import React from 'react';

import $ from 'jquery';
import { sortBy } from 'lodash';

import MySubscriptionsService from '../services/mysubscriptions-service';

import AppContext from '../AppContext';
import Collapsible from './Collapsible';

class MySubscriptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fieldGroups: [],
      langBu: null,
      wsException: false
    };

    this.wsEndpoint = null;

    /*
     * EVENT HANDLERS
     */

    this.onClickBadge = (event, props, state) => {
      console.log('onClickBadge()', props, state);

      const $save = $('#btn-save');
      
      $save.attr('disabled', true);

      this.wsEndpoint.postCampaign(props.campaignId, props.campaignUserId, state.checked)
        .then(response => {
          $save.attr('disabled', false);
        }
      );
    }
    
    this.onClickSwitch = (event, props, state) => {
      console.log('onClickSwitch()', props, state);

      const $save = $('#btn-save');
      
      $save.attr('disabled', true);

      this.wsEndpoint.postSubscription(props.availableSubId, state.checked)
        .then(response => {
          $save.attr('disabled', false);
        }
      );
    };

    this.onClickUnsubscribeAll = event => {
      event.preventDefault();

      console.log('onUnsubscribeAll()');

      const $save = $('#btn-save');
      const $this = $(event.target);

      $save.attr('disabled', true);
      $this.attr('disabled', true);

      this.wsEndpoint.postUnsubscribeAll()
        .then(response => {
          $save.attr('disabled', false);
          $this.attr('disabled', false);
        }
      );
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
      this.wsEndpoint.bu = this.context.value.bu;
      this.wsEndpoint.lang = this.context.value.lang;
      this.wsEndpoint.wsBaseUrl = this.context.value.wsBaseUrl;

      this.wsEndpoint.get()
        .then(fieldGroups => {
          const sortedfieldGroups = sortBy(fieldGroups, 'catorder');

          sortedfieldGroups.forEach(fieldGroup => {
            const sortedSubscriptions = sortBy(fieldGroup.subscriptions, 'order');

            sortedSubscriptions.forEach(subscription => {
              const sortedCampaigns = sortBy(subscription.campaigns, 'order');

              subscription.campaigns = sortedCampaigns;
            });

            fieldGroup.subscriptions = sortedSubscriptions;        
          });

          this.setState({ fieldGroups:sortedfieldGroups });
        })
        .catch(error => {
          this.setState({ wsException:true });
        });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    this.wsEndpoint = new MySubscriptionsService(this.context.value.bu, this.context.value.id, this.context.value.lang, this.context.value.wsBaseUrl);

    this.setState({ langBu: this.context.value.lang + '-' + this.context.value.bu });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.langBu !== prevState.langBu) {
      this.fetchData();
    }
    
    if (this.state.langBu !== this.context.value.lang + '-' + this.context.value.bu) {
      this.setState({
        langBu: this.context.value.lang + '-' + this.context.value.bu
      });
    }
  }

  render() {
    const fieldGroups = this.state.fieldGroups.map(fieldGroup => {
      const isActive = this.collapsibleIsActive(fieldGroup.catorder, fieldGroup.subscriptions);

      return (
        <Collapsible callbackBadge={this.onClickBadge} callbackSwitch={this.onClickSwitch} id={fieldGroup.catid} isActive={isActive} key={fieldGroup.catid} label={fieldGroup.catlabel} order={fieldGroup.catorder} subscriptions={fieldGroup.subscriptions} />
      )
    });

    return (
      <div>
        <div className={"alert alert-danger" + (this.state.wsException ? '' : ' d-none')} role="alert">
          <svg className="bi bi-alert-circle-fill" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8.998 3a1 1 0 112 0 1 1 0 01-2 0zM10 6a.905.905 0 00-.9.995l.35 3.507a.553.553 0 001.1 0l.35-3.507A.905.905 0 0010 6z" clipRule="evenodd"/>
          </svg>
          Unable to retrieve profile information at this time. Please try again later.
        </div>
        {fieldGroups}
        <button className="btn btn-large btn-secondary float-right" disabled={this.state.wsException} onClick={this.onClickUnsubscribeAll}>Unsubscribe All</button>
      </div>
    )
  }
}

MySubscriptions.contextType = AppContext;

export default MySubscriptions;
