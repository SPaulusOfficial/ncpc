import React from 'react';

import $ from 'jquery';
import PropTypes from 'prop-types';

class TextInput extends React.Component {
  constructor(props) {
    super(props);

    const { defaultValue } = this.props;

    this.state = {
      value: (defaultValue === ' ') ? null : defaultValue,
    };

    /*
     * EVENT HANDLERS
     */

    this.onBlur = (event) => {
      const { callback } = this.props;
      const $this = $(event.target);

      this.setState({ value: $this.val() }, () => {
        callback(event, this.props, this.state);
      });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const {
      defaultValue,
      disabled,
      helpText,
      id,
      label,
      placeholder,
    } = this.props;

    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input className="form-control" aria-describedby={id} defaultValue={defaultValue} disabled={disabled} id={id} name={id} onBlur={this.onBlur} placeholder={placeholder} type="text" />
        {helpText ? <small className="form-text text-muted" id={`${id}_help`}>{helpText}</small> : ''}
      </div>
    );
  }
}

TextInput.defaultProps = {
  helpText: '',
  placeholder: '',
};

TextInput.propTypes = {
  callback: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  helpText: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

export default TextInput;
