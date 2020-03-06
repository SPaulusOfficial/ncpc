import React from 'react';

import PropTypes from 'prop-types';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: props.checked,
    };

    /*
     * EVENT HANDLERS
     */

    this.handleClick = (event) => {
      const { callback } = this.props;
      const { checked } = this.state;

      this.setState({ checked: !checked }, () => {
        callback(event, this.props, this.state);
      });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const {
      availableIntId,
      checked: propChecked,
      description,
      disabled,
      imageUrl,
      label,
    } = this.props;
    const { checked } = this.state;

    return (
      <div className={`form-check${disabled ? ' isDisabled' : ''}${checked ? ' isActive' : ''}`}>
        <input className="form-check-input" disabled={disabled} id={availableIntId} type="checkbox" defaultChecked={propChecked} name={availableIntId} onClick={this.handleClick} />
        <label className="form-check-label" htmlFor={availableIntId}>
          <div className="card mix_checkbox">
            <img src={imageUrl} className="card-img-top" alt="" />
            <div className="card-body">
              <div className="form-check-toggle" />
              {label}
              <p className="form-check-description">{description}</p>
            </div>
          </div>
        </label>
      </div>
    );
  }
}

Checkbox.defaultProps = {
  callback: null,
  description: null,
  imageUrl: null,
};

Checkbox.propTypes = {
  availableIntId: PropTypes.string.isRequired,
  callback: PropTypes.func,
  checked: PropTypes.bool.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  imageUrl: PropTypes.string,
  label: PropTypes.string.isRequired,
};

export default Checkbox;
