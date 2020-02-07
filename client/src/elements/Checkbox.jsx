import React from 'react';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: props.checked
    }

    /*
     * EVENT HANDLERS
     */

    this.handleClick = event => {
      this.setState({ checked:!this.state.checked }, () => {
        this.props.callback(event, this.props, this.state)
      });
    }
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    return (
      <div className={"form-check" + (this.props.disabled ? ' isDisabled' : '') + (this.state.checked ? ' isActive' : '')}>
        <input className="form-check-input" disabled={this.props.disabled} id={this.props.availableIntId} type="checkbox" defaultChecked={this.props.checked} name={this.props.availableIntId} onClick={this.handleClick} />
        <label className="form-check-label" htmlFor={this.props.availableIntId}>
          <div className="card mix_checkbox">
            <img src={this.props.imageUrl} className="card-img-top" alt="" />
            <div className="card-body">
              <div className="form-check-toggle" />
              {this.props.label}
              <p className="form-check-description">{this.props.description}</p>
            </div>
          </div>
        </label>
      </div>
    )
  }
}

export default Checkbox;
