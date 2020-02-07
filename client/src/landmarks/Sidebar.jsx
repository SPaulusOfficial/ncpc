import React from 'react';

import $ from 'jquery';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    /*
     * EVENT HANDLERS
     */

    this.onClick = event => {
      event.preventDefault();
  
      const $this = $(event.target);
      const $anchor = $(`a[name="${ $this.attr('href').replace('#', '') }"]`);
      const $header = $('header');

      console.log($this, $anchor, $header, $anchor.offset().top - $header.outerHeight());
  
      $('html, body').animate({
        scrollTop: $anchor.offset().top - $header.outerHeight()
      }, 'fast');
    }
  }

  /*
   * LIFECYCLE METHODS
   */

  render() {
    const listItems = this.props.sections.map(section => {
      return(
        <li key={section.id}><a href={"#" + section.id} onClick={this.onClick}>{section.headline}</a></li>
      )
    });

    return (
      <div className="sidebar">
        <ul className="sidebar-links list-unstyled">
          {listItems}
        </ul>
        <button className="btn btn-lg btn-primary" id="btn-save">
          Sav
          <span className="btn-save-label_inactive">e</span>
          <span className="btn-save-label_active">ing...</span>
        </button>
      </div>
    )
  }
}

export default Sidebar;
