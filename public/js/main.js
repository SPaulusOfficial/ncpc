
var LanguageSelector = function(config) {
  // Merge defaults and config
  this.settings = $.extend({}, this.defaults, config);
  $(document).on('click', this.settings.$languageSelectorTrigger, this.togglelanguageSelector.bind(this));
  $(document).on('click', this.clickOutside.bind(this));
}


LanguageSelector.prototype.togglelanguageSelector = function(e) {
  e.preventDefault();

  if(!$(this.settings.$languageSelectorList).length) {
    return;
  }

  $(this.settings.$languageSelectorTrigger).toggleClass(this.settings.activeClass);
  $(this.settings.$languageSelectorTarget).toggleClass(this.settings.openClass);
  $(this.settings.$languageSelectorContainer).toggleClass(this.settings.activeClass)
  $(this.settings.$languageSelectorTarget).find('ul').stop(true).slideToggle();
  
}


LanguageSelector.prototype.clickOutside = function(e) {
  if(!$(this.settings.$languageSelectorList).length) {
    return;
  }
  
  if(!$(e.target).hasClass('language-selector-toggle')) {
    $(this.settings.$languageSelectorTarget).find('ul').slideUp();
    $(this.settings.$languageSelectorTrigger).removeClass(this.settings.activeClass);
  }
}


LanguageSelector.prototype.defaults = {
  offset: 0,
  open: false,
  activeClass: 'active',
  openClass: 'open',
  isMobile: null,
  mobileBreakpoint: 992,
  animationSpeed: 350,
  $submenu: '.navigation-submenu',
  $languageSelectorTrigger: '.language-selector-toggle',
  $languageSelectorTarget: '.language-selector',
  $languageSelectorContainer: '.language-selector-container',
  $languageSelectorList: '#language-selector'
}


$(function() {
  // instantiate Slidey nav
  new LanguageSelector();
});

var PreferenceCenter = function(config) {
  this.settings = $.extend({}, this.DEFAULTS, config);
  $(this.els.$sidebar).on('click', 'a', this.scrollTo.bind(this));
  $(this.els.$subscriptions).on('change', 'input[type="checkbox"]', this.updateSubscriptions.bind(this));
  $(this.els.$interests).on('change', 'input[type="checkbox"]', this.updateInterests.bind(this));
  $(this.els.$profile).on('change', 'input[type!="checkbox"]', this.updateProfile.bind(this));
  $(document).on('click', this.els.$unsubscribeBtn, this.unsubscribeAll.bind(this));
  $(document).on('click', this.els.$saveBtn, this.toggleSaveButton.bind(this));
  $(this.els.$profileForm).on('submit', this.handleFormSubmit.bind(this));
  $(window).on('scroll', this.handleScroll.bind(this))
    .on('resize', this.handleResize.bind(this));
}

/*
  SETUP
*/

PreferenceCenter.prototype.endpoints = {
  Base: 'https://ncpc-horizontal.herokuapp.com',
  //RetrieveProfile: ‘ahq5cgdy10v’,
  RetrieveSubscription: 'availableSubscriptions',
  RetrieveInterest: 'availableInterests',
  RetrieveProfileFields: 'profile',
  // RetrieveProfileFieldOptions: 'ahq5cgdy10v',

  PostSubscription: 'subscriptions',
  PostInterest: 'interests',
  PostUnsubscribeAll: 'unsubscribeAll',
  PostProfile: 'profile',
  PostLog: 'log'
}

PreferenceCenter.prototype.DEFAULTS = {
  mobileBreakpoint: 992,
  //minSavingTime: 233,
  redirectOnError: false,
  redirectUrl: 'https://www.cargill.com/page-not-found',
  formValid: true
}

PreferenceCenter.prototype.profile = {
  id: null,
  firstName: null,
  lastName: null,
  bu: null, // business unit
  lang: null // language preference
}

PreferenceCenter.prototype.els = {
  $languageSelector: '#language-selector',
  $utilityNav: '.header-utility-nav',
  $sidebar: '.pc-sidebar',
  $sidebarLinks: '.pc-sidebar-links',
  $subscriptions: '#my-subscriptions',
  $interests: '#my-interests',
  $profileForm: '#profile-form',
  $profile: '#subscription-profile',
  $saveBtn: '#pc-save',
  $unsubscribeBtn: '#unsubscribe-all',
  $footer: '.footer'
}

PreferenceCenter.prototype.templates = {
  profile: 'pc-profile.njx',
  subscriptions: 'pc-subscriptions.njx',
  interests: 'pc-interests.njx',
  languageSelector: 'language-selector.njx',
  sidebar: 'sidebar.njx',
  footer: 'footer.njx'
}

PreferenceCenter.prototype.init = function() {
  // initialize validation
  $(this.els.$profileForm).validate({
    errorPlacement: function() {
      // this removes built-in error messaging
      return true;
    }
  });

  // set sticky navigation start point
  this.settings.stickyLinksOffset = $(this.els.$sidebar).offset().top;
  this.getProfileInfo();
  this.renderSidebar();
  this.renderFooter();
  this.renderProfile();
  // this.renderProfileFields();
  this.renderSubscriptions();
  this.renderInterests();
  this.renderLanguageSelector();
}

/*
  RENDER
*/

PreferenceCenter.prototype.renderSidebar = function() {
  $(nunjucks.render(this.templates.sidebar, { lang: this.profile.lang }))
    .appendTo(this.els.$sidebar);
}

PreferenceCenter.prototype.renderFooter = function() {
  $(nunjucks.render(this.templates.footer, { lang: this.profile.lang }))
    .appendTo(this.els.$footer);
}

PreferenceCenter.prototype.renderProfile = function() {
  
  var self = this,
      payload = {
        id: this.profile.id,
        bu: this.profile.bu
      };

  this.toggleLoading(true);

  this.getData(this.getEndpoint('RetrieveProfileFields' ), payload)
    .then(function(data) {
      self.handleReceiveErrors(payload, data, 'profile');
      $(function () {
        
        setTimeout(function () {
          
          $('.multi-select').multiselect({
              columns: 1,
              search: true,
              searchOptions: {
                  'default': 'Search'
              },
              selectAll: false,
              onControlClose: function( element ) {
                var multiSelect = $(element);
                var msValues = multiSelect.siblings("div").find("button span").text();
                // var msValues = that.replace(",", "");
                
                var msField = multiSelect.attr("data-mapped-field");
                newField = msField;
                newValue = msValues;
                
                // console.log(deselectedValue);
                PreferenceCenter.prototype.updateProfilePicklist(newField, newValue);
              }
              
             
          });
          // change back to dataLocal for local testing
          $.each(data.ProfileFields, function(i,profileField) {
            if (profileField.fieldType === "Multi-Picklist") {
              var checkBoxData = profileField.fieldValue;
              // console.log(checkBoxData);
                var mappedField = $('label[for*="' + profileField.mappedField + '"]');

                var inputValues = checkBoxData.split(';');

                $(inputValues).each(function(i, item) {
                   $(mappedField).parent().find('input[value*="' + item + '"]').trigger("click");
                });
                var newestInputValues = inputValues.join(", ");
                if (newestInputValues == "") {
                  newestInputValues = "Select options";
                } 
                $(mappedField).parent().find("button span").text(newestInputValues);
            }
          });
      
        }, 0);
      });
      var mergedData = $.extend({}, data, {
        language: localStorage.getItem('lang')
      });

      $(nunjucks.render(self.templates.profile, mergedData)).appendTo(self.els.$profile);
    })
}

PreferenceCenter.prototype.renderSubscriptions = function() {
  var self = this,
      payload = {
        id: this.profile.id
        // id: '0036C00000Asl0CQAR'
      };

  this.toggleSaving(true);

  this.getData(this.getEndpoint('RetrieveSubscription'), payload)
    .error(function(res, err, errMsg) {
      console.log(res, err, errMsg);
    })
    .then(function(data) {
      const groupBy = key => array =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
      }, {});

    const groupByCategory = groupBy('ncpc__Display_Category__c');
    
    var input = data;

    function sortToCategory(obj) {

      var output = {}
      output.config = obj.config;
      output.Categories = []

      var tempObj = groupByCategory(obj.Subscription);

      for (var key in tempObj) {
        if (!tempObj.hasOwnProperty(key)) continue;

        var obj = tempObj[key];

        var categoryObj = {
          CategoryName:obj[0].ncpc__Category_Display_Text__c,
          CategoryId:obj[0].ncpc__Display_Category__c,
          order:obj[0].ncpc__Category_Order__c,
          Subscription:obj
        }

        output.Categories.push(categoryObj);

      }
      return output;
    }

    var output = sortToCategory(input);

      var mergedData = $.extend({}, output, { lang: self.profile.lang} )
      self.handleReceiveErrors(payload, data, 'subscription');
      self.toggleLoading(false);
      self.toggleSaving(false);
      $(nunjucks.render(self.templates.subscriptions, mergedData)).appendTo(self.els.$subscriptions);
        openCollapse();
        $(".collapse").on('shown.bs.collapse', function () {
          $('.subscription-card-description').matchHeight({
            byRow: false
          });
        });     
    })
}

PreferenceCenter.prototype.renderInterests = function() {
  var self = this,
      payload = {
        bu: this.profile.bu,
        // id: '0036C00000Asl0CQAR'
        id: this.profile.id
      };

  this.toggleSaving(true);

  this.getData(this.getEndpoint('RetrieveInterest'), payload)
    .error(function(res, err, errMsg) {
      console.log(res, err, errMsg);
    })
    .then(function(data) {
      var mergedData = $.extend({}, data, { lang: self.profile.lang} )
      self.handleReceiveErrors(payload, data, 'interest');
      self.toggleLoading(false);
      self.toggleSaving(false);
      $(nunjucks.render(self.templates.interests, mergedData)).appendTo(self.els.$interests);
      
      setTimeout(function() {
        if(!$('.interest-card').length){
          $("#my-interests").hide();
          $("a[href='#my-interests']").hide();
        }
      }, 2000)

      $(".interest-card input").on('click', function () {
        $(this).closest('.interest-card').toggleClass('active');
      });
    })
}

PreferenceCenter.prototype.renderLanguageSelector = function() {
  $(nunjucks.render(this.templates.languageSelector, {
    profile: this.profile,
    baseUrl: window.location.origin + window.location.pathname
  })).appendTo(this.els.$utilityNav);
}

openCollapse = function() {
  if ($('.collapse input').is(':checked')) {
      $( "input:checked" ).each(function( index ) {
      $(this).closest('.collapse').siblings().removeClass('collapsed').attr('aria-expanded', 'true');
      $(this).closest('.collapse').addClass('in').attr('aria-expanded', 'true');
    }); 
  }
  $('.subscription-card-description').matchHeight({
    byRow: false
  });
}

/*
  ACTIONS
*/

PreferenceCenter.prototype.updateProfile = function(e) {
  
  var self = this,
      payload = {
        "subscriberKey": this.profile.id,
        "method": "postProfile",
        "bu": this.profile.bu,
        "type": this.profile.type,
        "data": { 
          "field": e.currentTarget.dataset.mappedField,
          "value": e.currentTarget.value
        }
      };
  this.validate(e);

  if (!this.settings.formValid) {
    return;
  }

  this.toggleSaving(true);

  this.postData(this.getEndpoint('PostProfile'), payload)
    .error(function(res, err, errMsg) {
      console.log(res, err, errMsg)
    })
    .then(function(data) {
      self.handlePostErrors(payload, data);
      self.toggleSaving(false);
    })
}
PreferenceCenter.prototype.updateProfilePicklist = function(newField, newValue) {
if (newValue == "Select options") {
    newValue = " ";
}
var separatebysemicolon = newValue.replace(/,/g, ';');

  var self = this,
    payload = {
    "subscriberKey": this.profile.id,
    "method": "postProfile",
    "bu": this.profile.bu,
    "data": { 
      "field": newField,
      "value": separatebysemicolon
    }
  };
  this.toggleSaving(true);


  this.postData(this.getEndpoint('PostProfile'), payload)
    .error(function(a, c, b) {
      console.log(res, err, errMsg)
    })
    .then(function(data) {
      
      self.handlePostErrors(payload, data);
      
      self.toggleSaving(false);

    });
}

PreferenceCenter.prototype.updateSubscriptions = function(e) {
  if($(e.currentTarget).hasClass('sms') && $('#MobilePhone').val() == '') {
      alert('A Mobile Phone number is required to receive an SMS message.');
      $('#MobilePhone').focus();
  } else {
  var self = this,
      $input = $(e.currentTarget),
      $indicator = $input.siblings('.switch-indicator'),
      payload = {
        "subscriberKey": this.profile.id,
        "method": "postSub",
        "bu": this.profile.bu,
        "availableSubId": e.currentTarget.dataset.availableSubId,
        "customerSubId": e.currentTarget.dataset.customerSubId,
        "value": e.currentTarget.checked
      };

  this.toggleSaving(true);

  this.postData(this.getEndpoint('PostSubscription'), payload)
    .error(function(a, c, b) {
      console.log(res, err, errMsg)
    })
    .then(function(data) {
      self.handlePostErrors(payload, data);
      self.toggleSaving(false);
      
      $input.is(':checked') ? $indicator.text($indicator.data().subscribed) : $indicator.text($indicator.data().unsubscribed)
      $indicator.addClass('active');

      setTimeout(function() {
        $indicator.removeClass('active');
      }, 1000)
    });
  }

}

PreferenceCenter.prototype.updateInterests = function(e) {
  var self = this,
      $input = $(e.currentTarget),
      payload = {
        "subscriberKey": this.profile.id,
        "method": "postInt",
        "bu": this.profile.bu,
        "availableIntId": e.currentTarget.dataset.availableIntId,
        "customerIntId": e.currentTarget.dataset.customerIntId,
        "value": e.currentTarget.checked
      };

  this.toggleSaving(true);

  this.postData(this.getEndpoint('PostInterest'), payload)
    .error(function(a, c, b) {
      console.log(res, err, errMsg)
    })
    .then(function(data) {
      self.handlePostErrors(payload, data);
      self.toggleSaving(false);
      setTimeout(function() {
      }, 1000)
    });
}

PreferenceCenter.prototype.unsubscribeAll = function(e) {
  e.preventDefault();
  this.toggleLoading(true);
  var self = this,
    mappedFields = function() {
      var subs = [];

      $(self.els.$subscriptions).find('[data-mapped-field]').each(function(e) {
        subs.push($(this).data('mappedField'));
      });

      return subs.join(',');
    },
    payload = {
      "subscriberKey": this.profile.id,
      "method": "postUnsubAll",
      "bu": this.profile.bu,
      "data": {
        "mappedFields": mappedFields()
      }
    };

  this.toggleSaving(true);

  this.postData(this.getEndpoint('PostUnsubscribeAll'), payload)
    .error(function(res, err, errMsg) {
      console.log(res, err, errMsg);
    })
    .then(function(data) {
      self.handlePostErrors(payload, data);
      $(self.els.$subscriptions).empty();
      self.renderSubscriptions();
      this.toggleSaving(false);

    });
}

/*
  STATE CHANGES
*/

PreferenceCenter.prototype.toggleSaving = function(saving) {
  var self = this,
    timeout = saving ? 0 : 233;

  setTimeout(function() {
    $(self.els.$saveBtn).toggleClass('saving', saving);
  }, timeout);
}

PreferenceCenter.prototype.toggleLoading = function(loading) {
  $('body').toggleClass('loading', loading);
}

/*
  EVENT HANDLERS
*/

PreferenceCenter.prototype.handleScroll = function() {
  var st = $(window).scrollTop(),
    $links = $('.pc-sidebar-links'),
    $linksOffset = $links.offset().top,
    isStuck = $links.hasClass('stuck');

  $links.data('offset', $linksOffset);

  if (!this.isMobile()) {
    $links.toggleClass('stuck', st > this.settings.stickyLinksOffset - 112);
  }
}

PreferenceCenter.prototype.handleResize = function() {
  this.settings.stickyLinksOffset = $(this.els.$sidebarLinks).offset().top;
}

PreferenceCenter.prototype.handleFormSubmit = function(e) {
  e.preventDefault();
}

PreferenceCenter.prototype.scrollTo = function(e) {
  var target = e.currentTarget.hash;

  e.preventDefault();

  $('html, body').animate({
    scrollTop: $(target).offset().top - 200
  });
}

PreferenceCenter.prototype.toggleSaveButton = function() {
  this.toggleSaving(true);

  setTimeout(function() {
    this.toggleSaving(false);
  }.bind(this), 250);
}


/*
  VALIDATION
*/

PreferenceCenter.prototype.validate = function(e) {
  var valid = $(e.currentTarget).valid();

  this.settings.formValid = valid;
  $(this.els.$saveBtn).prop('disabled', !valid);
}


/*
  DATA HANDLERS
*/

PreferenceCenter.prototype.getData = function(url, sendData) {
  return $.ajax({
    url: url,
    data: sendData,
    dataType: 'json'
  });
}

PreferenceCenter.prototype.postData = function(url, sendData) {
  var postString = "ob=" + encodeURIComponent(JSON.stringify(sendData));

  return $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    data: postString,
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    }
  })
}

/*
  ERROR HANDLERS
*/ 

PreferenceCenter.prototype.handleReceiveErrors = function(payload, response, type) {
  if(!this.profile.id) {
    this.postError({
      "overallStatus": "410",
      "errorMessage": "No email address provided (id)",
      "endpoint": "RetrieveProfileFields",
      "requestPayload": "No Payload"
    });

    return;
  }

  if (!response.status || response.status == "200") {
    // if no status, assume it went through properly
    // check email fieldValue
    if (response.ProfileFields) {
      var email = response.ProfileFields.filter(function(data) {
        return data.ncpc__Field_Type__c === 'Email';
      });

      // if email field is populated, no need to error
      if(!email[0].fieldValue) {
        this.postError({
          "overallStatus": "411",
          "errorMessage": "Invalid or unknown email address (id)",
          "endpoint": "RetrieveProfileFields",
          "requestPayload": payload
        });

        return;
      }
    }

    if(response.Subscription) {
      if(response.Subscription.length < 1) {
        this.postError({
          "overallStatus": "420",
          "errorMessage": "No subscriptions returned",
          "endpoint": "RetrieveSubscription",
          "requestPayload": payload
        });

        return;
      }
    }

    if(type == 'subscription' && !response.Subscription) {
      this.postError({
        "overallStatus": "421",
        "errorMessage": "Subscriptions endpoint is named incorrectly or missing",
        "endpoint": "RetrieveSubscription",
        "requestPayload": payload
      });
      
      return;
    }

    if(type == 'profile' && !response.ProfileFields) {
      this.postError({
        "status": "412",
        "errorMessage": "ProfileFields endpoint is named incorrectly or missing",
        "endpoint": "RetrieveProfileFields",
        "requestPayload": payload
      });

      return;
    }
  }
}

PreferenceCenter.prototype.handlePostErrors = function(payload, response) {
  var mergedData = $.extend({}, response, { "requestPayload": payload });
  if(!response.status || response.status === "200") return;

  // the error status
  this.postError(mergedData);
}

PreferenceCenter.prototype.postError = function(response) {
  // if no ID, response comes back with status error
  // if incorrect ID, response comes back with empty fieldValue
  var self = this;

  this.postData(this.getEndpoint('PostLog'), response)
    .then(function(data) {
      if(self.settings.redirectOnError) {
        window.location = self.settings.redirectUrl;
      } else {
        console.log('redirect on error is disabled');
      }
    });
}


/*
  HELPERS / UTILITIES
*/

PreferenceCenter.prototype.getEndpoint = function(endpoint) {
  return this.endpoints.Base + '/' + this.endpoints[endpoint];
}

PreferenceCenter.prototype.getProfileInfo = function() {
  // get URL parameters here and set defaults if they don't exist
  var id = this.getURLParam('id') || this.getURLParam('ID'),
      lang = this.getURLParam('lang') || this.getURLParam('LANG'),
      bu = this.getURLParam('bu') || this.getURLParam('BU');

  // set id
  this.profile.id = id;
  
  // if no BU in URL
  if(!bu) {
    // if also no BU in localStorage
    if(!localStorage.getItem('bu')) {
      // set default
      localStorage.setItem('bu', 'US');
    }

    this.profile.bu = localStorage.getItem('bu');
  } else {
    this.profile.bu = bu;
    localStorage.setItem('bu', bu);
  }

  // if no lang in URL
  if(!lang) {
    // if also no lang in localStorage
    if(!localStorage.getItem('lang')) {
      // set default
      localStorage.setItem('lang', 'EN-US');
    }

    this.profile.lang = localStorage.getItem('lang');
  } else {
    this.profile.lang =  lang;
    localStorage.setItem('lang', lang);
  }
}

PreferenceCenter.prototype.getURLParam = function(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

PreferenceCenter.prototype.isMobile = function() {
  return window.innerWidth < this.settings.mobileBreakpoint;
}

/*
  INITIALIZE
*/

;(function($, window, document) {
  var pc = new PreferenceCenter();
  $('#preference-center').length && pc.init();
}(window.jQuery, window, document));


//# sourceMappingURL=main.js.map
