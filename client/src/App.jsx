import React from 'react';

import { isEqual, merge } from 'lodash';

import AppContext from './AppContext';
import ConfigService from './services/config-service';
import {
  Footer,
  Header,
  Main,
  Roadblock,
} from './landmarks';

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
            url: null,
          },
          logo: {
            link: null,
            url: null,
          },
        },
        links: {
          footerPrivacy: {
            label: null,
            url: null,
          },
          footerTerms: {
            label: null,
            url: null,
          },
        },
        sections: [],
      },
    };

    this.wsEndpoint = new ConfigService(null, null, '/api');

    /*
    * HELPER METHODS
    */

    this.fetchData = () => {
      const { setValue, value } = this.context;

      this.wsEndpoint.get().then((data) => {
        setValue(
          { ...value.locale },
          merge({ ...value.settings }, data.settings),
          merge({ ...value.strings }, data.strings),
          merge({ ...value.theme }, data.theme),
        );

        this.setState({ managedContent: data.managedContent });
      });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.context;
    const { locale } = this.state;

    if (!isEqual(value.locale, locale)) {
      this.setState({ locale: { ...value.locale } });
    }

    if (!isEqual(prevState.locale, locale)) {
      this.wsEndpoint.bu = value.locale.businessUnit;
      this.wsEndpoint.lang = value.locale.language;

      this.fetchData();
    }
  }

  renderMain() {
    const { value } = this.context;
    const { managedContent } = this.state;

    let content = null;

    if (value.id !== null) {
      content = <Main heroImg={managedContent.images.hero} heroHeadline={value.strings.hero_headline} sections={managedContent.sections} />;
    } else {
      content = <Roadblock />;
    }

    return content;
  }

  render() {
    const { value } = this.context;
    const { managedContent } = this.state;

    return (
      <div>
        <Header languages={managedContent.languages} logo={managedContent.images.logo} />
        {this.renderMain()}
        <Footer companyName={value.strings.footer_companyName} privacyLink={managedContent.links.footerPrivacy} termsLink={managedContent.links.footerTerms} />
        <style>
          {`
          :root {
            --border-radius: ${value.theme.borderRadius};
            --brand-primary: ${value.theme.colors.brandPrimary};
            --button-default: ${value.theme.colors.buttonDefault};
            --button-hover: ${value.theme.colors.buttonHover};
            --font-family: ${value.theme.fontFamily};
            --form-check-active: ${value.theme.colors.formCheckActive};
            --form-check-active-hover: ${value.theme.colors.formCheckActiveHover};
            --form-check-default: ${value.theme.colors.formCheckDefault};
            --form-check-hover: ${value.theme.colors.formCheckHover};
            --form-switch-default: ${value.theme.colors.formSwitchDefault};
            --form-switch-disabled: ${value.theme.colors.formSwitchDisabled};
            --form-switch-active: ${value.theme.colors.formSwitchActive};
            --form-switch-hover: ${value.theme.colors.formSwitchHover};
            --hero-text-color:  ${value.theme.colors.heroText};
          }
          `}
        </style>
      </div>
    );
  }
}

App.contextType = AppContext;

export default App;
