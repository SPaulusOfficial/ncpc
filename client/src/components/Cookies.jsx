import React from 'react';

import $ from 'jquery';
import { withCookies } from 'react-cookie';

import AppContext from '../AppContext';

class Cookies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gdprCookie: null
    };

    this.ref = React.createRef();

    /*
    * EVENT HANDLERS
    */

    this.handleClick = event => {
      const $this = $(this.ref.current);

      const { cookies } = this.props;
      const height = $(this.ref.current).outerHeight();
      
      $this.animate({
        bottom: -(height)
      }, 'fast', () => {
        cookies.set('gdpr-cookies', Date(), { path: '/' });
      });
    }
  }

  componentDidMount() {
    const { cookies } = this.props;

    this.setState({ gdprCookie:cookies.get('gdpr-cookies') });
  }

  render() {
    if (!this.state.gdprCookie) {
      return(
        <div className="gdpr-cookies" ref={this.ref}>
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0 offset-md-1 text-center" dangerouslySetInnerHTML={this.renderText()}></div>
            <div className="col-lg-3 offset-md-1 text-center">
              <button className="btn btn-primary" onClick={this.handleClick}>{this.context.value.strings.cookies_button}</button>
            </div>
          </div>
        </div>
      )
    } else {
      return null;
    }
  }

  renderText() {
    return(
      {__html:this.context.value.strings.cookies_text }
    )
  }
}

Cookies.contextType = AppContext;

export default withCookies(Cookies);
