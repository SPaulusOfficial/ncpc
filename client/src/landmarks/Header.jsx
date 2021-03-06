import React from 'react';

import { isEqual } from 'lodash';
import PropTypes from 'prop-types';

import AppContext from '../AppContext';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      languages: [],
    };

    /*
     * EVENT HANDLERS
     */

    this.handleClick = (event, language) => {
      const { setValue, value } = this.context;

      event.preventDefault();

      setValue(
        { ...value.globalAlert },
        { businessUnit: language.bu, language: language.lang },
        { ...value.settings },
        { ...value.strings },
        { ...value.theme },
      );
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidUpdate(prevProps) {
    const { languages } = this.props;

    if (!isEqual(languages, prevProps.languages)) {
      this.setState({ languages });
    }
  }

  render() {
    const { value } = this.context;
    const { logo } = this.props;
    const { languages } = this.state;

    const dropdownItems = languages.map((language) => (
      <a className="dropdown-item" href="#{language.lang}-{language.bu}" key={language.label} onClick={(event) => this.handleClick(event, language)}>{language.label}</a>
    ));

    const dropdownItemsFiltered = languages.filter((language) => language.bu === value.locale.businessUnit && language.lang === value.locale.language);

    const dropdownLabel = dropdownItemsFiltered.map((dl) => (
      <span key={dl.label}>{dl.label}</span>
    ));

    return (
      <header>
        <div className="container">
          <a aria-label="Home" href={logo.link} rel="noopener noreferrer" role="button" target="_blank"><img className="header-logo" src={logo.url} alt="" /></a>
          <div className="dropdown  header-locale">
            <button className="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-offset="0,6">
              {dropdownLabel}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {dropdownItems}
            </div>
          </div>
        </div>
      </header>
    );
  }
}

Header.contextType = AppContext;

Header.defaultProps = {
  languages: [],
};

Header.propTypes = {
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      bu: PropTypes.string,
      label: PropTypes.string,
      lang: PropTypes.string,
    }),
  ),
  logo: PropTypes.shape({
    label: PropTypes.string,
    link: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
};

export default Header;
