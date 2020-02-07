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
    console.log('ConfigService.get()');

    const wsUri = this.wsBaseUrl + '/package?langBU=' + this.lang + '-' + this.bu;

    return fetch(wsUri)
      .then(response => response.json())
      .then(response => {
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
        banner: config.ncpc__banner_text_2__c,
        colors: {
          brandPrimary: config.ncpc__brand_color_hex_code__c,
          buttonDefault: config.ncpc__button_color_hex_code__c,
          formSwitchActive: config.ncpc__active_toggle_color_hex_code__c,
        },
        footer: {
          companyName: config.ncpc__company_name__c,
          privacy: {
            label: config.ncpc__footer_privacy_text__c,
            url: config.ncpc__footer_privacy_url__c
          },
          terms: {
            label: config.ncpc__footer_terms_text__c,
            url: config.ncpc__footer_terms_url__c
          }
        },
        images: {
          banner: {
            link: null,
            url: config.ncpc__banner_url__c
          },
          logo: {
            link: config.ncpc__logo_link_url__c,
            url: config.ncpc__logo_url__c
          }
        },
        languages: parsedLanguages,
        sections: [
          {
            "description": config.ncpc__profile_text__c,
            "headline": config.ncpc__profile_header__c,
            "id": "my-profile",
            "order": 0
          },{
            "description": config.ncpc__interest_text__c,
            "headline": config.ncpc__interest_header__c,
            "id": "my-interests",
            "order": 1
          },{
            "description": config.ncpc__subscription_intro__c,
            "headline": config.ncpc__subscription_header__c,
            "id": "my-subscriptions",
            "order": 2
          }
        ]
      };

      return parsedData;
  }
}

export default ConfigService;
