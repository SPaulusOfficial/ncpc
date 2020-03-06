import React from 'react';

import PropTypes from 'prop-types';

import { MyInterests, MySubscriptions, MyProfile } from '../components';

class Section extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
  }
  /*
   * LIFECYCLE METHODS
   */

  renderDescription() {
    const { description } = this.props;

    return (
      { __html: description }
    );
  }

  render() {
    const {
      description,
      headline,
      id,
      sidebarMyInterestsRef,
    } = this.props;

    let formBody;

    switch (id) {
      case 'my-interests':
        formBody = <MyInterests id={id} sectionRef={this.ref} sidebarRef={sidebarMyInterestsRef} />;
        break;
      case 'my-subscriptions':
        formBody = <MySubscriptions id={id} />;
        break;
      case 'my-profile':
        formBody = <MyProfile id={id} />;
        break;
      default:
        formBody = <div />;
        break;
    }

    return (
      <section ref={this.ref}>
        <a className="sr-only" href={`#${id}`} name={id}>{headline}</a>
        <h2>{headline}</h2>
        {description ? <div className="section-description" dangerouslySetInnerHTML={this.renderDescription()} /> : ''}
        {formBody}
      </section>
    );
  }
}

Section.defaultProps = {
  description: null,
  sidebarMyInterestsRef: null,
};

Section.propTypes = {
  description: PropTypes.string,
  headline: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  sidebarMyInterestsRef: PropTypes.shape(),
};

export default Section;
