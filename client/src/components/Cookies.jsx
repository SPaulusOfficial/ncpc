import React from 'react';

import $ from 'jquery';

import AppContext from '../AppContext';

class Cookies extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();

    /*
    * EVENT HANDLERS
    */

    this.handleClick = event => {
      const $this = $(this.ref.current);

      const height = $(this.ref.current).outerHeight();
      
      $this.animate({
        bottom: -(height)
      }, 'fast', () => {
        
      });
    }
  }

  render() {
    return(
      <div className="gdpr-cookies" ref={this.ref}>
        <div className="container">
          <div className="row">
            <div className="col-md-9" dangerouslySetInnerHTML={this.renderText()}></div>
            <div className="col-md-3">
              <button className="btn btn-block btn-primary" onClick={this.handleClick}>{this.context.value.strings.cookies_button}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderText() {
    return(
      {__html:this.context.value.strings.cookies_text }
    )
  }
}

Cookies.contextType = AppContext;

export default Cookies;
