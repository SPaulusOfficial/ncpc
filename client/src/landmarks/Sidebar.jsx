import React from 'react';

import $ from 'jquery';
import PropTypes from 'prop-types';

import AppContext from '../AppContext';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    /*
     * EVENT HANDLERS
     */

    this.onClickMenuItem = (event) => {
      event.preventDefault();

      const $this = $(event.target);
      const $anchor = $(`a[name="${$this.attr('href').replace('#', '')}"]`);
      const $header = $('header');

      $('html, body').animate({
        scrollTop: $anchor.offset().top - $header.outerHeight(),
      }, 'fast');
    };

    this.onClickSaveButton = (event) => {
      event.preventDefault();
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const { value } = this.context;
    const { myInterestsRef, sections } = this.props;

    const listItems = sections.map((section) => {
      let listItem = null;

      if (section.id === 'my-interests') {
        listItem = <li id={section.id} key={section.id} ref={myInterestsRef}><a href={`#${section.id}`} onClick={this.onClickMenuItem}>{section.headline}</a></li>;
      } else {
        listItem = <li id={section.id} key={section.id}><a href={`#${section.id}`} onClick={this.onClickMenuItem}>{section.headline}</a></li>;
      }

      return listItem;
    });

    return (
      <div className="sidebar">
        <ul className="sidebar-links list-unstyled">
          {listItems}
        </ul>
        <button className="btn btn-lg btn-primary" id="btn-save" onClick={this.onClickSaveButton} type="button">
          {value.strings.button_submit}
        </button>
      </div>
    );
  }
}

Sidebar.contextType = AppContext;

Sidebar.propTypes = {
  myInterestsRef: PropTypes.shape().isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      headline: PropTypes.string,
      id: PropTypes.string,
      order: PropTypes.number,
    }),
  ).isRequired,
};

export default Sidebar;
