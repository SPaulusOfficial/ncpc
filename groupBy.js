module.exports = {
  groupByProfile: groupByProfile = (objectArray, ...properties) => {
    return [...Object.values(objectArray.reduce((accumulator, object) => {
      const key = JSON.stringify(properties.map((x) => object[x] || null));

      if (!accumulator[key]) {
        accumulator[key] = {
          id: object['profid'],
          controlType: object['fieldtype'],
          label: object['label'],
          placeholder: object['placeholder'],
          disabled: object['disabled'],
          order: object['order'],
          value: object[''],
          mappedField: object[''+properties+''],
          options: []
        };
      }
      
      if(object['optionid']){
        const filteredObject = {
          id: object['optionid'],
          label: object['optionlabel'],
          order: object['optionorder'],
          value: object['optionvalue'],
        };
        
        accumulator[key].options.push(filteredObject);
      }

      return accumulator;
    }, {}))];
  },

  groupByInterest: groupByInterest = (objectArray, ...properties) => {
    return [...Object.values(objectArray.reduce((accumulator, object) => {
      const key = JSON.stringify(properties.map((x) => object[x] || null));

      if (!accumulator[key]) {
        accumulator[key] = {
          catcontrolType: 'formGroup',
          catid: object['ncpc__categoryid__c'],
          catlabel: object['categoryname'],
          catorder: object['ncpc__categoryorder__c'],
          interests: []
        };
      }
      
      const filteredObject = {
        userIntId: object['userintid'],
        availableIntId: object['availableintid'],
        controlType: 'checkbox',
        label: object['ncpc__display_text__c'],
        description: object['ncpc__display_description__c'],
        checked: object['optinstate'],
        disabled: object['ncpc__disabled__c'],
        order: object['ncpc__order__c'],
        url: object['ncpc__icon_url__c']
      };
      
      accumulator[key].interests.push(filteredObject);
      
      return accumulator;
    }, {}))];
  },

  groupBySubscriptionCampaign: groupBySubscriptionCampaign = (objectArray, ...properties) => {
    return [...Object.values(objectArray.reduce((accumulator, object) => {
      const key = JSON.stringify(properties.map((x) => object[x] || null));

      if (!accumulator[key]) {
        accumulator[key] = {
          catcontrolType: 'formGroup',
          catid: object['ncpc__categoryid__c'],
          catlabel: object['categoryname'],
          catorder: object['catorder'],
          userSubId: object['usersubid'],
          availableSubId: object['availablesubid'],
          controlType: 'switch',
          label: object['ncpc__display_text__c'],
          checked: object['optinstate'],
          description: object['ncpc__display_description__c'],
          channel: object['ncpc__channel__c'],
          disabled: object['ncpc__disabled__c'],
          public: object['ncpc__public__c'],
          order: object['ncpc__order__c'],
          campaigns: []
        };
      }

      if(object['campaignid']){
        const campaignObject = {
          memberId: object['campaignmemberid'],
          name: object['campaignname'],
          id: object['campaignid'],
          memberStatus: object['ncpc__subscribed__c']
        }
        
        accumulator[key].campaigns.push(campaignObject);
      }
      
      return accumulator;
    }, {}))];
  },

  groupBySubscription: groupBySubscription = (objectArray, ...properties) => {
    return [...Object.values(objectArray.reduce((accumulator, object) => {
      const key = JSON.stringify(properties.map((x) => object[x] || null));

      if (!accumulator[key]) {
        accumulator[key] = {
          catcontrolType: 'formGroup',
          catid: object['catid'],
          catlabel: object['catlabel'],
          catorder: object['catorder'],
          subscriptions: []
        };
      }
      
      const filteredObject = {
        userSubId: object['usersubid'],
        availableSubId: object['availablesubid'],
        controlType: 'switch',
        label: object['label'],
        checked: object['checked'],
        description: object['description'],
        channel: object['channel'],
        disabled: object['disabled'],
        public: object['public'],
        order: object['order'],
        campaigns: object['campaigns']
      };
      
      accumulator[key].subscriptions.push(filteredObject);
      
      return accumulator;
    }, {}))];
  }
}