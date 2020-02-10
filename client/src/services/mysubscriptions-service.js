import LoggingService from './logging-service';

class MySubscriptionsService {
  constructor(bu, id, lang, wsBaseUrl) {
    this.bu = bu;
    this.id = id;
    this.lang = lang;
    this.logger = new LoggingService(wsBaseUrl);
    this.wsBaseUrl = wsBaseUrl;
  };

  /*
   * GET
   * URI: https://ncpc-horizontal.herokuapp.com/subscriptions?id={{USER_ID}}&langBU={{BUSINESS_UNIT}}
   */
  async get() {
    // console.log('MySubscriptionsService.get()');

    const wsUri = this.wsBaseUrl + '/subscriptions?id=' + this.id + '&langBU=' + this.lang + '-' + this.bu;

    let options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    };

    return fetch(wsUri, options)
      .then(response => response.json())
      .then(response => {
        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return response;
      })
      .catch(error => {
        this.logger.post(wsUri, error, '500');

        throw error;
      });
  }

  /*
   * POST (Campaign)
   * URI: https://ncpc-horizontal.herokuapp.com/subscription
   * PAYLOAD:
   * {
   *   "campaignId":"{{ }}",
   *   "campaignMemberId": "{{ }}",
   *   "id": "{{USER_ID}}"
   *   "status":"false",
   * }
   */
  async postCampaign(campaignId, campaignMemberId) {
    // console.log('MySubscriptionsService.postCampaign()', campaignId, campaignMemberId);
    
    const wsUri = this.wsBaseUrl + '/campaign';

    let body = {
      campaignId: campaignId,
      id: this.id,
      campaignMemberId: campaignMemberId,
      status: false
    };

    let options = {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    };

    return fetch(wsUri, options)
      .then(response => response.json())
      .then(response => {
        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return response;
      })
      .catch(error => {
        this.logger.post(wsUri, error, '500', options);

        throw error;
      });
  }

  /*
   * POST (Subscription)
   * URI: https://ncpc-horizontal.herokuapp.com/subscription
   * PAYLOAD:
   * {
   *   "availableSubId":"{{ }}",
   *   "id": "{{USER_ID}}",
   *   "value":"{{FIELD_VALUE}}"
   * }
   */
  async postSubscription(availableSubId, fieldValue) {
    // console.log('MySubscriptionsService.postSubscription()', availableSubId, fieldValue);
    
    const wsUri = this.wsBaseUrl + '/subscription';

    let body = {
      availableSubId: availableSubId,
      id: this.id,
      value: fieldValue
    };

    let options = {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    };

    return fetch(wsUri, options)
      .then(response => response.json())
      .then(response => {
        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return response;
      })
      .catch(error => {
        this.logger.post(wsUri, error, '500', options);

        throw error;
      });
  }

  /*
   * POST (Unsubscribe All)
   * URI: https://ncpc-horizontal.herokuapp.com/unsubscribeAll
   * PAYLOAD:
   * {
   *   "id": "{{USER_ID}}",
   * }
   */
  async postUnsubscribeAll() {
    // console.log('MySubscriptionsService.postUnsubscribeAll()');

    const wsUri = this.wsBaseUrl + '/unsubscribeAll';

    let body = {
      id: this.id
    };

    let options = {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    };

    return fetch(wsUri, options)
      .then(response => response.json())
      .then(response => {
        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return response;
      })
      .catch(error => {
        this.logger.post(wsUri, error, '500', options);

        throw error;
      });
  }
}

export default MySubscriptionsService;
