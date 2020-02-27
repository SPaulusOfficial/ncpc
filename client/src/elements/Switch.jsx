import React from 'react';

import $ from 'jquery';

import AppContext from '../AppContext';

import { Badge } from '../components';

import 'bootstrap/dist/js/bootstrap.bundle';
class Switch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: props.checked
    }

    /*
     * EVENT HANDLERS
     */

    this.handleClick = event => {
      if (this.props.disabled) { return; }
      
      this.setState({ checked:!this.state.checked }, () => {
        if (this.state.checked) {
          $('#collapse_' + this.props.availableSubId).collapse('show');
        } else {
          $('#collapse_' + this.props.availableSubId).collapse('hide');
        }

        this.props.callback(event, this.props, this.state);
      });
    }
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    $('#collapse_' + this.props.availableSubId).collapse({ toggle:false });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.checked !== prevState.checked) {
      this.setState({ checked:this.props.checked });
    }
  }

  render() {
    const campaigns = this.props.campaigns.filter(campaign => campaign.memberStatus === true).map(campaign => {
        return(
          <Badge callback={this.props.callbackBadge} checked={campaign.memberStatus} disabled={false} id={campaign.id} key={campaign.id} label={campaign.name} memberId={campaign.memberId} />
        )
    });

    return (
      <div>
        <div className={"form-switch" + (this.props.disabled ? ' isDisabled' : '') + (this.state.checked ? ' isActive' : '')}>
          <input className="form-switch-input" defaultChecked={this.props.checked} disabled={this.props.disabled && this.props.userSubId === null} id={this.props.availableSubId} name={this.props.availableSubId} onClick={this.handleClick} type="checkbox" />
          <label className="form-switch-label" htmlFor={this.props.availableSubId}>
            <div className="form-switch-text">
              {this.props.label} {this.renderChannelLabel()}
              <p className="form-switch-description">{this.props.description}</p>
            </div>
            
            <div className="form-switch-toggle" />
          </label>
        </div>
        <div className={"collapse form-switch-campaigns" + (this.props.disabled ? ' d-none' : '') + (this.props.campaigns.length && this.props.checked ? ' show' : '')} id={'collapse_' + this.props.availableSubId}>
          {campaigns}
        </div>
      </div>
    )
  }

  renderChannelLabel() {
    if (this.context.value.settings.channelLabelsEnabled) {
      return (
        <span className={"form-switch-badge badge badge-pill badge-light" + (this.props.channel === 'sms' ? ' text-uppercase' : '')}>{(this.props.channel === 'SMS') ? this.context.value.strings.badge_sms : this.context.value.strings.badge_email}</span>
      )
    } else {
      return null;
    }
  }
}

Switch.contextType = AppContext;

export default Switch;
