import React from 'react';

class Badge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: this.props.checked
    }

    /*
     * EVENT HANDLERS
     */

    this.handleClick = event => {
      this.setState({ checked:!this.state.checked }, () => {
        this.props.callback(event, this.props, this.state);
      });
    }
  }

  render() {
    return(
      <span className="badge badge-campaign badge-pill">
        {this.props.label} 
        <span className="badge-icon" onClick={this.handleClick}>
          <svg className="bi bi-x-circle-fill" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.354 6.646L10 9.293l2.646-2.647a.5.5 0 01.708.708L10.707 10l2.647 2.646a.5.5 0 01-.708.708L10 10.707l-2.646 2.647a.5.5 0 01-.708-.708L9.293 10 6.646 7.354a.5.5 0 11.708-.708z" clipRule="evenodd"/>
          </svg>
        </span>
      </span>
    )
  }
}

export default Badge;