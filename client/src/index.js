import 'polyfill-array-includes';
import 'react-app-polyfill/ie11';
import 'url-search-params-polyfill';
import cssVars from 'css-vars-ponyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import AppContext from './AppContext';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

import 'bootstrap/dist/js/bootstrap.bundle';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availableSubId: null,
      id: null,
      locale: {
        businessUnit: null,
        language: null,
      },
      settings: {
        channelLabelsEnabled: true
      },
      strings: {
        badge_email: 'Email',
        badge_sms: 'SMS',
        button_submit: 'Submit',
        button_unsubscribeAll: 'Unsubscribe All',
        cookies_button: 'OK',
        cookies_text: 'We use cookies on this site to enhance your user experience. By continuing to use this site, you consent to our cookies as described in our <a href="https://www.horizontal.com/page/privacy-center/" target="_blank">Privacy Policy</a>.',
        footer_companyName: 'Horizontal',
        forgetMe_button_primary: 'Forget Me',
        forgetMe_modal_body: 'Clicking "Forget Me" will cause your profile to be permanently deleted. This action cannot be undone.',
        forgetMe_modal_title: 'Are you sure?',
        hero_headline: 'Manage Salesforce Subscriptions',
        pageTitle: 'Managed Preference Center',
        roadblock: 'No user could not be found, or a user ID was not provided. Please try again.'
      },
      theme: {
        borderRadius: '8px',
        colors: {
          brandPrimary: '#2275D3',
          buttonDefault: '#2275D3',
          buttonHover: '#146BCF',
          formCheckActive: '#2275D3',
          formCheckActiveHover: '#146BCF',
          formCheckDefault: '#D1CFCE',
          formCheckHover: '#146BCF',
          formSwitchActive: '#D1CFCE',
          formSwitchDefault: '#646464',
          formSwitchDisabled: '#CCCCCC',
          formSwitchHover: '#146BCF',
          heroText: '#000000'
        },
        fontFamily: ''
      }
    };

    this.urlParams = new URLSearchParams(window.location.search);

    /*
     * HELPER METHODS
     */

    this.setSharedContext = (_locale, _settings, _strings, _theme) => {
      this.setState({
        locale: _locale,
        settings: _settings,
        strings: _strings,
        theme: _theme
      }, () => {
        this.urlParams.set('langBU', _locale.language + '-' + _locale.businessUnit);

        window.history.replaceState({}, '', `${window.location.pathname}?${this.urlParams}`);
      });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    const id = (this.urlParams.has('id') ? this.urlParams.get('id') : null);
    const langBU = (this.urlParams.has('langBU') && this.urlParams.get('langBU').split('-').length === 2 ? this.urlParams.get('langBU').split('-') : ['EN', 'US']);
    const availableSubId = (this.urlParams.has('availableSubId') ? this.urlParams.get('availableSubId') : null);

    const bu = (langBU.length === 2 ? langBU[1] : null);
    const lang = (langBU.length === 2 ? langBU[0] : null);

    this.setState({ availableSubId:availableSubId, id:id, locale:{ businessUnit:bu, language:lang } });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.strings.pageTitle !== this.state.strings.pageTitle) {
      document.title = this.state.strings.pageTitle;
    }
  }
  
  render() {
    return (
      <React.Fragment>
        <AppContext.Provider value={{ value:this.state, setValue:this.setSharedContext }}>
          <App />
        </AppContext.Provider>
      </React.Fragment>
    )
  }
}

const rootElement = document.getElementById("root");

ReactDOM.render(<Index />, rootElement);

// Instantiate the CSS Variables Ponyfill. (SEE: https://jhildenbiddle.github.io/css-vars-ponyfill/)
cssVars();
