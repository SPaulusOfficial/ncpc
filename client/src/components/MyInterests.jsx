import React from 'react';

import $ from 'jquery';
import { isEqual, sortBy } from 'lodash';
import PropTypes from 'prop-types';

import MyInterestsService from '../services/myinterests-service';

import AppContext from '../AppContext';
import { Checkbox } from '../elements';

class MyInterests extends React.Component {
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

    this.wsEndpoint = new MyInterestsService(null, null, null, '/api');

    /*
     * EVENT HANDLERS
     */

    this.onClickCheckbox = (event, checkboxProps, checkboxState) => {
      const $save = $('#btn-save');

      $save.attr('disabled', true);

      this.wsEndpoint.post(checkboxProps.availableIntId, checkboxState.checked)
        .then((response) => {
          if (response.success === 'fail') {
            $('#exceptionModal').modal();
          } else {
            $save.attr('disabled', false);
          }
        })
        .catch(() => {
          this.setState({ wsException: true });
        });
    };

    /*
     * HELPER METHODS
     */

    this.fetchData = () => {
      this.wsEndpoint.get()
        .then((fieldGroups) => {
          const sortedfieldGroups = sortBy(fieldGroups, 'catorder');

          sortedfieldGroups.forEach((fieldGroup) => {
            const modifiedFieldGroup = fieldGroup;
            const sortedInterests = sortBy(fieldGroup.interests, 'order');

            modifiedFieldGroup.interests = sortedInterests;
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
    const { sectionRef, sidebarRef } = this.props;
    const { fieldGroups, locale } = this.state;

    if (!isEqual(value.locale, locale)) {
      this.setState({ locale: { ...value.locale } });
    }

    if (!isEqual(prevState.locale, locale)) {
      this.wsEndpoint.id = value.id;
      this.wsEndpoint.bu = value.locale.businessUnit;
      this.wsEndpoint.lang = value.locale.language;

      this.fetchData();
    }

    if (fieldGroups.length === 0) {
      sectionRef.current.classList.add('d-none');
      sidebarRef.current.classList.add('d-none');
    } else {
      sectionRef.current.classList.remove('d-none');
      sidebarRef.current.classList.remove('d-none');
    }
  }

  render() {
    const { fieldGroups, wsException } = this.state;

    const mappedFieldGroups = fieldGroups.map((fieldGroup) => (
      fieldGroup.interests.map((interest) => (
        <div className="d-flex align-items-stretch mt-5 pb-15px pl-15px pr-15px" key={interest.availableIntId}>
          <Checkbox availableIntId={interest.availableIntId} callback={this.onClickCheckbox} checked={interest.checked} description={interest.description} disabled={interest.disabled} imageUrl={interest.url} key={interest.availableIntId} label={interest.label} userIntId={interest.userIntId} />
        </div>
      ))
    ));

    return (
      <div>
        <div className={`alert alert-danger${wsException ? '' : ' d-none'}`} role="alert">
          <svg className="bi bi-alert-circle-fill" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8.998 3a1 1 0 112 0 1 1 0 01-2 0zM10 6a.905.905 0 00-.9.995l.35 3.507a.553.553 0 001.1 0l.35-3.507A.905.905 0 0010 6z" clipRule="evenodd" />
          </svg>
          Unable to retrieve profile information at this time. Please try again later.
        </div>
        <div className="row row-cols-2 row-cols-lg-3">
          {mappedFieldGroups}
        </div>
      </div>
    );
  }
}

MyInterests.contextType = AppContext;

MyInterests.propTypes = {
  sectionRef: PropTypes.shape({
    current: PropTypes.any,
  }).isRequired,
  sidebarRef: PropTypes.shape({
    current: PropTypes.any,
  }).isRequired,
};

export default MyInterests;
