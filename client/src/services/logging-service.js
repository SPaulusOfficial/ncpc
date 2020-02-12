class LoggingService {
  constructor(wsBaseUrl) {
    this.wsBaseUrl = wsBaseUrl;
  };

  /*
   * POST
   * URI: https://ncpc-horizontal.herokuapp.com/log
   * PAYLOAD:
   * {
   *   "endpoint": "",
   *   "errorMessage": "",
   *   "overallStatus":"",
   *   "requestPayload":"",
   * }
   */
  async post(endpoint, errorMessage, overallStatus, requestPayload) {
    // console.log('LoggingService.post()', endpoint, errorMessage, overallStatus, requestPayload);

    const wsUri = this.wsBaseUrl + '/log';

    let data = {
      endpoint: endpoint,
      errorMessage: errorMessage,
      overallStatus: overallStatus,
      requestPayload: requestPayload
    };

    let options = {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    };

    return fetch(wsUri, options)
      .then(response => {
        return response.json();
      })
      .catch(error => {
        throw error;
      });
  }
}

export default LoggingService;
