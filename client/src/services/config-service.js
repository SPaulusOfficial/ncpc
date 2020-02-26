import LoggingService from './logging-service';

class ConfigService {
  constructor(bu, lang, wsBaseUrl) {
    this.bu = bu;
    this.lang = lang;
    this.logger = new LoggingService(wsBaseUrl);
    this.wsBaseUrl = wsBaseUrl;
  };

  /*
   * GET
   * URI: https://ncpc-horizontal.herokuapp.com/package?langBU={{BUSINESS_UNIT}}
   */
  async get() {
    const wsUri = this.wsBaseUrl + '/package?langBU=' + this.lang + '-' + this.bu;

    return fetch(wsUri)
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          this.logger.post(wsUri, response.message, response.status, response.body);

          throw new Error();
        }

        if (!Array.isArray(response.config) || !response.config.length || !Array.isArray(response.languages) || !response.languages.length) {
          throw new Error();
        }

        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return this.parseResponseObject(response);
      })
      .catch(error => {
        this.logger.post(wsUri, error, '500');

        throw error;
      });
  }

  /*
  * HELPER METHODS
  */
  
  parseResponseObject(data) {
    const config = data.config[0];
      const languages = data.languages;

      let parsedLanguages = languages.map(language => {
        const parsedLanguage = {
          bu: language.ncpc__business_unit_parameter__c,
          label: language.name,
          lang: language.ncpc__language_parameter__c
        };
        return parsedLanguage;
      });

      let parsedData = {
        managedContent: {
          images: {
            hero: {
              link: null,
              url: config.ncpc__banner_url__c
            },
            logo: {
              link: config.ncpc__logo_link_url__c,
              url: config.ncpc__logo_url__c
            }
          },
          languages: parsedLanguages,
          links: {
            footerPrivacy: {
              label: config.ncpc__footer_privacy_text__c,
              url: config.ncpc__footer_privacy_url__c
            },
            footerTerms: {
              label: config.ncpc__footer_terms_text__c,
              url: config.ncpc__footer_terms_url__c
            }
          },
          sections: [
            {
              description: config.ncpc__profile_text__c,
              headline: config.ncpc__profile_header__c,
              id: 'my-profile',
              order: 0
            },{
              description: config.ncpc__interest_text__c,
              headline: config.ncpc__interest_header__c,
              id: 'my-interests',
              order: 1
            },{
              description: config.ncpc__subscription_intro__c,
              headline: config.ncpc__subscription_header__c,
              id: 'my-subscriptions',
              order: 2
            }
          ],
        },
        settings: {
          channelLabelsEnabled: config.ncpc__channel_labels_enabled__c
        },
        strings: {
          badge_email: config.ncpc__email_channel_text__c,
          badge_sms: config.ncpc__sms_channel_text__c,
          button_submit: config.ncpc__save_button_text__c,
          button_unsubscribeAll: config.ncpc__unsubscribe_all_button_text__c,
          footer_companyName: config.ncpc__company_name__c,
          hero_headline: config.ncpc__banner_text_2__c,
          pageTitle: config.ncpc__page_title__c
        },
        theme: {
          borderRadius: config.ncpc__border_radius__c,
          colors: {
            brandPrimary: config.ncpc__brand_color_hex_code__c,
            buttonDefault: config.ncpc__button_color_hex_code__c,
            buttonHover: config.ncpc__button_hover_hex_code__c,
            formCheckActive: config.ncpc__checkbox_active_color_hex_code__c,
            formCheckActiveHover: config.ncpc__checkbox_active_hover_color_hex_code__c,
            formCheckDefault: config.ncpc__checkbox_default_color_hex_code__c,
            formCheckHover: config.ncpc__checkbox_default_hover_color_hex_code__c,
            formSwitchActive: config.ncpc__active_toggle_color_hex_code__c,
            formSwitchDefault: config.ncpc__inactive_toggle_color_hex_code__c,
            formSwitchDisabled: config.ncpc__disabled_toggle_color_hex_code__c,
            formSwitchHover: config.ncpc__hover_toggle_color_hex_code__c,
            heroText: config.ncpc__hero_text_color_hex_code__c
          },
          fontFamily: config.ncpc__font_family__c
        }
      };

      return parsedData;
  }
}

export default ConfigService;
