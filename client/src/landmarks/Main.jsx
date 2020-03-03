import React from 'react';

import { Cookies, Modal } from '../components';
import { Section } from '../elements';
import { Sidebar } from '../landmarks';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.sidebarMyInterestsRef = React.createRef();
  }
  /*
   * LIFECYCLE METHODS
   */

  render() {
    const sections = this.props.sections.map(section => {
      return (
        <Section description={section.description} headline={section.headline} id={section.id} key={section.id} sidebarMyInterestsRef={this.sidebarMyInterestsRef} />
      )
    });

    return (
      <main>
        <form>
          <div className="container-fluid">
            <div className="hero" style={(this.props.heroImg.url) ? { backgroundImage: 'url(' + this.props.heroImg.url + ')' }: {}}>
              <div className="container">
                <h1 className="hero-heading">{this.props.heroHeadline}</h1>
              </div>
            </div>
          </div>
          <div className="container-lg">
            <div className="row">
              <div className="col-lg-3">
                <Sidebar myInterestsRef={this.sidebarMyInterestsRef} sections={this.props.sections} />
              </div>
              <div className="col-lg-9">
                <div className="container">
                  {sections}
                </div>
              </div>
            </div>
          </div>
        </form>
        <Cookies />
        <Modal body="Your information could not be updated. Please try again later." title="Oops!" />
      </main>
    )
  }
}

export default Main;
