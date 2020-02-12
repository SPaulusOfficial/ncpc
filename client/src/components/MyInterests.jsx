import React from 'react';

import $ from 'jquery';
import { sortBy } from 'lodash';

import MyInterestsService from '../services/myinterests-service';

import AppContext from '../AppContext';
import { Checkbox } from '../elements';

class MyInterests extends React.Component {
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

    this.onClickCheckbox = (event, props, state) => {
      // console.log('onClickCheckbox()', props, state);

      const $save = $('#btn-save');
      
      $save.attr('disabled', true);

      this.wsEndpoint.post(props.availableIntId, state.checked)
        .then(response => {
          if (response.success === 'fail') {
            $('#exceptionModal').modal();
          } else {
            $save.attr('disabled', false);
          }
        })
        .catch(error => {
          this.setState({ wsException:true });
        });
    }

    /*
     * HELPER METHODS
     */

    this.fetchData = () => {
      this.wsEndpoint.bu = this.context.value.bu;
      this.wsEndpoint.lang = this.context.value.lang;
      this.wsEndpoint.wsBaseUrl = this.context.value.wsBaseUrl;

      this.wsEndpoint.get()
        .then(fieldGroups => {
          const sortedfieldGroups = sortBy(fieldGroups, 'catorder');

          sortedfieldGroups.forEach(fieldGroup => {
            const sortedInterests = sortBy(fieldGroup.interests, 'order');

            fieldGroup.interests = sortedInterests;
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
    this.wsEndpoint = new MyInterestsService(this.context.value.bu, this.context.value.id, this.context.value.lang, this.context.value.wsBaseUrl);

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
      return (
        fieldGroup.interests.map(interest => {
          return (
            <div className="d-flex align-items-stretch pb-15px pl-15px pr-15px" key={interest.availableIntId}>
              <Checkbox availableIntId={interest.availableIntId} callback={this.onClickCheckbox} checked={interest.checked} description={interest.description} disabled={interest.disabled} imageUrl={interest.url} key={interest.availableIntId} label={interest.label} userIntId={interest.userIntId} />
            </div>
          )
        })
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
        <div className={"row row-cols-2 row-cols-lg-3" + (fieldGroups.length ? ' mt-lg-5' : '')}>
          {fieldGroups}
        </div>
      </div>
    )
  }
}

MyInterests.contextType = AppContext;

export default MyInterests;
