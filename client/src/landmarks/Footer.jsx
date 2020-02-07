import React from 'react';

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      today: new Date()
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    return (
      <footer>
        <div className="container">
          <ul className="footer-nav list-inline">
            <li className="list-inline-item"><a href={this.props.privacyUrl}>{this.props.privacyLabel}</a></li>
            <li className="list-inline-item"><a href={this.props.termsUrl}>{this.props.termsLabel}</a></li>
          </ul>
          <p className="footer-legal">{this.props.companyName}®</p>
          <p className="footer-legal">© {this.state.today.getFullYear()} {this.props.companyName}</p>
        </div>
      </footer>
    );
  }
}

export default Footer;
