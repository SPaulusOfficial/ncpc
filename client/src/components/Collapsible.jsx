import React from 'react';

import PropTypes from 'prop-types';

import { Switch } from '../elements';

class Collapsible extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isActive: props.isActive,
    };

    /*
     * EVENT HANDLERS
     */

    this.handleClick = () => {
      const { isActive } = this.state;

      this.setState({ isActive: !isActive });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const {
      id,
      isActive: propIsActive,
      callbackBadge,
      callbackSwitch,
      label,
      subscriptions,
    } = this.props;
    const { isActive } = this.state;

    const fieldGroups = subscriptions.map((subscription) => (
      <div className="collapsible-tile" key={subscription.availableSubId}>
        <Switch availableSubId={subscription.availableSubId} callback={callbackSwitch} callbackBadge={callbackBadge} campaigns={subscription.campaigns} channel={subscription.channel} checked={subscription.checked} description={subscription.description} disabled={subscription.disabled} label={subscription.label} userSubId={subscription.userSubId} />
      </div>
    ));

    return (
      <div className={`collapsible${isActive ? ' isActive' : ''}`}>
        <h3 className="collapsible-headline" aria-expanded={propIsActive} aria-controls={id} data-toggle="collapse" data-target={`#${id}`} onClick={this.handleClick}>
          {label}
          <svg className="bi bi-chevron-down" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3.646 6.646a.5.5 0 01.708 0L10 12.293l5.646-5.647a.5.5 0 01.708.708l-6 6a.5.5 0 01-.708 0l-6-6a.5.5 0 010-.708z" clipRule="evenodd" /></svg>
        </h3>
        <div className={`collapse${isActive ? ' show' : ''}`} id={id}>
          <div className={`alert alert-light mt-3${subscriptions.length === 0 ? '' : ' d-none'}`}>No subscriptions are available for this category.</div>
          {fieldGroups}
        </div>
      </div>
    );
  }
}

Collapsible.propTypes = {
  callbackBadge: PropTypes.func.isRequired,
  callbackSwitch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      availableSubId: PropTypes.string,
      campaigns: PropTypes.array,
      channel: PropTypes.string,
      checked: PropTypes.bool,
      controlType: PropTypes.string,
      description: PropTypes.string,
      disabled: PropTypes.bool,
      label: PropTypes.string,
      order: PropTypes.number,
      public: PropTypes.bool,
      userSubId: PropTypes.string,
    }),
  ).isRequired,
};

export default Collapsible;
