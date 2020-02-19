import 'polyfill-array-includes';
import 'react-app-polyfill/ie11';
import 'url-search-params-polyfill';
import cssVars from 'css-vars-ponyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import ConfigService from './services/config-service';

import AppContext from './AppContext';
import { Footer, Header, Main, Roadblock } from './landmarks';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

import 'bootstrap/dist/js/bootstrap.bundle';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      banner: null,
      colors: [],
      footer: {
        companyName: null,
        privacy: {
          label: null,
          url: null
        },
        terms: {
          label: null,
          url: null
        }
      },
      images: {
        banner: {},
        logo: {}
      },
      sections: [],
      sharedContext: {
        bu: null,
        id: null,
        isValid: false,
        lang: null,
        strings: {
          badge_email: null,
          badge_sms: null,
          button_submit: null,
          button_unsubscribeAll: null
        },
        wsBaseUrl: '/api'
      }
    };

    this.wsEndpoint = null;

    this.urlParams = new URLSearchParams(window.location.search);

    /*
     * HELPER METHODS
     */

    this.fetchData = () => {
      this.wsEndpoint.bu = this.state.sharedContext.bu;
      this.wsEndpoint.lang = this.state.sharedContext.lang;
      this.wsEndpoint.wsBaseUrl = this.state.sharedContext.wsBaseUrl;

      this.wsEndpoint.get().then(data => {
        // Move the "strings" object into sharedContext so it can be shared across components.
        data.sharedContext = {
          ...this.state.sharedContext,
          strings: data.strings
        };

        this.setState(data);
      });
    };

    this.setSharedContext = (lang, bu) => {
      this.setState(prevState => ({
        sharedContext: {
          ...prevState.sharedContext,
          bu: bu,
          lang: lang
        }
      }), () => {
        this.urlParams.set('langBU', lang + '-' + bu);

        window.history.replaceState({}, '', `${window.location.pathname}?${this.urlParams}`);
      });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    const id = (this.urlParams.has('id') ? this.urlParams.get('id') : null);
    const langBU = (this.urlParams.has('langBU') ? this.urlParams.get('langBU').split('-') : []);
    const bu = (langBU.length === 2 ? langBU[1] : null);
    const lang = (langBU.length === 2 ? langBU[0] : null);

    let isValid = false;

    // id must exist and must be 18 characters in length.
    // bu must exist and must be 2 characters in length.
    if (id && bu && bu.length === 2) {
      isValid = true;
    }

    this.setState({
      sharedContext: {
        ...this.state.sharedContext,
        bu: bu,
        id: id,
        isValid: isValid,
        lang: lang
      }
    });

    this.wsEndpoint = new ConfigService(bu, lang, '');
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.wsEndpoint !== null && (this.state.sharedContext.bu !== prevState.sharedContext.bu || this.state.sharedContext.lang !== prevState.sharedContext.lang)) {
      this.fetchData();
    }
  }
  
  render() {
    return (
      <React.Fragment>
        <AppContext.Provider value={{ value:this.state.sharedContext, setValue:this.setSharedContext }}>
          <Header languages={this.state.languages} logoImage={this.state.images.logo.url} logoLink={this.state.images.logo.link} />
          {this.renderMain()}
          <Footer companyName={this.state.footer.companyName} privacyLabel={this.state.footer.privacy.label} privacyUrl={this.state.footer.privacy.url} termsLabel={this.state.footer.terms.label} termsUrl={this.state.footer.terms.url} />
          <style>
            {`
            :root {
              --border-radius: ${(this.state.borderRadius) ? this.state.borderRadius : '8px'};
              --brand-primary: ${(this.state.colors.brandPrimary) ? this.state.colors.brandPrimary : '#2275D3'};
              --button-default: ${(this.state.colors.buttonDefault) ? this.state.colors.buttonDefault : '#2275D3'};
              --button-hover: ${(this.state.colors.buttonHover) ? this.state.colors.buttonHover : '#146BCF'};
              --form-check-active: ${(this.state.colors.formCheckActive) ? this.state.colors.formCheckActive : '#2275D3'};
              --form-check-active-hover: ${(this.state.colors.formCheckActiveHover) ? this.state.colors.formCheckActiveHover : '#146BCF'};
              --form-check-default: ${(this.state.colors.formCheckDefault) ? this.state.colors.formCheckDefault : '#D1CFCE'};
              --form-check-hover: ${(this.state.colors.formCheckHover) ? this.state.colors.formCheckHover : '#146BCF'};
              --form-switch-active: ${(this.state.colors.formSwitchActive) ? this.state.colors.formSwitchActive : '#D1CFCE'};
              --form-switch-default: ${(this.state.colors.formSwitchDefault) ? this.state.colors.formSwitchDefault : '#646464'};
              --form-switch-disabled: ${(this.state.colors.formSwitchDisabled) ? this.state.colors.formSwitchDisabled : '#CCCCCC'};
              --form-switch-hover: ${(this.state.colors.formSwitchHover) ? this.state.colors.formSwitchHover : '#146BCF'};
              --hero-text-color: ${(this.state.colors.heroTextColor) ? this.state.colors.heroTextColor : '#000000'};
            }
            `}
          </style>
        </AppContext.Provider>
      </React.Fragment>
    )
  }

  renderMain() {
    if (this.state.sharedContext.isValid) {
      return <Main bannerImg={this.state.images.banner.url} bannerText={this.state.banner} sections={this.state.sections} />;
    } else {
      return <Roadblock />;
    }
  }
}

const rootElement = document.getElementById("root");

ReactDOM.render(<App />, rootElement);

// Instantiate the CSS Variables Ponyfill. (SEE: https://jhildenbiddle.github.io/css-vars-ponyfill/)
cssVars();