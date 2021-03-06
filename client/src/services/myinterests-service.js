import LoggingService from './logging-service';

class MyInterestsService {
  constructor(bu, id, lang, wsBaseUrl) {
    this.bu = bu;
    this.id = id;
    this.lang = lang;
    this.logger = new LoggingService(wsBaseUrl);
    this.wsBaseUrl = wsBaseUrl;
  }

  /*
   * GET
   * URI: https://ncpc-horizontal.herokuapp.com/interests?id={{USER_ID}}&langBU={{BUSINESS_UNIT}}
   */
  async get() {
    const wsUri = `${this.wsBaseUrl}/interests?id=${this.id}&langBU=${this.lang}-${this.bu}`;

    return fetch(wsUri)
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          this.logger.post(wsUri, response.message, response.status, response.body);

          throw new Error();
        }

        if (!Array.isArray(response) || !response.length) {
          throw new Error();
        }

        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return response;
      })
      .catch((error) => {
        this.logger.post(wsUri, error, '500');

        throw error;
      });
  }

  /*
   * POST
   * URI: https://ncpc-horizontal.herokuapp.com/interest
   * PAYLOAD:
   * {
   *   "availableIntId": {{ }},
   *   "id": {{USER_ID}},
   *   "value": fieldValue
   * }
   */
  async post(availableIntId, fieldValue) {
    const wsUri = `${this.wsBaseUrl}/interest`;

    const data = {
      availableIntId,
      id: this.id,
      value: fieldValue,
    };

    const options = {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };

    return fetch(wsUri, options)
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          this.logger.post(wsUri, response.message, response.status, response.body);

          throw new Error();
        }

        if (response.success && response.success === 'fail') {
          this.logger.post(wsUri, response.message, response.status, response.body);
        }

        return response;
      })
      .catch((error) => {
        this.logger.post(wsUri, error, '500', options);

        throw error;
      });
  }
}

export default MyInterestsService;
