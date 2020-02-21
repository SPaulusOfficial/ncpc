import React from 'react';

import { isEqual, merge } from 'lodash';

import AppContext from './AppContext';
import ConfigService from './services/config-service';
import { Footer, Header, Main, Roadblock } from './landmarks';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      locale: {
        businessUnit: null,
        language: null,
      },
      managedContent: {
        images: {
          hero: {
            link: null,
            url: null
          },
          logo: {
            link: null,
            url: null
          }
        },
        links: {
          footerPrivacy: {
            label: null,
            url: null
          },
          footerTerms: {
            label: null,
            url: null
          }
        },
        sections: []
      }
    };

    this.wsEndpoint = new ConfigService(null, null, '/api');;
    
    /*
    * HELPER METHODS
    */

    this.fetchData = () => {
      this.wsEndpoint.get().then(data => {
        this.context.setValue(
          {...this.context.value.locale},
          merge(this.context.value.settings, data.settings),
          merge(this.context.value.strings, data.strings),
          merge(this.context.value.theme, data.theme)
        );
        
        this.setState({ managedContent:data.managedContent });
      });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidUpdate(prevProps, prevState, snapshot) {    
    if (this.context && this.context.value && !isEqual(this.context.value.locale, this.state.locale)) {
      this.setState({ locale:{...this.context.value.locale }});
    }

    if (!isEqual(prevState.locale, this.state.locale)) {
      this.wsEndpoint.bu = this.context.value.locale.businessUnit;
      this.wsEndpoint.lang = this.context.value.locale.language;
      
      this.fetchData();
    }
  }
  
  render() {
    return (
      <div>
        <Header languages={this.state.managedContent.languages} logo={this.state.managedContent.images.logo} />
        {this.renderMain()}
        <Footer companyName={this.context.value.strings.footer_companyName} privacyLink={this.state.managedContent.links.footerPrivacy} termsLink={this.state.managedContent.links.footerTerms} />
        <style>
          {`
          :root {
            --border-radius: ${this.context.value.theme.borderRadius};
            --brand-primary: ${this.context.value.theme.colors.brandPrimary};
            --button-default: ${this.context.value.theme.colors.buttonDefault};
            --button-hover: ${this.context.value.theme.colors.buttonHover};
            --font-family: ${this.context.value.theme.fontFamily};
            --form-check-active: ${this.context.value.theme.colors.formCheckActive};
            --form-check-active-hover: ${this.context.value.theme.colors.formCheckActiveHover};
            --form-check-default: ${this.context.value.theme.colors.formCheckDefault};
            --form-check-hover: ${this.context.value.theme.colors.formCheckHover};
            --form-switch-active: ${this.context.value.theme.colors.formSwitchActive};
            --form-switch-default: ${this.context.value.theme.colors.formSwitchDefault};
            --form-switch-disabled: ${this.context.value.theme.colors.formSwitchDisabled};
            --form-switch-hover: ${this.context.value.theme.colors.formSwitchHover};
            --hero-text-color:  ${this.context.value.theme.colors.heroText};
          }
          `}
        </style>
      </div>
    )
  }

  renderMain() {
    if (this.state.locale.businessUnit !== null && this.state.locale.language !== null) {
      return <Main heroImg={this.state.managedContent.images.hero} heroHeadline={this.context.value.strings.hero_headline} sections={this.state.managedContent.sections} />;
    } else {
      return <Roadblock />;
    }
  }
}

App.contextType = AppContext;

export default App;
