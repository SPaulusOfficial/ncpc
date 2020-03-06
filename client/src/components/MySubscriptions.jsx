import React from 'react';

import $ from 'jquery';
import { cloneDeep, isEqual, sortBy } from 'lodash';
import PropTypes from 'prop-types';

import MySubscriptionsService from '../services/mysubscriptions-service';

import AppContext from '../AppContext';
import Collapsible from './Collapsible';
import ForgetMe from './ForgetMe';

class MySubscriptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fieldGroups: [],
      locale: {
        businessUnit: null,
        language: null,
      },
      wsException: false,
    };

    this.wsEndpoint = new MySubscriptionsService(null, null, null, '/api');

    /*
     * EVENT HANDLERS
     */

    this.onClickBadge = (event, props, state) => {
      const $save = $('#btn-save');

      $save.attr('disabled', true);

      this.wsEndpoint.postCampaign(props.memberId, state.checked, props.id)
        .then((response) => {
          const { fieldGroups } = this.state;

          if (response.success === 'fail') {
            $('#exceptionModal').modal();
          } else {
            const newFieldGroups = cloneDeep(fieldGroups);

            newFieldGroups.forEach((fieldGroup) => {
              fieldGroup.subscriptions.forEach((subscription) => {
                subscription.campaigns.forEach((campaign) => {
                  if (campaign.id === props.id) {
                    campaign.memberStatus = false;
                  }
                });
              });
            });

            this.setState({ fieldGroups: newFieldGroups }, () => {
              $save.attr('disabled', false);
            });
          }
        });
    };

    this.onClickSwitch = (event, props, state) => {
      const $save = $('#btn-save');

      $save.attr('disabled', true);

      this.wsEndpoint.postSubscription(props.availableSubId, state.checked)
        .then((response) => {
          if (response.success === 'fail') {
            $('#exceptionModal').modal();
          } else {
            $save.attr('disabled', false);
          }
        });
    };

    this.onClickUnsubscribeAll = (event) => {
      event.preventDefault();

      const $save = $('#btn-save');
      const $this = $(event.target);

      $save.attr('disabled', true);
      $this.attr('disabled', true);

      this.wsEndpoint.postUnsubscribeAll()
        .then((response) => {
          const { fieldGroups } = this.state;

          if (response.success === 'fail') {
            $('#exceptionModal').modal();
          } else {
            $save.attr('disabled', false);
          }

          const newFieldGroups = cloneDeep(fieldGroups);

          newFieldGroups.forEach((fieldGroup) => {
            fieldGroup.subscriptions.forEach((subscription) => {
              subscription.checked = false;
            });
          });

          this.setState({ fieldGroups: newFieldGroups }, () => {
            $save.attr('disabled', false);
            $this.attr('disabled', false);
          });
        })
        .catch(() => {
          $('#exceptionModal').modal();
          $save.attr('disabled', false);
          $this.attr('disabled', false);
        });
    };

    /*
    * HELPER METHODS
    */

    this.collapsibleIsActive = (order, subscriptions) => {
      const isInactive = (subscription) => subscription.checked !== true;

      // The first category is always open.
      if (order === 0) return true;

      // Additional categorys are closed if they do not contain subscriptions.
      if (subscriptions.length === 0) return false;

      // Additional categories are closed if they contain subscriptions but all are not checked.
      if (subscriptions.every(isInactive)) return false;

      return true;
    };

    this.fetchData = () => {
      this.wsEndpoint.get()
        .then((fieldGroups) => {
          const sortedfieldGroups = sortBy(fieldGroups, 'catorder');

          sortedfieldGroups.forEach((fieldGroup) => {
            const sortedSubscriptions = sortBy(fieldGroup.subscriptions, 'order');

            sortedSubscriptions.forEach((subscription) => {
              const sortedCampaigns = sortBy(subscription.campaigns, 'order');

              subscription.campaigns = sortedCampaigns;
            });

            fieldGroup.subscriptions = sortedSubscriptions;
          });

          this.setState({ fieldGroups: sortedfieldGroups });
        })
        .catch(() => {
          this.setState({ wsException: true });
        });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    const { value } = this.context;

    this.setState({ locale: { ...value.locale } });
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.context;
    const { fieldGroups, locale } = this.state;

    if (this.context && value && !isEqual(value.locale, locale)) {
      this.setState({ locale: { ...value.locale } });
    }

    if (!isEqual(prevState.locale, locale)) {
      this.wsEndpoint.id = value.id;
      this.wsEndpoint.bu = value.locale.businessUnit;
      this.wsEndpoint.lang = value.locale.language;

      this.fetchData();
    }

    if (!isEqual(prevState.fieldGroups, fieldGroups)) {
      // If "availableSubId" exists in the URL query string then the user should be automatically opted-in to the matching subscription.
      if (value.availableSubId) {
        const clonedFieldGroups = cloneDeep(fieldGroups);

        // Test to see if the specified ID exists somewhere in the collection.
        clonedFieldGroups.forEach((fieldGroup) => {
          fieldGroup.subscriptions.forEach((subscription) => {
            if (subscription.availableSubId === value.availableSubId && subscription.checked === false) {
              // If the indicated ID exists then call the web service to subscribe the user and update the UI.
              this.wsEndpoint.postSubscription(subscription.availableSubId, true)
                .then((response) => {
                  if (response.success === 'fail') {
                    $('#exceptionModal').modal();
                  } else {
                    subscription.checked = true;

                    this.setState({ fieldGroups });
                  }
                });
            }
          });
        });
      }
    }
  }

  render() {
    const { value } = this.context;
    const { fieldGroups, wsException } = this.state;

    const mappedFieldGroups = fieldGroups.map((fieldGroup) => {
      const isActive = this.collapsibleIsActive(fieldGroup.catorder, fieldGroup.subscriptions);

      return (
        <Collapsible callbackBadge={this.onClickBadge} callbackSwitch={this.onClickSwitch} id={fieldGroup.catid} isActive={isActive} key={fieldGroup.catid} label={fieldGroup.catlabel} order={fieldGroup.catorder} subscriptions={fieldGroup.subscriptions} />
      );
    });

    return (
      <div>
        <div className={`alert alert-danger${wsException ? '' : ' d-none'}`} role="alert">
          <svg className="bi bi-alert-circle-fill" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8.998 3a1 1 0 112 0 1 1 0 01-2 0zM10 6a.905.905 0 00-.9.995l.35 3.507a.553.553 0 001.1 0l.35-3.507A.905.905 0 0010 6z" clipRule="evenodd"/>
          </svg>
          Unable to retrieve profile information at this time. Please try again later.
        </div>
        {mappedFieldGroups}
        <button className="btn btn-large btn-secondary float-right" disabled={wsException} onClick={this.onClickUnsubscribeAll} type="button">{value.strings.button_unsubscribeAll}</button>
        <ForgetMe className="float-right mr-2" />
      </div>
    );
  }
}

MySubscriptions.contextType = AppContext;

MySubscriptions.propTypes = {
  id: PropTypes.string.isRequired,
};

export default MySubscriptions;
