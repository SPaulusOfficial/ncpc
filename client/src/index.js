import 'react-app-polyfill/ie11';
import 'url-search-params-polyfill';
// import 'whatwg-fetch';
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
        wsBaseUrl: 'http://localhost:8010/proxy'
      },
      strings: {
        badge_email: null,
        badge_sms: null,
        button_submit: null,
        button_unsubscribeAll: null
      }
    };

    this.wsEndpoint = new ConfigService();

    this.urlParams = new URLSearchParams(window.location.search);

    /*
     * HELPER METHODS
     */

    this.fetchData = () => {
      this.wsEndpoint.bu = this.state.sharedContext.bu;
      this.wsEndpoint.lang = this.state.sharedContext.lang;
      this.wsEndpoint.wsBaseUrl = this.state.sharedContext.wsBaseUrl;

      this.wsEndpoint.get().then(data => {
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

  componentWillMount() { 
    const id = (this.urlParams.has('id') ? this.urlParams.get('id') : null);
    const langBU = (this.urlParams.has('langBU') ? this.urlParams.get('langBU').split('-') : []);
    const bu = (langBU.length === 2 ? langBU[1] : null);
    const lang = (langBU.length === 2 ? langBU[0] : null);

    let isValid = false;

    // id must exist and must be 18 characters in length.
    // bu must exist and must be 2 characters in length.
    if (id && id.length === 18 && bu && bu.length === 2) {
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

    this.wsEndpoint = new ConfigService(bu, lang, 'http://localhost:8010/proxy');
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.sharedContext.bu !== prevState.sharedContext.bu || this.state.sharedContext.lang !== prevState.sharedContext.lang) {
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
              --brand-primary: ${this.state.colors.brandPrimary};

              --button-default: ${this.state.colors.buttonDefault};
              --button-hover: #146BCF;
      
              --form-check-active: ${this.state.colors.brandPrimary};
              --form-check-active-hover: #146BCF;
              --form-check-default: #D1CFCE;
              --form-check-hover: #146BCF;
      
              --form-switch-active: ${this.state.colors.formSwitchActive};
              --form-switch-default: #646464;
              --form-switch-disabled: #CCCCCC;
              --form-switch-hover: #146BCF;
            }
            `}
          </style>
        </AppContext.Provider>
      </React.Fragment>
    )
  }

  renderMain() {
    if (this.state.sharedContext.isValid) {
      return <Main bannerImg={this.state.images.banner.url} bannerText={this.state.banner} buttonSubmit={this.state.strings.button_submit} sections={this.state.sections} />;
    } else {
      return <Roadblock />;
    }
  }
}

const rootElement = document.getElementById("root");

ReactDOM.render(<App />, rootElement);

// Instantiate the CSS Variables Ponyfill. (SEE: https://jhildenbiddle.github.io/css-vars-ponyfill/)
cssVars();