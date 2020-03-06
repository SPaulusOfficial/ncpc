import React from 'react';

import PropTypes from 'prop-types';

class EmailInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: (props.defaultValue === ' ') ? null : props.defaultValue,
    };

    /*
     * EVENT HANDLERS
     */

    this.onBlur = (event) => {
      const { callback } = this.props;

      callback(event, this.props, this.state);
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const {
      disabled,
      helpText,
      id,
      label,
      placeholder,
    } = this.props;
    const { value } = this.state;

    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input className="form-control" aria-describedby={id} defaultValue={value} disabled={disabled} id={id} name={id} onBlur={this.onBlur} placeholder={placeholder} type="email" />
        {helpText ? <small className="form-text text-muted" id={`${id}_help`}>{helpText}</small> : ''}
      </div>
    );
  }
}

EmailInput.defaultProps = {
  callback: null,
  defaultValue: null,
  helpText: null,
  placeholder: null,
};

EmailInput.propTypes = {
  callback: PropTypes.func,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  helpText: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

export default EmailInput;
