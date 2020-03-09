import React from 'react';

import PropTypes from 'prop-types';

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      today: new Date(),
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const { companyName, privacyLink, termsLink } = this.props;
    const { today } = this.state;

    return (
      <footer>
        <div className="container">
          <ul className="footer-nav list-inline">
            <li className="list-inline-item"><a href={privacyLink.url} rel="noopener noreferrer" target="_blank">{privacyLink.label}</a></li>
            <li className="list-inline-item"><a href={termsLink.url} rel="noopener noreferrer" target="_blank">{termsLink.label}</a></li>
          </ul>
          <p className="footer-legal">{companyName}®</p>
          <p className="footer-legal">© {today.getFullYear()} {companyName}</p>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  companyName: PropTypes.string.isRequired,
  privacyLink: PropTypes.shape({
    label: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  termsLink: PropTypes.shape({
    label: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
};

export default Footer;
