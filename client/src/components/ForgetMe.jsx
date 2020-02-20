import React from 'react';

import $ from 'jquery';

import MyProfileService from '../services/myprofile-service';

import AppContext from '../AppContext';

class ForgetMe extends React.Component {
  constructor(props) {
    super(props);

    this.wsEndpoint = null;

    /*
     * EVENT HANDLERS
     */

    this.onClickForgetMe = (event) => {
      event.preventDefault();

      this.wsEndpoint.postForgetMe()
        .then(response => {
          if (response.success === 'fail') {
            $('#forgetMeConfirmation').modal('hide');
            $('#exceptionModal').modal();
          } else {
            // TODO: What happens here? Redirect to client homepage maybe?
          }
        })
        .catch(error =>{
          $('#forgetMeConfirmation').modal('hide');
          $('#exceptionModal').modal();
        });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    this.wsEndpoint = new MyProfileService(this.context.value.bu, this.context.value.id, this.context.value.lang, this.context.value.wsBaseUrl);
  }

  render() {
    return (
      <div className={this.props.className}>
        <button className="btn btn-large btn-link" data-toggle="modal" data-target="#forgetMeConfirmation" type="button">{this.context.value.strings.forgetMe_button_primary}</button>
        <div className="modal" id="forgetMeConfirmation" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.context.value.strings.forgetMe_modal_title}</h5>
                <button aria-label="Close" className="close" data-dismiss="modal" type="button">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>{this.context.value.strings.forgetMe_modal_body}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" data-dismiss="modal" type="button">{this.context.value.strings.forgetMe_button_secondary}</button>
                <button className="btn btn-primary" onClick={this.onClickForgetMe} type="button">{this.context.value.strings.forgetMe_button_primary}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ForgetMe.contextType = AppContext;

export default ForgetMe;