import React from 'react';

import { MyInterests, MySubscriptions, MyProfile } from '../components';

class Section extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
  }
  /*
   * LIFECYCLE METHODS
   */

  render() {
    let formBody;

    switch(this.props.id) {
      case 'my-interests':
        formBody = <MyInterests id={this.props.id} sectionRef={this.ref} sidebarRef={this.props.sidebarMyInterestsRef} />
        break;
      case 'my-subscriptions':
        formBody = <MySubscriptions id={this.props.id} />
        break;
      case 'my-profile':
        formBody = <MyProfile id={this.props.id} />
        break;
      default:
        formBody = <div />
        break;
    }

    return (
      <section ref={this.ref}>
        <a className="sr-only" href={'#' + this.props.id} name={this.props.id}>{this.props.headline}</a>
        <h2>{this.props.headline}</h2>
        {this.props.description ? <div className="section-description" dangerouslySetInnerHTML={this.renderDescription()} /> : ''}
        {formBody}
      </section>
    )
  }

  renderDescription() {
    return(
      {__html:this.props.description }
    )
  }
}

export default Section;
