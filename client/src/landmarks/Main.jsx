import React from 'react';

import PropTypes from 'prop-types';

import { Cookies, GlobalAlert, Modal } from '../components';
import { Section } from '../elements';
import Sidebar from './Sidebar';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.sidebarMyInterestsRef = React.createRef();
  }
  /*
   * LIFECYCLE METHODS
   */

  render() {
    const { heroHeadline, heroImg, sections } = this.props;

    const renderedSections = sections.map((section) => (
      <Section description={section.description} headline={section.headline} id={section.id} key={section.id} sidebarMyInterestsRef={this.sidebarMyInterestsRef} />
    ));

    return (
      <main>
        <form>
          <div className="container-fluid">
            <div className="hero" style={(heroImg.url) ? { backgroundImage: `url(${heroImg.url})` } : {}}>
              <div className="container">
                <h1 className="hero-heading">{heroHeadline}</h1>
              </div>
            </div>
          </div>
          <div className="container-lg">
            <div className="row">
              <div className="col-lg-3">
                <Sidebar myInterestsRef={this.sidebarMyInterestsRef} sections={sections} />
              </div>
              <div className="col-lg-9">
                <GlobalAlert />
                {renderedSections}
              </div>
            </div>
          </div>
        </form>
        <Cookies />
        <Modal body="Your information could not be updated. Please try again later." title="Oops!" />
      </main>
    );
  }
}

Main.propTypes = {
  heroHeadline: PropTypes.string.isRequired,
  heroImg: PropTypes.shape({
    link: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      headline: PropTypes.string,
      id: PropTypes.string,
      order: PropTypes.number,
    }),
  ).isRequired,
};

export default Main;
