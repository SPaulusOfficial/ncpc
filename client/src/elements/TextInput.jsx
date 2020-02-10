import React from 'react';

import $ from 'jquery';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      value: (this.props.defaultValue === ' ') ? null : this.props.defaultValue
    };

    /*
     * EVENT HANDLERS
     */

    this.onBlur = event => {
      const $this = $(event.target);

      this.setState({ value:$this.val() }, () => {
        this.props.callback(event, this.props, this.state);
      });
    }
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    return (
      <div className="form-group">
        <label htmlFor={this.props.id}>{this.props.label}</label>
        <input className="form-control" aria-describedby={this.props.id} defaultValue={this.props.defaultValue} disabled={this.props.disabled} id={this.props.id} name={this.props.id} onBlur={this.onBlur} placeholder={this.props.placeholder} type="text" />
        {this.props.helpText ? <small className="form-text text-muted" id={this.props.id + '_help'}>{this.props.helpText}</small> : ''}
      </div>
    )
  }
}

export default TextInput;
