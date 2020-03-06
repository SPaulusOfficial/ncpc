import React from 'react';

import $ from 'jquery';
import { withCookies } from 'react-cookie';
import PropTypes from 'prop-types';

import AppContext from '../AppContext';

class Cookies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gdprCookie: null,
    };

    this.ref = React.createRef();

    /*
    * EVENT HANDLERS
    */

    this.handleClick = () => {
      const $this = $(this.ref.current);

      const { cookies } = this.props;
      const height = $(this.ref.current).outerHeight();

      $this.animate({
        bottom: -(height),
      }, 'fast', () => {
        cookies.set('gdpr-cookies', Date(), { path: '/' });
      });
    };
  }

  componentDidMount() {
    const { cookies } = this.props;

    this.setState({ gdprCookie: cookies.get('gdpr-cookies') });
  }

  renderText() {
    const { value } = this.context;

    return (
      { __html: value.strings.cookies_text }
    );
  }

  render() {
    const { value } = this.context;
    const { gdprCookie } = this.state;

    let markup = null;

    if (!gdprCookie) {
      markup = (
        <div className="gdpr-cookies" ref={this.ref}>
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0 offset-md-1 text-center" dangerouslySetInnerHTML={this.renderText()} />
            <div className="col-lg-3 offset-md-1 text-center">
              <button className="btn btn-primary" onClick={this.handleClick} type="button">{value.strings.cookies_button}</button>
            </div>
          </div>
        </div>
      );
    }

    return markup;
  }
}

Cookies.contextType = AppContext;

Cookies.defaultProps = {
  cookies: {},
};

Cookies.propTypes = {
  cookies: PropTypes.shape({
    HAS_DOCUMENT_COOKIE: PropTypes.bool.isRequired,
  }),
};

export default withCookies(Cookies);
