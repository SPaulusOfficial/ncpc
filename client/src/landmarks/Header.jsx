import React from 'react';

import { isEqual } from 'lodash';

import AppContext from '../AppContext';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      languages: []
    }

    /*
     * EVENT HANDLERS
     */

    this.handleClick = (event, language) => {
      event.preventDefault();

      this.context.setValue(language.lang, language.bu);
    }
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.languages, prevProps.languages)) {
      this.setState({ languages:this.props.languages });
    }
  }

  render() {
    const dropdownItems = this.state.languages.map(language => {
      return (
        <a className="dropdown-item" href="#{language.lang}-{language.bu}" key={language.label} onClick={(event) => this.handleClick(event, language)}>{language.label}</a>
      )
    });

    const dropdownItemsFiltered = this.state.languages.filter(language => language.bu === this.context.value.bu && language.lang === this.context.value.lang);

    const dropdownLabel = dropdownItemsFiltered.map(dl => {
      return (
        <span key={dl.label}>{dl.label}</span>
      )
    });

    return (
      <header>
        <div className="container">
          <a href={this.props.logoLink} rel="noopener noreferrer" target="_blank"><img className="header-logo" src={this.props.logoImage} alt="" /></a>
          <div className="dropdown  header-locale">
            <button className="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {dropdownLabel}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {dropdownItems}
            </div>
          </div>
        </div>
      </header>
    )
  }
}

Header.contextType = AppContext;

export default Header;
