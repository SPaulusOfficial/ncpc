import React from 'react';

import { Switch } from '../elements';

class Collapsible extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isActive: this.props.isActive
    }

    /*
     * EVENT HANDLERS
     */

    this.handleClick = () => {
      this.setState({ isActive:!this.state.isActive });
    }
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const fieldGroups = this.props.subscriptions.map(subscription => {
      return(
        <div className="collapsible-tile" key={subscription.availableSubId}>
          <Switch availableSubId={subscription.availableSubId} callback={this.props.callbackSwitch} callbackBadge={this.callbackBadge} campaigns={subscription.campaigns} channel={subscription.channel} checked={subscription.checked} description={subscription.description} disabled={subscription.disabled} label={subscription.label} userSubId={subscription.userSubId} />
        </div>
      )
    });

    return (
      <div className={"collapsible" + (this.state.isActive ? ' isActive' : '')}>
        <h3 className="collapsible-headline" aria-expanded={this.props.isActive} aria-controls={this.props.id} data-toggle="collapse" data-target={"#" + this.props.id} onClick={this.handleClick}>
          {this.props.label} <svg className="bi bi-chevron-down" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3.646 6.646a.5.5 0 01.708 0L10 12.293l5.646-5.647a.5.5 0 01.708.708l-6 6a.5.5 0 01-.708 0l-6-6a.5.5 0 010-.708z" clipRule="evenodd"/></svg>
        </h3>
        <div className={"collapse" + (this.props.isActive ? ' show' : '')} id={this.props.id}>
          <div className={"alert alert-light mt-3" + (this.props.subscriptions.length === 0 ? '' : ' d-none')}>No subscriptions are available for this category.</div>
          {fieldGroups}
        </div>
      </div>
    )
  }
}

export default Collapsible;
