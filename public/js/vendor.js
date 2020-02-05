/*!
 * jQuery Validation Plugin v1.19.0
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2018 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
     define( ["jquery"], factory );
    } else if (typeof module === "object" && module.exports) {
     module.exports = factory( require( "jquery" ) );
    } else {
     factory( jQuery );
    }
   }(function( $ ) {
   
   $.extend( $.fn, {
   
    // https://jqueryvalidation.org/validate/
    validate: function( options ) {
   
     // If nothing is selected, return nothing; can't chain anyway
     if ( !this.length ) {
      if ( options && options.debug && window.console ) {
       console.warn( "Nothing selected, can't validate, returning nothing." );
      }
      return;
     }
   
     // Check if a validator for this form was already created
     var validator = $.data( this[ 0 ], "validator" );
     if ( validator ) {
      return validator;
     }
   
     // Add novalidate tag if HTML5.
     this.attr( "novalidate", "novalidate" );
   
     validator = new $.validator( options, this[ 0 ] );
     $.data( this[ 0 ], "validator", validator );
   
     if ( validator.settings.onsubmit ) {
   
      this.on( "click.validate", ":submit", function( event ) {
   
       // Track the used submit button to properly handle scripted
       // submits later.
       validator.submitButton = event.currentTarget;
   
       // Allow suppressing validation by adding a cancel class to the submit button
       if ( $( this ).hasClass( "cancel" ) ) {
        validator.cancelSubmit = true;
       }
   
       // Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
       if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
        validator.cancelSubmit = true;
       }
      } );
   
      // Validate the form on submit
      this.on( "submit.validate", function( event ) {
       if ( validator.settings.debug ) {
   
        // Prevent form submit to be able to see console output
        event.preventDefault();
       }
   
       function handle() {
        var hidden, result;
   
        // Insert a hidden input as a replacement for the missing submit button
        // The hidden input is inserted in two cases:
        //   - A user defined a `submitHandler`
        //   - There was a pending request due to `remote` method and `stopRequest()`
        //     was called to submit the form in case it's valid
        if ( validator.submitButton && ( validator.settings.submitHandler || validator.formSubmitted ) ) {
         hidden = $( "<input type='hidden'/>" )
          .attr( "name", validator.submitButton.name )
          .val( $( validator.submitButton ).val() )
          .appendTo( validator.currentForm );
        }
   
        if ( validator.settings.submitHandler && !validator.settings.debug ) {
         result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
         if ( hidden ) {
   
          // And clean up afterwards; thanks to no-block-scope, hidden can be referenced
          hidden.remove();
         }
         if ( result !== undefined ) {
          return result;
         }
         return false;
        }
        return true;
       }
   
       // Prevent submit for invalid forms or custom submit handlers
       if ( validator.cancelSubmit ) {
        validator.cancelSubmit = false;
        return handle();
       }
       if ( validator.form() ) {
        if ( validator.pendingRequest ) {
         validator.formSubmitted = true;
         return false;
        }
        return handle();
       } else {
        validator.focusInvalid();
        return false;
       }
      } );
     }
   
     return validator;
    },
   
    // https://jqueryvalidation.org/valid/
    valid: function() {
     var valid, validator, errorList;
   
     if ( $( this[ 0 ] ).is( "form" ) ) {
      valid = this.validate().form();
     } else {
      errorList = [];
      valid = true;
      validator = $( this[ 0 ].form ).validate();
      this.each( function() {
       valid = validator.element( this ) && valid;
       if ( !valid ) {
        errorList = errorList.concat( validator.errorList );
       }
      } );
      validator.errorList = errorList;
     }
     return valid;
    },
   
    // https://jqueryvalidation.org/rules/
    rules: function( command, argument ) {
     var element = this[ 0 ],
      isContentEditable = typeof this.attr( "contenteditable" ) !== "undefined" && this.attr( "contenteditable" ) !== "false",
      settings, staticRules, existingRules, data, param, filtered;
   
     // If nothing is selected, return empty object; can't chain anyway
     if ( element == null ) {
      return;
     }
   
     if ( !element.form && isContentEditable ) {
      element.form = this.closest( "form" )[ 0 ];
      element.name = this.attr( "name" );
     }
   
     if ( element.form == null ) {
      return;
     }
   
     if ( command ) {
      settings = $.data( element.form, "validator" ).settings;
      staticRules = settings.rules;
      existingRules = $.validator.staticRules( element );
      switch ( command ) {
      case "add":
       $.extend( existingRules, $.validator.normalizeRule( argument ) );
   
       // Remove messages from rules, but allow them to be set separately
       delete existingRules.messages;
       staticRules[ element.name ] = existingRules;
       if ( argument.messages ) {
        settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
       }
       break;
      case "remove":
       if ( !argument ) {
        delete staticRules[ element.name ];
        return existingRules;
       }
       filtered = {};
       $.each( argument.split( /\s/ ), function( index, method ) {
        filtered[ method ] = existingRules[ method ];
        delete existingRules[ method ];
       } );
       return filtered;
      }
     }
   
     data = $.validator.normalizeRules(
     $.extend(
      {},
      $.validator.classRules( element ),
      $.validator.attributeRules( element ),
      $.validator.dataRules( element ),
      $.validator.staticRules( element )
     ), element );
   
     // Make sure required is at front
     if ( data.required ) {
      param = data.required;
      delete data.required;
      data = $.extend( { required: param }, data );
     }
   
     // Make sure remote is at back
     if ( data.remote ) {
      param = data.remote;
      delete data.remote;
      data = $.extend( data, { remote: param } );
     }
   
     return data;
    }
   } );
   
   // Custom selectors
   $.extend( $.expr.pseudos || $.expr[ ":" ], {  // '|| $.expr[ ":" ]' here enables backwards compatibility to jQuery 1.7. Can be removed when dropping jQ 1.7.x support
   
    // https://jqueryvalidation.org/blank-selector/
    blank: function( a ) {
     return !$.trim( "" + $( a ).val() );
    },
   
    // https://jqueryvalidation.org/filled-selector/
    filled: function( a ) {
     var val = $( a ).val();
     return val !== null && !!$.trim( "" + val );
    },
   
    // https://jqueryvalidation.org/unchecked-selector/
    unchecked: function( a ) {
     return !$( a ).prop( "checked" );
    }
   } );
   
   // Constructor for validator
   $.validator = function( options, form ) {
    this.settings = $.extend( true, {}, $.validator.defaults, options );
    this.currentForm = form;
    this.init();
   };
   
   // https://jqueryvalidation.org/jQuery.validator.format/
   $.validator.format = function( source, params ) {
    if ( arguments.length === 1 ) {
     return function() {
      var args = $.makeArray( arguments );
      args.unshift( source );
      return $.validator.format.apply( this, args );
     };
    }
    if ( params === undefined ) {
     return source;
    }
    if ( arguments.length > 2 && params.constructor !== Array  ) {
     params = $.makeArray( arguments ).slice( 1 );
    }
    if ( params.constructor !== Array ) {
     params = [ params ];
    }
    $.each( params, function( i, n ) {
     source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
      return n;
     } );
    } );
    return source;
   };
   
   $.extend( $.validator, {
   
    defaults: {
     messages: {},
     groups: {},
     rules: {},
     errorClass: "error",
     pendingClass: "pending",
     validClass: "valid",
     errorElement: "label",
     focusCleanup: false,
     focusInvalid: true,
     errorContainer: $( [] ),
     errorLabelContainer: $( [] ),
     onsubmit: true,
     ignore: ":hidden",
     ignoreTitle: false,
     onfocusin: function( element ) {
      this.lastActive = element;
   
      // Hide error label and remove error class on focus if enabled
      if ( this.settings.focusCleanup ) {
       if ( this.settings.unhighlight ) {
        this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
       }
       this.hideThese( this.errorsFor( element ) );
      }
     },
     onfocusout: function( element ) {
      if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
       this.element( element );
      }
     },
     onkeyup: function( element, event ) {
   
      // Avoid revalidate the field when pressing one of the following keys
      // Shift       => 16
      // Ctrl        => 17
      // Alt         => 18
      // Caps lock   => 20
      // End         => 35
      // Home        => 36
      // Left arrow  => 37
      // Up arrow    => 38
      // Right arrow => 39
      // Down arrow  => 40
      // Insert      => 45
      // Num lock    => 144
      // AltGr key   => 225
      var excludedKeys = [
       16, 17, 18, 20, 35, 36, 37,
       38, 39, 40, 45, 144, 225
      ];
   
      if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
       return;
      } else if ( element.name in this.submitted || element.name in this.invalid ) {
       this.element( element );
      }
     },
     onclick: function( element ) {
   
      // Click on selects, radiobuttons and checkboxes
      if ( element.name in this.submitted ) {
       this.element( element );
   
      // Or option elements, check parent select in that case
      } else if ( element.parentNode.name in this.submitted ) {
       this.element( element.parentNode );
      }
     },
     highlight: function( element, errorClass, validClass ) {
      if ( element.type === "radio" ) {
       this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
      } else {
       $( element ).addClass( errorClass ).removeClass( validClass );
      }
     },
     unhighlight: function( element, errorClass, validClass ) {
      if ( element.type === "radio" ) {
       this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
      } else {
       $( element ).removeClass( errorClass ).addClass( validClass );
      }
     }
    },
   
    // https://jqueryvalidation.org/jQuery.validator.setDefaults/
    setDefaults: function( settings ) {
     $.extend( $.validator.defaults, settings );
    },
   
    messages: {
     required: "This field is required.",
     remote: "Please fix this field.",
     email: "Please enter a valid email address.",
     url: "Please enter a valid URL.",
     date: "Please enter a valid date.",
     dateISO: "Please enter a valid date (ISO).",
     number: "Please enter a valid number.",
     digits: "Please enter only digits.",
     equalTo: "Please enter the same value again.",
     maxlength: $.validator.format( "Please enter no more than {0} characters." ),
     minlength: $.validator.format( "Please enter at least {0} characters." ),
     rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
     range: $.validator.format( "Please enter a value between {0} and {1}." ),
     max: $.validator.format( "Please enter a value less than or equal to {0}." ),
     min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
     step: $.validator.format( "Please enter a multiple of {0}." )
    },
   
    autoCreateRanges: false,
   
    prototype: {
   
     init: function() {
      this.labelContainer = $( this.settings.errorLabelContainer );
      this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
      this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
      this.submitted = {};
      this.valueCache = {};
      this.pendingRequest = 0;
      this.pending = {};
      this.invalid = {};
      this.reset();
   
      var currentForm = this.currentForm,
       groups = ( this.groups = {} ),
       rules;
      $.each( this.settings.groups, function( key, value ) {
       if ( typeof value === "string" ) {
        value = value.split( /\s/ );
       }
       $.each( value, function( index, name ) {
        groups[ name ] = key;
       } );
      } );
      rules = this.settings.rules;
      $.each( rules, function( key, value ) {
       rules[ key ] = $.validator.normalizeRule( value );
      } );
   
      function delegate( event ) {
       var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";
   
       // Set form expando on contenteditable
       if ( !this.form && isContentEditable ) {
        this.form = $( this ).closest( "form" )[ 0 ];
        this.name = $( this ).attr( "name" );
       }
   
       // Ignore the element if it belongs to another form. This will happen mainly
       // when setting the `form` attribute of an input to the id of another form.
       if ( currentForm !== this.form ) {
        return;
       }
   
       var validator = $.data( this.form, "validator" ),
        eventType = "on" + event.type.replace( /^validate/, "" ),
        settings = validator.settings;
       if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
        settings[ eventType ].call( validator, this, event );
       }
      }
   
      $( this.currentForm )
       .on( "focusin.validate focusout.validate keyup.validate",
        ":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
        "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
        "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
        "[type='radio'], [type='checkbox'], [contenteditable], [type='button']", delegate )
   
       // Support: Chrome, oldIE
       // "select" is provided as event.target when clicking a option
       .on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );
   
      if ( this.settings.invalidHandler ) {
       $( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
      }
     },
   
     // https://jqueryvalidation.org/Validator.form/
     form: function() {
      this.checkForm();
      $.extend( this.submitted, this.errorMap );
      this.invalid = $.extend( {}, this.errorMap );
      if ( !this.valid() ) {
       $( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
      }
      this.showErrors();
      return this.valid();
     },
   
     checkForm: function() {
      this.prepareForm();
      for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
       this.check( elements[ i ] );
      }
      return this.valid();
     },
   
     // https://jqueryvalidation.org/Validator.element/
     element: function( element ) {
      var cleanElement = this.clean( element ),
       checkElement = this.validationTargetFor( cleanElement ),
       v = this,
       result = true,
       rs, group;
   
      if ( checkElement === undefined ) {
       delete this.invalid[ cleanElement.name ];
      } else {
       this.prepareElement( checkElement );
       this.currentElements = $( checkElement );
   
       // If this element is grouped, then validate all group elements already
       // containing a value
       group = this.groups[ checkElement.name ];
       if ( group ) {
        $.each( this.groups, function( name, testgroup ) {
         if ( testgroup === group && name !== checkElement.name ) {
          cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
          if ( cleanElement && cleanElement.name in v.invalid ) {
           v.currentElements.push( cleanElement );
           result = v.check( cleanElement ) && result;
          }
         }
        } );
       }
   
       rs = this.check( checkElement ) !== false;
       result = result && rs;
       if ( rs ) {
        this.invalid[ checkElement.name ] = false;
       } else {
        this.invalid[ checkElement.name ] = true;
       }
   
       if ( !this.numberOfInvalids() ) {
   
        // Hide error containers on last error
        this.toHide = this.toHide.add( this.containers );
       }
       this.showErrors();
   
       // Add aria-invalid status for screen readers
       $( element ).attr( "aria-invalid", !rs );
      }
   
      return result;
     },
   
     // https://jqueryvalidation.org/Validator.showErrors/
     showErrors: function( errors ) {
      if ( errors ) {
       var validator = this;
   
       // Add items to error list and map
       $.extend( this.errorMap, errors );
       this.errorList = $.map( this.errorMap, function( message, name ) {
        return {
         message: message,
         element: validator.findByName( name )[ 0 ]
        };
       } );
   
       // Remove items from success list
       this.successList = $.grep( this.successList, function( element ) {
        return !( element.name in errors );
       } );
      }
      if ( this.settings.showErrors ) {
       this.settings.showErrors.call( this, this.errorMap, this.errorList );
      } else {
       this.defaultShowErrors();
      }
     },
   
     // https://jqueryvalidation.org/Validator.resetForm/
     resetForm: function() {
      if ( $.fn.resetForm ) {
       $( this.currentForm ).resetForm();
      }
      this.invalid = {};
      this.submitted = {};
      this.prepareForm();
      this.hideErrors();
      var elements = this.elements()
       .removeData( "previousValue" )
       .removeAttr( "aria-invalid" );
   
      this.resetElements( elements );
     },
   
     resetElements: function( elements ) {
      var i;
   
      if ( this.settings.unhighlight ) {
       for ( i = 0; elements[ i ]; i++ ) {
        this.settings.unhighlight.call( this, elements[ i ],
         this.settings.errorClass, "" );
        this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
       }
      } else {
       elements
        .removeClass( this.settings.errorClass )
        .removeClass( this.settings.validClass );
      }
     },
   
     numberOfInvalids: function() {
      return this.objectLength( this.invalid );
     },
   
     objectLength: function( obj ) {
      /* jshint unused: false */
      var count = 0,
       i;
      for ( i in obj ) {
   
       // This check allows counting elements with empty error
       // message as invalid elements
       if ( obj[ i ] !== undefined && obj[ i ] !== null && obj[ i ] !== false ) {
        count++;
       }
      }
      return count;
     },
   
     hideErrors: function() {
      this.hideThese( this.toHide );
     },
   
     hideThese: function( errors ) {
      errors.not( this.containers ).text( "" );
      this.addWrapper( errors ).hide();
     },
   
     valid: function() {
      return this.size() === 0;
     },
   
     size: function() {
      return this.errorList.length;
     },
   
     focusInvalid: function() {
      if ( this.settings.focusInvalid ) {
       try {
        $( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
        .filter( ":visible" )
        .focus()
   
        // Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
        .trigger( "focusin" );
       } catch ( e ) {
   
        // Ignore IE throwing errors when focusing hidden elements
       }
      }
     },
   
     findLastActive: function() {
      var lastActive = this.lastActive;
      return lastActive && $.grep( this.errorList, function( n ) {
       return n.element.name === lastActive.name;
      } ).length === 1 && lastActive;
     },
   
     elements: function() {
      var validator = this,
       rulesCache = {};
   
      // Select all valid inputs inside the form (no submit or reset buttons)
      return $( this.currentForm )
      .find( "input, select, textarea, [contenteditable]" )
      .not( ":submit, :reset, :image, :disabled" )
      .not( this.settings.ignore )
      .filter( function() {
       var name = this.name || $( this ).attr( "name" ); // For contenteditable
       var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";
   
       if ( !name && validator.settings.debug && window.console ) {
        console.error( "%o has no name assigned", this );
       }
   
       // Set form expando on contenteditable
       if ( isContentEditable ) {
        this.form = $( this ).closest( "form" )[ 0 ];
        this.name = name;
       }
   
       // Ignore elements that belong to other/nested forms
       if ( this.form !== validator.currentForm ) {
        return false;
       }
   
       // Select only the first element for each name, and only those with rules specified
       if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
        return false;
       }
   
       rulesCache[ name ] = true;
       return true;
      } );
     },
   
     clean: function( selector ) {
      return $( selector )[ 0 ];
     },
   
     errors: function() {
      var errorClass = this.settings.errorClass.split( " " ).join( "." );
      return $( this.settings.errorElement + "." + errorClass, this.errorContext );
     },
   
     resetInternals: function() {
      this.successList = [];
      this.errorList = [];
      this.errorMap = {};
      this.toShow = $( [] );
      this.toHide = $( [] );
     },
   
     reset: function() {
      this.resetInternals();
      this.currentElements = $( [] );
     },
   
     prepareForm: function() {
      this.reset();
      this.toHide = this.errors().add( this.containers );
     },
   
     prepareElement: function( element ) {
      this.reset();
      this.toHide = this.errorsFor( element );
     },
   
     elementValue: function( element ) {
      var $element = $( element ),
       type = element.type,
       isContentEditable = typeof $element.attr( "contenteditable" ) !== "undefined" && $element.attr( "contenteditable" ) !== "false",
       val, idx;
   
      if ( type === "radio" || type === "checkbox" ) {
       return this.findByName( element.name ).filter( ":checked" ).val();
      } else if ( type === "number" && typeof element.validity !== "undefined" ) {
       return element.validity.badInput ? "NaN" : $element.val();
      }
   
      if ( isContentEditable ) {
       val = $element.text();
      } else {
       val = $element.val();
      }
   
      if ( type === "file" ) {
   
       // Modern browser (chrome & safari)
       if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
        return val.substr( 12 );
       }
   
       // Legacy browsers
       // Unix-based path
       idx = val.lastIndexOf( "/" );
       if ( idx >= 0 ) {
        return val.substr( idx + 1 );
       }
   
       // Windows-based path
       idx = val.lastIndexOf( "\\" );
       if ( idx >= 0 ) {
        return val.substr( idx + 1 );
       }
   
       // Just the file name
       return val;
      }
   
      if ( typeof val === "string" ) {
       return val.replace( /\r/g, "" );
      }
      return val;
     },
   
     check: function( element ) {
      element = this.validationTargetFor( this.clean( element ) );
   
      var rules = $( element ).rules(),
       rulesCount = $.map( rules, function( n, i ) {
        return i;
       } ).length,
       dependencyMismatch = false,
       val = this.elementValue( element ),
       result, method, rule, normalizer;
   
      // Prioritize the local normalizer defined for this element over the global one
      // if the former exists, otherwise user the global one in case it exists.
      if ( typeof rules.normalizer === "function" ) {
       normalizer = rules.normalizer;
      } else if ( typeof this.settings.normalizer === "function" ) {
       normalizer = this.settings.normalizer;
      }
   
      // If normalizer is defined, then call it to retreive the changed value instead
      // of using the real one.
      // Note that `this` in the normalizer is `element`.
      if ( normalizer ) {
       val = normalizer.call( element, val );
   
       // Delete the normalizer from rules to avoid treating it as a pre-defined method.
       delete rules.normalizer;
      }
   
      for ( method in rules ) {
       rule = { method: method, parameters: rules[ method ] };
       try {
        result = $.validator.methods[ method ].call( this, val, element, rule.parameters );
   
        // If a method indicates that the field is optional and therefore valid,
        // don't mark it as valid when there are no other rules
        if ( result === "dependency-mismatch" && rulesCount === 1 ) {
         dependencyMismatch = true;
         continue;
        }
        dependencyMismatch = false;
   
        if ( result === "pending" ) {
         this.toHide = this.toHide.not( this.errorsFor( element ) );
         return;
        }
   
        if ( !result ) {
         this.formatAndAdd( element, rule );
         return false;
        }
       } catch ( e ) {
        if ( this.settings.debug && window.console ) {
         console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
        }
        if ( e instanceof TypeError ) {
         e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
        }
   
        throw e;
       }
      }
      if ( dependencyMismatch ) {
       return;
      }
      if ( this.objectLength( rules ) ) {
       this.successList.push( element );
      }
      return true;
     },
   
     // Return the custom message for the given element and validation method
     // specified in the element's HTML5 data attribute
     // return the generic message if present and no method specific message is present
     customDataMessage: function( element, method ) {
      return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
       method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
     },
   
     // Return the custom message for the given element name and validation method
     customMessage: function( name, method ) {
      var m = this.settings.messages[ name ];
      return m && ( m.constructor === String ? m : m[ method ] );
     },
   
     // Return the first defined argument, allowing empty strings
     findDefined: function() {
      for ( var i = 0; i < arguments.length; i++ ) {
       if ( arguments[ i ] !== undefined ) {
        return arguments[ i ];
       }
      }
      return undefined;
     },
   
     // The second parameter 'rule' used to be a string, and extended to an object literal
     // of the following form:
     // rule = {
     //     method: "method name",
     //     parameters: "the given method parameters"
     // }
     //
     // The old behavior still supported, kept to maintain backward compatibility with
     // old code, and will be removed in the next major release.
     defaultMessage: function( element, rule ) {
      if ( typeof rule === "string" ) {
       rule = { method: rule };
      }
   
      var message = this.findDefined(
        this.customMessage( element.name, rule.method ),
        this.customDataMessage( element, rule.method ),
   
        // 'title' is never undefined, so handle empty string as undefined
        !this.settings.ignoreTitle && element.title || undefined,
        $.validator.messages[ rule.method ],
        "<strong>Warning: No message defined for " + element.name + "</strong>"
       ),
       theregex = /\$?\{(\d+)\}/g;
      if ( typeof message === "function" ) {
       message = message.call( this, rule.parameters, element );
      } else if ( theregex.test( message ) ) {
       message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
      }
   
      return message;
     },
   
     formatAndAdd: function( element, rule ) {
      var message = this.defaultMessage( element, rule );
   
      this.errorList.push( {
       message: message,
       element: element,
       method: rule.method
      } );
   
      this.errorMap[ element.name ] = message;
      this.submitted[ element.name ] = message;
     },
   
     addWrapper: function( toToggle ) {
      if ( this.settings.wrapper ) {
       toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
      }
      return toToggle;
     },
   
     defaultShowErrors: function() {
      var i, elements, error;
      for ( i = 0; this.errorList[ i ]; i++ ) {
       error = this.errorList[ i ];
       if ( this.settings.highlight ) {
        this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
       }
       this.showLabel( error.element, error.message );
      }
      if ( this.errorList.length ) {
       this.toShow = this.toShow.add( this.containers );
      }
      if ( this.settings.success ) {
       for ( i = 0; this.successList[ i ]; i++ ) {
        this.showLabel( this.successList[ i ] );
       }
      }
      if ( this.settings.unhighlight ) {
       for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
        this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
       }
      }
      this.toHide = this.toHide.not( this.toShow );
      this.hideErrors();
      this.addWrapper( this.toShow ).show();
     },
   
     validElements: function() {
      return this.currentElements.not( this.invalidElements() );
     },
   
     invalidElements: function() {
      return $( this.errorList ).map( function() {
       return this.element;
      } );
     },
   
     showLabel: function( element, message ) {
      var place, group, errorID, v,
       error = this.errorsFor( element ),
       elementID = this.idOrName( element ),
       describedBy = $( element ).attr( "aria-describedby" );
   
      if ( error.length ) {
   
       // Refresh error/success class
       error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
   
       // Replace message on existing label
       error.html( message );
      } else {
   
       // Create error element
       error = $( "<" + this.settings.errorElement + ">" )
        .attr( "id", elementID + "-error" )
        .addClass( this.settings.errorClass )
        .html( message || "" );
   
       // Maintain reference to the element to be placed into the DOM
       place = error;
       if ( this.settings.wrapper ) {
   
        // Make sure the element is visible, even in IE
        // actually showing the wrapped element is handled elsewhere
        place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
       }
       if ( this.labelContainer.length ) {
        this.labelContainer.append( place );
       } else if ( this.settings.errorPlacement ) {
        this.settings.errorPlacement.call( this, place, $( element ) );
       } else {
        place.insertAfter( element );
       }
   
       // Link error back to the element
       if ( error.is( "label" ) ) {
   
        // If the error is a label, then associate using 'for'
        error.attr( "for", elementID );
   
        // If the element is not a child of an associated label, then it's necessary
        // to explicitly apply aria-describedby
       } else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
        errorID = error.attr( "id" );
   
        // Respect existing non-error aria-describedby
        if ( !describedBy ) {
         describedBy = errorID;
        } else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {
   
         // Add to end of list if not already present
         describedBy += " " + errorID;
        }
        $( element ).attr( "aria-describedby", describedBy );
   
        // If this element is grouped, then assign to all elements in the same group
        group = this.groups[ element.name ];
        if ( group ) {
         v = this;
         $.each( v.groups, function( name, testgroup ) {
          if ( testgroup === group ) {
           $( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
            .attr( "aria-describedby", error.attr( "id" ) );
          }
         } );
        }
       }
      }
      if ( !message && this.settings.success ) {
       error.text( "" );
       if ( typeof this.settings.success === "string" ) {
        error.addClass( this.settings.success );
       } else {
        this.settings.success( error, element );
       }
      }
      this.toShow = this.toShow.add( error );
     },
   
     errorsFor: function( element ) {
      var name = this.escapeCssMeta( this.idOrName( element ) ),
       describer = $( element ).attr( "aria-describedby" ),
       selector = "label[for='" + name + "'], label[for='" + name + "'] *";
   
      // 'aria-describedby' should directly reference the error element
      if ( describer ) {
       selector = selector + ", #" + this.escapeCssMeta( describer )
        .replace( /\s+/g, ", #" );
      }
   
      return this
       .errors()
       .filter( selector );
     },
   
     // See https://api.jquery.com/category/selectors/, for CSS
     // meta-characters that should be escaped in order to be used with JQuery
     // as a literal part of a name/id or any selector.
     escapeCssMeta: function( string ) {
      return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
     },
   
     idOrName: function( element ) {
      return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
     },
   
     validationTargetFor: function( element ) {
   
      // If radio/checkbox, validate first element in group instead
      if ( this.checkable( element ) ) {
       element = this.findByName( element.name );
      }
   
      // Always apply ignore filter
      return $( element ).not( this.settings.ignore )[ 0 ];
     },
   
     checkable: function( element ) {
      return ( /radio|checkbox/i ).test( element.type );
     },
   
     findByName: function( name ) {
      return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
     },
   
     getLength: function( value, element ) {
      switch ( element.nodeName.toLowerCase() ) {
      case "select":
       return $( "option:selected", element ).length;
      case "input":
       if ( this.checkable( element ) ) {
        return this.findByName( element.name ).filter( ":checked" ).length;
       }
      }
      return value.length;
     },
   
     depend: function( param, element ) {
      return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
     },
   
     dependTypes: {
      "boolean": function( param ) {
       return param;
      },
      "string": function( param, element ) {
       return !!$( param, element.form ).length;
      },
      "function": function( param, element ) {
       return param( element );
      }
     },
   
     optional: function( element ) {
      var val = this.elementValue( element );
      return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
     },
   
     startRequest: function( element ) {
      if ( !this.pending[ element.name ] ) {
       this.pendingRequest++;
       $( element ).addClass( this.settings.pendingClass );
       this.pending[ element.name ] = true;
      }
     },
   
     stopRequest: function( element, valid ) {
      this.pendingRequest--;
   
      // Sometimes synchronization fails, make sure pendingRequest is never < 0
      if ( this.pendingRequest < 0 ) {
       this.pendingRequest = 0;
      }
      delete this.pending[ element.name ];
      $( element ).removeClass( this.settings.pendingClass );
      if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
       $( this.currentForm ).submit();
   
       // Remove the hidden input that was used as a replacement for the
       // missing submit button. The hidden input is added by `handle()`
       // to ensure that the value of the used submit button is passed on
       // for scripted submits triggered by this method
       if ( this.submitButton ) {
        $( "input:hidden[name='" + this.submitButton.name + "']", this.currentForm ).remove();
       }
   
       this.formSubmitted = false;
      } else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
       $( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
       this.formSubmitted = false;
      }
     },
   
     previousValue: function( element, method ) {
      method = typeof method === "string" && method || "remote";
   
      return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
       old: null,
       valid: true,
       message: this.defaultMessage( element, { method: method } )
      } );
     },
   
     // Cleans up all forms and elements, removes validator-specific events
     destroy: function() {
      this.resetForm();
   
      $( this.currentForm )
       .off( ".validate" )
       .removeData( "validator" )
       .find( ".validate-equalTo-blur" )
        .off( ".validate-equalTo" )
        .removeClass( "validate-equalTo-blur" )
       .find( ".validate-lessThan-blur" )
        .off( ".validate-lessThan" )
        .removeClass( "validate-lessThan-blur" )
       .find( ".validate-lessThanEqual-blur" )
        .off( ".validate-lessThanEqual" )
        .removeClass( "validate-lessThanEqual-blur" )
       .find( ".validate-greaterThanEqual-blur" )
        .off( ".validate-greaterThanEqual" )
        .removeClass( "validate-greaterThanEqual-blur" )
       .find( ".validate-greaterThan-blur" )
        .off( ".validate-greaterThan" )
        .removeClass( "validate-greaterThan-blur" );
     }
   
    },
   
    classRuleSettings: {
     required: { required: true },
     email: { email: true },
     url: { url: true },
     date: { date: true },
     dateISO: { dateISO: true },
     number: { number: true },
     digits: { digits: true },
     creditcard: { creditcard: true }
    },
   
    addClassRules: function( className, rules ) {
     if ( className.constructor === String ) {
      this.classRuleSettings[ className ] = rules;
     } else {
      $.extend( this.classRuleSettings, className );
     }
    },
   
    classRules: function( element ) {
     var rules = {},
      classes = $( element ).attr( "class" );
   
     if ( classes ) {
      $.each( classes.split( " " ), function() {
       if ( this in $.validator.classRuleSettings ) {
        $.extend( rules, $.validator.classRuleSettings[ this ] );
       }
      } );
     }
     return rules;
    },
   
    normalizeAttributeRule: function( rules, type, method, value ) {
   
     // Convert the value to a number for number inputs, and for text for backwards compability
     // allows type="date" and others to be compared as strings
     if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
      value = Number( value );
   
      // Support Opera Mini, which returns NaN for undefined minlength
      if ( isNaN( value ) ) {
       value = undefined;
      }
     }
   
     if ( value || value === 0 ) {
      rules[ method ] = value;
     } else if ( type === method && type !== "range" ) {
   
      // Exception: the jquery validate 'range' method
      // does not test for the html5 'range' type
      rules[ method ] = true;
     }
    },
   
    attributeRules: function( element ) {
     var rules = {},
      $element = $( element ),
      type = element.getAttribute( "type" ),
      method, value;
   
     for ( method in $.validator.methods ) {
   
      // Support for <input required> in both html5 and older browsers
      if ( method === "required" ) {
       value = element.getAttribute( method );
   
       // Some browsers return an empty string for the required attribute
       // and non-HTML5 browsers might have required="" markup
       if ( value === "" ) {
        value = true;
       }
   
       // Force non-HTML5 browsers to return bool
       value = !!value;
      } else {
       value = $element.attr( method );
      }
   
      this.normalizeAttributeRule( rules, type, method, value );
     }
   
     // 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
     if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
      delete rules.maxlength;
     }
   
     return rules;
    },
   
    dataRules: function( element ) {
     var rules = {},
      $element = $( element ),
      type = element.getAttribute( "type" ),
      method, value;
   
     for ( method in $.validator.methods ) {
      value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
   
      // Cast empty attributes like `data-rule-required` to `true`
      if ( value === "" ) {
       value = true;
      }
   
      this.normalizeAttributeRule( rules, type, method, value );
     }
     return rules;
    },
   
    staticRules: function( element ) {
     var rules = {},
      validator = $.data( element.form, "validator" );
   
     if ( validator.settings.rules ) {
      rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
     }
     return rules;
    },
   
    normalizeRules: function( rules, element ) {
   
     // Handle dependency check
     $.each( rules, function( prop, val ) {
   
      // Ignore rule when param is explicitly false, eg. required:false
      if ( val === false ) {
       delete rules[ prop ];
       return;
      }
      if ( val.param || val.depends ) {
       var keepRule = true;
       switch ( typeof val.depends ) {
       case "string":
        keepRule = !!$( val.depends, element.form ).length;
        break;
       case "function":
        keepRule = val.depends.call( element, element );
        break;
       }
       if ( keepRule ) {
        rules[ prop ] = val.param !== undefined ? val.param : true;
       } else {
        $.data( element.form, "validator" ).resetElements( $( element ) );
        delete rules[ prop ];
       }
      }
     } );
   
     // Evaluate parameters
     $.each( rules, function( rule, parameter ) {
      rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
     } );
   
     // Clean number parameters
     $.each( [ "minlength", "maxlength" ], function() {
      if ( rules[ this ] ) {
       rules[ this ] = Number( rules[ this ] );
      }
     } );
     $.each( [ "rangelength", "range" ], function() {
      var parts;
      if ( rules[ this ] ) {
       if ( $.isArray( rules[ this ] ) ) {
        rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
       } else if ( typeof rules[ this ] === "string" ) {
        parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
        rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
       }
      }
     } );
   
     if ( $.validator.autoCreateRanges ) {
   
      // Auto-create ranges
      if ( rules.min != null && rules.max != null ) {
       rules.range = [ rules.min, rules.max ];
       delete rules.min;
       delete rules.max;
      }
      if ( rules.minlength != null && rules.maxlength != null ) {
       rules.rangelength = [ rules.minlength, rules.maxlength ];
       delete rules.minlength;
       delete rules.maxlength;
      }
     }
   
     return rules;
    },
   
    // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
    normalizeRule: function( data ) {
     if ( typeof data === "string" ) {
      var transformed = {};
      $.each( data.split( /\s/ ), function() {
       transformed[ this ] = true;
      } );
      data = transformed;
     }
     return data;
    },
   
    // https://jqueryvalidation.org/jQuery.validator.addMethod/
    addMethod: function( name, method, message ) {
     $.validator.methods[ name ] = method;
     $.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
     if ( method.length < 3 ) {
      $.validator.addClassRules( name, $.validator.normalizeRule( name ) );
     }
    },
   
    // https://jqueryvalidation.org/jQuery.validator.methods/
    methods: {
   
     // https://jqueryvalidation.org/required-method/
     required: function( value, element, param ) {
   
      // Check if dependency is met
      if ( !this.depend( param, element ) ) {
       return "dependency-mismatch";
      }
      if ( element.nodeName.toLowerCase() === "select" ) {
   
       // Could be an array for select-multiple or a string, both are fine this way
       var val = $( element ).val();
       return val && val.length > 0;
      }
      if ( this.checkable( element ) ) {
       return this.getLength( value, element ) > 0;
      }
      return value !== undefined && value !== null && value.length > 0;
     },
   
     // https://jqueryvalidation.org/email-method/
     email: function( value, element ) {
   
      // From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
      // Retrieved 2014-01-14
      // If you have a problem with this implementation, report a bug against the above spec
      // Or use custom methods to implement your own email validation
      return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
     },
   
     // https://jqueryvalidation.org/url-method/
     url: function( value, element ) {
   
      // Copyright (c) 2010-2013 Diego Perini, MIT licensed
      // https://gist.github.com/dperini/729294
      // see also https://mathiasbynens.be/demo/url-regex
      // modified to allow protocol-relative URLs
      return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
     },
   
     // https://jqueryvalidation.org/date-method/
     date: ( function() {
      var called = false;
   
      return function( value, element ) {
       if ( !called ) {
        called = true;
        if ( this.settings.debug && window.console ) {
         console.warn(
          "The `date` method is deprecated and will be removed in version '2.0.0'.\n" +
          "Please don't use it, since it relies on the Date constructor, which\n" +
          "behaves very differently across browsers and locales. Use `dateISO`\n" +
          "instead or one of the locale specific methods in `localizations/`\n" +
          "and `additional-methods.js`."
         );
        }
       }
   
       return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
      };
     }() ),
   
     // https://jqueryvalidation.org/dateISO-method/
     dateISO: function( value, element ) {
      return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
     },
   
     // https://jqueryvalidation.org/number-method/
     number: function( value, element ) {
      return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
     },
   
     // https://jqueryvalidation.org/digits-method/
     digits: function( value, element ) {
      return this.optional( element ) || /^\d+$/.test( value );
     },
   
     // https://jqueryvalidation.org/minlength-method/
     minlength: function( value, element, param ) {
      var length = $.isArray( value ) ? value.length : this.getLength( value, element );
      return this.optional( element ) || length >= param;
     },
   
     // https://jqueryvalidation.org/maxlength-method/
     maxlength: function( value, element, param ) {
      var length = $.isArray( value ) ? value.length : this.getLength( value, element );
      return this.optional( element ) || length <= param;
     },
   
     // https://jqueryvalidation.org/rangelength-method/
     rangelength: function( value, element, param ) {
      var length = $.isArray( value ) ? value.length : this.getLength( value, element );
      return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
     },
   
     // https://jqueryvalidation.org/min-method/
     min: function( value, element, param ) {
      return this.optional( element ) || value >= param;
     },
   
     // https://jqueryvalidation.org/max-method/
     max: function( value, element, param ) {
      return this.optional( element ) || value <= param;
     },
   
     // https://jqueryvalidation.org/range-method/
     range: function( value, element, param ) {
      return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
     },
   
     // https://jqueryvalidation.org/step-method/
     step: function( value, element, param ) {
      var type = $( element ).attr( "type" ),
       errorMessage = "Step attribute on input type " + type + " is not supported.",
       supportedTypes = [ "text", "number", "range" ],
       re = new RegExp( "\\b" + type + "\\b" ),
       notSupported = type && !re.test( supportedTypes.join() ),
       decimalPlaces = function( num ) {
        var match = ( "" + num ).match( /(?:\.(\d+))?$/ );
        if ( !match ) {
         return 0;
        }
   
        // Number of digits right of decimal point.
        return match[ 1 ] ? match[ 1 ].length : 0;
       },
       toInt = function( num ) {
        return Math.round( num * Math.pow( 10, decimals ) );
       },
       valid = true,
       decimals;
   
      // Works only for text, number and range input types
      // TODO find a way to support input types date, datetime, datetime-local, month, time and week
      if ( notSupported ) {
       throw new Error( errorMessage );
      }
   
      decimals = decimalPlaces( param );
   
      // Value can't have too many decimals
      if ( decimalPlaces( value ) > decimals || toInt( value ) % toInt( param ) !== 0 ) {
       valid = false;
      }
   
      return this.optional( element ) || valid;
     },
   
     // https://jqueryvalidation.org/equalTo-method/
     equalTo: function( value, element, param ) {
   
      // Bind to the blur event of the target in order to revalidate whenever the target field is updated
      var target = $( param );
      if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
       target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
        $( element ).valid();
       } );
      }
      return value === target.val();
     },
   
     // https://jqueryvalidation.org/remote-method/
     remote: function( value, element, param, method ) {
      if ( this.optional( element ) ) {
       return "dependency-mismatch";
      }
   
      method = typeof method === "string" && method || "remote";
   
      var previous = this.previousValue( element, method ),
       validator, data, optionDataString;
   
      if ( !this.settings.messages[ element.name ] ) {
       this.settings.messages[ element.name ] = {};
      }
      previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
      this.settings.messages[ element.name ][ method ] = previous.message;
   
      param = typeof param === "string" && { url: param } || param;
      optionDataString = $.param( $.extend( { data: value }, param.data ) );
      if ( previous.old === optionDataString ) {
       return previous.valid;
      }
   
      previous.old = optionDataString;
      validator = this;
      this.startRequest( element );
      data = {};
      data[ element.name ] = value;
      $.ajax( $.extend( true, {
       mode: "abort",
       port: "validate" + element.name,
       dataType: "json",
       data: data,
       context: validator.currentForm,
       success: function( response ) {
        var valid = response === true || response === "true",
         errors, message, submitted;
   
        validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
        if ( valid ) {
         submitted = validator.formSubmitted;
         validator.resetInternals();
         validator.toHide = validator.errorsFor( element );
         validator.formSubmitted = submitted;
         validator.successList.push( element );
         validator.invalid[ element.name ] = false;
         validator.showErrors();
        } else {
         errors = {};
         message = response || validator.defaultMessage( element, { method: method, parameters: value } );
         errors[ element.name ] = previous.message = message;
         validator.invalid[ element.name ] = true;
         validator.showErrors( errors );
        }
        previous.valid = valid;
        validator.stopRequest( element, valid );
       }
      }, param ) );
      return "pending";
     }
    }
   
   } );
   
   // Ajax mode: abort
   // usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
   // if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
   
   var pendingRequests = {},
    ajax;
   
   // Use a prefilter if available (1.5+)
   if ( $.ajaxPrefilter ) {
    $.ajaxPrefilter( function( settings, _, xhr ) {
     var port = settings.port;
     if ( settings.mode === "abort" ) {
      if ( pendingRequests[ port ] ) {
       pendingRequests[ port ].abort();
      }
      pendingRequests[ port ] = xhr;
     }
    } );
   } else {
   
    // Proxy ajax
    ajax = $.ajax;
    $.ajax = function( settings ) {
     var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
      port = ( "port" in settings ? settings : $.ajaxSettings ).port;
     if ( mode === "abort" ) {
      if ( pendingRequests[ port ] ) {
       pendingRequests[ port ].abort();
      }
      pendingRequests[ port ] = ajax.apply( this, arguments );
      return pendingRequests[ port ];
     }
     return ajax.apply( this, arguments );
    };
   }
   return $;
   }));
   /*! jQuery UI - v1.12.1 - 2019-11-13
   * http://jqueryui.com
   * Includes: widget.js, position.js, data.js, disable-selection.js, focusable.js, form-reset-mixin.js, jquery-1-7.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js, widgets/menu.js, widgets/selectmenu.js
   * Copyright jQuery Foundation and other contributors; Licensed MIT */
   
   (function( factory ) {
    if ( typeof define === "function" && define.amd ) {
   
     // AMD. Register as an anonymous module.
     define([ "jquery" ], factory );
    } else {
   
     // Browser globals
     factory( jQuery );
    }
   }(function( $ ) {
   
   $.ui = $.ui || {};
   
   var version = $.ui.version = "1.12.1";
   
   
   /*!
    * jQuery UI Widget 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: Widget
   //>>group: Core
   //>>description: Provides a factory for creating stateful widgets with a common API.
   //>>docs: http://api.jqueryui.com/jQuery.widget/
   //>>demos: http://jqueryui.com/widget/
   
   
   
   var widgetUuid = 0;
   var widgetSlice = Array.prototype.slice;
   
   $.cleanData = ( function( orig ) {
    return function( elems ) {
     var events, elem, i;
     for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
      try {
   
       // Only trigger remove when necessary to save time
       events = $._data( elem, "events" );
       if ( events && events.remove ) {
        $( elem ).triggerHandler( "remove" );
       }
   
      // Http://bugs.jquery.com/ticket/8235
      } catch ( e ) {}
     }
     orig( elems );
    };
   } )( $.cleanData );
   
   $.widget = function( name, base, prototype ) {
    var existingConstructor, constructor, basePrototype;
   
    // ProxiedPrototype allows the provided prototype to remain unmodified
    // so that it can be used as a mixin for multiple widgets (#8876)
    var proxiedPrototype = {};
   
    var namespace = name.split( "." )[ 0 ];
    name = name.split( "." )[ 1 ];
    var fullName = namespace + "-" + name;
   
    if ( !prototype ) {
     prototype = base;
     base = $.Widget;
    }
   
    if ( $.isArray( prototype ) ) {
     prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
    }
   
    // Create selector for plugin
    $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
     return !!$.data( elem, fullName );
    };
   
    $[ namespace ] = $[ namespace ] || {};
    existingConstructor = $[ namespace ][ name ];
    constructor = $[ namespace ][ name ] = function( options, element ) {
   
     // Allow instantiation without "new" keyword
     if ( !this._createWidget ) {
      return new constructor( options, element );
     }
   
     // Allow instantiation without initializing for simple inheritance
     // must use "new" keyword (the code above always passes args)
     if ( arguments.length ) {
      this._createWidget( options, element );
     }
    };
   
    // Extend with the existing constructor to carry over any static properties
    $.extend( constructor, existingConstructor, {
     version: prototype.version,
   
     // Copy the object used to create the prototype in case we need to
     // redefine the widget later
     _proto: $.extend( {}, prototype ),
   
     // Track widgets that inherit from this widget in case this widget is
     // redefined after a widget inherits from it
     _childConstructors: []
    } );
   
    basePrototype = new base();
   
    // We need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = $.widget.extend( {}, basePrototype.options );
    $.each( prototype, function( prop, value ) {
     if ( !$.isFunction( value ) ) {
      proxiedPrototype[ prop ] = value;
      return;
     }
     proxiedPrototype[ prop ] = ( function() {
      function _super() {
       return base.prototype[ prop ].apply( this, arguments );
      }
   
      function _superApply( args ) {
       return base.prototype[ prop ].apply( this, args );
      }
   
      return function() {
       var __super = this._super;
       var __superApply = this._superApply;
       var returnValue;
   
       this._super = _super;
       this._superApply = _superApply;
   
       returnValue = value.apply( this, arguments );
   
       this._super = __super;
       this._superApply = __superApply;
   
       return returnValue;
      };
     } )();
    } );
    constructor.prototype = $.widget.extend( basePrototype, {
   
     // TODO: remove support for widgetEventPrefix
     // always use the name + a colon as the prefix, e.g., draggable:start
     // don't prefix for widgets that aren't DOM-based
     widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
    }, proxiedPrototype, {
     constructor: constructor,
     namespace: namespace,
     widgetName: name,
     widgetFullName: fullName
    } );
   
    // If this widget is being redefined then we need to find all widgets that
    // are inheriting from it and redefine all of them so that they inherit from
    // the new version of this widget. We're essentially trying to replace one
    // level in the prototype chain.
    if ( existingConstructor ) {
     $.each( existingConstructor._childConstructors, function( i, child ) {
      var childPrototype = child.prototype;
   
      // Redefine the child widget using the same prototype that was
      // originally used, but inherit from the new version of the base
      $.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
       child._proto );
     } );
   
     // Remove the list of existing child constructors from the old constructor
     // so the old child constructors can be garbage collected
     delete existingConstructor._childConstructors;
    } else {
     base._childConstructors.push( constructor );
    }
   
    $.widget.bridge( name, constructor );
   
    return constructor;
   };
   
   $.widget.extend = function( target ) {
    var input = widgetSlice.call( arguments, 1 );
    var inputIndex = 0;
    var inputLength = input.length;
    var key;
    var value;
   
    for ( ; inputIndex < inputLength; inputIndex++ ) {
     for ( key in input[ inputIndex ] ) {
      value = input[ inputIndex ][ key ];
      if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
   
       // Clone objects
       if ( $.isPlainObject( value ) ) {
        target[ key ] = $.isPlainObject( target[ key ] ) ?
         $.widget.extend( {}, target[ key ], value ) :
   
         // Don't extend strings, arrays, etc. with objects
         $.widget.extend( {}, value );
   
       // Copy everything else by reference
       } else {
        target[ key ] = value;
       }
      }
     }
    }
    return target;
   };
   
   $.widget.bridge = function( name, object ) {
    var fullName = object.prototype.widgetFullName || name;
    $.fn[ name ] = function( options ) {
     var isMethodCall = typeof options === "string";
     var args = widgetSlice.call( arguments, 1 );
     var returnValue = this;
   
     if ( isMethodCall ) {
   
      // If this is an empty collection, we need to have the instance method
      // return undefined instead of the jQuery instance
      if ( !this.length && options === "instance" ) {
       returnValue = undefined;
      } else {
       this.each( function() {
        var methodValue;
        var instance = $.data( this, fullName );
   
        if ( options === "instance" ) {
         returnValue = instance;
         return false;
        }
   
        if ( !instance ) {
         return $.error( "cannot call methods on " + name +
          " prior to initialization; " +
          "attempted to call method '" + options + "'" );
        }
   
        if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
         return $.error( "no such method '" + options + "' for " + name +
          " widget instance" );
        }
   
        methodValue = instance[ options ].apply( instance, args );
   
        if ( methodValue !== instance && methodValue !== undefined ) {
         returnValue = methodValue && methodValue.jquery ?
          returnValue.pushStack( methodValue.get() ) :
          methodValue;
         return false;
        }
       } );
      }
     } else {
   
      // Allow multiple hashes to be passed on init
      if ( args.length ) {
       options = $.widget.extend.apply( null, [ options ].concat( args ) );
      }
   
      this.each( function() {
       var instance = $.data( this, fullName );
       if ( instance ) {
        instance.option( options || {} );
        if ( instance._init ) {
         instance._init();
        }
       } else {
        $.data( this, fullName, new object( options, this ) );
       }
      } );
     }
   
     return returnValue;
    };
   };
   
   $.Widget = function( /* options, element */ ) {};
   $.Widget._childConstructors = [];
   
   $.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
   
    options: {
     classes: {},
     disabled: false,
   
     // Callbacks
     create: null
    },
   
    _createWidget: function( options, element ) {
     element = $( element || this.defaultElement || this )[ 0 ];
     this.element = $( element );
     this.uuid = widgetUuid++;
     this.eventNamespace = "." + this.widgetName + this.uuid;
   
     this.bindings = $();
     this.hoverable = $();
     this.focusable = $();
     this.classesElementLookup = {};
   
     if ( element !== this ) {
      $.data( element, this.widgetFullName, this );
      this._on( true, this.element, {
       remove: function( event ) {
        if ( event.target === element ) {
         this.destroy();
        }
       }
      } );
      this.document = $( element.style ?
   
       // Element within the document
       element.ownerDocument :
   
       // Element is window or document
       element.document || element );
      this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
     }
   
     this.options = $.widget.extend( {},
      this.options,
      this._getCreateOptions(),
      options );
   
     this._create();
   
     if ( this.options.disabled ) {
      this._setOptionDisabled( this.options.disabled );
     }
   
     this._trigger( "create", null, this._getCreateEventData() );
     this._init();
    },
   
    _getCreateOptions: function() {
     return {};
    },
   
    _getCreateEventData: $.noop,
   
    _create: $.noop,
   
    _init: $.noop,
   
    destroy: function() {
     var that = this;
   
     this._destroy();
     $.each( this.classesElementLookup, function( key, value ) {
      that._removeClass( value, key );
     } );
   
     // We can probably remove the unbind calls in 2.0
     // all event bindings should go through this._on()
     this.element
      .off( this.eventNamespace )
      .removeData( this.widgetFullName );
     this.widget()
      .off( this.eventNamespace )
      .removeAttr( "aria-disabled" );
   
     // Clean up events and states
     this.bindings.off( this.eventNamespace );
    },
   
    _destroy: $.noop,
   
    widget: function() {
     return this.element;
    },
   
    option: function( key, value ) {
     var options = key;
     var parts;
     var curOption;
     var i;
   
     if ( arguments.length === 0 ) {
   
      // Don't return a reference to the internal hash
      return $.widget.extend( {}, this.options );
     }
   
     if ( typeof key === "string" ) {
   
      // Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
      options = {};
      parts = key.split( "." );
      key = parts.shift();
      if ( parts.length ) {
       curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
       for ( i = 0; i < parts.length - 1; i++ ) {
        curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
        curOption = curOption[ parts[ i ] ];
       }
       key = parts.pop();
       if ( arguments.length === 1 ) {
        return curOption[ key ] === undefined ? null : curOption[ key ];
       }
       curOption[ key ] = value;
      } else {
       if ( arguments.length === 1 ) {
        return this.options[ key ] === undefined ? null : this.options[ key ];
       }
       options[ key ] = value;
      }
     }
   
     this._setOptions( options );
   
     return this;
    },
   
    _setOptions: function( options ) {
     var key;
   
     for ( key in options ) {
      this._setOption( key, options[ key ] );
     }
   
     return this;
    },
   
    _setOption: function( key, value ) {
     if ( key === "classes" ) {
      this._setOptionClasses( value );
     }
   
     this.options[ key ] = value;
   
     if ( key === "disabled" ) {
      this._setOptionDisabled( value );
     }
   
     return this;
    },
   
    _setOptionClasses: function( value ) {
     var classKey, elements, currentElements;
   
     for ( classKey in value ) {
      currentElements = this.classesElementLookup[ classKey ];
      if ( value[ classKey ] === this.options.classes[ classKey ] ||
        !currentElements ||
        !currentElements.length ) {
       continue;
      }
   
      // We are doing this to create a new jQuery object because the _removeClass() call
      // on the next line is going to destroy the reference to the current elements being
      // tracked. We need to save a copy of this collection so that we can add the new classes
      // below.
      elements = $( currentElements.get() );
      this._removeClass( currentElements, classKey );
   
      // We don't use _addClass() here, because that uses this.options.classes
      // for generating the string of classes. We want to use the value passed in from
      // _setOption(), this is the new value of the classes option which was passed to
      // _setOption(). We pass this value directly to _classes().
      elements.addClass( this._classes( {
       element: elements,
       keys: classKey,
       classes: value,
       add: true
      } ) );
     }
    },
   
    _setOptionDisabled: function( value ) {
     this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );
   
     // If the widget is becoming disabled, then nothing is interactive
     if ( value ) {
      this._removeClass( this.hoverable, null, "ui-state-hover" );
      this._removeClass( this.focusable, null, "ui-state-focus" );
     }
    },
   
    enable: function() {
     return this._setOptions( { disabled: false } );
    },
   
    disable: function() {
     return this._setOptions( { disabled: true } );
    },
   
    _classes: function( options ) {
     var full = [];
     var that = this;
   
     options = $.extend( {
      element: this.element,
      classes: this.options.classes || {}
     }, options );
   
     function processClassString( classes, checkOption ) {
      var current, i;
      for ( i = 0; i < classes.length; i++ ) {
       current = that.classesElementLookup[ classes[ i ] ] || $();
       if ( options.add ) {
        current = $( $.unique( current.get().concat( options.element.get() ) ) );
       } else {
        current = $( current.not( options.element ).get() );
       }
       that.classesElementLookup[ classes[ i ] ] = current;
       full.push( classes[ i ] );
       if ( checkOption && options.classes[ classes[ i ] ] ) {
        full.push( options.classes[ classes[ i ] ] );
       }
      }
     }
   
     this._on( options.element, {
      "remove": "_untrackClassesElement"
     } );
   
     if ( options.keys ) {
      processClassString( options.keys.match( /\S+/g ) || [], true );
     }
     if ( options.extra ) {
      processClassString( options.extra.match( /\S+/g ) || [] );
     }
   
     return full.join( " " );
    },
   
    _untrackClassesElement: function( event ) {
     var that = this;
     $.each( that.classesElementLookup, function( key, value ) {
      if ( $.inArray( event.target, value ) !== -1 ) {
       that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
      }
     } );
    },
   
    _removeClass: function( element, keys, extra ) {
     return this._toggleClass( element, keys, extra, false );
    },
   
    _addClass: function( element, keys, extra ) {
     return this._toggleClass( element, keys, extra, true );
    },
   
    _toggleClass: function( element, keys, extra, add ) {
     add = ( typeof add === "boolean" ) ? add : extra;
     var shift = ( typeof element === "string" || element === null ),
      options = {
       extra: shift ? keys : extra,
       keys: shift ? element : keys,
       element: shift ? this.element : element,
       add: add
      };
     options.element.toggleClass( this._classes( options ), add );
     return this;
    },
   
    _on: function( suppressDisabledCheck, element, handlers ) {
     var delegateElement;
     var instance = this;
   
     // No suppressDisabledCheck flag, shuffle arguments
     if ( typeof suppressDisabledCheck !== "boolean" ) {
      handlers = element;
      element = suppressDisabledCheck;
      suppressDisabledCheck = false;
     }
   
     // No element argument, shuffle and use this.element
     if ( !handlers ) {
      handlers = element;
      element = this.element;
      delegateElement = this.widget();
     } else {
      element = delegateElement = $( element );
      this.bindings = this.bindings.add( element );
     }
   
     $.each( handlers, function( event, handler ) {
      function handlerProxy() {
   
       // Allow widgets to customize the disabled handling
       // - disabled as an array instead of boolean
       // - disabled class as method for disabling individual parts
       if ( !suppressDisabledCheck &&
         ( instance.options.disabled === true ||
         $( this ).hasClass( "ui-state-disabled" ) ) ) {
        return;
       }
       return ( typeof handler === "string" ? instance[ handler ] : handler )
        .apply( instance, arguments );
      }
   
      // Copy the guid so direct unbinding works
      if ( typeof handler !== "string" ) {
       handlerProxy.guid = handler.guid =
        handler.guid || handlerProxy.guid || $.guid++;
      }
   
      var match = event.match( /^([\w:-]*)\s*(.*)$/ );
      var eventName = match[ 1 ] + instance.eventNamespace;
      var selector = match[ 2 ];
   
      if ( selector ) {
       delegateElement.on( eventName, selector, handlerProxy );
      } else {
       element.on( eventName, handlerProxy );
      }
     } );
    },
   
    _off: function( element, eventName ) {
     eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
      this.eventNamespace;
     element.off( eventName ).off( eventName );
   
     // Clear the stack to avoid memory leaks (#10056)
     this.bindings = $( this.bindings.not( element ).get() );
     this.focusable = $( this.focusable.not( element ).get() );
     this.hoverable = $( this.hoverable.not( element ).get() );
    },
   
    _delay: function( handler, delay ) {
     function handlerProxy() {
      return ( typeof handler === "string" ? instance[ handler ] : handler )
       .apply( instance, arguments );
     }
     var instance = this;
     return setTimeout( handlerProxy, delay || 0 );
    },
   
    _hoverable: function( element ) {
     this.hoverable = this.hoverable.add( element );
     this._on( element, {
      mouseenter: function( event ) {
       this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
      },
      mouseleave: function( event ) {
       this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
      }
     } );
    },
   
    _focusable: function( element ) {
     this.focusable = this.focusable.add( element );
     this._on( element, {
      focusin: function( event ) {
       this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
      },
      focusout: function( event ) {
       this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
      }
     } );
    },
   
    _trigger: function( type, event, data ) {
     var prop, orig;
     var callback = this.options[ type ];
   
     data = data || {};
     event = $.Event( event );
     event.type = ( type === this.widgetEventPrefix ?
      type :
      this.widgetEventPrefix + type ).toLowerCase();
   
     // The original event may come from any element
     // so we need to reset the target on the new event
     event.target = this.element[ 0 ];
   
     // Copy original event properties over to the new event
     orig = event.originalEvent;
     if ( orig ) {
      for ( prop in orig ) {
       if ( !( prop in event ) ) {
        event[ prop ] = orig[ prop ];
       }
      }
     }
   
     this.element.trigger( event, data );
     return !( $.isFunction( callback ) &&
      callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
      event.isDefaultPrevented() );
    }
   };
   
   $.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
    $.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
     if ( typeof options === "string" ) {
      options = { effect: options };
     }
   
     var hasOptions;
     var effectName = !options ?
      method :
      options === true || typeof options === "number" ?
       defaultEffect :
       options.effect || defaultEffect;
   
     options = options || {};
     if ( typeof options === "number" ) {
      options = { duration: options };
     }
   
     hasOptions = !$.isEmptyObject( options );
     options.complete = callback;
   
     if ( options.delay ) {
      element.delay( options.delay );
     }
   
     if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
      element[ method ]( options );
     } else if ( effectName !== method && element[ effectName ] ) {
      element[ effectName ]( options.duration, options.easing, callback );
     } else {
      element.queue( function( next ) {
       $( this )[ method ]();
       if ( callback ) {
        callback.call( element[ 0 ] );
       }
       next();
      } );
     }
    };
   } );
   
   var widget = $.widget;
   
   
   /*!
    * jQuery UI Position 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    *
    * http://api.jqueryui.com/position/
    */
   
   //>>label: Position
   //>>group: Core
   //>>description: Positions elements relative to other elements.
   //>>docs: http://api.jqueryui.com/position/
   //>>demos: http://jqueryui.com/position/
   
   
   ( function() {
   var cachedScrollbarWidth,
    max = Math.max,
    abs = Math.abs,
    rhorizontal = /left|center|right/,
    rvertical = /top|center|bottom/,
    roffset = /[\+\-]\d+(\.[\d]+)?%?/,
    rposition = /^\w+/,
    rpercent = /%$/,
    _position = $.fn.position;
   
   function getOffsets( offsets, width, height ) {
    return [
     parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
     parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
    ];
   }
   
   function parseCss( element, property ) {
    return parseInt( $.css( element, property ), 10 ) || 0;
   }
   
   function getDimensions( elem ) {
    var raw = elem[ 0 ];
    if ( raw.nodeType === 9 ) {
     return {
      width: elem.width(),
      height: elem.height(),
      offset: { top: 0, left: 0 }
     };
    }
    if ( $.isWindow( raw ) ) {
     return {
      width: elem.width(),
      height: elem.height(),
      offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
     };
    }
    if ( raw.preventDefault ) {
     return {
      width: 0,
      height: 0,
      offset: { top: raw.pageY, left: raw.pageX }
     };
    }
    return {
     width: elem.outerWidth(),
     height: elem.outerHeight(),
     offset: elem.offset()
    };
   }
   
   $.position = {
    scrollbarWidth: function() {
     if ( cachedScrollbarWidth !== undefined ) {
      return cachedScrollbarWidth;
     }
     var w1, w2,
      div = $( "<div " +
       "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
       "<div style='height:100px;width:auto;'></div></div>" ),
      innerDiv = div.children()[ 0 ];
   
     $( "body" ).append( div );
     w1 = innerDiv.offsetWidth;
     div.css( "overflow", "scroll" );
   
     w2 = innerDiv.offsetWidth;
   
     if ( w1 === w2 ) {
      w2 = div[ 0 ].clientWidth;
     }
   
     div.remove();
   
     return ( cachedScrollbarWidth = w1 - w2 );
    },
    getScrollInfo: function( within ) {
     var overflowX = within.isWindow || within.isDocument ? "" :
       within.element.css( "overflow-x" ),
      overflowY = within.isWindow || within.isDocument ? "" :
       within.element.css( "overflow-y" ),
      hasOverflowX = overflowX === "scroll" ||
       ( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
      hasOverflowY = overflowY === "scroll" ||
       ( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
     return {
      width: hasOverflowY ? $.position.scrollbarWidth() : 0,
      height: hasOverflowX ? $.position.scrollbarWidth() : 0
     };
    },
    getWithinInfo: function( element ) {
     var withinElement = $( element || window ),
      isWindow = $.isWindow( withinElement[ 0 ] ),
      isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
      hasOffset = !isWindow && !isDocument;
     return {
      element: withinElement,
      isWindow: isWindow,
      isDocument: isDocument,
      offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
      scrollLeft: withinElement.scrollLeft(),
      scrollTop: withinElement.scrollTop(),
      width: withinElement.outerWidth(),
      height: withinElement.outerHeight()
     };
    }
   };
   
   $.fn.position = function( options ) {
    if ( !options || !options.of ) {
     return _position.apply( this, arguments );
    }
   
    // Make a copy, we don't want to modify arguments
    options = $.extend( {}, options );
   
    var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
     target = $( options.of ),
     within = $.position.getWithinInfo( options.within ),
     scrollInfo = $.position.getScrollInfo( within ),
     collision = ( options.collision || "flip" ).split( " " ),
     offsets = {};
   
    dimensions = getDimensions( target );
    if ( target[ 0 ].preventDefault ) {
   
     // Force left top to allow flipping
     options.at = "left top";
    }
    targetWidth = dimensions.width;
    targetHeight = dimensions.height;
    targetOffset = dimensions.offset;
   
    // Clone to reuse original targetOffset later
    basePosition = $.extend( {}, targetOffset );
   
    // Force my and at to have valid horizontal and vertical positions
    // if a value is missing or invalid, it will be converted to center
    $.each( [ "my", "at" ], function() {
     var pos = ( options[ this ] || "" ).split( " " ),
      horizontalOffset,
      verticalOffset;
   
     if ( pos.length === 1 ) {
      pos = rhorizontal.test( pos[ 0 ] ) ?
       pos.concat( [ "center" ] ) :
       rvertical.test( pos[ 0 ] ) ?
        [ "center" ].concat( pos ) :
        [ "center", "center" ];
     }
     pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
     pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";
   
     // Calculate offsets
     horizontalOffset = roffset.exec( pos[ 0 ] );
     verticalOffset = roffset.exec( pos[ 1 ] );
     offsets[ this ] = [
      horizontalOffset ? horizontalOffset[ 0 ] : 0,
      verticalOffset ? verticalOffset[ 0 ] : 0
     ];
   
     // Reduce to just the positions without the offsets
     options[ this ] = [
      rposition.exec( pos[ 0 ] )[ 0 ],
      rposition.exec( pos[ 1 ] )[ 0 ]
     ];
    } );
   
    // Normalize collision option
    if ( collision.length === 1 ) {
     collision[ 1 ] = collision[ 0 ];
    }
   
    if ( options.at[ 0 ] === "right" ) {
     basePosition.left += targetWidth;
    } else if ( options.at[ 0 ] === "center" ) {
     basePosition.left += targetWidth / 2;
    }
   
    if ( options.at[ 1 ] === "bottom" ) {
     basePosition.top += targetHeight;
    } else if ( options.at[ 1 ] === "center" ) {
     basePosition.top += targetHeight / 2;
    }
   
    atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
    basePosition.left += atOffset[ 0 ];
    basePosition.top += atOffset[ 1 ];
   
    return this.each( function() {
     var collisionPosition, using,
      elem = $( this ),
      elemWidth = elem.outerWidth(),
      elemHeight = elem.outerHeight(),
      marginLeft = parseCss( this, "marginLeft" ),
      marginTop = parseCss( this, "marginTop" ),
      collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
       scrollInfo.width,
      collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
       scrollInfo.height,
      position = $.extend( {}, basePosition ),
      myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );
   
     if ( options.my[ 0 ] === "right" ) {
      position.left -= elemWidth;
     } else if ( options.my[ 0 ] === "center" ) {
      position.left -= elemWidth / 2;
     }
   
     if ( options.my[ 1 ] === "bottom" ) {
      position.top -= elemHeight;
     } else if ( options.my[ 1 ] === "center" ) {
      position.top -= elemHeight / 2;
     }
   
     position.left += myOffset[ 0 ];
     position.top += myOffset[ 1 ];
   
     collisionPosition = {
      marginLeft: marginLeft,
      marginTop: marginTop
     };
   
     $.each( [ "left", "top" ], function( i, dir ) {
      if ( $.ui.position[ collision[ i ] ] ) {
       $.ui.position[ collision[ i ] ][ dir ]( position, {
        targetWidth: targetWidth,
        targetHeight: targetHeight,
        elemWidth: elemWidth,
        elemHeight: elemHeight,
        collisionPosition: collisionPosition,
        collisionWidth: collisionWidth,
        collisionHeight: collisionHeight,
        offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
        my: options.my,
        at: options.at,
        within: within,
        elem: elem
       } );
      }
     } );
   
     if ( options.using ) {
   
      // Adds feedback as second argument to using callback, if present
      using = function( props ) {
       var left = targetOffset.left - position.left,
        right = left + targetWidth - elemWidth,
        top = targetOffset.top - position.top,
        bottom = top + targetHeight - elemHeight,
        feedback = {
         target: {
          element: target,
          left: targetOffset.left,
          top: targetOffset.top,
          width: targetWidth,
          height: targetHeight
         },
         element: {
          element: elem,
          left: position.left,
          top: position.top,
          width: elemWidth,
          height: elemHeight
         },
         horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
         vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
        };
       if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
        feedback.horizontal = "center";
       }
       if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
        feedback.vertical = "middle";
       }
       if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
        feedback.important = "horizontal";
       } else {
        feedback.important = "vertical";
       }
       options.using.call( this, props, feedback );
      };
     }
   
     elem.offset( $.extend( position, { using: using } ) );
    } );
   };
   
   $.ui.position = {
    fit: {
     left: function( position, data ) {
      var within = data.within,
       withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
       outerWidth = within.width,
       collisionPosLeft = position.left - data.collisionPosition.marginLeft,
       overLeft = withinOffset - collisionPosLeft,
       overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
       newOverRight;
   
      // Element is wider than within
      if ( data.collisionWidth > outerWidth ) {
   
       // Element is initially over the left side of within
       if ( overLeft > 0 && overRight <= 0 ) {
        newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
         withinOffset;
        position.left += overLeft - newOverRight;
   
       // Element is initially over right side of within
       } else if ( overRight > 0 && overLeft <= 0 ) {
        position.left = withinOffset;
   
       // Element is initially over both left and right sides of within
       } else {
        if ( overLeft > overRight ) {
         position.left = withinOffset + outerWidth - data.collisionWidth;
        } else {
         position.left = withinOffset;
        }
       }
   
      // Too far left -> align with left edge
      } else if ( overLeft > 0 ) {
       position.left += overLeft;
   
      // Too far right -> align with right edge
      } else if ( overRight > 0 ) {
       position.left -= overRight;
   
      // Adjust based on position and margin
      } else {
       position.left = max( position.left - collisionPosLeft, position.left );
      }
     },
     top: function( position, data ) {
      var within = data.within,
       withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
       outerHeight = data.within.height,
       collisionPosTop = position.top - data.collisionPosition.marginTop,
       overTop = withinOffset - collisionPosTop,
       overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
       newOverBottom;
   
      // Element is taller than within
      if ( data.collisionHeight > outerHeight ) {
   
       // Element is initially over the top of within
       if ( overTop > 0 && overBottom <= 0 ) {
        newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
         withinOffset;
        position.top += overTop - newOverBottom;
   
       // Element is initially over bottom of within
       } else if ( overBottom > 0 && overTop <= 0 ) {
        position.top = withinOffset;
   
       // Element is initially over both top and bottom of within
       } else {
        if ( overTop > overBottom ) {
         position.top = withinOffset + outerHeight - data.collisionHeight;
        } else {
         position.top = withinOffset;
        }
       }
   
      // Too far up -> align with top
      } else if ( overTop > 0 ) {
       position.top += overTop;
   
      // Too far down -> align with bottom edge
      } else if ( overBottom > 0 ) {
       position.top -= overBottom;
   
      // Adjust based on position and margin
      } else {
       position.top = max( position.top - collisionPosTop, position.top );
      }
     }
    },
    flip: {
     left: function( position, data ) {
      var within = data.within,
       withinOffset = within.offset.left + within.scrollLeft,
       outerWidth = within.width,
       offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
       collisionPosLeft = position.left - data.collisionPosition.marginLeft,
       overLeft = collisionPosLeft - offsetLeft,
       overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
       myOffset = data.my[ 0 ] === "left" ?
        -data.elemWidth :
        data.my[ 0 ] === "right" ?
         data.elemWidth :
         0,
       atOffset = data.at[ 0 ] === "left" ?
        data.targetWidth :
        data.at[ 0 ] === "right" ?
         -data.targetWidth :
         0,
       offset = -2 * data.offset[ 0 ],
       newOverRight,
       newOverLeft;
   
      if ( overLeft < 0 ) {
       newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
        outerWidth - withinOffset;
       if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
        position.left += myOffset + atOffset + offset;
       }
      } else if ( overRight > 0 ) {
       newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
        atOffset + offset - offsetLeft;
       if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
        position.left += myOffset + atOffset + offset;
       }
      }
     },
     top: function( position, data ) {
      var within = data.within,
       withinOffset = within.offset.top + within.scrollTop,
       outerHeight = within.height,
       offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
       collisionPosTop = position.top - data.collisionPosition.marginTop,
       overTop = collisionPosTop - offsetTop,
       overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
       top = data.my[ 1 ] === "top",
       myOffset = top ?
        -data.elemHeight :
        data.my[ 1 ] === "bottom" ?
         data.elemHeight :
         0,
       atOffset = data.at[ 1 ] === "top" ?
        data.targetHeight :
        data.at[ 1 ] === "bottom" ?
         -data.targetHeight :
         0,
       offset = -2 * data.offset[ 1 ],
       newOverTop,
       newOverBottom;
      if ( overTop < 0 ) {
       newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
        outerHeight - withinOffset;
       if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
        position.top += myOffset + atOffset + offset;
       }
      } else if ( overBottom > 0 ) {
       newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
        offset - offsetTop;
       if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
        position.top += myOffset + atOffset + offset;
       }
      }
     }
    },
    flipfit: {
     left: function() {
      $.ui.position.flip.left.apply( this, arguments );
      $.ui.position.fit.left.apply( this, arguments );
     },
     top: function() {
      $.ui.position.flip.top.apply( this, arguments );
      $.ui.position.fit.top.apply( this, arguments );
     }
    }
   };
   
   } )();
   
   var position = $.ui.position;
   
   
   /*!
    * jQuery UI :data 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: :data Selector
   //>>group: Core
   //>>description: Selects elements which have data stored under the specified key.
   //>>docs: http://api.jqueryui.com/data-selector/
   
   
   var data = $.extend( $.expr[ ":" ], {
    data: $.expr.createPseudo ?
     $.expr.createPseudo( function( dataName ) {
      return function( elem ) {
       return !!$.data( elem, dataName );
      };
     } ) :
   
     // Support: jQuery <1.8
     function( elem, i, match ) {
      return !!$.data( elem, match[ 3 ] );
     }
   } );
   
   /*!
    * jQuery UI Disable Selection 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: disableSelection
   //>>group: Core
   //>>description: Disable selection of text content within the set of matched elements.
   //>>docs: http://api.jqueryui.com/disableSelection/
   
   // This file is deprecated
   
   
   var disableSelection = $.fn.extend( {
    disableSelection: ( function() {
     var eventType = "onselectstart" in document.createElement( "div" ) ?
      "selectstart" :
      "mousedown";
   
     return function() {
      return this.on( eventType + ".ui-disableSelection", function( event ) {
       event.preventDefault();
      } );
     };
    } )(),
   
    enableSelection: function() {
     return this.off( ".ui-disableSelection" );
    }
   } );
   
   
   /*!
    * jQuery UI Focusable 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: :focusable Selector
   //>>group: Core
   //>>description: Selects elements which can be focused.
   //>>docs: http://api.jqueryui.com/focusable-selector/
   
   
   
   // Selectors
   $.ui.focusable = function( element, hasTabindex ) {
    var map, mapName, img, focusableIfVisible, fieldset,
     nodeName = element.nodeName.toLowerCase();
   
    if ( "area" === nodeName ) {
     map = element.parentNode;
     mapName = map.name;
     if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
      return false;
     }
     img = $( "img[usemap='#" + mapName + "']" );
     return img.length > 0 && img.is( ":visible" );
    }
   
    if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
     focusableIfVisible = !element.disabled;
   
     if ( focusableIfVisible ) {
   
      // Form controls within a disabled fieldset are disabled.
      // However, controls within the fieldset's legend do not get disabled.
      // Since controls generally aren't placed inside legends, we skip
      // this portion of the check.
      fieldset = $( element ).closest( "fieldset" )[ 0 ];
      if ( fieldset ) {
       focusableIfVisible = !fieldset.disabled;
      }
     }
    } else if ( "a" === nodeName ) {
     focusableIfVisible = element.href || hasTabindex;
    } else {
     focusableIfVisible = hasTabindex;
    }
   
    return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
   };
   
   // Support: IE 8 only
   // IE 8 doesn't resolve inherit to visible/hidden for computed values
   function visible( element ) {
    var visibility = element.css( "visibility" );
    while ( visibility === "inherit" ) {
     element = element.parent();
     visibility = element.css( "visibility" );
    }
    return visibility !== "hidden";
   }
   
   $.extend( $.expr[ ":" ], {
    focusable: function( element ) {
     return $.ui.focusable( element, $.attr( element, "tabindex" ) != null );
    }
   } );
   
   var focusable = $.ui.focusable;
   
   
   
   
   // Support: IE8 Only
   // IE8 does not support the form attribute and when it is supplied. It overwrites the form prop
   // with a string, so we need to find the proper form.
   var form = $.fn.form = function() {
    return typeof this[ 0 ].form === "string" ? this.closest( "form" ) : $( this[ 0 ].form );
   };
   
   
   /*!
    * jQuery UI Form Reset Mixin 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: Form Reset Mixin
   //>>group: Core
   //>>description: Refresh input widgets when their form is reset
   //>>docs: http://api.jqueryui.com/form-reset-mixin/
   
   
   
   var formResetMixin = $.ui.formResetMixin = {
    _formResetHandler: function() {
     var form = $( this );
   
     // Wait for the form reset to actually happen before refreshing
     setTimeout( function() {
      var instances = form.data( "ui-form-reset-instances" );
      $.each( instances, function() {
       this.refresh();
      } );
     } );
    },
   
    _bindFormResetHandler: function() {
     this.form = this.element.form();
     if ( !this.form.length ) {
      return;
     }
   
     var instances = this.form.data( "ui-form-reset-instances" ) || [];
     if ( !instances.length ) {
   
      // We don't use _on() here because we use a single event handler per form
      this.form.on( "reset.ui-form-reset", this._formResetHandler );
     }
     instances.push( this );
     this.form.data( "ui-form-reset-instances", instances );
    },
   
    _unbindFormResetHandler: function() {
     if ( !this.form.length ) {
      return;
     }
   
     var instances = this.form.data( "ui-form-reset-instances" );
     instances.splice( $.inArray( this, instances ), 1 );
     if ( instances.length ) {
      this.form.data( "ui-form-reset-instances", instances );
     } else {
      this.form
       .removeData( "ui-form-reset-instances" )
       .off( "reset.ui-form-reset" );
     }
    }
   };
   
   
   /*!
    * jQuery UI Support for jQuery core 1.7.x 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    *
    */
   
   //>>label: jQuery 1.7 Support
   //>>group: Core
   //>>description: Support version 1.7.x of jQuery core
   
   
   
   // Support: jQuery 1.7 only
   // Not a great way to check versions, but since we only support 1.7+ and only
   // need to detect <1.8, this is a simple check that should suffice. Checking
   // for "1.7." would be a bit safer, but the version string is 1.7, not 1.7.0
   // and we'll never reach 1.70.0 (if we do, we certainly won't be supporting
   // 1.7 anymore). See #11197 for why we're not using feature detection.
   if ( $.fn.jquery.substring( 0, 3 ) === "1.7" ) {
   
    // Setters for .innerWidth(), .innerHeight(), .outerWidth(), .outerHeight()
    // Unlike jQuery Core 1.8+, these only support numeric values to set the
    // dimensions in pixels
    $.each( [ "Width", "Height" ], function( i, name ) {
     var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
      type = name.toLowerCase(),
      orig = {
       innerWidth: $.fn.innerWidth,
       innerHeight: $.fn.innerHeight,
       outerWidth: $.fn.outerWidth,
       outerHeight: $.fn.outerHeight
      };
   
     function reduce( elem, size, border, margin ) {
      $.each( side, function() {
       size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
       if ( border ) {
        size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
       }
       if ( margin ) {
        size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
       }
      } );
      return size;
     }
   
     $.fn[ "inner" + name ] = function( size ) {
      if ( size === undefined ) {
       return orig[ "inner" + name ].call( this );
      }
   
      return this.each( function() {
       $( this ).css( type, reduce( this, size ) + "px" );
      } );
     };
   
     $.fn[ "outer" + name ] = function( size, margin ) {
      if ( typeof size !== "number" ) {
       return orig[ "outer" + name ].call( this, size );
      }
   
      return this.each( function() {
       $( this ).css( type, reduce( this, size, true, margin ) + "px" );
      } );
     };
    } );
   
    $.fn.addBack = function( selector ) {
     return this.add( selector == null ?
      this.prevObject : this.prevObject.filter( selector )
     );
    };
   }
   
   ;
   /*!
    * jQuery UI Keycode 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: Keycode
   //>>group: Core
   //>>description: Provide keycodes as keynames
   //>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/
   
   
   var keycode = $.ui.keyCode = {
    BACKSPACE: 8,
    COMMA: 188,
    DELETE: 46,
    DOWN: 40,
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    LEFT: 37,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38
   };
   
   
   
   
   // Internal use only
   var escapeSelector = $.ui.escapeSelector = ( function() {
    var selectorEscape = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;
    return function( selector ) {
     return selector.replace( selectorEscape, "\\$1" );
    };
   } )();
   
   
   /*!
    * jQuery UI Labels 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: labels
   //>>group: Core
   //>>description: Find all the labels associated with a given input
   //>>docs: http://api.jqueryui.com/labels/
   
   
   
   var labels = $.fn.labels = function() {
    var ancestor, selector, id, labels, ancestors;
   
    // Check control.labels first
    if ( this[ 0 ].labels && this[ 0 ].labels.length ) {
     return this.pushStack( this[ 0 ].labels );
    }
   
    // Support: IE <= 11, FF <= 37, Android <= 2.3 only
    // Above browsers do not support control.labels. Everything below is to support them
    // as well as document fragments. control.labels does not work on document fragments
    labels = this.eq( 0 ).parents( "label" );
   
    // Look for the label based on the id
    id = this.attr( "id" );
    if ( id ) {
   
     // We don't search against the document in case the element
     // is disconnected from the DOM
     ancestor = this.eq( 0 ).parents().last();
   
     // Get a full set of top level ancestors
     ancestors = ancestor.add( ancestor.length ? ancestor.siblings() : this.siblings() );
   
     // Create a selector for the label based on the id
     selector = "label[for='" + $.ui.escapeSelector( id ) + "']";
   
     labels = labels.add( ancestors.find( selector ).addBack( selector ) );
   
    }
   
    // Return whatever we have found for labels
    return this.pushStack( labels );
   };
   
   
   /*!
    * jQuery UI Scroll Parent 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: scrollParent
   //>>group: Core
   //>>description: Get the closest ancestor element that is scrollable.
   //>>docs: http://api.jqueryui.com/scrollParent/
   
   
   
   var scrollParent = $.fn.scrollParent = function( includeHidden ) {
    var position = this.css( "position" ),
     excludeStaticParent = position === "absolute",
     overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
     scrollParent = this.parents().filter( function() {
      var parent = $( this );
      if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
       return false;
      }
      return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
       parent.css( "overflow-x" ) );
     } ).eq( 0 );
   
    return position === "fixed" || !scrollParent.length ?
     $( this[ 0 ].ownerDocument || document ) :
     scrollParent;
   };
   
   
   /*!
    * jQuery UI Tabbable 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: :tabbable Selector
   //>>group: Core
   //>>description: Selects elements which can be tabbed to.
   //>>docs: http://api.jqueryui.com/tabbable-selector/
   
   
   
   var tabbable = $.extend( $.expr[ ":" ], {
    tabbable: function( element ) {
     var tabIndex = $.attr( element, "tabindex" ),
      hasTabindex = tabIndex != null;
     return ( !hasTabindex || tabIndex >= 0 ) && $.ui.focusable( element, hasTabindex );
    }
   } );
   
   
   /*!
    * jQuery UI Unique ID 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: uniqueId
   //>>group: Core
   //>>description: Functions to generate and remove uniqueId's
   //>>docs: http://api.jqueryui.com/uniqueId/
   
   
   
   var uniqueId = $.fn.extend( {
    uniqueId: ( function() {
     var uuid = 0;
   
     return function() {
      return this.each( function() {
       if ( !this.id ) {
        this.id = "ui-id-" + ( ++uuid );
       }
      } );
     };
    } )(),
   
    removeUniqueId: function() {
     return this.each( function() {
      if ( /^ui-id-\d+$/.test( this.id ) ) {
       $( this ).removeAttr( "id" );
      }
     } );
    }
   } );
   
   
   
   var safeActiveElement = $.ui.safeActiveElement = function( document ) {
    var activeElement;
   
    // Support: IE 9 only
    // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
    try {
     activeElement = document.activeElement;
    } catch ( error ) {
     activeElement = document.body;
    }
   
    // Support: IE 9 - 11 only
    // IE may return null instead of an element
    // Interestingly, this only seems to occur when NOT in an iframe
    if ( !activeElement ) {
     activeElement = document.body;
    }
   
    // Support: IE 11 only
    // IE11 returns a seemingly empty object in some cases when accessing
    // document.activeElement from an <iframe>
    if ( !activeElement.nodeName ) {
     activeElement = document.body;
    }
   
    return activeElement;
   };
   
   
   /*!
    * jQuery UI Menu 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: Menu
   //>>group: Widgets
   //>>description: Creates nestable menus.
   //>>docs: http://api.jqueryui.com/menu/
   //>>demos: http://jqueryui.com/menu/
   //>>css.structure: ../../themes/base/core.css
   //>>css.structure: ../../themes/base/menu.css
   //>>css.theme: ../../themes/base/theme.css
   
   
   
   var widgetsMenu = $.widget( "ui.menu", {
    version: "1.12.1",
    defaultElement: "<ul>",
    delay: 300,
    options: {
     icons: {
      submenu: "ui-icon-caret-1-e"
     },
     items: "> *",
     menus: "ul",
     position: {
      my: "left top",
      at: "right top"
     },
     role: "menu",
   
     // Callbacks
     blur: null,
     focus: null,
     select: null
    },
   
    _create: function() {
     this.activeMenu = this.element;
   
     // Flag used to prevent firing of the click handler
     // as the event bubbles up through nested menus
     this.mouseHandled = false;
     this.element
      .uniqueId()
      .attr( {
       role: this.options.role,
       tabIndex: 0
      } );
   
     this._addClass( "ui-menu", "ui-widget ui-widget-content" );
     this._on( {
   
      // Prevent focus from sticking to links inside menu after clicking
      // them (focus should always stay on UL during navigation).
      "mousedown .ui-menu-item": function( event ) {
       event.preventDefault();
      },
      "click .ui-menu-item": function( event ) {
       var target = $( event.target );
       var active = $( $.ui.safeActiveElement( this.document[ 0 ] ) );
       if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
        this.select( event );
   
        // Only set the mouseHandled flag if the event will bubble, see #9469.
        if ( !event.isPropagationStopped() ) {
         this.mouseHandled = true;
        }
   
        // Open submenu on click
        if ( target.has( ".ui-menu" ).length ) {
         this.expand( event );
        } else if ( !this.element.is( ":focus" ) &&
          active.closest( ".ui-menu" ).length ) {
   
         // Redirect focus to the menu
         this.element.trigger( "focus", [ true ] );
   
         // If the active item is on the top level, let it stay active.
         // Otherwise, blur the active item since it is no longer visible.
         if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
          clearTimeout( this.timer );
         }
        }
       }
      },
      "mouseenter .ui-menu-item": function( event ) {
   
       // Ignore mouse events while typeahead is active, see #10458.
       // Prevents focusing the wrong item when typeahead causes a scroll while the mouse
       // is over an item in the menu
       if ( this.previousFilter ) {
        return;
       }
   
       var actualTarget = $( event.target ).closest( ".ui-menu-item" ),
        target = $( event.currentTarget );
   
       // Ignore bubbled events on parent items, see #11641
       if ( actualTarget[ 0 ] !== target[ 0 ] ) {
        return;
       }
   
       // Remove ui-state-active class from siblings of the newly focused menu item
       // to avoid a jump caused by adjacent elements both having a class with a border
       this._removeClass( target.siblings().children( ".ui-state-active" ),
        null, "ui-state-active" );
       this.focus( event, target );
      },
      mouseleave: "collapseAll",
      "mouseleave .ui-menu": "collapseAll",
      focus: function( event, keepActiveItem ) {
   
       // If there's already an active item, keep it active
       // If not, activate the first item
       var item = this.active || this.element.find( this.options.items ).eq( 0 );
   
       if ( !keepActiveItem ) {
        this.focus( event, item );
       }
      },
      blur: function( event ) {
       this._delay( function() {
        var notContained = !$.contains(
         this.element[ 0 ],
         $.ui.safeActiveElement( this.document[ 0 ] )
        );
        if ( notContained ) {
         this.collapseAll( event );
        }
       } );
      },
      keydown: "_keydown"
     } );
   
     this.refresh();
   
     // Clicks outside of a menu collapse any open menus
     this._on( this.document, {
      click: function( event ) {
       if ( this._closeOnDocumentClick( event ) ) {
        this.collapseAll( event );
       }
   
       // Reset the mouseHandled flag
       this.mouseHandled = false;
      }
     } );
    },
   
    _destroy: function() {
     var items = this.element.find( ".ui-menu-item" )
       .removeAttr( "role aria-disabled" ),
      submenus = items.children( ".ui-menu-item-wrapper" )
       .removeUniqueId()
       .removeAttr( "tabIndex role aria-haspopup" );
   
     // Destroy (sub)menus
     this.element
      .removeAttr( "aria-activedescendant" )
      .find( ".ui-menu" ).addBack()
       .removeAttr( "role aria-labelledby aria-expanded aria-hidden aria-disabled " +
        "tabIndex" )
       .removeUniqueId()
       .show();
   
     submenus.children().each( function() {
      var elem = $( this );
      if ( elem.data( "ui-menu-submenu-caret" ) ) {
       elem.remove();
      }
     } );
    },
   
    _keydown: function( event ) {
     var match, prev, character, skip,
      preventDefault = true;
   
     switch ( event.keyCode ) {
     case $.ui.keyCode.PAGE_UP:
      this.previousPage( event );
      break;
     case $.ui.keyCode.PAGE_DOWN:
      this.nextPage( event );
      break;
     case $.ui.keyCode.HOME:
      this._move( "first", "first", event );
      break;
     case $.ui.keyCode.END:
      this._move( "last", "last", event );
      break;
     case $.ui.keyCode.UP:
      this.previous( event );
      break;
     case $.ui.keyCode.DOWN:
      this.next( event );
      break;
     case $.ui.keyCode.LEFT:
      this.collapse( event );
      break;
     case $.ui.keyCode.RIGHT:
      if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
       this.expand( event );
      }
      break;
     case $.ui.keyCode.ENTER:
     case $.ui.keyCode.SPACE:
      this._activate( event );
      break;
     case $.ui.keyCode.ESCAPE:
      this.collapse( event );
      break;
     default:
      preventDefault = false;
      prev = this.previousFilter || "";
      skip = false;
   
      // Support number pad values
      character = event.keyCode >= 96 && event.keyCode <= 105 ?
       ( event.keyCode - 96 ).toString() : String.fromCharCode( event.keyCode );
   
      clearTimeout( this.filterTimer );
   
      if ( character === prev ) {
       skip = true;
      } else {
       character = prev + character;
      }
   
      match = this._filterMenuItems( character );
      match = skip && match.index( this.active.next() ) !== -1 ?
       this.active.nextAll( ".ui-menu-item" ) :
       match;
   
      // If no matches on the current filter, reset to the last character pressed
      // to move down the menu to the first item that starts with that character
      if ( !match.length ) {
       character = String.fromCharCode( event.keyCode );
       match = this._filterMenuItems( character );
      }
   
      if ( match.length ) {
       this.focus( event, match );
       this.previousFilter = character;
       this.filterTimer = this._delay( function() {
        delete this.previousFilter;
       }, 1000 );
      } else {
       delete this.previousFilter;
      }
     }
   
     if ( preventDefault ) {
      event.preventDefault();
     }
    },
   
    _activate: function( event ) {
     if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
      if ( this.active.children( "[aria-haspopup='true']" ).length ) {
       this.expand( event );
      } else {
       this.select( event );
      }
     }
    },
   
    refresh: function() {
     var menus, items, newSubmenus, newItems, newWrappers,
      that = this,
      icon = this.options.icons.submenu,
      submenus = this.element.find( this.options.menus );
   
     this._toggleClass( "ui-menu-icons", null, !!this.element.find( ".ui-icon" ).length );
   
     // Initialize nested menus
     newSubmenus = submenus.filter( ":not(.ui-menu)" )
      .hide()
      .attr( {
       role: this.options.role,
       "aria-hidden": "true",
       "aria-expanded": "false"
      } )
      .each( function() {
       var menu = $( this ),
        item = menu.prev(),
        submenuCaret = $( "<span>" ).data( "ui-menu-submenu-caret", true );
   
       that._addClass( submenuCaret, "ui-menu-icon", "ui-icon " + icon );
       item
        .attr( "aria-haspopup", "true" )
        .prepend( submenuCaret );
       menu.attr( "aria-labelledby", item.attr( "id" ) );
      } );
   
     this._addClass( newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front" );
   
     menus = submenus.add( this.element );
     items = menus.find( this.options.items );
   
     // Initialize menu-items containing spaces and/or dashes only as dividers
     items.not( ".ui-menu-item" ).each( function() {
      var item = $( this );
      if ( that._isDivider( item ) ) {
       that._addClass( item, "ui-menu-divider", "ui-widget-content" );
      }
     } );
   
     // Don't refresh list items that are already adapted
     newItems = items.not( ".ui-menu-item, .ui-menu-divider" );
     newWrappers = newItems.children()
      .not( ".ui-menu" )
       .uniqueId()
       .attr( {
        tabIndex: -1,
        role: this._itemRole()
       } );
     this._addClass( newItems, "ui-menu-item" )
      ._addClass( newWrappers, "ui-menu-item-wrapper" );
   
     // Add aria-disabled attribute to any disabled menu item
     items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );
   
     // If the active item has been removed, blur the menu
     if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
      this.blur();
     }
    },
   
    _itemRole: function() {
     return {
      menu: "menuitem",
      listbox: "option"
     }[ this.options.role ];
    },
   
    _setOption: function( key, value ) {
     if ( key === "icons" ) {
      var icons = this.element.find( ".ui-menu-icon" );
      this._removeClass( icons, null, this.options.icons.submenu )
       ._addClass( icons, null, value.submenu );
     }
     this._super( key, value );
    },
   
    _setOptionDisabled: function( value ) {
     this._super( value );
   
     this.element.attr( "aria-disabled", String( value ) );
     this._toggleClass( null, "ui-state-disabled", !!value );
    },
   
    focus: function( event, item ) {
     var nested, focused, activeParent;
     this.blur( event, event && event.type === "focus" );
   
     this._scrollIntoView( item );
   
     this.active = item.first();
   
     focused = this.active.children( ".ui-menu-item-wrapper" );
     this._addClass( focused, null, "ui-state-active" );
   
     // Only update aria-activedescendant if there's a role
     // otherwise we assume focus is managed elsewhere
     if ( this.options.role ) {
      this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
     }
   
     // Highlight active parent menu item, if any
     activeParent = this.active
      .parent()
       .closest( ".ui-menu-item" )
        .children( ".ui-menu-item-wrapper" );
     this._addClass( activeParent, null, "ui-state-active" );
   
     if ( event && event.type === "keydown" ) {
      this._close();
     } else {
      this.timer = this._delay( function() {
       this._close();
      }, this.delay );
     }
   
     nested = item.children( ".ui-menu" );
     if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
      this._startOpening( nested );
     }
     this.activeMenu = item.parent();
   
     this._trigger( "focus", event, { item: item } );
    },
   
    _scrollIntoView: function( item ) {
     var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
     if ( this._hasScroll() ) {
      borderTop = parseFloat( $.css( this.activeMenu[ 0 ], "borderTopWidth" ) ) || 0;
      paddingTop = parseFloat( $.css( this.activeMenu[ 0 ], "paddingTop" ) ) || 0;
      offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
      scroll = this.activeMenu.scrollTop();
      elementHeight = this.activeMenu.height();
      itemHeight = item.outerHeight();
   
      if ( offset < 0 ) {
       this.activeMenu.scrollTop( scroll + offset );
      } else if ( offset + itemHeight > elementHeight ) {
       this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
      }
     }
    },
   
    blur: function( event, fromFocus ) {
     if ( !fromFocus ) {
      clearTimeout( this.timer );
     }
   
     if ( !this.active ) {
      return;
     }
   
     this._removeClass( this.active.children( ".ui-menu-item-wrapper" ),
      null, "ui-state-active" );
   
     this._trigger( "blur", event, { item: this.active } );
     this.active = null;
    },
   
    _startOpening: function( submenu ) {
     clearTimeout( this.timer );
   
     // Don't open if already open fixes a Firefox bug that caused a .5 pixel
     // shift in the submenu position when mousing over the caret icon
     if ( submenu.attr( "aria-hidden" ) !== "true" ) {
      return;
     }
   
     this.timer = this._delay( function() {
      this._close();
      this._open( submenu );
     }, this.delay );
    },
   
    _open: function( submenu ) {
     var position = $.extend( {
      of: this.active
     }, this.options.position );
   
     clearTimeout( this.timer );
     this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
      .hide()
      .attr( "aria-hidden", "true" );
   
     submenu
      .show()
      .removeAttr( "aria-hidden" )
      .attr( "aria-expanded", "true" )
      .position( position );
    },
   
    collapseAll: function( event, all ) {
     clearTimeout( this.timer );
     this.timer = this._delay( function() {
   
      // If we were passed an event, look for the submenu that contains the event
      var currentMenu = all ? this.element :
       $( event && event.target ).closest( this.element.find( ".ui-menu" ) );
   
      // If we found no valid submenu ancestor, use the main menu to close all
      // sub menus anyway
      if ( !currentMenu.length ) {
       currentMenu = this.element;
      }
   
      this._close( currentMenu );
   
      this.blur( event );
   
      // Work around active item staying active after menu is blurred
      this._removeClass( currentMenu.find( ".ui-state-active" ), null, "ui-state-active" );
   
      this.activeMenu = currentMenu;
     }, this.delay );
    },
   
    // With no arguments, closes the currently active menu - if nothing is active
    // it closes all menus.  If passed an argument, it will search for menus BELOW
    _close: function( startMenu ) {
     if ( !startMenu ) {
      startMenu = this.active ? this.active.parent() : this.element;
     }
   
     startMenu.find( ".ui-menu" )
      .hide()
      .attr( "aria-hidden", "true" )
      .attr( "aria-expanded", "false" );
    },
   
    _closeOnDocumentClick: function( event ) {
     return !$( event.target ).closest( ".ui-menu" ).length;
    },
   
    _isDivider: function( item ) {
   
     // Match hyphen, em dash, en dash
     return !/[^\-\u2014\u2013\s]/.test( item.text() );
    },
   
    collapse: function( event ) {
     var newItem = this.active &&
      this.active.parent().closest( ".ui-menu-item", this.element );
     if ( newItem && newItem.length ) {
      this._close();
      this.focus( event, newItem );
     }
    },
   
    expand: function( event ) {
     var newItem = this.active &&
      this.active
       .children( ".ui-menu " )
        .find( this.options.items )
         .first();
   
     if ( newItem && newItem.length ) {
      this._open( newItem.parent() );
   
      // Delay so Firefox will not hide activedescendant change in expanding submenu from AT
      this._delay( function() {
       this.focus( event, newItem );
      } );
     }
    },
   
    next: function( event ) {
     this._move( "next", "first", event );
    },
   
    previous: function( event ) {
     this._move( "prev", "last", event );
    },
   
    isFirstItem: function() {
     return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
    },
   
    isLastItem: function() {
     return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
    },
   
    _move: function( direction, filter, event ) {
     var next;
     if ( this.active ) {
      if ( direction === "first" || direction === "last" ) {
       next = this.active
        [ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
        .eq( -1 );
      } else {
       next = this.active
        [ direction + "All" ]( ".ui-menu-item" )
        .eq( 0 );
      }
     }
     if ( !next || !next.length || !this.active ) {
      next = this.activeMenu.find( this.options.items )[ filter ]();
     }
   
     this.focus( event, next );
    },
   
    nextPage: function( event ) {
     var item, base, height;
   
     if ( !this.active ) {
      this.next( event );
      return;
     }
     if ( this.isLastItem() ) {
      return;
     }
     if ( this._hasScroll() ) {
      base = this.active.offset().top;
      height = this.element.height();
      this.active.nextAll( ".ui-menu-item" ).each( function() {
       item = $( this );
       return item.offset().top - base - height < 0;
      } );
   
      this.focus( event, item );
     } else {
      this.focus( event, this.activeMenu.find( this.options.items )
       [ !this.active ? "first" : "last" ]() );
     }
    },
   
    previousPage: function( event ) {
     var item, base, height;
     if ( !this.active ) {
      this.next( event );
      return;
     }
     if ( this.isFirstItem() ) {
      return;
     }
     if ( this._hasScroll() ) {
      base = this.active.offset().top;
      height = this.element.height();
      this.active.prevAll( ".ui-menu-item" ).each( function() {
       item = $( this );
       return item.offset().top - base + height > 0;
      } );
   
      this.focus( event, item );
     } else {
      this.focus( event, this.activeMenu.find( this.options.items ).first() );
     }
    },
   
    _hasScroll: function() {
     return this.element.outerHeight() < this.element.prop( "scrollHeight" );
    },
   
    select: function( event ) {
   
     // TODO: It should never be possible to not have an active item at this
     // point, but the tests don't trigger mouseenter before click.
     this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
     var ui = { item: this.active };
     if ( !this.active.has( ".ui-menu" ).length ) {
      this.collapseAll( event, true );
     }
     this._trigger( "select", event, ui );
    },
   
    _filterMenuItems: function( character ) {
     var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
      regex = new RegExp( "^" + escapedCharacter, "i" );
   
     return this.activeMenu
      .find( this.options.items )
   
       // Only match on items, not dividers or other content (#10571)
       .filter( ".ui-menu-item" )
        .filter( function() {
         return regex.test(
          $.trim( $( this ).children( ".ui-menu-item-wrapper" ).text() ) );
        } );
    }
   } );
   
   
   /*!
    * jQuery UI Selectmenu 1.12.1
    * http://jqueryui.com
    *
    * Copyright jQuery Foundation and other contributors
    * Released under the MIT license.
    * http://jquery.org/license
    */
   
   //>>label: Selectmenu
   //>>group: Widgets
   // jscs:disable maximumLineLength
   //>>description: Duplicates and extends the functionality of a native HTML select element, allowing it to be customizable in behavior and appearance far beyond the limitations of a native select.
   // jscs:enable maximumLineLength
   //>>docs: http://api.jqueryui.com/selectmenu/
   //>>demos: http://jqueryui.com/selectmenu/
   //>>css.structure: ../../themes/base/core.css
   //>>css.structure: ../../themes/base/selectmenu.css, ../../themes/base/button.css
   //>>css.theme: ../../themes/base/theme.css
   
   
   
   var widgetsSelectmenu = $.widget( "ui.selectmenu", [ $.ui.formResetMixin, {
    version: "1.12.1",
    defaultElement: "<select>",
    options: {
     appendTo: null,
     classes: {
      "ui-selectmenu-button-open": "ui-corner-top",
      "ui-selectmenu-button-closed": "ui-corner-all"
     },
     disabled: null,
     icons: {
      button: "ui-icon-triangle-1-s"
     },
     position: {
      my: "left top",
      at: "left bottom",
      collision: "none"
     },
     width: false,
   
     // Callbacks
     change: null,
     close: null,
     focus: null,
     open: null,
     select: null
    },
   
    _create: function() {
     var selectmenuId = this.element.uniqueId().attr( "id" );
     this.ids = {
      element: selectmenuId,
      button: selectmenuId + "-button",
      menu: selectmenuId + "-menu"
     };
   
     this._drawButton();
     this._drawMenu();
     this._bindFormResetHandler();
   
     this._rendered = false;
     this.menuItems = $();
    },
   
    _drawButton: function() {
     var icon,
      that = this,
      item = this._parseOption(
       this.element.find( "option:selected" ),
       this.element[ 0 ].selectedIndex
      );
   
     // Associate existing label with the new button
     this.labels = this.element.labels().attr( "for", this.ids.button );
     this._on( this.labels, {
      click: function( event ) {
       this.button.focus();
       event.preventDefault();
      }
     } );
   
     // Hide original select element
     this.element.hide();
   
     // Create button
     this.button = $( "<span>", {
      tabindex: this.options.disabled ? -1 : 0,
      id: this.ids.button,
      role: "combobox",
      "aria-expanded": "false",
      "aria-autocomplete": "list",
      "aria-owns": this.ids.menu,
      "aria-haspopup": "true",
      title: this.element.attr( "title" )
     } )
      .insertAfter( this.element );
   
     this._addClass( this.button, "ui-selectmenu-button ui-selectmenu-button-closed",
      "ui-button ui-widget" );
   
     icon = $( "<span>" ).appendTo( this.button );
     this._addClass( icon, "ui-selectmenu-icon", "ui-icon " + this.options.icons.button );
     this.buttonItem = this._renderButtonItem( item )
      .appendTo( this.button );
   
     if ( this.options.width !== false ) {
      this._resizeButton();
     }
   
     this._on( this.button, this._buttonEvents );
     this.button.one( "focusin", function() {
   
      // Delay rendering the menu items until the button receives focus.
      // The menu may have already been rendered via a programmatic open.
      if ( !that._rendered ) {
       that._refreshMenu();
      }
     } );
    },
   
    _drawMenu: function() {
     var that = this;
   
     // Create menu
     this.menu = $( "<ul>", {
      "aria-hidden": "true",
      "aria-labelledby": this.ids.button,
      id: this.ids.menu
     } );
   
     // Wrap menu
     this.menuWrap = $( "<div>" ).append( this.menu );
     this._addClass( this.menuWrap, "ui-selectmenu-menu", "ui-front" );
     this.menuWrap.appendTo( this._appendTo() );
   
     // Initialize menu widget
     this.menuInstance = this.menu
      .menu( {
       classes: {
        "ui-menu": "ui-corner-bottom"
       },
       role: "listbox",
       select: function( event, ui ) {
        event.preventDefault();
   
        // Support: IE8
        // If the item was selected via a click, the text selection
        // will be destroyed in IE
        that._setSelection();
   
        that._select( ui.item.data( "ui-selectmenu-item" ), event );
       },
       focus: function( event, ui ) {
        var item = ui.item.data( "ui-selectmenu-item" );
   
        // Prevent inital focus from firing and check if its a newly focused item
        if ( that.focusIndex != null && item.index !== that.focusIndex ) {
         that._trigger( "focus", event, { item: item } );
         if ( !that.isOpen ) {
          that._select( item, event );
         }
        }
        that.focusIndex = item.index;
   
        that.button.attr( "aria-activedescendant",
         that.menuItems.eq( item.index ).attr( "id" ) );
       }
      } )
      .menu( "instance" );
   
     // Don't close the menu on mouseleave
     this.menuInstance._off( this.menu, "mouseleave" );
   
     // Cancel the menu's collapseAll on document click
     this.menuInstance._closeOnDocumentClick = function() {
      return false;
     };
   
     // Selects often contain empty items, but never contain dividers
     this.menuInstance._isDivider = function() {
      return false;
     };
    },
   
    refresh: function() {
     this._refreshMenu();
     this.buttonItem.replaceWith(
      this.buttonItem = this._renderButtonItem(
   
       // Fall back to an empty object in case there are no options
       this._getSelectedItem().data( "ui-selectmenu-item" ) || {}
      )
     );
     if ( this.options.width === null ) {
      this._resizeButton();
     }
    },
   
    _refreshMenu: function() {
     var item,
      options = this.element.find( "option" );
   
     this.menu.empty();
   
     this._parseOptions( options );
     this._renderMenu( this.menu, this.items );
   
     this.menuInstance.refresh();
     this.menuItems = this.menu.find( "li" )
      .not( ".ui-selectmenu-optgroup" )
       .find( ".ui-menu-item-wrapper" );
   
     this._rendered = true;
   
     if ( !options.length ) {
      return;
     }
   
     item = this._getSelectedItem();
   
     // Update the menu to have the correct item focused
     this.menuInstance.focus( null, item );
     this._setAria( item.data( "ui-selectmenu-item" ) );
   
     // Set disabled state
     this._setOption( "disabled", this.element.prop( "disabled" ) );
    },
   
    open: function( event ) {
     if ( this.options.disabled ) {
      return;
     }
   
     // If this is the first time the menu is being opened, render the items
     if ( !this._rendered ) {
      this._refreshMenu();
     } else {
   
      // Menu clears focus on close, reset focus to selected item
      this._removeClass( this.menu.find( ".ui-state-active" ), null, "ui-state-active" );
      this.menuInstance.focus( null, this._getSelectedItem() );
     }
   
     // If there are no options, don't open the menu
     if ( !this.menuItems.length ) {
      return;
     }
   
     this.isOpen = true;
     this._toggleAttr();
     this._resizeMenu();
     this._position();
   
     this._on( this.document, this._documentClick );
   
     this._trigger( "open", event );
    },
   
    _position: function() {
     this.menuWrap.position( $.extend( { of: this.button }, this.options.position ) );
    },
   
    close: function( event ) {
     if ( !this.isOpen ) {
      return;
     }
   
     this.isOpen = false;
     this._toggleAttr();
   
     this.range = null;
     this._off( this.document );
   
     this._trigger( "close", event );
    },
   
    widget: function() {
     return this.button;
    },
   
    menuWidget: function() {
     return this.menu;
    },
   
    _renderButtonItem: function( item ) {
     var buttonItem = $( "<span>" );
   
     this._setText( buttonItem, item.label );
     this._addClass( buttonItem, "ui-selectmenu-text" );
   
     return buttonItem;
    },
   
    _renderMenu: function( ul, items ) {
     var that = this,
      currentOptgroup = "";
   
     $.each( items, function( index, item ) {
      var li;
   
      if ( item.optgroup !== currentOptgroup ) {
       li = $( "<li>", {
        text: item.optgroup
       } );
       that._addClass( li, "ui-selectmenu-optgroup", "ui-menu-divider" +
        ( item.element.parent( "optgroup" ).prop( "disabled" ) ?
         " ui-state-disabled" :
         "" ) );
   
       li.appendTo( ul );
   
       currentOptgroup = item.optgroup;
      }
   
      that._renderItemData( ul, item );
     } );
    },
   
    _renderItemData: function( ul, item ) {
     return this._renderItem( ul, item ).data( "ui-selectmenu-item", item );
    },
   
    _renderItem: function( ul, item ) {
     var li = $( "<li>" ),
      wrapper = $( "<div>", {
       title: item.element.attr( "title" )
      } );
   
     if ( item.disabled ) {
      this._addClass( li, null, "ui-state-disabled" );
     }
     this._setText( wrapper, item.label );
   
     return li.append( wrapper ).appendTo( ul );
    },
   
    _setText: function( element, value ) {
     if ( value ) {
      element.text( value );
     } else {
      element.html( "&#160;" );
     }
    },
   
    _move: function( direction, event ) {
     var item, next,
      filter = ".ui-menu-item";
   
     if ( this.isOpen ) {
      item = this.menuItems.eq( this.focusIndex ).parent( "li" );
     } else {
      item = this.menuItems.eq( this.element[ 0 ].selectedIndex ).parent( "li" );
      filter += ":not(.ui-state-disabled)";
     }
   
     if ( direction === "first" || direction === "last" ) {
      next = item[ direction === "first" ? "prevAll" : "nextAll" ]( filter ).eq( -1 );
     } else {
      next = item[ direction + "All" ]( filter ).eq( 0 );
     }
   
     if ( next.length ) {
      this.menuInstance.focus( event, next );
     }
    },
   
    _getSelectedItem: function() {
     return this.menuItems.eq( this.element[ 0 ].selectedIndex ).parent( "li" );
    },
   
    _toggle: function( event ) {
     this[ this.isOpen ? "close" : "open" ]( event );
    },
   
    _setSelection: function() {
     var selection;
   
     if ( !this.range ) {
      return;
     }
   
     if ( window.getSelection ) {
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange( this.range );
   
     // Support: IE8
     } else {
      this.range.select();
     }
   
     // Support: IE
     // Setting the text selection kills the button focus in IE, but
     // restoring the focus doesn't kill the selection.
     this.button.focus();
    },
   
    _documentClick: {
     mousedown: function( event ) {
      if ( !this.isOpen ) {
       return;
      }
   
      if ( !$( event.target ).closest( ".ui-selectmenu-menu, #" +
        $.ui.escapeSelector( this.ids.button ) ).length ) {
       this.close( event );
      }
     }
    },
   
    _buttonEvents: {
   
     // Prevent text selection from being reset when interacting with the selectmenu (#10144)
     mousedown: function() {
      var selection;
   
      if ( window.getSelection ) {
       selection = window.getSelection();
       if ( selection.rangeCount ) {
        this.range = selection.getRangeAt( 0 );
       }
   
      // Support: IE8
      } else {
       this.range = document.selection.createRange();
      }
     },
   
     click: function( event ) {
      this._setSelection();
      this._toggle( event );
     },
   
     keydown: function( event ) {
      var preventDefault = true;
      switch ( event.keyCode ) {
      case $.ui.keyCode.TAB:
      case $.ui.keyCode.ESCAPE:
       this.close( event );
       preventDefault = false;
       break;
      case $.ui.keyCode.ENTER:
       if ( this.isOpen ) {
        this._selectFocusedItem( event );
       }
       break;
      case $.ui.keyCode.UP:
       if ( event.altKey ) {
        this._toggle( event );
       } else {
        this._move( "prev", event );
       }
       break;
      case $.ui.keyCode.DOWN:
       if ( event.altKey ) {
        this._toggle( event );
       } else {
        this._move( "next", event );
       }
       break;
      case $.ui.keyCode.SPACE:
       if ( this.isOpen ) {
        this._selectFocusedItem( event );
       } else {
        this._toggle( event );
       }
       break;
      case $.ui.keyCode.LEFT:
       this._move( "prev", event );
       break;
      case $.ui.keyCode.RIGHT:
       this._move( "next", event );
       break;
      case $.ui.keyCode.HOME:
      case $.ui.keyCode.PAGE_UP:
       this._move( "first", event );
       break;
      case $.ui.keyCode.END:
      case $.ui.keyCode.PAGE_DOWN:
       this._move( "last", event );
       break;
      default:
       this.menu.trigger( event );
       preventDefault = false;
      }
   
      if ( preventDefault ) {
       event.preventDefault();
      }
     }
    },
   
    _selectFocusedItem: function( event ) {
     var item = this.menuItems.eq( this.focusIndex ).parent( "li" );
     if ( !item.hasClass( "ui-state-disabled" ) ) {
      this._select( item.data( "ui-selectmenu-item" ), event );
     }
    },
   
    _select: function( item, event ) {
     var oldIndex = this.element[ 0 ].selectedIndex;
   
     // Change native select element
     this.element[ 0 ].selectedIndex = item.index;
     this.buttonItem.replaceWith( this.buttonItem = this._renderButtonItem( item ) );
     this._setAria( item );
     this._trigger( "select", event, { item: item } );
   
     if ( item.index !== oldIndex ) {
      this._trigger( "change", event, { item: item } );
     }
   
     this.close( event );
    },
   
    _setAria: function( item ) {
     var id = this.menuItems.eq( item.index ).attr( "id" );
   
     this.button.attr( {
      "aria-labelledby": id,
      "aria-activedescendant": id
     } );
     this.menu.attr( "aria-activedescendant", id );
    },
   
    _setOption: function( key, value ) {
     if ( key === "icons" ) {
      var icon = this.button.find( "span.ui-icon" );
      this._removeClass( icon, null, this.options.icons.button )
       ._addClass( icon, null, value.button );
     }
   
     this._super( key, value );
   
     if ( key === "appendTo" ) {
      this.menuWrap.appendTo( this._appendTo() );
     }
   
     if ( key === "width" ) {
      this._resizeButton();
     }
    },
   
    _setOptionDisabled: function( value ) {
     this._super( value );
   
     this.menuInstance.option( "disabled", value );
     this.button.attr( "aria-disabled", value );
     this._toggleClass( this.button, null, "ui-state-disabled", value );
   
     this.element.prop( "disabled", value );
     if ( value ) {
      this.button.attr( "tabindex", -1 );
      this.close();
     } else {
      this.button.attr( "tabindex", 0 );
     }
    },
   
    _appendTo: function() {
     var element = this.options.appendTo;
   
     if ( element ) {
      element = element.jquery || element.nodeType ?
       $( element ) :
       this.document.find( element ).eq( 0 );
     }
   
     if ( !element || !element[ 0 ] ) {
      element = this.element.closest( ".ui-front, dialog" );
     }
   
     if ( !element.length ) {
      element = this.document[ 0 ].body;
     }
   
     return element;
    },
   
    _toggleAttr: function() {
     this.button.attr( "aria-expanded", this.isOpen );
   
     // We can't use two _toggleClass() calls here, because we need to make sure
     // we always remove classes first and add them second, otherwise if both classes have the
     // same theme class, it will be removed after we add it.
     this._removeClass( this.button, "ui-selectmenu-button-" +
      ( this.isOpen ? "closed" : "open" ) )
      ._addClass( this.button, "ui-selectmenu-button-" +
       ( this.isOpen ? "open" : "closed" ) )
      ._toggleClass( this.menuWrap, "ui-selectmenu-open", null, this.isOpen );
   
     this.menu.attr( "aria-hidden", !this.isOpen );
    },
   
    _resizeButton: function() {
     var width = this.options.width;
   
     // For `width: false`, just remove inline style and stop
     if ( width === false ) {
      this.button.css( "width", "" );
      return;
     }
   
     // For `width: null`, match the width of the original element
     if ( width === null ) {
      width = this.element.show().outerWidth();
      this.element.hide();
     }
   
     this.button.outerWidth( width );
    },
   
    _resizeMenu: function() {
     this.menu.outerWidth( Math.max(
      this.button.outerWidth(),
   
      // Support: IE10
      // IE10 wraps long text (possibly a rounding bug)
      // so we add 1px to avoid the wrapping
      this.menu.width( "" ).outerWidth() + 1
     ) );
    },
   
    _getCreateOptions: function() {
     var options = this._super();
   
     options.disabled = this.element.prop( "disabled" );
   
     return options;
    },
   
    _parseOptions: function( options ) {
     var that = this,
      data = [];
     options.each( function( index, item ) {
      data.push( that._parseOption( $( item ), index ) );
     } );
     this.items = data;
    },
   
    _parseOption: function( option, index ) {
     var optgroup = option.parent( "optgroup" );
   
     return {
      element: option,
      index: index,
      value: option.val(),
      label: option.text(),
      optgroup: optgroup.attr( "label" ) || "",
      disabled: optgroup.prop( "disabled" ) || option.prop( "disabled" )
     };
    },
   
    _destroy: function() {
     this._unbindFormResetHandler();
     this.menuWrap.remove();
     this.button.remove();
     this.element.show();
     this.element.removeUniqueId();
     this.labels.attr( "for", this.ids.element );
    }
   } ] );
   
   
   
   
   }));
   /*! Browser bundle of nunjucks 3.1.6  */
   !function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.nunjucks=n():t.nunjucks=n()}("undefined"!=typeof self?self:this,function(){return function(t){var n={};function i(r){if(n[r])return n[r].exports;var e=n[r]={i:r,l:!1,exports:{}};return t[r].call(e.exports,e,e.exports,i),e.l=!0,e.exports}return i.m=t,i.c=n,i.d=function(t,n,r){i.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},i.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(n,"a",n),n},i.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},i.p="",i(i.s=11)}([function(t,n,i){"use strict";var r=Array.prototype,e=Object.prototype,s={"&":"&amp;",'"':"&quot;","'":"&#39;","<":"&lt;",">":"&gt;"},o=/[&"'<>]/g;function u(t,n){return e.hasOwnProperty.call(t,n)}function h(t){return s[t]}function f(t,n,i){var r,e,s;if(t instanceof Error&&(t=(e=t).name+": "+e.message),Object.setPrototypeOf?Object.setPrototypeOf(r=Error(t),f.prototype):Object.defineProperty(r=this,"message",{enumerable:!1,writable:!0,value:t}),Object.defineProperty(r,"name",{value:"Template render error"}),Error.captureStackTrace&&Error.captureStackTrace(r,this.constructor),e){var o=Object.getOwnPropertyDescriptor(e,"stack");(s=o&&(o.get||function(){return o.value}))||(s=function(){return e.stack})}else{var u=Error(t).stack;s=function(){return u}}return Object.defineProperty(r,"stack",{get:function(){return s.call(r)}}),Object.defineProperty(r,"cause",{value:e}),r.lineno=n,r.colno=i,r.firstUpdate=!0,r.Update=function(t){var n="("+(t||"unknown path")+")";return this.firstUpdate&&(this.lineno&&this.colno?n+=" [Line "+this.lineno+", Column "+this.colno+"]":this.lineno&&(n+=" [Line "+this.lineno+"]")),n+="\n ",this.firstUpdate&&(n+=" "),this.message=n+(this.message||""),this.firstUpdate=!1,this},r}function a(t){return"[object Function]"===e.toString.call(t)}function c(t){return"[object Array]"===e.toString.call(t)}function l(t){return"[object String]"===e.toString.call(t)}function v(t){return"[object Object]"===e.toString.call(t)}function p(t){return Array.prototype.slice.call(t)}function d(t,n,i){return Array.prototype.indexOf.call(t||[],n,i)}function w(t){var n=[];for(var i in t)u(t,i)&&n.push(i);return n}(n=t.exports={}).hasOwnProp=u,n.t=function(t,i,r){if(r.Update||(r=new n.TemplateError(r)),r.Update(t),!i){var e=r;(r=Error(e.message)).name=e.name}return r},Object.setPrototypeOf?Object.setPrototypeOf(f.prototype,Error.prototype):f.prototype=Object.create(Error.prototype,{constructor:{value:f}}),n.TemplateError=f,n.escape=function(t){return t.replace(o,h)},n.isFunction=a,n.isArray=c,n.isString=l,n.isObject=v,n.groupBy=function(t,n){for(var i={},r=a(n)?n:function(t){return t[n]},e=0;e<t.length;e++){var s=t[e],o=r(s,e);(i[o]||(i[o]=[])).push(s)}return i},n.toArray=p,n.without=function(t){var n=[];if(!t)return n;for(var i=t.length,r=p(arguments).slice(1),e=-1;++e<i;)-1===d(r,t[e])&&n.push(t[e]);return n},n.repeat=function(t,n){for(var i="",r=0;r<n;r++)i+=t;return i},n.each=function(t,n,i){if(null!=t)if(r.forEach&&t.forEach===r.forEach)t.forEach(n,i);else if(t.length===+t.length)for(var e=0,s=t.length;e<s;e++)n.call(i,t[e],e,t)},n.map=function(t,n){var i=[];if(null==t)return i;if(r.map&&t.map===r.map)return t.map(n);for(var e=0;e<t.length;e++)i[i.length]=n(t[e],e);return t.length===+t.length&&(i.length=t.length),i},n.asyncIter=function(t,n,i){var r=-1;!function e(){++r<t.length?n(t[r],r,e,i):i()}()},n.asyncFor=function(t,n,i){var r=w(t||{}),e=r.length,s=-1;!function o(){var u=r[++s];s<e?n(u,t[u],s,e,o):i()}()},n.indexOf=d,n.keys=w,n.r=function(t){return w(t).map(function(n){return[n,t[n]]})},n.u=function(t){return w(t).map(function(n){return t[n]})},n.h=n.extend=function(t,n){return t=t||{},w(n).forEach(function(i){t[i]=n[i]}),t},n.inOperator=function(t,n){if(c(n)||l(n))return-1!==n.indexOf(t);if(v(n))return t in n;throw Error('Cannot use "in" operator to search for "'+t+'" in unexpected types.')}},function(t,n,i){"use strict";function r(t,n){for(var i=0;i<n.length;i++){var r=n[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function e(t,n,i){return n&&r(t.prototype,n),i&&r(t,i),t}var s=i(0);function o(t,n,i){i=i||{},s.keys(i).forEach(function(n){var r,e;i[n]=(r=t.prototype[n],e=i[n],"function"!=typeof r||"function"!=typeof e?e:function(){var t=this.parent;this.parent=r;var n=e.apply(this,arguments);return this.parent=t,n})});var r=function(t){var i,r;function s(){return t.apply(this,arguments)||this}return r=t,(i=s).prototype=Object.create(r.prototype),i.prototype.constructor=i,i.__proto__=r,e(s,[{key:"typename",get:function(){return n}}]),s}(t);return s.h(r.prototype,i),r}var u=function(){function t(){this.init.apply(this,arguments)}return t.prototype.init=function(){},t.extend=function(t,n){return"object"==typeof t&&(n=t,t="anonymous"),o(this,t,n)},e(t,[{key:"typename",get:function(){return this.constructor.name}}]),t}();t.exports=u},function(t,n,i){"use strict";var r=i(0),e=Array.from,s="function"==typeof Symbol&&Symbol.iterator&&"function"==typeof e,o=function(){function t(t,n){this.variables={},this.parent=t,this.topLevel=!1,this.isolateWrites=n}var n=t.prototype;return n.set=function(t,n,i){var r=t.split("."),e=this.variables,s=this;if(i&&(s=this.resolve(r[0],!0)))s.set(t,n);else{for(var o=0;o<r.length-1;o++){var u=r[o];e[u]||(e[u]={}),e=e[u]}e[r[r.length-1]]=n}},n.get=function(t){var n=this.variables[t];return void 0!==n?n:null},n.lookup=function(t){var n=this.parent,i=this.variables[t];return void 0!==i?i:n&&n.lookup(t)},n.resolve=function(t,n){var i=n&&this.isolateWrites?void 0:this.parent;return void 0!==this.variables[t]?this:i&&i.resolve(t)},n.push=function(n){return new t(this,n)},n.pop=function(){return this.parent},t}();function u(t){return t&&Object.prototype.hasOwnProperty.call(t,"__keywords")}function h(t){var n=t.length;return 0===n?0:u(t[n-1])?n-1:n}function f(t){if("string"!=typeof t)return t;this.val=t,this.length=t.length}f.prototype=Object.create(String.prototype,{length:{writable:!0,configurable:!0,value:0}}),f.prototype.valueOf=function(){return this.val},f.prototype.toString=function(){return this.val},t.exports={Frame:o,makeMacro:function(t,n,i){var r=this;return function(){for(var e=arguments.length,s=Array(e),o=0;o<e;o++)s[o]=arguments[o];var f,a=h(s),c=function(t){var n=t.length;if(n){var i=t[n-1];if(u(i))return i}return{}}(s);if(a>t.length)f=s.slice(0,t.length),s.slice(f.length,a).forEach(function(t,i){i<n.length&&(c[n[i]]=t)}),f.push(c);else if(a<t.length){f=s.slice(0,a);for(var l=a;l<t.length;l++){var v=t[l];f.push(c[v]),delete c[v]}f.push(c)}else f=s;return i.apply(r,f)}},makeKeywordArgs:function(t){return t.__keywords=!0,t},numArgs:h,suppressValue:function(t,n){return t=void 0!==t&&null!==t?t:"",!n||t instanceof f||(t=r.escape(t.toString())),t},ensureDefined:function(t,n,i){if(null===t||void 0===t)throw new r.TemplateError("attempted to output null or undefined value",n+1,i+1);return t},memberLookup:function(t,n){if(void 0!==t&&null!==t)return"function"==typeof t[n]?function(){for(var i=arguments.length,r=Array(i),e=0;e<i;e++)r[e]=arguments[e];return t[n].apply(t,r)}:t[n]},contextOrFrameLookup:function(t,n,i){var r=n.lookup(i);return void 0!==r?r:t.lookup(i)},callWrap:function(t,n,i,r){if(!t)throw Error("Unable to call `"+n+"`, which is undefined or falsey");if("function"!=typeof t)throw Error("Unable to call `"+n+"`, which is not a function");return t.apply(i,r)},handleError:function(t,n,i){return t.lineno?t:new r.TemplateError(t,n,i)},isArray:r.isArray,keys:r.keys,SafeString:f,copySafeness:function(t,n){return t instanceof f?new f(n):n.toString()},markSafe:function(t){var n=typeof t;return"string"===n?new f(t):"function"!==n?t:function(n){var i=t.apply(this,arguments);return"string"==typeof i?new f(i):i}},asyncEach:function(t,n,i,e){if(r.isArray(t)){var s=t.length;r.asyncIter(t,function(t,r,e){switch(n){case 1:i(t,r,s,e);break;case 2:i(t[0],t[1],r,s,e);break;case 3:i(t[0],t[1],t[2],r,s,e);break;default:t.push(r,s,e),i.apply(this,t)}},e)}else r.asyncFor(t,function(t,n,r,e,s){i(t,n,r,e,s)},e)},asyncAll:function(t,n,i,e){var s,o,u=0;function h(t,n){u++,o[t]=n,u===s&&e(null,o.join(""))}if(r.isArray(t))if(s=t.length,o=Array(s),0===s)e(null,"");else for(var f=0;f<t.length;f++){var a=t[f];switch(n){case 1:i(a,f,s,h);break;case 2:i(a[0],a[1],f,s,h);break;case 3:i(a[0],a[1],a[2],f,s,h);break;default:a.push(f,s,h),i.apply(this,a)}}else{var c=r.keys(t||{});if(s=c.length,o=Array(s),0===s)e(null,"");else for(var l=0;l<c.length;l++){var v=c[l];i(v,t[v],l,s,h)}}},inOperator:r.inOperator,fromIterator:function(t){return"object"!=typeof t||null===t||r.isArray(t)?t:s&&Symbol.iterator in t?e(t):t}}},function(t,n,i){"use strict";function r(t,n){for(var i=0;i<n.length;i++){var r=n[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function e(t,n,i){return n&&r(t.prototype,n),i&&r(t,i),t}function s(t,n){t.prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n}function o(t,n,i){t instanceof n&&i.push(t),t instanceof u&&t.findAll(n,i)}var u=function(t){function n(){return t.apply(this,arguments)||this}s(n,t);var i=n.prototype;return i.init=function(t,n){for(var i=this,r=arguments,e=arguments.length,s=Array(e>2?e-2:0),o=2;o<e;o++)s[o-2]=arguments[o];this.lineno=t,this.colno=n,this.fields.forEach(function(t,n){var e=r[n+2];void 0===e&&(e=null),i[t]=e})},i.findAll=function(t,n){var i=this;return n=n||[],this instanceof f?this.children.forEach(function(i){return o(i,t,n)}):this.fields.forEach(function(r){return o(i[r],t,n)}),n},i.iterFields=function(t){var n=this;this.fields.forEach(function(i){t(n[i],i)})},n}(i(1)),h=function(t){function n(){return t.apply(this,arguments)||this}return s(n,t),e(n,[{key:"typename",get:function(){return"Value"}},{key:"fields",get:function(){return["value"]}}]),n}(u),f=function(t){function n(){return t.apply(this,arguments)||this}s(n,t);var i=n.prototype;return i.init=function(n,i,r){t.prototype.init.call(this,n,i,r||[])},i.addChild=function(t){this.children.push(t)},e(n,[{key:"typename",get:function(){return"NodeList"}},{key:"fields",get:function(){return["children"]}}]),n}(u),a=f.extend("Root"),c=h.extend("Literal"),l=h.extend("Symbol"),v=f.extend("Group"),p=f.extend("Array"),d=u.extend("Pair",{fields:["key","value"]}),w=f.extend("Dict"),m=u.extend("LookupVal",{fields:["target","val"]}),b=u.extend("If",{fields:["cond","body","else_"]}),y=b.extend("IfAsync"),g=u.extend("InlineIf",{fields:["cond","body","else_"]}),k=u.extend("For",{fields:["arr","name","body","else_"]}),E=k.extend("AsyncEach"),x=k.extend("AsyncAll"),O=u.extend("Macro",{fields:["name","args","body"]}),A=O.extend("Caller"),T=u.extend("Import",{fields:["template","target","withContext"]}),_=function(t){function n(){return t.apply(this,arguments)||this}return s(n,t),n.prototype.init=function(n,i,r,e,s){t.prototype.init.call(this,n,i,r,e||new f,s)},e(n,[{key:"typename",get:function(){return"FromImport"}},{key:"fields",get:function(){return["template","names","withContext"]}}]),n}(u),N=u.extend("FunCall",{fields:["name","args"]}),S=N.extend("Filter"),j=S.extend("FilterAsync",{fields:["name","args","symbol"]}),C=w.extend("KeywordArgs"),I=u.extend("Block",{fields:["name","body"]}),F=u.extend("Super",{fields:["blockName","symbol"]}),L=u.extend("TemplateRef",{fields:["template"]}).extend("Extends"),K=u.extend("Include",{fields:["template","ignoreMissing"]}),R=u.extend("Set",{fields:["targets","value"]}),M=u.extend("Switch",{fields:["expr","cases","default"]}),B=u.extend("Case",{fields:["cond","body"]}),P=f.extend("Output"),V=u.extend("Capture",{fields:["body"]}),D=c.extend("TemplateData"),$=u.extend("UnaryOp",{fields:["target"]}),U=u.extend("BinOp",{fields:["left","right"]}),G=U.extend("In"),W=U.extend("Is"),H=U.extend("Or"),J=U.extend("And"),z=$.extend("Not"),Y=U.extend("Add"),q=U.extend("Concat"),X=U.extend("Sub"),Q=U.extend("Mul"),Z=U.extend("Div"),tt=U.extend("FloorDiv"),nt=U.extend("Mod"),it=U.extend("Pow"),rt=$.extend("Neg"),et=$.extend("Pos"),st=u.extend("Compare",{fields:["expr","ops"]}),ot=u.extend("CompareOperand",{fields:["expr","type"]}),ut=u.extend("CallExtension",{init:function(t,n,i,r){this.parent(),this.extName=t.__name||t,this.prop=n,this.args=i||new f,this.contentArgs=r||[],this.autoescape=t.autoescape},fields:["extName","prop","args","contentArgs"]}),ht=ut.extend("CallExtensionAsync");function ft(t,n,i){var r=t.split("\n");r.forEach(function(t,e){t&&(i&&e>0||!i)&&process.stdout.write(" ".repeat(n));var s=e===r.length-1?"":"\n";process.stdout.write(""+t+s)})}t.exports={Node:u,Root:a,NodeList:f,Value:h,Literal:c,Symbol:l,Group:v,Array:p,Pair:d,Dict:w,Output:P,Capture:V,TemplateData:D,If:b,IfAsync:y,InlineIf:g,For:k,AsyncEach:E,AsyncAll:x,Macro:O,Caller:A,Import:T,FromImport:_,FunCall:N,Filter:S,FilterAsync:j,KeywordArgs:C,Block:I,Super:F,Extends:L,Include:K,Set:R,Switch:M,Case:B,LookupVal:m,BinOp:U,In:G,Is:W,Or:H,And:J,Not:z,Add:Y,Concat:q,Sub:X,Mul:Q,Div:Z,FloorDiv:tt,Mod:nt,Pow:it,Neg:rt,Pos:et,Compare:st,CompareOperand:ot,CallExtension:ut,CallExtensionAsync:ht,printNodes:function t(n,i){if(i=i||0,ft(n.typename+": ",i),n instanceof f)ft("\n"),n.children.forEach(function(n){t(n,i+2)});else if(n instanceof ut)ft(n.extName+"."+n.prop+"\n"),n.args&&t(n.args,i+2),n.contentArgs&&n.contentArgs.forEach(function(n){t(n,i+2)});else{var r=[],e=null;n.iterFields(function(t,n){t instanceof u?r.push([n,t]):(e=e||{})[n]=t}),e?ft(JSON.stringify(e,null,2)+"\n",null,!0):ft("\n"),r.forEach(function(n){var r=n[0],e=n[1];ft("["+r+"] =>",i+2),t(e,i+4)})}}}},function(t,n){},function(t,n,i){"use strict";var r=i(8),e=i(16),s=i(3),o=i(0).TemplateError,u=i(2).Frame,h={"==":"==","===":"===","!=":"!=","!==":"!==","<":"<",">":">","<=":"<=",">=":">="},f=function(t){var n,i;function r(){return t.apply(this,arguments)||this}i=t,(n=r).prototype=Object.create(i.prototype),n.prototype.constructor=n,n.__proto__=i;var e=r.prototype;return e.init=function(t,n){this.templateName=t,this.codebuf=[],this.lastId=0,this.buffer=null,this.bufferStack=[],this.f="",this.inBlock=!1,this.throwOnUndefined=n},e.fail=function(t,n,i){throw void 0!==n&&(n+=1),void 0!==i&&(i+=1),new o(t,n,i)},e.a=function(){var t=this.v();return this.bufferStack.push(this.buffer),this.buffer=t,this.w("var "+this.buffer+' = "";'),t},e.b=function(){this.buffer=this.bufferStack.pop()},e.w=function(t){this.codebuf.push(t)},e.y=function(t){this.w(t+"\n")},e.g=function(){for(var t=this,n=arguments.length,i=Array(n),r=0;r<n;r++)i[r]=arguments[r];i.forEach(function(n){return t.y(n)})},e.k=function(t){this.buffer="output",this.f="",this.y("function "+t+"(env, context, frame, runtime, cb) {"),this.y("var lineno = null;"),this.y("var colno = null;"),this.y("var "+this.buffer+' = "";'),this.y("try {")},e.x=function(t){t||this.y("cb(null, "+this.buffer+");"),this.O(),this.y("} catch (e) {"),this.y("  cb(runtime.handleError(e, lineno, colno));"),this.y("}"),this.y("}"),this.buffer=null},e.A=function(){this.f+="})"},e.O=function(){this.y(this.f+";"),this.f=""},e.T=function(t){var n=this.f;this.f="",t.call(this),this.O(),this.f=n},e._=function(t){var n=this.v();return"function("+n+(t?","+t:"")+") {\nif("+n+") { cb("+n+"); return; }"},e.v=function(){return this.lastId++,"t_"+this.lastId},e.N=function(){return null==this.templateName?"undefined":JSON.stringify(this.templateName)},e.S=function(t,n){var i=this;t.children.forEach(function(t){i.compile(t,n)})},e.j=function(t,n,i,r){var e=this;i&&this.w(i),t.children.forEach(function(t,i){i>0&&e.w(","),e.compile(t,n)}),r&&this.w(r)},e.C=function(t,n){this.assertType(t,s.Literal,s.Symbol,s.Group,s.Array,s.Dict,s.FunCall,s.Caller,s.Filter,s.LookupVal,s.Compare,s.InlineIf,s.In,s.Is,s.And,s.Or,s.Not,s.Add,s.Concat,s.Sub,s.Mul,s.Div,s.FloorDiv,s.Mod,s.Pow,s.Neg,s.Pos,s.Compare,s.NodeList),this.compile(t,n)},e.assertType=function(t){for(var n=arguments.length,i=Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];i.some(function(n){return t instanceof n})||this.fail("assertType: invalid type: "+t.typename,t.lineno,t.colno)},e.compileCallExtension=function(t,n,i){var r=this,e=t.args,o=t.contentArgs,u="boolean"!=typeof t.autoescape||t.autoescape;if(i||this.w(this.buffer+" += runtime.suppressValue("),this.w('env.getExtension("'+t.extName+'")["'+t.prop+'"]('),this.w("context"),(e||o)&&this.w(","),e&&(e instanceof s.NodeList||this.fail("compileCallExtension: arguments must be a NodeList, use `parser.parseSignature`"),e.children.forEach(function(t,i){r.C(t,n),(i!==e.children.length-1||o.length)&&r.w(",")})),o.length&&o.forEach(function(t,i){if(i>0&&r.w(","),t){r.y("function(cb) {"),r.y("if(!cb) { cb = function(err) { if(err) { throw err; }}}");var e=r.a();r.T(function(){r.compile(t,n),r.y("cb(null, "+e+");")}),r.b(),r.y("return "+e+";"),r.y("}")}else r.w("null")}),i){var h=this.v();this.y(", "+this._(h)),this.y(this.buffer+" += runtime.suppressValue("+h+", "+u+" && env.opts.autoescape);"),this.A()}else this.w(")"),this.w(", "+u+" && env.opts.autoescape);\n")},e.compileCallExtensionAsync=function(t,n){this.compileCallExtension(t,n,!0)},e.compileNodeList=function(t,n){this.S(t,n)},e.compileLiteral=function(t){if("string"==typeof t.value){var n=t.value.replace(/\\/g,"\\\\");n=(n=(n=(n=(n=n.replace(/"/g,'\\"')).replace(/\n/g,"\\n")).replace(/\r/g,"\\r")).replace(/\t/g,"\\t")).replace(/\u2028/g,"\\u2028"),this.w('"'+n+'"')}else null===t.value?this.w("null"):this.w(t.value.toString())},e.compileSymbol=function(t,n){var i=t.value,r=n.lookup(i);r?this.w(r):this.w('runtime.contextOrFrameLookup(context, frame, "'+i+'")')},e.compileGroup=function(t,n){this.j(t,n,"(",")")},e.compileArray=function(t,n){this.j(t,n,"[","]")},e.compileDict=function(t,n){this.j(t,n,"{","}")},e.compilePair=function(t,n){var i=t.key,r=t.value;i instanceof s.Symbol?i=new s.Literal(i.lineno,i.colno,i.value):i instanceof s.Literal&&"string"==typeof i.value||this.fail("compilePair: Dict keys must be strings or names",i.lineno,i.colno),this.compile(i,n),this.w(": "),this.C(r,n)},e.compileInlineIf=function(t,n){this.w("("),this.compile(t.cond,n),this.w("?"),this.compile(t.body,n),this.w(":"),null!==t.else_?this.compile(t.else_,n):this.w('""'),this.w(")")},e.compileIn=function(t,n){this.w("runtime.inOperator("),this.compile(t.left,n),this.w(","),this.compile(t.right,n),this.w(")")},e.compileIs=function(t,n){var i=t.right.name?t.right.name.value:t.right.value;this.w('env.getTest("'+i+'").call(context, '),this.compile(t.left,n),t.right.args&&(this.w(","),this.compile(t.right.args,n)),this.w(") === true")},e.I=function(t,n,i){this.compile(t.left,n),this.w(i),this.compile(t.right,n)},e.compileOr=function(t,n){return this.I(t,n," || ")},e.compileAnd=function(t,n){return this.I(t,n," && ")},e.compileAdd=function(t,n){return this.I(t,n," + ")},e.compileConcat=function(t,n){return this.I(t,n,' + "" + ')},e.compileSub=function(t,n){return this.I(t,n," - ")},e.compileMul=function(t,n){return this.I(t,n," * ")},e.compileDiv=function(t,n){return this.I(t,n," / ")},e.compileMod=function(t,n){return this.I(t,n," % ")},e.compileNot=function(t,n){this.w("!"),this.compile(t.target,n)},e.compileFloorDiv=function(t,n){this.w("Math.floor("),this.compile(t.left,n),this.w(" / "),this.compile(t.right,n),this.w(")")},e.compilePow=function(t,n){this.w("Math.pow("),this.compile(t.left,n),this.w(", "),this.compile(t.right,n),this.w(")")},e.compileNeg=function(t,n){this.w("-"),this.compile(t.target,n)},e.compilePos=function(t,n){this.w("+"),this.compile(t.target,n)},e.compileCompare=function(t,n){var i=this;this.compile(t.expr,n),t.ops.forEach(function(t){i.w(" "+h[t.type]+" "),i.compile(t.expr,n)})},e.compileLookupVal=function(t,n){this.w("runtime.memberLookup(("),this.C(t.target,n),this.w("),"),this.C(t.val,n),this.w(")")},e.F=function(t){switch(t.typename){case"Symbol":return t.value;case"FunCall":return"the return value of ("+this.F(t.name)+")";case"LookupVal":return this.F(t.target)+'["'+this.F(t.val)+'"]';case"Literal":return t.value.toString();default:return"--expression--"}},e.compileFunCall=function(t,n){this.w("(lineno = "+t.lineno+", colno = "+t.colno+", "),this.w("runtime.callWrap("),this.C(t.name,n),this.w(', "'+this.F(t.name).replace(/"/g,'\\"')+'", context, '),this.j(t.args,n,"[","])"),this.w(")")},e.compileFilter=function(t,n){var i=t.name;this.assertType(i,s.Symbol),this.w('env.getFilter("'+i.value+'").call(context, '),this.j(t.args,n),this.w(")")},e.compileFilterAsync=function(t,n){var i=t.name,r=t.symbol.value;this.assertType(i,s.Symbol),n.set(r,r),this.w('env.getFilter("'+i.value+'").call(context, '),this.j(t.args,n),this.y(", "+this._(r)),this.A()},e.compileKeywordArgs=function(t,n){this.w("runtime.makeKeywordArgs("),this.compileDict(t,n),this.w(")")},e.compileSet=function(t,n){var i=this,r=[];t.targets.forEach(function(t){var e=t.value,s=n.lookup(e);null!==s&&void 0!==s||(s=i.v(),i.y("var "+s+";")),r.push(s)}),t.value?(this.w(r.join(" = ")+" = "),this.C(t.value,n),this.y(";")):(this.w(r.join(" = ")+" = "),this.compile(t.body,n),this.y(";")),t.targets.forEach(function(t,n){var e=r[n],s=t.value;i.y('frame.set("'+s+'", '+e+", true);"),i.y("if(frame.topLevel) {"),i.y('context.setVariable("'+s+'", '+e+");"),i.y("}"),"_"!==s.charAt(0)&&(i.y("if(frame.topLevel) {"),i.y('context.addExport("'+s+'", '+e+");"),i.y("}"))})},e.compileSwitch=function(t,n){var i=this;this.w("switch ("),this.compile(t.expr,n),this.w(") {"),t.cases.forEach(function(t,r){i.w("case "),i.compile(t.cond,n),i.w(": "),i.compile(t.body,n),t.body.children.length&&i.y("break;")}),t.default&&(this.w("default:"),this.compile(t.default,n)),this.w("}")},e.compileIf=function(t,n,i){var r=this;this.w("if("),this.C(t.cond,n),this.y(") {"),this.T(function(){r.compile(t.body,n),i&&r.w("cb()")}),t.else_?(this.y("}\nelse {"),this.T(function(){r.compile(t.else_,n),i&&r.w("cb()")})):i&&(this.y("}\nelse {"),this.w("cb()")),this.y("}")},e.compileIfAsync=function(t,n){this.w("(function(cb) {"),this.compileIf(t,n,!0),this.w("})("+this._()),this.A()},e.L=function(t,n,i,r){var e=this;[{name:"index",val:i+" + 1"},{name:"index0",val:i},{name:"revindex",val:r+" - "+i},{name:"revindex0",val:r+" - "+i+" - 1"},{name:"first",val:i+" === 0"},{name:"last",val:i+" === "+r+" - 1"},{name:"length",val:r}].forEach(function(t){e.y('frame.set("loop.'+t.name+'", '+t.val+");")})},e.compileFor=function(t,n){var i=this,r=this.v(),e=this.v(),o=this.v();if(n=n.push(),this.y("frame = frame.push();"),this.w("var "+o+" = "),this.C(t.arr,n),this.y(";"),this.w("if("+o+") {"),this.y(o+" = runtime.fromIterator("+o+");"),t.name instanceof s.Array){this.y("var "+r+";"),this.y("if(runtime.isArray("+o+")) {"),this.y("var "+e+" = "+o+".length;"),this.y("for("+r+"=0; "+r+" < "+o+".length; "+r+"++) {"),t.name.children.forEach(function(e,s){var u=i.v();i.y("var "+u+" = "+o+"["+r+"]["+s+"];"),i.y('frame.set("'+e+'", '+o+"["+r+"]["+s+"]);"),n.set(t.name.children[s].value,u)}),this.L(t,o,r,e),this.T(function(){i.compile(t.body,n)}),this.y("}"),this.y("} else {");var u=t.name.children,h=u[0],f=u[1],a=this.v(),c=this.v();n.set(h.value,a),n.set(f.value,c),this.y(r+" = -1;"),this.y("var "+e+" = runtime.keys("+o+").length;"),this.y("for(var "+a+" in "+o+") {"),this.y(r+"++;"),this.y("var "+c+" = "+o+"["+a+"];"),this.y('frame.set("'+h.value+'", '+a+");"),this.y('frame.set("'+f.value+'", '+c+");"),this.L(t,o,r,e),this.T(function(){i.compile(t.body,n)}),this.y("}"),this.y("}")}else{var l=this.v();n.set(t.name.value,l),this.y("var "+e+" = "+o+".length;"),this.y("for(var "+r+"=0; "+r+" < "+o+".length; "+r+"++) {"),this.y("var "+l+" = "+o+"["+r+"];"),this.y('frame.set("'+t.name.value+'", '+l+");"),this.L(t,o,r,e),this.T(function(){i.compile(t.body,n)}),this.y("}")}this.y("}"),t.else_&&(this.y("if (!"+e+") {"),this.compile(t.else_,n),this.y("}")),this.y("frame = frame.pop();")},e.K=function(t,n,i){var r=this,e=this.v(),o=this.v(),u=this.v(),h=i?"asyncAll":"asyncEach";if(n=n.push(),this.y("frame = frame.push();"),this.w("var "+u+" = runtime.fromIterator("),this.C(t.arr,n),this.y(");"),t.name instanceof s.Array){var f=t.name.children.length;this.w("runtime."+h+"("+u+", "+f+", function("),t.name.children.forEach(function(t){r.w(t.value+",")}),this.w(e+","+o+",next) {"),t.name.children.forEach(function(t){var i=t.value;n.set(i,i),r.y('frame.set("'+i+'", '+i+");")})}else{var a=t.name.value;this.y("runtime."+h+"("+u+", 1, function("+a+", "+e+", "+o+",next) {"),this.y('frame.set("'+a+'", '+a+");"),n.set(a,a)}this.L(t,u,e,o),this.T(function(){var s;i&&(s=r.a()),r.compile(t.body,n),r.y("next("+e+(s?","+s:"")+");"),i&&r.b()});var c=this.v();this.y("}, "+this._(c)),this.A(),i&&this.y(this.buffer+" += "+c+";"),t.else_&&(this.y("if (!"+u+".length) {"),this.compile(t.else_,n),this.y("}")),this.y("frame = frame.pop();")},e.compileAsyncEach=function(t,n){this.K(t,n)},e.compileAsyncAll=function(t,n){this.K(t,n,!0)},e.R=function(t,n){var i=this,r=[],e=null,o="macro_"+this.v(),h=void 0!==n;t.args.children.forEach(function(n,o){o===t.args.children.length-1&&n instanceof s.Dict?e=n:(i.assertType(n,s.Symbol),r.push(n))});var f,a=r.map(function(t){return"l_"+t.value}).concat(["kwargs"]),c=r.map(function(t){return'"'+t.value+'"'}),l=(e&&e.children||[]).map(function(t){return'"'+t.key.value+'"'});f=h?n.push(!0):new u,this.g("var "+o+" = runtime.makeMacro(","["+c.join(", ")+"], ","["+l.join(", ")+"], ","function ("+a.join(", ")+") {","var callerFrame = frame;","frame = "+(h?"frame.push(true);":"new runtime.Frame();"),"kwargs = kwargs || {};",'if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {','frame.set("caller", kwargs.caller); }'),r.forEach(function(t){i.y('frame.set("'+t.value+'", l_'+t.value+");"),f.set(t.value,"l_"+t.value)}),e&&e.children.forEach(function(t){var n=t.key.value;i.w('frame.set("'+n+'", '),i.w('Object.prototype.hasOwnProperty.call(kwargs, "'+n+'")'),i.w(' ? kwargs["'+n+'"] : '),i.C(t.value,f),i.w(");")});var v=this.a();return this.T(function(){i.compile(t.body,f)}),this.y("frame = "+(h?"frame.pop();":"callerFrame;")),this.y("return new runtime.SafeString("+v+");"),this.y("});"),this.b(),o},e.compileMacro=function(t,n){var i=this.R(t),r=t.name.value;n.set(r,i),n.parent?this.y('frame.set("'+r+'", '+i+");"):("_"!==t.name.value.charAt(0)&&this.y('context.addExport("'+r+'");'),this.y('context.setVariable("'+r+'", '+i+");"))},e.compileCaller=function(t,n){this.w("(function (){");var i=this.R(t,n);this.w("return "+i+";})()")},e.M=function(t,n,i,r){var e=this.v(),s=this.N(),o=this._(e),u=i?"true":"false",h=r?"true":"false";return this.w("env.getTemplate("),this.C(t.template,n),this.y(", "+u+", "+s+", "+h+", "+o),e},e.compileImport=function(t,n){var i=t.target.value,r=this.M(t,n,!1,!1);this.A(),this.y(r+".getExported("+(t.withContext?"context.getVariables(), frame, ":"")+this._(r)),this.A(),n.set(i,r),n.parent?this.y('frame.set("'+i+'", '+r+");"):this.y('context.setVariable("'+i+'", '+r+");")},e.compileFromImport=function(t,n){var i=this,r=this.M(t,n,!1,!1);this.A(),this.y(r+".getExported("+(t.withContext?"context.getVariables(), frame, ":"")+this._(r)),this.A(),t.names.children.forEach(function(t){var e,o,u=i.v();t instanceof s.Pair?(e=t.key.value,o=t.value.value):o=e=t.value,i.y("if(Object.prototype.hasOwnProperty.call("+r+', "'+e+'")) {'),i.y("var "+u+" = "+r+"."+e+";"),i.y("} else {"),i.y("cb(new Error(\"cannot import '"+e+"'\")); return;"),i.y("}"),n.set(o,u),n.parent?i.y('frame.set("'+o+'", '+u+");"):i.y('context.setVariable("'+o+'", '+u+");")})},e.compileBlock=function(t){var n=this.v();this.inBlock||this.w('(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : '),this.w('context.getBlock("'+t.name.value+'")'),this.inBlock||this.w(")"),this.y("(env, context, frame, runtime, "+this._(n)),this.y(this.buffer+" += "+n+";"),this.A()},e.compileSuper=function(t,n){var i=t.blockName.value,r=t.symbol.value,e=this._(r);this.y('context.getSuper(env, "'+i+'", b_'+i+", frame, runtime, "+e),this.y(r+" = runtime.markSafe("+r+");"),this.A(),n.set(r,r)},e.compileExtends=function(t,n){var i=this.v(),r=this.M(t,n,!0,!1);this.y("parentTemplate = "+r),this.y("for(var "+i+" in parentTemplate.blocks) {"),this.y("context.addBlock("+i+", parentTemplate.blocks["+i+"]);"),this.y("}"),this.A()},e.compileInclude=function(t,n){this.y("var tasks = [];"),this.y("tasks.push("),this.y("function(callback) {");var i=this.M(t,n,!1,t.ignoreMissing);this.y("callback(null,"+i+");});"),this.y("});");var r=this.v();this.y("tasks.push("),this.y("function(template, callback){"),this.y("template.render(context.getVariables(), frame, "+this._(r)),this.y("callback(null,"+r+");});"),this.y("});"),this.y("tasks.push("),this.y("function(result, callback){"),this.y(this.buffer+" += result;"),this.y("callback(null);"),this.y("});"),this.y("env.waterfall(tasks, function(){"),this.A()},e.compileTemplateData=function(t,n){this.compileLiteral(t,n)},e.compileCapture=function(t,n){var i=this,r=this.buffer;this.buffer="output",this.y("(function() {"),this.y('var output = "";'),this.T(function(){i.compile(t.body,n)}),this.y("return output;"),this.y("})()"),this.buffer=r},e.compileOutput=function(t,n){var i=this;t.children.forEach(function(r){r instanceof s.TemplateData?r.value&&(i.w(i.buffer+" += "),i.compileLiteral(r,n),i.y(";")):(i.w(i.buffer+" += runtime.suppressValue("),i.throwOnUndefined&&i.w("runtime.ensureDefined("),i.compile(r,n),i.throwOnUndefined&&i.w(","+t.lineno+","+t.colno+")"),i.w(", env.opts.autoescape);\n"))})},e.compileRoot=function(t,n){var i=this;n&&this.fail("compileRoot: root node can't have frame"),n=new u,this.k("root"),this.y("var parentTemplate = null;"),this.S(t,n),this.y("if(parentTemplate) {"),this.y("parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);"),this.y("} else {"),this.y("cb(null, "+this.buffer+");"),this.y("}"),this.x(!0),this.inBlock=!0;var r=[],e=t.findAll(s.Block);e.forEach(function(t,n){var e=t.name.value;if(-1!==r.indexOf(e))throw Error('Block "'+e+'" defined more than once.');r.push(e),i.k("b_"+e);var s=new u;i.y("var frame = frame.push(true);"),i.compile(t.body,s),i.x()}),this.y("return {"),e.forEach(function(t,n){var r="b_"+t.name.value;i.y(r+": "+r+",")}),this.y("root: root\n};")},e.compile=function(t,n){var i=this["compile"+t.typename];i?i.call(this,t,n):this.fail("compile: Cannot compile node: "+t.typename,t.lineno,t.colno)},e.getCode=function(){return this.codebuf.join("")},r}(i(1));t.exports={compile:function(t,n,i,s,o){void 0===o&&(o={});var u=new f(s,o.throwOnUndefined),h=(i||[]).map(function(t){return t.preprocess}).filter(function(t){return!!t}).reduce(function(t,n){return n(t)},t);return u.compile(e.transform(r.parse(h,i,o),n,s)),u.getCode()},Compiler:f}},function(t,n,i){"use strict";var r=i(4),e=i(1);t.exports=function(t){var n,i;function e(){return t.apply(this,arguments)||this}i=t,(n=e).prototype=Object.create(i.prototype),n.prototype.constructor=n,n.__proto__=i;var s=e.prototype;return s.on=function(t,n){this.listeners=this.listeners||{},this.listeners[t]=this.listeners[t]||[],this.listeners[t].push(n)},s.emit=function(t){for(var n=arguments.length,i=Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];this.listeners&&this.listeners[t]&&this.listeners[t].forEach(function(t){t.apply(void 0,i)})},s.resolve=function(t,n){return r.resolve(r.dirname(t),n)},s.isRelative=function(t){return 0===t.indexOf("./")||0===t.indexOf("../")},e}(e)},function(t,n,i){"use strict";function r(t,n){t.prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n}var e=i(12),s=i(15),o=i(0),u=i(5),h=i(17),f=i(10),a=f.FileSystemLoader,c=f.WebLoader,l=f.PrecompiledLoader,v=i(19),p=i(20),d=i(1),w=i(2),m=w.handleError,b=w.Frame,y=i(21);function g(t,n,i){e(function(){t(n,i)})}var k={type:"code",obj:{root:function(t,n,i,r,e){try{e(null,"")}catch(t){e(m(t,null,null))}}}},E=function(t){function n(){return t.apply(this,arguments)||this}r(n,t);var i=n.prototype;return i.init=function(t,n){var i=this;n=this.opts=n||{},this.opts.dev=!!n.dev,this.opts.autoescape=null==n.autoescape||n.autoescape,this.opts.throwOnUndefined=!!n.throwOnUndefined,this.opts.trimBlocks=!!n.trimBlocks,this.opts.lstripBlocks=!!n.lstripBlocks,this.loaders=[],t?this.loaders=o.isArray(t)?t:[t]:a?this.loaders=[new a("views")]:c&&(this.loaders=[new c("/views")]),"undefined"!=typeof window&&window.nunjucksPrecompiled&&this.loaders.unshift(new l(window.nunjucksPrecompiled)),this.initCache(),this.globals=p(),this.filters={},this.tests={},this.asyncFilters=[],this.extensions={},this.extensionsList=[],o.r(h).forEach(function(t){var n=t[0],r=t[1];return i.addFilter(n,r)}),o.r(v).forEach(function(t){var n=t[0],r=t[1];return i.addTest(n,r)})},i.initCache=function(){this.loaders.forEach(function(t){t.cache={},"function"==typeof t.on&&t.on("update",function(n){t.cache[n]=null})})},i.addExtension=function(t,n){return n.__name=t,this.extensions[t]=n,this.extensionsList.push(n),this},i.removeExtension=function(t){var n=this.getExtension(t);n&&(this.extensionsList=o.without(this.extensionsList,n),delete this.extensions[t])},i.getExtension=function(t){return this.extensions[t]},i.hasExtension=function(t){return!!this.extensions[t]},i.addGlobal=function(t,n){return this.globals[t]=n,this},i.getGlobal=function(t){if(void 0===this.globals[t])throw Error("global not found: "+t);return this.globals[t]},i.addFilter=function(t,n,i){var r=n;return i&&this.asyncFilters.push(t),this.filters[t]=r,this},i.getFilter=function(t){if(!this.filters[t])throw Error("filter not found: "+t);return this.filters[t]},i.addTest=function(t,n){return this.tests[t]=n,this},i.getTest=function(t){if(!this.tests[t])throw Error("test not found: "+t);return this.tests[t]},i.resolveTemplate=function(t,n,i){return!(!t.isRelative||!n)&&t.isRelative(i)&&t.resolve?t.resolve(n,i):i},i.getTemplate=function(t,n,i,r,e){var s,u=this,h=this,f=null;if(t&&t.raw&&(t=t.raw),o.isFunction(i)&&(e=i,i=null,n=n||!1),o.isFunction(n)&&(e=n,n=!1),t instanceof O)f=t;else{if("string"!=typeof t)throw Error("template names must be a string: "+t);for(var a=0;a<this.loaders.length;a++){var c=this.loaders[a];if(f=c.cache[this.resolveTemplate(c,i,t)])break}}if(f)return n&&f.compile(),e?void e(null,f):f;return o.asyncIter(this.loaders,function(n,r,e,s){function o(t,i){t?s(t):i?(i.loader=n,s(null,i)):e()}t=h.resolveTemplate(n,i,t),n.async?n.getSource(t,o):o(null,n.getSource(t))},function(i,o){if(o||i||r||(i=Error("template not found: "+t)),i){if(e)return void e(i);throw i}var h;o?(h=new O(o.src,u,o.path,n),o.noCache||(o.loader.cache[t]=h)):h=new O(k,u,"",n),e?e(null,h):s=h}),s},i.express=function(t){return y(this,t)},i.render=function(t,n,i){o.isFunction(n)&&(i=n,n=null);var r=null;return this.getTemplate(t,function(t,e){if(t&&i)g(i,t);else{if(t)throw t;r=e.render(n,i)}}),r},i.renderString=function(t,n,i,r){return o.isFunction(i)&&(r=i,i={}),new O(t,this,(i=i||{}).path).render(n,r)},i.waterfall=function(t,n,i){return s(t,n,i)},n}(d),x=function(t){function n(){return t.apply(this,arguments)||this}r(n,t);var i=n.prototype;return i.init=function(t,n,i){var r=this;this.env=i||new E,this.ctx=o.extend({},t),this.blocks={},this.exported=[],o.keys(n).forEach(function(t){r.addBlock(t,n[t])})},i.lookup=function(t){return t in this.env.globals&&!(t in this.ctx)?this.env.globals[t]:this.ctx[t]},i.setVariable=function(t,n){this.ctx[t]=n},i.getVariables=function(){return this.ctx},i.addBlock=function(t,n){return this.blocks[t]=this.blocks[t]||[],this.blocks[t].push(n),this},i.getBlock=function(t){if(!this.blocks[t])throw Error('unknown block "'+t+'"');return this.blocks[t][0]},i.getSuper=function(t,n,i,r,e,s){var u=o.indexOf(this.blocks[n]||[],i),h=this.blocks[n][u+1];if(-1===u||!h)throw Error('no super block available for "'+n+'"');h(t,this,r,e,s)},i.addExport=function(t){this.exported.push(t)},i.getExported=function(){var t=this,n={};return this.exported.forEach(function(i){n[i]=t.ctx[i]}),n},n}(d),O=function(t){function n(){return t.apply(this,arguments)||this}r(n,t);var i=n.prototype;return i.init=function(t,n,i,r){if(this.env=n||new E,o.isObject(t))switch(t.type){case"code":this.tmplProps=t.obj;break;case"string":this.tmplStr=t.obj;break;default:throw Error("Unexpected template object type "+t.type+"; expected 'code', or 'string'")}else{if(!o.isString(t))throw Error("src must be a string or an object describing the source");this.tmplStr=t}if(this.path=i,r)try{this.B()}catch(t){throw o.t(this.path,this.env.opts.dev,t)}else this.compiled=!1},i.render=function(t,n,i){var r=this;"function"==typeof t?(i=t,t={}):"function"==typeof n&&(i=n,n=null);var e=!n;try{this.compile()}catch(t){var s=o.t(this.path,this.env.opts.dev,t);if(i)return g(i,s);throw s}var u=new x(t||{},this.blocks,this.env),h=n?n.push(!0):new b;h.topLevel=!0;var f=null,a=!1;return this.rootRenderFunc(this.env,u,h,w,function(t,n){if(!a)if(t&&(t=o.t(r.path,r.env.opts.dev,t),a=!0),i)e?g(i,t,n):i(t,n);else{if(t)throw t;f=n}}),f},i.getExported=function(t,n,i){"function"==typeof t&&(i=t,t={}),"function"==typeof n&&(i=n,n=null);try{this.compile()}catch(t){if(i)return i(t);throw t}var r=n?n.push():new b;r.topLevel=!0;var e=new x(t||{},this.blocks,this.env);this.rootRenderFunc(this.env,e,r,w,function(t){t?i(t,null):i(null,e.getExported())})},i.compile=function(){this.compiled||this.B()},i.B=function(){var t;if(this.tmplProps)t=this.tmplProps;else{var n=u.compile(this.tmplStr,this.env.asyncFilters,this.env.extensionsList,this.path,this.env.opts);t=Function(n)()}this.blocks=this.P(t),this.rootRenderFunc=t.root,this.compiled=!0},i.P=function(t){var n={};return o.keys(t).forEach(function(i){"b_"===i.slice(0,2)&&(n[i.slice(2)]=t[i])}),n},n}(d);t.exports={Environment:E,Template:O}},function(t,n,i){"use strict";var r=i(9),e=i(3),s=i(1),o=i(0),u=function(t){var n,i;function s(){return t.apply(this,arguments)||this}i=t,(n=s).prototype=Object.create(i.prototype),n.prototype.constructor=n,n.__proto__=i;var u=s.prototype;return u.init=function(t){this.tokens=t,this.peeked=null,this.breakOnBlocks=null,this.dropLeadingWhitespace=!1,this.extensions=[]},u.nextToken=function(t){var n;if(this.peeked){if(t||this.peeked.type!==r.TOKEN_WHITESPACE)return n=this.peeked,this.peeked=null,n;this.peeked=null}if(n=this.tokens.nextToken(),!t)for(;n&&n.type===r.TOKEN_WHITESPACE;)n=this.tokens.nextToken();return n},u.peekToken=function(){return this.peeked=this.peeked||this.nextToken(),this.peeked},u.pushToken=function(t){if(this.peeked)throw Error("pushToken: can only push one token on between reads");this.peeked=t},u.error=function(t,n,i){if(void 0===n||void 0===i){var r=this.peekToken()||{};n=r.lineno,i=r.colno}return void 0!==n&&(n+=1),void 0!==i&&(i+=1),new o.TemplateError(t,n,i)},u.fail=function(t,n,i){throw this.error(t,n,i)},u.skip=function(t){var n=this.nextToken();return!(!n||n.type!==t)||(this.pushToken(n),!1)},u.expect=function(t){var n=this.nextToken();return n.type!==t&&this.fail("expected "+t+", got "+n.type,n.lineno,n.colno),n},u.skipValue=function(t,n){var i=this.nextToken();return!(!i||i.type!==t||i.value!==n)||(this.pushToken(i),!1)},u.skipSymbol=function(t){return this.skipValue(r.TOKEN_SYMBOL,t)},u.advanceAfterBlockEnd=function(t){var n;return t||((n=this.peekToken())||this.fail("unexpected end of file"),n.type!==r.TOKEN_SYMBOL&&this.fail("advanceAfterBlockEnd: expected symbol token or explicit name to be passed"),t=this.nextToken().value),(n=this.nextToken())&&n.type===r.TOKEN_BLOCK_END?"-"===n.value.charAt(0)&&(this.dropLeadingWhitespace=!0):this.fail("expected block end in "+t+" statement"),n},u.advanceAfterVariableEnd=function(){var t=this.nextToken();t&&t.type===r.TOKEN_VARIABLE_END?this.dropLeadingWhitespace="-"===t.value.charAt(t.value.length-this.tokens.tags.VARIABLE_END.length-1):(this.pushToken(t),this.fail("expected variable end"))},u.parseFor=function(){var t,n,i=this.peekToken();if(this.skipSymbol("for")?(t=new e.For(i.lineno,i.colno),n="endfor"):this.skipSymbol("asyncEach")?(t=new e.AsyncEach(i.lineno,i.colno),n="endeach"):this.skipSymbol("asyncAll")?(t=new e.AsyncAll(i.lineno,i.colno),n="endall"):this.fail("parseFor: expected for{Async}",i.lineno,i.colno),t.name=this.parsePrimary(),t.name instanceof e.Symbol||this.fail("parseFor: variable name expected for loop"),this.peekToken().type===r.TOKEN_COMMA){var s=t.name;for(t.name=new e.Array(s.lineno,s.colno),t.name.addChild(s);this.skip(r.TOKEN_COMMA);){var o=this.parsePrimary();t.name.addChild(o)}}return this.skipSymbol("in")||this.fail('parseFor: expected "in" keyword for loop',i.lineno,i.colno),t.arr=this.parseExpression(),this.advanceAfterBlockEnd(i.value),t.body=this.parseUntilBlocks(n,"else"),this.skipSymbol("else")&&(this.advanceAfterBlockEnd("else"),t.else_=this.parseUntilBlocks(n)),this.advanceAfterBlockEnd(),t},u.parseMacro=function(){var t=this.peekToken();this.skipSymbol("macro")||this.fail("expected macro");var n=this.parsePrimary(!0),i=this.parseSignature(),r=new e.Macro(t.lineno,t.colno,n,i);return this.advanceAfterBlockEnd(t.value),r.body=this.parseUntilBlocks("endmacro"),this.advanceAfterBlockEnd(),r},u.parseCall=function(){var t=this.peekToken();this.skipSymbol("call")||this.fail("expected call");var n=this.parseSignature(!0)||new e.NodeList,i=this.parsePrimary();this.advanceAfterBlockEnd(t.value);var r=this.parseUntilBlocks("endcall");this.advanceAfterBlockEnd();var s=new e.Symbol(t.lineno,t.colno,"caller"),o=new e.Caller(t.lineno,t.colno,s,n,r),u=i.args.children;return u[u.length-1]instanceof e.KeywordArgs||u.push(new e.KeywordArgs),u[u.length-1].addChild(new e.Pair(t.lineno,t.colno,s,o)),new e.Output(t.lineno,t.colno,[i])},u.parseWithContext=function(){var t=this.peekToken(),n=null;return this.skipSymbol("with")?n=!0:this.skipSymbol("without")&&(n=!1),null!==n&&(this.skipSymbol("context")||this.fail("parseFrom: expected context after with/without",t.lineno,t.colno)),n},u.parseImport=function(){var t=this.peekToken();this.skipSymbol("import")||this.fail("parseImport: expected import",t.lineno,t.colno);var n=this.parseExpression();this.skipSymbol("as")||this.fail('parseImport: expected "as" keyword',t.lineno,t.colno);var i=this.parseExpression(),r=this.parseWithContext(),s=new e.Import(t.lineno,t.colno,n,i,r);return this.advanceAfterBlockEnd(t.value),s},u.parseFrom=function(){var t=this.peekToken();this.skipSymbol("from")||this.fail("parseFrom: expected from");var n=this.parseExpression();this.skipSymbol("import")||this.fail("parseFrom: expected import",t.lineno,t.colno);for(var i,s=new e.NodeList;;){var o=this.peekToken();if(o.type===r.TOKEN_BLOCK_END){s.children.length||this.fail("parseFrom: Expected at least one import name",t.lineno,t.colno),"-"===o.value.charAt(0)&&(this.dropLeadingWhitespace=!0),this.nextToken();break}s.children.length>0&&!this.skip(r.TOKEN_COMMA)&&this.fail("parseFrom: expected comma",t.lineno,t.colno);var u=this.parsePrimary();if("_"===u.value.charAt(0)&&this.fail("parseFrom: names starting with an underscore cannot be imported",u.lineno,u.colno),this.skipSymbol("as")){var h=this.parsePrimary();s.addChild(new e.Pair(u.lineno,u.colno,u,h))}else s.addChild(u);i=this.parseWithContext()}return new e.FromImport(t.lineno,t.colno,n,s,i)},u.parseBlock=function(){var t=this.peekToken();this.skipSymbol("block")||this.fail("parseBlock: expected block",t.lineno,t.colno);var n=new e.Block(t.lineno,t.colno);n.name=this.parsePrimary(),n.name instanceof e.Symbol||this.fail("parseBlock: variable name expected",t.lineno,t.colno),this.advanceAfterBlockEnd(t.value),n.body=this.parseUntilBlocks("endblock"),this.skipSymbol("endblock"),this.skipSymbol(n.name.value);var i=this.peekToken();return i||this.fail("parseBlock: expected endblock, got end of file"),this.advanceAfterBlockEnd(i.value),n},u.parseExtends=function(){var t=this.peekToken();this.skipSymbol("extends")||this.fail("parseTemplateRef: expected extends");var n=new e.Extends(t.lineno,t.colno);return n.template=this.parseExpression(),this.advanceAfterBlockEnd(t.value),n},u.parseInclude=function(){var t=this.peekToken();this.skipSymbol("include")||this.fail("parseInclude: expected include");var n=new e.Include(t.lineno,t.colno);return n.template=this.parseExpression(),this.skipSymbol("ignore")&&this.skipSymbol("missing")&&(n.ignoreMissing=!0),this.advanceAfterBlockEnd(t.value),n},u.parseIf=function(){var t,n=this.peekToken();this.skipSymbol("if")||this.skipSymbol("elif")||this.skipSymbol("elseif")?t=new e.If(n.lineno,n.colno):this.skipSymbol("ifAsync")?t=new e.IfAsync(n.lineno,n.colno):this.fail("parseIf: expected if, elif, or elseif",n.lineno,n.colno),t.cond=this.parseExpression(),this.advanceAfterBlockEnd(n.value),t.body=this.parseUntilBlocks("elif","elseif","else","endif");var i=this.peekToken();switch(i&&i.value){case"elseif":case"elif":t.else_=this.parseIf();break;case"else":this.advanceAfterBlockEnd(),t.else_=this.parseUntilBlocks("endif"),this.advanceAfterBlockEnd();break;case"endif":t.else_=null,this.advanceAfterBlockEnd();break;default:this.fail("parseIf: expected elif, else, or endif, got end of file")}return t},u.parseSet=function(){var t=this.peekToken();this.skipSymbol("set")||this.fail("parseSet: expected set",t.lineno,t.colno);for(var n,i=new e.Set(t.lineno,t.colno,[]);(n=this.parsePrimary())&&(i.targets.push(n),this.skip(r.TOKEN_COMMA)););return this.skipValue(r.TOKEN_OPERATOR,"=")?(i.value=this.parseExpression(),this.advanceAfterBlockEnd(t.value)):this.skip(r.TOKEN_BLOCK_END)?(i.body=new e.Capture(t.lineno,t.colno,this.parseUntilBlocks("endset")),i.value=null,this.advanceAfterBlockEnd()):this.fail("parseSet: expected = or block end in set tag",t.lineno,t.colno),i},u.parseSwitch=function(){var t=this.peekToken();this.skipSymbol("switch")||this.skipSymbol("case")||this.skipSymbol("default")||this.fail('parseSwitch: expected "switch," "case" or "default"',t.lineno,t.colno);var n=this.parseExpression();this.advanceAfterBlockEnd("switch"),this.parseUntilBlocks("case","default","endswitch");var i,r=this.peekToken(),s=[];do{this.skipSymbol("case");var o=this.parseExpression();this.advanceAfterBlockEnd("switch");var u=this.parseUntilBlocks("case","default","endswitch");s.push(new e.Case(r.line,r.col,o,u)),r=this.peekToken()}while(r&&"case"===r.value);switch(r.value){case"default":this.advanceAfterBlockEnd(),i=this.parseUntilBlocks("endswitch"),this.advanceAfterBlockEnd();break;case"endswitch":this.advanceAfterBlockEnd();break;default:this.fail('parseSwitch: expected "case," "default" or "endswitch," got EOF.')}return new e.Switch(t.lineno,t.colno,n,s,i)},u.parseStatement=function(){var t=this.peekToken();if(t.type!==r.TOKEN_SYMBOL&&this.fail("tag name expected",t.lineno,t.colno),this.breakOnBlocks&&-1!==o.indexOf(this.breakOnBlocks,t.value))return null;switch(t.value){case"raw":return this.parseRaw();case"verbatim":return this.parseRaw("verbatim");case"if":case"ifAsync":return this.parseIf();case"for":case"asyncEach":case"asyncAll":return this.parseFor();case"block":return this.parseBlock();case"extends":return this.parseExtends();case"include":return this.parseInclude();case"set":return this.parseSet();case"macro":return this.parseMacro();case"call":return this.parseCall();case"import":return this.parseImport();case"from":return this.parseFrom();case"filter":return this.parseFilterStatement();case"switch":return this.parseSwitch();default:if(this.extensions.length)for(var n=0;n<this.extensions.length;n++){var i=this.extensions[n];if(-1!==o.indexOf(i.tags||[],t.value))return i.parse(this,e,r)}this.fail("unknown block tag: "+t.value,t.lineno,t.colno)}},u.parseRaw=function(t){for(var n="end"+(t=t||"raw"),i=RegExp("([\\s\\S]*?){%\\s*("+t+"|"+n+")\\s*(?=%})%}"),r=1,s="",o=null,u=this.advanceAfterBlockEnd();(o=this.tokens.V(i))&&r>0;){var h=o[0],f=o[1],a=o[2];a===t?r+=1:a===n&&(r-=1),0===r?(s+=f,this.tokens.backN(h.length-f.length)):s+=h}return new e.Output(u.lineno,u.colno,[new e.TemplateData(u.lineno,u.colno,s)])},u.parsePostfix=function(t){for(var n,i=this.peekToken();i;){if(i.type===r.TOKEN_LEFT_PAREN)t=new e.FunCall(i.lineno,i.colno,t,this.parseSignature());else if(i.type===r.TOKEN_LEFT_BRACKET)(n=this.parseAggregate()).children.length>1&&this.fail("invalid index"),t=new e.LookupVal(i.lineno,i.colno,t,n.children[0]);else{if(i.type!==r.TOKEN_OPERATOR||"."!==i.value)break;this.nextToken();var s=this.nextToken();s.type!==r.TOKEN_SYMBOL&&this.fail("expected name as lookup value, got "+s.value,s.lineno,s.colno),n=new e.Literal(s.lineno,s.colno,s.value),t=new e.LookupVal(i.lineno,i.colno,t,n)}i=this.peekToken()}return t},u.parseExpression=function(){return this.parseInlineIf()},u.parseInlineIf=function(){var t=this.parseOr();if(this.skipSymbol("if")){var n=this.parseOr(),i=t;(t=new e.InlineIf(t.lineno,t.colno)).body=i,t.cond=n,this.skipSymbol("else")?t.else_=this.parseOr():t.else_=null}return t},u.parseOr=function(){for(var t=this.parseAnd();this.skipSymbol("or");){var n=this.parseAnd();t=new e.Or(t.lineno,t.colno,t,n)}return t},u.parseAnd=function(){for(var t=this.parseNot();this.skipSymbol("and");){var n=this.parseNot();t=new e.And(t.lineno,t.colno,t,n)}return t},u.parseNot=function(){var t=this.peekToken();return this.skipSymbol("not")?new e.Not(t.lineno,t.colno,this.parseNot()):this.parseIn()},u.parseIn=function(){for(var t=this.parseIs();;){var n=this.nextToken();if(!n)break;var i=n.type===r.TOKEN_SYMBOL&&"not"===n.value;if(i||this.pushToken(n),!this.skipSymbol("in")){i&&this.pushToken(n);break}var s=this.parseIs();t=new e.In(t.lineno,t.colno,t,s),i&&(t=new e.Not(t.lineno,t.colno,t))}return t},u.parseIs=function(){var t=this.parseCompare();if(this.skipSymbol("is")){var n=this.skipSymbol("not"),i=this.parseCompare();t=new e.Is(t.lineno,t.colno,t,i),n&&(t=new e.Not(t.lineno,t.colno,t))}return t},u.parseCompare=function(){for(var t=["==","===","!=","!==","<",">","<=",">="],n=this.parseConcat(),i=[];;){var r=this.nextToken();if(!r)break;if(-1===t.indexOf(r.value)){this.pushToken(r);break}i.push(new e.CompareOperand(r.lineno,r.colno,this.parseConcat(),r.value))}return i.length?new e.Compare(i[0].lineno,i[0].colno,n,i):n},u.parseConcat=function(){for(var t=this.parseAdd();this.skipValue(r.TOKEN_TILDE,"~");){var n=this.parseAdd();t=new e.Concat(t.lineno,t.colno,t,n)}return t},u.parseAdd=function(){for(var t=this.parseSub();this.skipValue(r.TOKEN_OPERATOR,"+");){var n=this.parseSub();t=new e.Add(t.lineno,t.colno,t,n)}return t},u.parseSub=function(){for(var t=this.parseMul();this.skipValue(r.TOKEN_OPERATOR,"-");){var n=this.parseMul();t=new e.Sub(t.lineno,t.colno,t,n)}return t},u.parseMul=function(){for(var t=this.parseDiv();this.skipValue(r.TOKEN_OPERATOR,"*");){var n=this.parseDiv();t=new e.Mul(t.lineno,t.colno,t,n)}return t},u.parseDiv=function(){for(var t=this.parseFloorDiv();this.skipValue(r.TOKEN_OPERATOR,"/");){var n=this.parseFloorDiv();t=new e.Div(t.lineno,t.colno,t,n)}return t},u.parseFloorDiv=function(){for(var t=this.parseMod();this.skipValue(r.TOKEN_OPERATOR,"//");){var n=this.parseMod();t=new e.FloorDiv(t.lineno,t.colno,t,n)}return t},u.parseMod=function(){for(var t=this.parsePow();this.skipValue(r.TOKEN_OPERATOR,"%");){var n=this.parsePow();t=new e.Mod(t.lineno,t.colno,t,n)}return t},u.parsePow=function(){for(var t=this.parseUnary();this.skipValue(r.TOKEN_OPERATOR,"**");){var n=this.parseUnary();t=new e.Pow(t.lineno,t.colno,t,n)}return t},u.parseUnary=function(t){var n,i=this.peekToken();return n=this.skipValue(r.TOKEN_OPERATOR,"-")?new e.Neg(i.lineno,i.colno,this.parseUnary(!0)):this.skipValue(r.TOKEN_OPERATOR,"+")?new e.Pos(i.lineno,i.colno,this.parseUnary(!0)):this.parsePrimary(),t||(n=this.parseFilter(n)),n},u.parsePrimary=function(t){var n,i=this.nextToken(),s=null;if(i?i.type===r.TOKEN_STRING?n=i.value:i.type===r.TOKEN_INT?n=parseInt(i.value,10):i.type===r.TOKEN_FLOAT?n=parseFloat(i.value):i.type===r.TOKEN_BOOLEAN?"true"===i.value?n=!0:"false"===i.value?n=!1:this.fail("invalid boolean: "+i.value,i.lineno,i.colno):i.type===r.TOKEN_NONE?n=null:i.type===r.TOKEN_REGEX&&(n=RegExp(i.value.body,i.value.flags)):this.fail("expected expression, got end of file"),void 0!==n?s=new e.Literal(i.lineno,i.colno,n):i.type===r.TOKEN_SYMBOL?s=new e.Symbol(i.lineno,i.colno,i.value):(this.pushToken(i),s=this.parseAggregate()),t||(s=this.parsePostfix(s)),s)return s;throw this.error("unexpected token: "+i.value,i.lineno,i.colno)},u.parseFilterName=function(){for(var t=this.expect(r.TOKEN_SYMBOL),n=t.value;this.skipValue(r.TOKEN_OPERATOR,".");)n+="."+this.expect(r.TOKEN_SYMBOL).value;return new e.Symbol(t.lineno,t.colno,n)},u.parseFilterArgs=function(t){return this.peekToken().type===r.TOKEN_LEFT_PAREN?this.parsePostfix(t).args.children:[]},u.parseFilter=function(t){for(;this.skip(r.TOKEN_PIPE);){var n=this.parseFilterName();t=new e.Filter(n.lineno,n.colno,n,new e.NodeList(n.lineno,n.colno,[t].concat(this.parseFilterArgs(t))))}return t},u.parseFilterStatement=function(){var t=this.peekToken();this.skipSymbol("filter")||this.fail("parseFilterStatement: expected filter");var n=this.parseFilterName(),i=this.parseFilterArgs(n);this.advanceAfterBlockEnd(t.value);var r=new e.Capture(n.lineno,n.colno,this.parseUntilBlocks("endfilter"));this.advanceAfterBlockEnd();var s=new e.Filter(n.lineno,n.colno,n,new e.NodeList(n.lineno,n.colno,[r].concat(i)));return new e.Output(n.lineno,n.colno,[s])},u.parseAggregate=function(){var t,n=this.nextToken();switch(n.type){case r.TOKEN_LEFT_PAREN:t=new e.Group(n.lineno,n.colno);break;case r.TOKEN_LEFT_BRACKET:t=new e.Array(n.lineno,n.colno);break;case r.TOKEN_LEFT_CURLY:t=new e.Dict(n.lineno,n.colno);break;default:return null}for(;;){var i=this.peekToken().type;if(i===r.TOKEN_RIGHT_PAREN||i===r.TOKEN_RIGHT_BRACKET||i===r.TOKEN_RIGHT_CURLY){this.nextToken();break}if(t.children.length>0&&(this.skip(r.TOKEN_COMMA)||this.fail("parseAggregate: expected comma after expression",n.lineno,n.colno)),t instanceof e.Dict){var s=this.parsePrimary();this.skip(r.TOKEN_COLON)||this.fail("parseAggregate: expected colon after dict key",n.lineno,n.colno);var o=this.parseExpression();t.addChild(new e.Pair(s.lineno,s.colno,s,o))}else{var u=this.parseExpression();t.addChild(u)}}return t},u.parseSignature=function(t,n){var i=this.peekToken();if(!n&&i.type!==r.TOKEN_LEFT_PAREN){if(t)return null;this.fail("expected arguments",i.lineno,i.colno)}i.type===r.TOKEN_LEFT_PAREN&&(i=this.nextToken());for(var s=new e.NodeList(i.lineno,i.colno),o=new e.KeywordArgs(i.lineno,i.colno),u=!1;;){if(i=this.peekToken(),!n&&i.type===r.TOKEN_RIGHT_PAREN){this.nextToken();break}if(n&&i.type===r.TOKEN_BLOCK_END)break;if(u&&!this.skip(r.TOKEN_COMMA))this.fail("parseSignature: expected comma after expression",i.lineno,i.colno);else{var h=this.parseExpression();this.skipValue(r.TOKEN_OPERATOR,"=")?o.addChild(new e.Pair(h.lineno,h.colno,h,this.parseExpression())):s.addChild(h)}u=!0}return o.children.length&&s.addChild(o),s},u.parseUntilBlocks=function(){for(var t=this.breakOnBlocks,n=arguments.length,i=Array(n),r=0;r<n;r++)i[r]=arguments[r];this.breakOnBlocks=i;var e=this.parse();return this.breakOnBlocks=t,e},u.parseNodes=function(){for(var t,n=[];t=this.nextToken();)if(t.type===r.TOKEN_DATA){var i=t.value,s=this.peekToken(),o=s&&s.value;this.dropLeadingWhitespace&&(i=i.replace(/^\s*/,""),this.dropLeadingWhitespace=!1),s&&(s.type===r.TOKEN_BLOCK_START&&"-"===o.charAt(o.length-1)||s.type===r.TOKEN_VARIABLE_START&&"-"===o.charAt(this.tokens.tags.VARIABLE_START.length)||s.type===r.TOKEN_COMMENT&&"-"===o.charAt(this.tokens.tags.COMMENT_START.length))&&(i=i.replace(/\s*$/,"")),n.push(new e.Output(t.lineno,t.colno,[new e.TemplateData(t.lineno,t.colno,i)]))}else if(t.type===r.TOKEN_BLOCK_START){this.dropLeadingWhitespace=!1;var u=this.parseStatement();if(!u)break;n.push(u)}else if(t.type===r.TOKEN_VARIABLE_START){var h=this.parseExpression();this.dropLeadingWhitespace=!1,this.advanceAfterVariableEnd(),n.push(new e.Output(t.lineno,t.colno,[h]))}else t.type===r.TOKEN_COMMENT?this.dropLeadingWhitespace="-"===t.value.charAt(t.value.length-this.tokens.tags.COMMENT_END.length-1):this.fail("Unexpected token at top-level: "+t.type,t.lineno,t.colno);return n},u.parse=function(){return new e.NodeList(0,0,this.parseNodes())},u.parseAsRoot=function(){return new e.Root(0,0,this.parseNodes())},s}(s);t.exports={parse:function(t,n,i){var e=new u(r.lex(t,i));return void 0!==n&&(e.extensions=n),e.parseAsRoot()},Parser:u}},function(t,n,i){"use strict";var r=i(0),e="{%",s="%}",o="{{",u="}}",h="{#",f="#}";function a(t,n,i,r){return{type:t,value:n,lineno:i,colno:r}}var c=function(){function t(t,n){this.str=t,this.index=0,this.len=t.length,this.lineno=0,this.colno=0,this.in_code=!1;var i=(n=n||{}).tags||{};this.tags={BLOCK_START:i.blockStart||e,BLOCK_END:i.blockEnd||s,VARIABLE_START:i.variableStart||o,VARIABLE_END:i.variableEnd||u,COMMENT_START:i.commentStart||h,COMMENT_END:i.commentEnd||f},this.trimBlocks=!!n.trimBlocks,this.lstripBlocks=!!n.lstripBlocks}var n=t.prototype;return n.nextToken=function(){var t,n=this.lineno,i=this.colno;if(this.in_code){var e=this.current();if(this.isFinished())return null;if('"'===e||"'"===e)return a("string",this.D(e),n,i);if(t=this.$(" \n\t\r "))return a("whitespace",t,n,i);if((t=this.U(this.tags.BLOCK_END))||(t=this.U("-"+this.tags.BLOCK_END)))return this.in_code=!1,this.trimBlocks&&("\n"===(e=this.current())?this.forward():"\r"===e&&(this.forward(),"\n"===(e=this.current())?this.forward():this.back())),a("block-end",t,n,i);if((t=this.U(this.tags.VARIABLE_END))||(t=this.U("-"+this.tags.VARIABLE_END)))return this.in_code=!1,a("variable-end",t,n,i);if("r"===e&&"/"===this.str.charAt(this.index+1)){this.forwardN(2);for(var s="";!this.isFinished();){if("/"===this.current()&&"\\"!==this.previous()){this.forward();break}s+=this.current(),this.forward()}for(var o=["g","i","m","y"],u="";!this.isFinished();){if(!(-1!==o.indexOf(this.current())))break;u+=this.current(),this.forward()}return a("regex",{body:s,flags:u},n,i)}if(-1!=="()[]{}%*-+~/#,:|.<>=!".indexOf(e)){this.forward();var h,f=["==","===","!=","!==","<=",">=","//","**"],c=e+this.current();switch(-1!==r.indexOf(f,c)&&(this.forward(),e=c,-1!==r.indexOf(f,c+this.current())&&(e=c+this.current(),this.forward())),e){case"(":h="left-paren";break;case")":h="right-paren";break;case"[":h="left-bracket";break;case"]":h="right-bracket";break;case"{":h="left-curly";break;case"}":h="right-curly";break;case",":h="comma";break;case":":h="colon";break;case"~":h="tilde";break;case"|":h="pipe";break;default:h="operator"}return a(h,e,n,i)}if((t=this.G(" \n\t\r ()[]{}%*-+~/#,:|.<>=!")).match(/^[-+]?[0-9]+$/))return"."===this.current()?(this.forward(),a("float",t+"."+this.$("0123456789"),n,i)):a("int",t,n,i);if(t.match(/^(true|false)$/))return a("boolean",t,n,i);if("none"===t)return a("none",t,n,i);if("null"===t)return a("none",t,n,i);if(t)return a("symbol",t,n,i);throw Error("Unexpected value while parsing: "+t)}var l,v=this.tags.BLOCK_START.charAt(0)+this.tags.VARIABLE_START.charAt(0)+this.tags.COMMENT_START.charAt(0)+this.tags.COMMENT_END.charAt(0);if(this.isFinished())return null;if((t=this.U(this.tags.BLOCK_START+"-"))||(t=this.U(this.tags.BLOCK_START)))return this.in_code=!0,a("block-start",t,n,i);if((t=this.U(this.tags.VARIABLE_START+"-"))||(t=this.U(this.tags.VARIABLE_START)))return this.in_code=!0,a("variable-start",t,n,i);t="";var p=!1;for(this.W(this.tags.COMMENT_START)&&(p=!0,t=this.U(this.tags.COMMENT_START));null!==(l=this.G(v));){if(t+=l,(this.W(this.tags.BLOCK_START)||this.W(this.tags.VARIABLE_START)||this.W(this.tags.COMMENT_START))&&!p){if(this.lstripBlocks&&this.W(this.tags.BLOCK_START)&&this.colno>0&&this.colno<=t.length){var d=t.slice(-this.colno);if(/^\s+$/.test(d)&&!(t=t.slice(0,-this.colno)).length)return this.nextToken()}break}if(this.W(this.tags.COMMENT_END)){if(!p)throw Error("unexpected end of comment");t+=this.U(this.tags.COMMENT_END);break}t+=this.current(),this.forward()}if(null===l&&p)throw Error("expected end of comment, got end of file");return a(p?"comment":"data",t,n,i)},n.D=function(t){this.forward();for(var n="";!this.isFinished()&&this.current()!==t;){var i=this.current();if("\\"===i){switch(this.forward(),this.current()){case"n":n+="\n";break;case"t":n+="\t";break;case"r":n+="\r";break;default:n+=this.current()}this.forward()}else n+=i,this.forward()}return this.forward(),n},n.W=function(t){return this.index+t.length>this.len?null:this.str.slice(this.index,this.index+t.length)===t},n.U=function(t){return this.W(t)?(this.index+=t.length,t):null},n.G=function(t){return this.H(!0,t||"")},n.$=function(t){return this.H(!1,t)},n.H=function(t,n){if(this.isFinished())return null;var i=n.indexOf(this.current());if(t&&-1===i||!t&&-1!==i){var r=this.current();this.forward();for(var e=n.indexOf(this.current());(t&&-1===e||!t&&-1!==e)&&!this.isFinished();)r+=this.current(),this.forward(),e=n.indexOf(this.current());return r}return""},n.V=function(t){var n=this.currentStr().match(t);return n?(this.forwardN(n[0].length),n):null},n.isFinished=function(){return this.index>=this.len},n.forwardN=function(t){for(var n=0;n<t;n++)this.forward()},n.forward=function(){this.index++,"\n"===this.previous()?(this.lineno++,this.colno=0):this.colno++},n.backN=function(t){for(var n=0;n<t;n++)this.back()},n.back=function(){if(this.index--,"\n"===this.current()){this.lineno--;var t=this.src.lastIndexOf("\n",this.index-1);this.colno=-1===t?this.index:this.index-t}else this.colno--},n.current=function(){return this.isFinished()?"":this.str.charAt(this.index)},n.currentStr=function(){return this.isFinished()?"":this.str.substr(this.index)},n.previous=function(){return this.str.charAt(this.index-1)},t}();t.exports={lex:function(t,n){return new c(t,n)},TOKEN_STRING:"string",TOKEN_WHITESPACE:"whitespace",TOKEN_DATA:"data",TOKEN_BLOCK_START:"block-start",TOKEN_BLOCK_END:"block-end",TOKEN_VARIABLE_START:"variable-start",TOKEN_VARIABLE_END:"variable-end",TOKEN_COMMENT:"comment",TOKEN_LEFT_PAREN:"left-paren",TOKEN_RIGHT_PAREN:"right-paren",TOKEN_LEFT_BRACKET:"left-bracket",TOKEN_RIGHT_BRACKET:"right-bracket",TOKEN_LEFT_CURLY:"left-curly",TOKEN_RIGHT_CURLY:"right-curly",TOKEN_OPERATOR:"operator",TOKEN_COMMA:"comma",TOKEN_COLON:"colon",TOKEN_TILDE:"tilde",TOKEN_PIPE:"pipe",TOKEN_INT:"int",TOKEN_FLOAT:"float",TOKEN_BOOLEAN:"boolean",TOKEN_NONE:"none",TOKEN_SYMBOL:"symbol",TOKEN_SPECIAL:"special",TOKEN_REGEX:"regex"}},function(t,n,i){"use strict";var r=i(6),e=i(18).PrecompiledLoader,s=function(t){var n,i;function r(n,i){var r;return(r=t.call(this)||this).baseURL=n||".",i=i||{},r.useCache=!!i.useCache,r.async=!!i.async,r}i=t,(n=r).prototype=Object.create(i.prototype),n.prototype.constructor=n,n.__proto__=i;var e=r.prototype;return e.resolve=function(t,n){throw Error("relative templates not support in the browser yet")},e.getSource=function(t,n){var i,r=this.useCache;return this.fetch(this.baseURL+"/"+t,function(e,s){if(e)if(n)n(e.content);else{if(404!==e.status)throw e.content;i=null}else i={src:s,path:t,noCache:!r},n&&n(null,i)}),i},e.fetch=function(t,n){if("undefined"==typeof window)throw Error("WebLoader can only by used in a browser");var i=new XMLHttpRequest,r=!0;i.onreadystatechange=function(){4===i.readyState&&r&&(r=!1,0===i.status||200===i.status?n(null,i.responseText):n({status:i.status,content:i.responseText}))},t+=(-1===t.indexOf("?")?"?":"&")+"s="+(new Date).getTime(),i.open("GET",t,this.async),i.send()},r}(r);t.exports={WebLoader:s,PrecompiledLoader:e}},function(t,n,i){"use strict";var r,e=i(0),s=i(7),o=s.Environment,u=s.Template,h=i(6),f=i(10),a=i(22),c=i(5),l=i(8),v=i(9),p=i(2),d=i(3),w=i(24);function m(t,n){var i;return n=n||{},e.isObject(t)&&(n=t,t=null),f.FileSystemLoader?i=new f.FileSystemLoader(t,{watch:n.watch,noCache:n.noCache}):f.WebLoader&&(i=new f.WebLoader(t,{useCache:n.web&&n.web.useCache,async:n.web&&n.web.async})),r=new o(i,n),n&&n.express&&r.express(n.express),r}t.exports={Environment:o,Template:u,Loader:h,FileSystemLoader:f.FileSystemLoader,PrecompiledLoader:f.PrecompiledLoader,WebLoader:f.WebLoader,compiler:c,parser:l,lexer:v,runtime:p,lib:e,nodes:d,installJinjaCompat:w,configure:m,reset:function(){r=void 0},compile:function(t,n,i,e){return r||m(),new u(t,n,i,e)},render:function(t,n,i){return r||m(),r.render(t,n,i)},renderString:function(t,n,i){return r||m(),r.renderString(t,n,i)},precompile:a?a.precompile:void 0,precompileString:a?a.precompileString:void 0}},function(t,n,i){"use strict";var r=i(13),e=[],s=[],o=r.makeRequestCallFromTimer(function(){if(s.length)throw s.shift()});function u(t){var n;(n=e.length?e.pop():new h).task=t,r(n)}function h(){this.task=null}t.exports=u,h.prototype.call=function(){try{this.task.call()}catch(t){u.onerror?u.onerror(t):(s.push(t),o())}finally{this.task=null,e[e.length]=this}}},function(t,n,i){"use strict";!function(n){function i(t){e.length||(r(),!0),e[e.length]=t}t.exports=i;var r,e=[],s=0,o=1024;function u(){for(;s<e.length;){var t=s;if(s+=1,e[t].call(),s>o){for(var n=0,i=e.length-s;n<i;n++)e[n]=e[n+s];e.length-=s,s=0}}e.length=0,s=0,!1}var h,f,a,c=void 0!==n?n:self,l=c.MutationObserver||c.WebKitMutationObserver;function v(t){return function(){var n=setTimeout(r,0),i=setInterval(r,50);function r(){clearTimeout(n),clearInterval(i),t()}}}"function"==typeof l?(h=1,f=new l(u),a=document.createTextNode(""),f.observe(a,{characterData:!0}),r=function(){h=-h,a.data=h}):r=v(u),i.requestFlush=r,i.makeRequestCallFromTimer=v}(i(14))},function(t,n){var i;i=function(){return this}();try{i=i||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(i=window)}t.exports=i},function(t,n,i){var r;!function(i){"use strict";var e=function(){var t=Array.prototype.slice.call(arguments);"function"==typeof t[0]&&t[0].apply(null,t.splice(1))},s=function(t){"function"==typeof setImmediate?setImmediate(t):"undefined"!=typeof process&&process.nextTick?process.nextTick(t):setTimeout(t,0)},o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},u=function(t,n,i){var r=i?s:e;if(n=n||function(){},!o(t))return n(Error("First argument to waterfall must be an array of functions"));if(!t.length)return n();var u=function(t){return function(i){if(i)n.apply(null,arguments),n=function(){};else{var e=Array.prototype.slice.call(arguments,1),s=t.next();s?e.push(u(s)):e.push(n),r(function(){t.apply(null,e)})}}};u(function(t){var n=function(i){var r=function(){return t.length&&t[i].apply(null,arguments),r.next()};return r.next=function(){return i<t.length-1?n(i+1):null},r};return n(0)}(t))()};void 0===(r=function(){return u}.apply(n,[]))||(t.exports=r)}()},function(t,n,i){"use strict";var r=i(3),e=i(0),s=0;function o(){return"hole_"+s++}function u(t,n){for(var i=null,r=0;r<t.length;r++){var e=n(t[r]);e!==t[r]&&(i||(i=t.slice()),i[r]=e)}return i||t}function h(t,n,i){if(!(t instanceof r.Node))return t;if(!i){var e=n(t);if(e&&e!==t)return e}if(t instanceof r.NodeList){var s=u(t.children,function(t){return h(t,n,i)});s!==t.children&&(t=new r[t.typename](t.lineno,t.colno,s))}else if(t instanceof r.CallExtension){var o=h(t.args,n,i),f=u(t.contentArgs,function(t){return h(t,n,i)});o===t.args&&f===t.contentArgs||(t=new r[t.typename](t.extName,t.prop,o,f))}else{var a=t.fields.map(function(n){return t[n]}),c=u(a,function(t){return h(t,n,i)});c!==a&&(t=new r[t.typename](t.lineno,t.colno),c.forEach(function(n,i){t[t.fields[i]]=n}))}return i&&n(t)||t}function f(t,n){return h(t,n,!0)}function a(t,n,i){var s=[],u=f(i?t[i]:t,function(t){var i;return t instanceof r.Block?t:((t instanceof r.Filter&&-1!==e.indexOf(n,t.name.value)||t instanceof r.CallExtensionAsync)&&(i=new r.Symbol(t.lineno,t.colno,o()),s.push(new r.FilterAsync(t.lineno,t.colno,t.name,t.args,i))),i)});return i?t[i]=u:t=u,s.length?(s.push(t),new r.NodeList(t.lineno,t.colno,s)):t}function c(t,n){return function(t){return f(t,function(t){if(t instanceof r.If||t instanceof r.For){var n=!1;if(h(t,function(t){if(t instanceof r.FilterAsync||t instanceof r.IfAsync||t instanceof r.AsyncEach||t instanceof r.AsyncAll||t instanceof r.CallExtensionAsync)return n=!0,t}),n){if(t instanceof r.If)return new r.IfAsync(t.lineno,t.colno,t.cond,t.body,t.else_);if(t instanceof r.For&&!(t instanceof r.AsyncAll))return new r.AsyncEach(t.lineno,t.colno,t.arr,t.name,t.body,t.else_)}}})}(function(t){return h(t,function(t){if(t instanceof r.Block){var n=!1,i=o();t.body=h(t.body,function(t){if(t instanceof r.FunCall&&"super"===t.name.value)return n=!0,new r.Symbol(t.lineno,t.colno,i)}),n&&t.body.children.unshift(new r.Super(0,0,t.name,new r.Symbol(0,0,i)))}})}(function(t,n){return f(t,function(t){return t instanceof r.Output?a(t,n):t instanceof r.Set?a(t,n,"value"):t instanceof r.For?a(t,n,"arr"):t instanceof r.If?a(t,n,"cond"):t instanceof r.CallExtension?a(t,n,"args"):void 0})}(t,n)))}t.exports={transform:function(t,n){return c(t,n||[])}}},function(t,n,i){"use strict";var r=i(0),e=i(2);function s(t,n){return null===t||void 0===t||!1===t?n:t}function o(t){return t!=t}function u(t){var n=(t=s(t,"")).toLowerCase();return e.copySafeness(t,n.charAt(0).toUpperCase()+n.slice(1))}function h(t){if(r.isString(t))return t.split("");if(r.isObject(t))return r.r(t||{}).map(function(t){return{key:t[0],value:t[1]}});if(r.isArray(t))return t;throw new r.TemplateError("list filter: type not iterable")}function f(t){return e.copySafeness(t,t.replace(/^\s*|\s*$/g,""))}(n=t.exports={}).abs=Math.abs,n.batch=function(t,n,i){var r,e=[],s=[];for(r=0;r<t.length;r++)r%n==0&&s.length&&(e.push(s),s=[]),s.push(t[r]);if(s.length){if(i)for(r=s.length;r<n;r++)s.push(i);e.push(s)}return e},n.capitalize=u,n.center=function(t,n){if(t=s(t,""),n=n||80,t.length>=n)return t;var i=n-t.length,o=r.repeat(" ",i/2-i%2),u=r.repeat(" ",i/2);return e.copySafeness(t,o+t+u)},n.default=function(t,n,i){return i?t||n:void 0!==t?t:n},n.dictsort=function(t,n,i){if(!r.isObject(t))throw new r.TemplateError("dictsort filter: val must be an object");var e,s=[];for(var o in t)s.push([o,t[o]]);if(void 0===i||"key"===i)e=0;else{if("value"!==i)throw new r.TemplateError("dictsort filter: You can only sort by either key or value");e=1}return s.sort(function(t,i){var s=t[e],o=i[e];return n||(r.isString(s)&&(s=s.toUpperCase()),r.isString(o)&&(o=o.toUpperCase())),s>o?1:s===o?0:-1}),s},n.dump=function(t,n){return JSON.stringify(t,null,n)},n.escape=function(t){return t instanceof e.SafeString?t:(t=null===t||void 0===t?"":t,e.markSafe(r.escape(t.toString())))},n.safe=function(t){return t instanceof e.SafeString?t:(t=null===t||void 0===t?"":t,e.markSafe(t.toString()))},n.first=function(t){return t[0]},n.forceescape=function(t){return t=null===t||void 0===t?"":t,e.markSafe(r.escape(t.toString()))},n.groupby=function(t,n){return r.groupBy(t,n)},n.indent=function(t,n,i){if(""===(t=s(t,"")))return"";n=n||4;var o=t.split("\n"),u=r.repeat(" ",n),h=o.map(function(t,n){return 0!==n||i?""+u+t+"\n":t+"\n"}).join("");return e.copySafeness(t,h)},n.join=function(t,n,i){return n=n||"",i&&(t=r.map(t,function(t){return t[i]})),t.join(n)},n.last=function(t){return t[t.length-1]},n.length=function(t){var n=s(t,"");return void 0!==n?"function"==typeof Map&&n instanceof Map||"function"==typeof Set&&n instanceof Set?n.size:!r.isObject(n)||n instanceof e.SafeString?n.length:r.keys(n).length:0},n.list=h,n.lower=function(t){return(t=s(t,"")).toLowerCase()},n.nl2br=function(t){return null===t||void 0===t?"":e.copySafeness(t,t.replace(/\r\n|\n/g,"<br />\n"))},n.random=function(t){return t[Math.floor(Math.random()*t.length)]},n.rejectattr=function(t,n){return t.filter(function(t){return!t[n]})},n.selectattr=function(t,n){return t.filter(function(t){return!!t[n]})},n.replace=function(t,n,i,r){var s=t;if(n instanceof RegExp)return t.replace(n,i);void 0===r&&(r=-1);var o="";if("number"==typeof n)n=""+n;else if("string"!=typeof n)return t;if("number"==typeof t&&(t=""+t),"string"!=typeof t&&!(t instanceof e.SafeString))return t;if(""===n)return o=i+t.split("").join(i)+i,e.copySafeness(t,o);var u=t.indexOf(n);if(0===r||-1===u)return t;for(var h=0,f=0;u>-1&&(-1===r||f<r);)o+=t.substring(h,u)+i,h=u+n.length,f++,u=t.indexOf(n,h);return h<t.length&&(o+=t.substring(h)),e.copySafeness(s,o)},n.reverse=function(t){var n;return(n=r.isString(t)?h(t):r.map(t,function(t){return t})).reverse(),r.isString(t)?e.copySafeness(t,n.join("")):n},n.round=function(t,n,i){var r=Math.pow(10,n=n||0);return("ceil"===i?Math.ceil:"floor"===i?Math.floor:Math.round)(t*r)/r},n.slice=function(t,n,i){for(var r=Math.floor(t.length/n),e=t.length%n,s=[],o=0,u=0;u<n;u++){var h=o+u*r;u<e&&o++;var f=o+(u+1)*r,a=t.slice(h,f);i&&u>=e&&a.push(i),s.push(a)}return s},n.sum=function(t,n,i){return void 0===i&&(i=0),n&&(t=r.map(t,function(t){return t[n]})),i+t.reduce(function(t,n){return t+n},0)},n.sort=e.makeMacro(["value","reverse","case_sensitive","attribute"],[],function(t,n,i,e){var s=r.map(t,function(t){return t});return s.sort(function(t,s){var o=e?t[e]:t,u=e?s[e]:s;return!i&&r.isString(o)&&r.isString(u)&&(o=o.toLowerCase(),u=u.toLowerCase()),o<u?n?1:-1:o>u?n?-1:1:0}),s}),n.string=function(t){return e.copySafeness(t,t)},n.striptags=function(t,n){var i=f((t=s(t,"")).replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi,"")),r="";return r=n?i.replace(/^ +| +$/gm,"").replace(/ +/g," ").replace(/(\r\n)/g,"\n").replace(/\n\n\n+/g,"\n\n"):i.replace(/\s+/gi," "),e.copySafeness(t,r)},n.title=function(t){var n=(t=s(t,"")).split(" ").map(function(t){return u(t)});return e.copySafeness(t,n.join(" "))},n.trim=f,n.truncate=function(t,n,i,r){var o=t;if(t=s(t,""),n=n||255,t.length<=n)return t;if(i)t=t.substring(0,n);else{var u=t.lastIndexOf(" ",n);-1===u&&(u=n),t=t.substring(0,u)}return t+=void 0!==r&&null!==r?r:"...",e.copySafeness(o,t)},n.upper=function(t){return(t=s(t,"")).toUpperCase()},n.urlencode=function(t){var n=encodeURIComponent;return r.isString(t)?n(t):(r.isArray(t)?t:r.r(t)).map(function(t){var i=t[0],r=t[1];return n(i)+"="+n(r)}).join("&")};var a=/^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/,c=/^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i,l=/^https?:\/\/.*$/,v=/^www\./,p=/\.(?:org|net|com)(?:\:|\/|$)/;n.urlize=function(t,n,i){o(n)&&(n=1/0);var r=!0===i?' rel="nofollow"':"";return t.split(/(\s+)/).filter(function(t){return t&&t.length}).map(function(t){var i=t.match(a),e=i?i[1]:t,s=e.substr(0,n);return l.test(e)?'<a href="'+e+'"'+r+">"+s+"</a>":v.test(e)?'<a href="http://'+e+'"'+r+">"+s+"</a>":c.test(e)?'<a href="mailto:'+e+'">'+e+"</a>":p.test(e)?'<a href="http://'+e+'"'+r+">"+s+"</a>":t}).join("")},n.wordcount=function(t){var n=(t=s(t,""))?t.match(/\w+/g):null;return n?n.length:null},n.float=function(t,n){var i=parseFloat(t);return o(i)?n:i},n.int=function(t,n){var i=parseInt(t,10);return o(i)?n:i},n.d=n.default,n.e=n.escape},function(t,n,i){"use strict";var r=function(t){var n,i;function r(n){var i;return(i=t.call(this)||this).precompiled=n||{},i}return i=t,(n=r).prototype=Object.create(i.prototype),n.prototype.constructor=n,n.__proto__=i,r.prototype.getSource=function(t){return this.precompiled[t]?{src:{type:"code",obj:this.precompiled[t]},path:t}:null},r}(i(6));t.exports={PrecompiledLoader:r}},function(t,n,i){"use strict";var r=i(2).SafeString;n.callable=function(t){return"function"==typeof t},n.defined=function(t){return void 0!==t},n.divisibleby=function(t,n){return t%n==0},n.escaped=function(t){return t instanceof r},n.equalto=function(t,n){return t===n},n.eq=n.equalto,n.sameas=n.equalto,n.even=function(t){return t%2==0},n.falsy=function(t){return!t},n.ge=function(t,n){return t>=n},n.greaterthan=function(t,n){return t>n},n.gt=n.greaterthan,n.le=function(t,n){return t<=n},n.lessthan=function(t,n){return t<n},n.lt=n.lessthan,n.lower=function(t){return t.toLowerCase()===t},n.ne=function(t,n){return t!==n},n.null=function(t){return null===t},n.number=function(t){return"number"==typeof t},n.odd=function(t){return t%2==1},n.string=function(t){return"string"==typeof t},n.truthy=function(t){return!!t},n.undefined=function(t){return void 0===t},n.upper=function(t){return t.toUpperCase()===t},n.iterable=function(t){return"undefined"!=typeof Symbol?!!t[Symbol.iterator]:Array.isArray(t)||"string"==typeof t},n.mapping=function(t){var n=null!==t&&void 0!==t&&"object"==typeof t&&!Array.isArray(t);return Set?n&&!(t instanceof Set):n}},function(t,n,i){"use strict";t.exports=function(){return{range:function(t,n,i){void 0===n?(n=t,t=0,i=1):i||(i=1);var r=[];if(i>0)for(var e=t;e<n;e+=i)r.push(e);else for(var s=t;s>n;s+=i)r.push(s);return r},cycler:function(){return t=Array.prototype.slice.call(arguments),n=-1,{current:null,reset:function(){n=-1,this.current=null},next:function(){return++n>=t.length&&(n=0),this.current=t[n],this.current}};var t,n},joiner:function(t){return function(t){t=t||",";var n=!0;return function(){var i=n?"":t;return n=!1,i}}(t)}}}},function(t,n,i){var r=i(4);t.exports=function(t,n){function i(t,n){if(this.name=t,this.path=t,this.defaultEngine=n.defaultEngine,this.ext=r.extname(t),!this.ext&&!this.defaultEngine)throw Error("No default engine was specified and no extension was provided.");this.ext||(this.name+=this.ext=("."!==this.defaultEngine[0]?".":"")+this.defaultEngine)}return i.prototype.render=function(n,i){t.render(this.name,n,i)},n.set("view",i),n.set("nunjucksEnv",t),t}},function(t,n,i){"use strict";var r=i(4),e=i(4),s=i(0).t,o=i(5),u=i(7).Environment,h=i(23);function f(t,n){return!!Array.isArray(n)&&n.some(function(n){return t.match(n)})}function a(t,n){(n=n||{}).isString=!0;var i=n.env||new u([]),r=n.wrapper||h;if(!n.name)throw Error('the "name" option is required when compiling a string');return r([c(t,n.name,i)],n)}function c(t,n,i){var r,e=(i=i||new u([])).asyncFilters,h=i.extensionsList;n=n.replace(/\\/g,"/");try{r=o.compile(t,e,h,n,i.opts)}catch(t){throw s(n,!1,t)}return{name:n,template:r}}t.exports={precompile:function(t,n){var i=(n=n||{}).env||new u([]),s=n.wrapper||h;if(n.isString)return a(t,n);var o=r.existsSync(t)&&r.statSync(t),l=[],v=[];if(o.isFile())l.push(c(r.readFileSync(t,"utf-8"),n.name||t,i));else if(o.isDirectory()){!function i(s){r.readdirSync(s).forEach(function(o){var u=e.join(s,o),h=u.substr(e.join(t,"/").length),a=r.statSync(u);a&&a.isDirectory()?f(h+="/",n.exclude)||i(u):f(h,n.include)&&v.push(u)})}(t);for(var p=0;p<v.length;p++){var d=v[p].replace(e.join(t,"/"),"");try{l.push(c(r.readFileSync(v[p],"utf-8"),d,i))}catch(t){if(!n.force)throw t;console.error(t)}}}return s(l,n)},precompileString:a}},function(t,n,i){"use strict";t.exports=function(t,n){var i="";n=n||{};for(var r=0;r<t.length;r++){var e=JSON.stringify(t[r].name);i+="(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["+e+"] = (function() {\n"+t[r].template+"\n})();\n",n.asFunction&&(i+="return function(ctx, cb) { return nunjucks.render("+e+", ctx, cb); }\n"),i+="})();\n"}return i}},function(t,n,i){t.exports=function(){"use strict";var t,n,i=this.runtime,r=this.lib,e=this.compiler.Compiler,s=this.parser.Parser,o=this.nodes,u=this.lexer,h=i.contextOrFrameLookup,f=i.memberLookup;function a(t){return{index:t.index,lineno:t.lineno,colno:t.colno}}if(e&&(t=e.prototype.assertType),s&&(n=s.prototype.parseAggregate),i.contextOrFrameLookup=function(t,n,i){var r=h.apply(this,arguments);if(void 0!==r)return r;switch(i){case"True":return!0;case"False":return!1;case"None":return null;default:return}},o&&e&&s){var c=o.Node.extend("Slice",{fields:["start","stop","step"],init:function(t,n,i,r,e){i=i||new o.Literal(t,n,null),r=r||new o.Literal(t,n,null),e=e||new o.Literal(t,n,1),this.parent(t,n,i,r,e)}});e.prototype.assertType=function(n){n instanceof c||t.apply(this,arguments)},e.prototype.compileSlice=function(t,n){this.w("("),this.C(t.start,n),this.w("),("),this.C(t.stop,n),this.w("),("),this.C(t.step,n),this.w(")")},s.prototype.parseAggregate=function(){var t=this,i=a(this.tokens);i.colno--,i.index--;try{return n.apply(this)}catch(n){var e=a(this.tokens),s=function(){return r.h(t.tokens,e),n};r.h(this.tokens,i),this.peeked=!1;var h=this.peekToken();if(h.type!==u.TOKEN_LEFT_BRACKET)throw s();this.nextToken();for(var f=new c(h.lineno,h.colno),l=!1,v=0;v<=f.fields.length&&!this.skip(u.TOKEN_RIGHT_BRACKET);v++){if(v===f.fields.length){if(!l)break;this.fail("parseSlice: too many slice components",h.lineno,h.colno)}this.skip(u.TOKEN_COLON)?l=!0:(f[f.fields[v]]=this.parseExpression(),l=this.skip(u.TOKEN_COLON)||l)}if(!l)throw s();return new o.Array(h.lineno,h.colno,[f])}}}function l(t,n){return Object.prototype.hasOwnProperty.call(t,n)}var v={pop:function(t){if(void 0===t)return this.pop();if(t>=this.length||t<0)throw Error("KeyError");return this.splice(t,1)},append:function(t){return this.push(t)},remove:function(t){for(var n=0;n<this.length;n++)if(this[n]===t)return this.splice(n,1);throw Error("ValueError")},count:function(t){for(var n=0,i=0;i<this.length;i++)this[i]===t&&n++;return n},index:function(t){var n;if(-1===(n=this.indexOf(t)))throw Error("ValueError");return n},find:function(t){return this.indexOf(t)},insert:function(t,n){return this.splice(t,0,n)}},p={items:function(){return r.r(this)},values:function(){return r.u(this)},keys:function(){return r.keys(this)},get:function(t,n){var i=this[t];return void 0===i&&(i=n),i},has_key:function(t){return l(this,t)},pop:function(t,n){var i=this[t];if(void 0===i&&void 0!==n)i=n;else{if(void 0===i)throw Error("KeyError");delete this[t]}return i},popitem:function(){var t=r.keys(this);if(!t.length)throw Error("KeyError");var n=t[0],i=this[n];return delete this[n],[n,i]},setdefault:function(t,n){return void 0===n&&(n=null),t in this||(this[t]=n),this[t]},update:function(t){return r.h(this,t),null}};return p.iteritems=p.items,p.itervalues=p.values,p.iterkeys=p.keys,i.memberLookup=function(t,n,e){return 4===arguments.length?function(t,n,r,e){t=t||[],null===n&&(n=e<0?t.length-1:0),null===r?r=e<0?-1:t.length:r<0&&(r+=t.length),n<0&&(n+=t.length);for(var s=[],o=n;!(o<0||o>t.length||e>0&&o>=r||e<0&&o<=r);o+=e)s.push(i.memberLookup(t,o));return s}.apply(this,arguments):(t=t||{},r.isArray(t)&&l(v,n)?v[n].bind(t):r.isObject(t)&&l(p,n)?p[n].bind(t):f.apply(this,arguments))},function(){i.contextOrFrameLookup=h,i.memberLookup=f,e&&(e.prototype.assertType=t),s&&(s.prototype.parseAggregate=n)}}}])});
   //# sourceMappingURL=nunjucks.min.js.map
   /**
   * jquery-match-height master by @liabru
   * http://brm.io/jquery-match-height/
   * License: MIT
   */
   
   ;(function(factory) { // eslint-disable-line no-extra-semi
       'use strict';
       if (typeof define === 'function' && define.amd) {
           // AMD
           define(['jquery'], factory);
       } else if (typeof module !== 'undefined' && module.exports) {
           // CommonJS
           module.exports = factory(require('jquery'));
       } else {
           // Global
           factory(jQuery);
       }
   })(function($) {
       /*
       *  internal
       */
   
       var _previousResizeWidth = -1,
           _updateTimeout = -1;
   
       /*
       *  _parse
       *  value parse utility function
       */
   
       var _parse = function(value) {
           // parse value and convert NaN to 0
           return parseFloat(value) || 0;
       };
   
       /*
       *  _rows
       *  utility function returns array of jQuery selections representing each row
       *  (as displayed after float wrapping applied by browser)
       */
   
       var _rows = function(elements) {
           var tolerance = 1,
               $elements = $(elements),
               lastTop = null,
               rows = [];
   
           // group elements by their top position
           $elements.each(function(){
               var $that = $(this),
                   top = $that.offset().top - _parse($that.css('margin-top')),
                   lastRow = rows.length > 0 ? rows[rows.length - 1] : null;
   
               if (lastRow === null) {
                   // first item on the row, so just push it
                   rows.push($that);
               } else {
                   // if the row top is the same, add to the row group
                   if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                       rows[rows.length - 1] = lastRow.add($that);
                   } else {
                       // otherwise start a new row group
                       rows.push($that);
                   }
               }
   
               // keep track of the last row top
               lastTop = top;
           });
   
           return rows;
       };
   
       /*
       *  _parseOptions
       *  handle plugin options
       */
   
       var _parseOptions = function(options) {
           var opts = {
               byRow: true,
               property: 'height',
               target: null,
               remove: false
           };
   
           if (typeof options === 'object') {
               return $.extend(opts, options);
           }
   
           if (typeof options === 'boolean') {
               opts.byRow = options;
           } else if (options === 'remove') {
               opts.remove = true;
           }
   
           return opts;
       };
   
       /*
       *  matchHeight
       *  plugin definition
       */
   
       var matchHeight = $.fn.matchHeight = function(options) {
           var opts = _parseOptions(options);
   
           // handle remove
           if (opts.remove) {
               var that = this;
   
               // remove fixed height from all selected elements
               this.css(opts.property, '');
   
               // remove selected elements from all groups
               $.each(matchHeight._groups, function(key, group) {
                   group.elements = group.elements.not(that);
               });
   
               // TODO: cleanup empty groups
   
               return this;
           }
   
           if (this.length <= 1 && !opts.target) {
               return this;
           }
   
           // keep track of this group so we can re-apply later on load and resize events
           matchHeight._groups.push({
               elements: this,
               options: opts
           });
   
           // match each element's height to the tallest element in the selection
           matchHeight._apply(this, opts);
   
           return this;
       };
   
       /*
       *  plugin global options
       */
   
       matchHeight.version = 'master';
       matchHeight._groups = [];
       matchHeight._throttle = 80;
       matchHeight._maintainScroll = false;
       matchHeight._beforeUpdate = null;
       matchHeight._afterUpdate = null;
       matchHeight._rows = _rows;
       matchHeight._parse = _parse;
       matchHeight._parseOptions = _parseOptions;
   
       /*
       *  matchHeight._apply
       *  apply matchHeight to given elements
       */
   
       matchHeight._apply = function(elements, options) {
           var opts = _parseOptions(options),
               $elements = $(elements),
               rows = [$elements];
   
           // take note of scroll position
           var scrollTop = $(window).scrollTop(),
               htmlHeight = $('html').outerHeight(true);
   
           // get hidden parents
           var $hiddenParents = $elements.parents().filter(':hidden');
   
           // cache the original inline style
           $hiddenParents.each(function() {
               var $that = $(this);
               $that.data('style-cache', $that.attr('style'));
           });
   
           // temporarily must force hidden parents visible
           $hiddenParents.css('display', 'block');
   
           // get rows if using byRow, otherwise assume one row
           if (opts.byRow && !opts.target) {
   
               // must first force an arbitrary equal height so floating elements break evenly
               $elements.each(function() {
                   var $that = $(this),
                       display = $that.css('display');
   
                   // temporarily force a usable display value
                   if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                       display = 'block';
                   }
   
                   // cache the original inline style
                   $that.data('style-cache', $that.attr('style'));
   
                   $that.css({
                       'display': display,
                       'padding-top': '0',
                       'padding-bottom': '0',
                       'margin-top': '0',
                       'margin-bottom': '0',
                       'border-top-width': '0',
                       'border-bottom-width': '0',
                       'height': '100px',
                       'overflow': 'hidden'
                   });
               });
   
               // get the array of rows (based on element top position)
               rows = _rows($elements);
   
               // revert original inline styles
               $elements.each(function() {
                   var $that = $(this);
                   $that.attr('style', $that.data('style-cache') || '');
               });
           }
   
           $.each(rows, function(key, row) {
               var $row = $(row),
                   targetHeight = 0;
   
               if (!opts.target) {
                   // skip apply to rows with only one item
                   if (opts.byRow && $row.length <= 1) {
                       $row.css(opts.property, '');
                       return;
                   }
   
                   // iterate the row and find the max height
                   $row.each(function(){
                       var $that = $(this),
                           style = $that.attr('style'),
                           display = $that.css('display');
   
                       // temporarily force a usable display value
                       if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                           display = 'block';
                       }
   
                       // ensure we get the correct actual height (and not a previously set height value)
                       var css = { 'display': display };
                       css[opts.property] = '';
                       $that.css(css);
   
                       // find the max height (including padding, but not margin)
                       if ($that.outerHeight(false) > targetHeight) {
                           targetHeight = $that.outerHeight(false);
                       }
   
                       // revert styles
                       if (style) {
                           $that.attr('style', style);
                       } else {
                           $that.css('display', '');
                       }
                   });
               } else {
                   // if target set, use the height of the target element
                   targetHeight = opts.target.outerHeight(false);
               }
   
               // iterate the row and apply the height to all elements
               $row.each(function(){
                   var $that = $(this),
                       verticalPadding = 0;
   
                   // don't apply to a target
                   if (opts.target && $that.is(opts.target)) {
                       return;
                   }
   
                   // handle padding and border correctly (required when not using border-box)
                   if ($that.css('box-sizing') !== 'border-box') {
                       verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
                       verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
                   }
   
                   // set the height (accounting for padding and border)
                   $that.css(opts.property, (targetHeight - verticalPadding) + 'px');
               });
           });
   
           // revert hidden parents
           $hiddenParents.each(function() {
               var $that = $(this);
               $that.attr('style', $that.data('style-cache') || null);
           });
   
           // restore scroll position if enabled
           if (matchHeight._maintainScroll) {
               $(window).scrollTop((scrollTop / htmlHeight) * $('html').outerHeight(true));
           }
   
           return this;
       };
   
       /*
       *  matchHeight._applyDataApi
       *  applies matchHeight to all elements with a data-match-height attribute
       */
   
       matchHeight._applyDataApi = function() {
           var groups = {};
   
           // generate groups by their groupId set by elements using data-match-height
           $('[data-match-height], [data-mh]').each(function() {
               var $this = $(this),
                   groupId = $this.attr('data-mh') || $this.attr('data-match-height');
   
               if (groupId in groups) {
                   groups[groupId] = groups[groupId].add($this);
               } else {
                   groups[groupId] = $this;
               }
           });
   
           // apply matchHeight to each group
           $.each(groups, function() {
               this.matchHeight(true);
           });
       };
   
       /*
       *  matchHeight._update
       *  updates matchHeight on all current groups with their correct options
       */
   
       var _update = function(event) {
           if (matchHeight._beforeUpdate) {
               matchHeight._beforeUpdate(event, matchHeight._groups);
           }
   
           $.each(matchHeight._groups, function() {
               matchHeight._apply(this.elements, this.options);
           });
   
           if (matchHeight._afterUpdate) {
               matchHeight._afterUpdate(event, matchHeight._groups);
           }
       };
   
       matchHeight._update = function(throttle, event) {
           // prevent update if fired from a resize event
           // where the viewport width hasn't actually changed
           // fixes an event looping bug in IE8
           if (event && event.type === 'resize') {
               var windowWidth = $(window).width();
               if (windowWidth === _previousResizeWidth) {
                   return;
               }
               _previousResizeWidth = windowWidth;
           }
   
           // throttle updates
           if (!throttle) {
               _update(event);
           } else if (_updateTimeout === -1) {
               _updateTimeout = setTimeout(function() {
                   _update(event);
                   _updateTimeout = -1;
               }, matchHeight._throttle);
           }
       };
   
       /*
       *  bind events
       */
   
       // apply on DOM ready event
       $(matchHeight._applyDataApi);
   
       // use on or bind where supported
       var on = $.fn.on ? 'on' : 'bind';
   
       // update heights on load and resize events
       $(window)[on]('load', function(event) {
           matchHeight._update(false, event);
       });
   
       // throttled update heights on resize events
       $(window)[on]('resize orientationchange', function(event) {
           matchHeight._update(true, event);
       });
   
   });
   
   /**
    * Display a nice easy to use multiselect list
    * @Version: 2.4.17
    * @Author: Patrick Springstubbe
    * @Contact: @JediNobleclem
    * @Website: springstubbe.us
    * @Source: https://github.com/nobleclem/jQuery-MultiSelect
    *
    * Usage:
    *     $('select[multiple]').multiselect();
    *     $('select[multiple]').multiselect({ texts: { placeholder: 'Select options' } });
    *     $('select[multiple]').multiselect('reload');
    *     $('select[multiple]').multiselect( 'loadOptions', [{
    *         name   : 'Option Name 1',
    *         value  : 'option-value-1',
    *         checked: false,
    *         attributes : {
    *             custom1: 'value1',
    *             custom2: 'value2'
    *         }
    *     },{
    *         name   : 'Option Name 2',
    *         value  : 'option-value-2',
    *         checked: false,
    *         attributes : {
    *             custom1: 'value1',
    *             custom2: 'value2'
    *         }
    *     }]);
    *
    **/
   (function($){
       var defaults = {
           columns: 1,     // how many columns should be use to show options
           search : false, // include option search box
   
           // search filter options
           searchOptions : {
               delay        : 250,                  // time (in ms) between keystrokes until search happens
               showOptGroups: false,                // show option group titles if no options remaining
               searchText   : true,                 // search within the text
               searchValue  : false,                // search within the value
               onSearch     : function( element ){} // fires on keyup before search on options happens
           },
   
           // plugin texts
           texts: {
               placeholder    : 'Select options', // text to use in dummy input
               search         : 'Search',         // search input placeholder text
               selectedOptions: ' selected',      // selected suffix text
               selectAll      : 'Select all',     // select all text
               unselectAll    : 'Unselect all',   // unselect all text
               noneSelected   : 'None Selected'   // None selected text
           },
   
           // general options
           selectAll          : false, // add select all option
           selectGroup        : false, // select entire optgroup
           minHeight          : 200,   // minimum height of option overlay
           maxHeight          : null,  // maximum height of option overlay
           maxWidth           : null,  // maximum width of option overlay (or selector)
           maxPlaceholderWidth: null,  // maximum width of placeholder button
           maxPlaceholderOpts : 10,    // maximum number of placeholder options to show until "# selected" shown instead
           showCheckbox       : true,  // display the checkbox to the user
           checkboxAutoFit    : false,  // auto calc checkbox padding
           optionAttributes   : [],    // attributes to copy to the checkbox from the option element
   
           // Callbacks
           onLoad        : function( element ){},           // fires at end of list initialization
           onOptionClick : function( element, option ){},   // fires when an option is clicked
           onControlClose: function( element ){},           // fires when the options list is closed
           onSelectAll   : function( element, selected ){}, // fires when (un)select all is clicked
           onPlaceholder : function( element, placeholder, selectedOpts ){}, // fires when the placeholder txt is updated
       };
   
       var msCounter    = 1; // counter for each select list
       var msOptCounter = 1; // counter for each option on page
   
       // FOR LEGACY BROWSERS (talking to you IE8)
       if( typeof Array.prototype.map !== 'function' ) {
           Array.prototype.map = function( callback, thisArg ) {
               if( typeof thisArg === 'undefined' ) {
                   thisArg = this;
               }
   
               return $.isArray( thisArg ) ? $.map( thisArg, callback ) : [];
           };
       }
       if( typeof String.prototype.trim !== 'function' ) {
           String.prototype.trim = function() {
               return this.replace(/^\s+|\s+$/g, '');
           };
       }
   
       function MultiSelect( element, options )
       {
           this.element           = element;
           this.options           = $.extend( true, {}, defaults, options );
           this.updateSelectAll   = true;
           this.updatePlaceholder = true;
           this.listNumber        = msCounter;
   
           msCounter = msCounter + 1; // increment counter
   
           /* Make sure its a multiselect list */
           if( !$(this.element).attr('multiple') ) {
               throw new Error( '[jQuery-MultiSelect] Select list must be a multiselect list in order to use this plugin' );
           }
   
           /* Options validation checks */
           if( this.options.search ){
               if( !this.options.searchOptions.searchText && !this.options.searchOptions.searchValue ){
                   throw new Error( '[jQuery-MultiSelect] Either searchText or searchValue should be true.' );
               }
           }
   
           /** BACKWARDS COMPATIBILITY **/
           if( 'placeholder' in this.options ) {
               this.options.texts.placeholder = this.options.placeholder;
               delete this.options.placeholder;
           }
           if( 'default' in this.options.searchOptions ) {
               this.options.texts.search = this.options.searchOptions['default'];
               delete this.options.searchOptions['default'];
           }
           /** END BACKWARDS COMPATIBILITY **/
   
           // load this instance
           this.load();
       }
   
       MultiSelect.prototype = {
           /* LOAD CUSTOM MULTISELECT DOM/ACTIONS */
           load: function() {
               var instance = this;
   
               // make sure this is a select list and not loaded
               if( (instance.element.nodeName != 'SELECT') || $(instance.element).hasClass('jqmsLoaded') ) {
                   return true;
               }
   
               // sanity check so we don't double load on a select element
               $(instance.element).addClass('jqmsLoaded ms-list-'+ instance.listNumber ).data( 'plugin_multiselect-instance', instance );
   
               // add option container
               $(instance.element).after('<div id="ms-list-'+ instance.listNumber +'" class="ms-options-wrap"><button type="button"><span>None Selected</span></button><div class="ms-options"><ul></ul></div></div>');
   
               var placeholder = $(instance.element).siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> button:first-child');
               var optionsWrap = $(instance.element).siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> .ms-options');
               var optionsList = optionsWrap.find('> ul');
   
               // don't show checkbox (add class for css to hide checkboxes)
               if( !instance.options.showCheckbox ) {
                   optionsWrap.addClass('hide-checkbox');
               }
               else if( instance.options.checkboxAutoFit ) {
                   optionsWrap.addClass('checkbox-autofit');
               }
   
               // check if list is disabled
               if( $(instance.element).prop( 'disabled' ) ) {
                   placeholder.prop( 'disabled', true );
               }
   
               // set placeholder maxWidth
               if( instance.options.maxPlaceholderWidth ) {
                   placeholder.css( 'maxWidth', instance.options.maxPlaceholderWidth );
               }
   
               // override with user defined maxHeight
               if( instance.options.maxHeight ) {
                   var maxHeight = instance.options.maxHeight;
               }
               else {
                   // cacl default maxHeight
                   var maxHeight = ($(window).height() - optionsWrap.offset().top + $(window).scrollTop() - 20);
               }
   
               // maxHeight cannot be less than options.minHeight
               maxHeight = maxHeight < instance.options.minHeight ? instance.options.minHeight : maxHeight;
   
               optionsWrap.css({
                   maxWidth : instance.options.maxWidth,
                   minHeight: instance.options.minHeight,
                   maxHeight: maxHeight,
               });
   
               // isolate options scroll
               // @source: https://github.com/nobleclem/jQuery-IsolatedScroll
               optionsWrap.on( 'touchmove mousewheel DOMMouseScroll', function ( e ) {
                   if( ($(this).outerHeight() < $(this)[0].scrollHeight) ) {
                       var e0 = e.originalEvent,
                           delta = e0.wheelDelta || -e0.detail;
   
                       if( ($(this).outerHeight() + $(this)[0].scrollTop) > $(this)[0].scrollHeight ) {
                           e.preventDefault();
                           this.scrollTop += ( delta < 0 ? 1 : -1 );
                       }
                   }
               });
   
               // hide options menus if click happens off of the list placeholder button
               $(document).off('click.ms-hideopts').on('click.ms-hideopts', function( event ){
                   if( !$(event.target).closest('.ms-options-wrap').length ) {
                       $('.ms-options-wrap.ms-active > .ms-options').each(function(){
                           $(this).closest('.ms-options-wrap').removeClass('ms-active');
   
                           var listID = $(this).closest('.ms-options-wrap').attr('id');
   
                           var thisInst = $(this).parent().siblings('.'+ listID +'.jqmsLoaded').data('plugin_multiselect-instance');
   
                           // USER CALLBACK
                           if( typeof thisInst.options.onControlClose == 'function' ) {
                               thisInst.options.onControlClose( thisInst.element );
                           }
                       });
                   }
               // hide open option lists if escape key pressed
               }).on('keydown', function( event ){
                   if( (event.keyCode || event.which) == 27 ) { // esc key
                       $(this).trigger('click.ms-hideopts');
                   }
               });
   
               // handle pressing enter|space while tabbing through
               placeholder.on('keydown', function( event ){
                   var code = (event.keyCode || event.which);
                   if( (code == 13) || (code == 32) ) { // enter OR space
                       placeholder.trigger( 'mousedown' );
                   }
               });
   
               // disable button action
               placeholder.on( 'mousedown', function( event ){
                   // ignore if its not a left click
                   if( event.which && (event.which != 1) ) {
                       return true;
                   }
   
                   // hide other menus before showing this one
                   $('.ms-options-wrap.ms-active').each(function(){
                       if( $(this).siblings( '.'+ $(this).attr('id') +'.jqmsLoaded')[0] != optionsWrap.parent().siblings('.ms-list-'+ instance.listNumber +'.jqmsLoaded')[0] ) {
                           $(this).removeClass('ms-active');
   
                           var thisInst = $(this).siblings( '.'+ $(this).attr('id') +'.jqmsLoaded').data('plugin_multiselect-instance');
   
                           // USER CALLBACK
                           if( typeof thisInst.options.onControlClose == 'function' ) {
                               thisInst.options.onControlClose( thisInst.element );
                           }
                       }
                   });
   
                   // show/hide options
                   optionsWrap.closest('.ms-options-wrap').toggleClass('ms-active');
   
                   // recalculate height
                   if( optionsWrap.closest('.ms-options-wrap').hasClass('ms-active') ) {
                       optionsWrap.css( 'maxHeight', '' );
   
                       // override with user defined maxHeight
                       if( instance.options.maxHeight ) {
                           var maxHeight = instance.options.maxHeight;
                       }
                       else {
                           // cacl default maxHeight
                           var maxHeight = ($(window).height() - optionsWrap.offset().top + $(window).scrollTop() - 20);
                       }
   
                       if( maxHeight ) {
                           // maxHeight cannot be less than options.minHeight
                           maxHeight = maxHeight < instance.options.minHeight ? instance.options.minHeight : maxHeight;
   
                           optionsWrap.css( 'maxHeight', maxHeight );
                       }
                   }
                   else if( typeof instance.options.onControlClose == 'function' ) {
                       instance.options.onControlClose( instance.element );
                   }
               }).click(function( event ){ event.preventDefault(); });
   
               // add placeholder copy
               if( instance.options.texts.placeholder ) {
                   placeholder.find('span').text( instance.options.texts.placeholder );
               }
   
               // add search box
               if( instance.options.search ) {
                   optionsList.before('<div class="ms-search"><input type="text" value="" placeholder="'+ instance.options.texts.search +'" /></div>');
   
                   var search = optionsWrap.find('.ms-search input');
                   search.on('keyup', function(){
                       // ignore keystrokes that don't make a difference
                       if( $(this).data('lastsearch') == $(this).val() ) {
                           return true;
                       }
   
                       // pause timeout
                       if( $(this).data('searchTimeout') ) {
                           clearTimeout( $(this).data('searchTimeout') );
                       }
   
                       var thisSearchElem = $(this);
   
                       $(this).data('searchTimeout', setTimeout(function(){
                           thisSearchElem.data('lastsearch', thisSearchElem.val() );
   
                           // USER CALLBACK
                           if( typeof instance.options.searchOptions.onSearch == 'function' ) {
                               instance.options.searchOptions.onSearch( instance.element );
                           }
   
                           // search non optgroup li's
                           var searchString = $.trim( search.val().toLowerCase() );
                           if( searchString ) {
                               optionsList.find('li[data-search-term*="'+ searchString +'"]:not(.optgroup)').removeClass('ms-hidden');
                               optionsList.find('li:not([data-search-term*="'+ searchString +'"], .optgroup)').addClass('ms-hidden');
                           }
                           else {
                               optionsList.find('.ms-hidden').removeClass('ms-hidden');
                           }
   
                           // show/hide optgroups based on if there are items visible within
                           if( !instance.options.searchOptions.showOptGroups ) {
                               optionsList.find('.optgroup').each(function(){
                                   if( $(this).find('li:not(.ms-hidden)').length ) {
                                       $(this).show();
                                   }
                                   else {
                                       $(this).hide();
                                   }
                               });
                           }
   
                           instance._updateSelectAllText();
                       }, instance.options.searchOptions.delay ));
                   });
               }
   
               // add global select all options
               if( instance.options.selectAll ) {
                   optionsList.before('<a href="#" class="ms-selectall global">' + instance.options.texts.selectAll + '</a>');
               }
   
               // handle select all option
               optionsWrap.on('click', '.ms-selectall', function( event ){
                   event.preventDefault();
   
                   instance.updateSelectAll   = false;
                   instance.updatePlaceholder = false;
   
                   var select = optionsWrap.parent().siblings('.ms-list-'+ instance.listNumber +'.jqmsLoaded');
   
                   if( $(this).hasClass('global') ) {
                       // check if any options are not selected if so then select them
                       if( optionsList.find('li:not(.optgroup, .selected, .ms-hidden)').length ) {
                           // get unselected vals, mark as selected, return val list
                           optionsList.find('li:not(.optgroup, .selected, .ms-hidden)').addClass('selected');
                           optionsList.find('li.selected input[type="checkbox"]:not(:disabled)').prop( 'checked', true );
                       }
                       // deselect everything
                       else {
                           optionsList.find('li:not(.optgroup, .ms-hidden).selected').removeClass('selected');
                           optionsList.find('li:not(.optgroup, .ms-hidden, .selected) input[type="checkbox"]:not(:disabled)').prop( 'checked', false );
                       }
                   }
                   else if( $(this).closest('li').hasClass('optgroup') ) {
                       var optgroup = $(this).closest('li.optgroup');
   
                       // check if any selected if so then select them
                       if( optgroup.find('li:not(.selected, .ms-hidden)').length ) {
                           optgroup.find('li:not(.selected, .ms-hidden)').addClass('selected');
                           optgroup.find('li.selected input[type="checkbox"]:not(:disabled)').prop( 'checked', true );
                       }
                       // deselect everything
                       else {
                           optgroup.find('li:not(.ms-hidden).selected').removeClass('selected');
                           optgroup.find('li:not(.ms-hidden, .selected) input[type="checkbox"]:not(:disabled)').prop( 'checked', false );
                       }
                   }
   
                   var vals = [];
                   optionsList.find('li.selected input[type="checkbox"]').each(function(){
                       vals.push( $(this).val() );
                   });
                   select.val( vals ).trigger('change');
   
                   instance.updateSelectAll   = true;
                   instance.updatePlaceholder = true;
   
                   // USER CALLBACK
                   if( typeof instance.options.onSelectAll == 'function' ) {
                       instance.options.onSelectAll( instance.element, vals.length );
                   }
   
                   instance._updateSelectAllText();
                   instance._updatePlaceholderText();
               });
   
               // add options to wrapper
               var options = [];
               $(instance.element).children().each(function(){
                   if( this.nodeName == 'OPTGROUP' ) {
                       var groupOptions = [];
   
                       $(this).children('option').each(function(){
                           var thisOptionAtts = {};
                           for( var i = 0; i < instance.options.optionAttributes.length; i++ ) {
                               var thisOptAttr = instance.options.optionAttributes[ i ];
   
                               if( $(this).attr( thisOptAttr ) !== undefined ) {
                                   thisOptionAtts[ thisOptAttr ] = $(this).attr( thisOptAttr );
                               }
                           }
   
                           groupOptions.push({
                               name   : $(this).text(),
                               value  : $(this).val(),
                               checked: $(this).prop( 'selected' ),
                               attributes: thisOptionAtts
                           });
                       });
   
                       options.push({
                           label  : $(this).attr('label'),
                           options: groupOptions
                       });
                   }
                   else if( this.nodeName == 'OPTION' ) {
                       var thisOptionAtts = {};
                       for( var i = 0; i < instance.options.optionAttributes.length; i++ ) {
                           var thisOptAttr = instance.options.optionAttributes[ i ];
   
                           if( $(this).attr( thisOptAttr ) !== undefined ) {
                               thisOptionAtts[ thisOptAttr ] = $(this).attr( thisOptAttr );
                           }
                       }
   
                       options.push({
                           name      : $(this).text(),
                           value     : $(this).val(),
                           checked   : $(this).prop( 'selected' ),
                           attributes: thisOptionAtts
                       });
                   }
                   else {
                       // bad option
                       return true;
                   }
               });
               instance.loadOptions( options, true, false );
   
               // BIND SELECT ACTION
               optionsWrap.on( 'click', 'input[type="checkbox"]', function(){
                   $(this).closest( 'li' ).toggleClass( 'selected' );
   
                   var select = optionsWrap.parent().siblings('.ms-list-'+ instance.listNumber +'.jqmsLoaded');
   
                   // toggle clicked option
                   select.find('option[value="'+ instance._escapeSelector( $(this).val() ) +'"]').prop(
                       'selected', $(this).is(':checked')
                   ).closest('select').trigger('change');
   
                   // USER CALLBACK
                   if( typeof instance.options.onOptionClick == 'function' ) {
                       instance.options.onOptionClick(instance.element, this);
                   }
   
                   instance._updateSelectAllText();
                   instance._updatePlaceholderText();
               });
   
               // BIND FOCUS EVENT
               optionsWrap.on('focusin', 'input[type="checkbox"]', function(){
                   $(this).closest('label').addClass('focused');
               }).on('focusout', 'input[type="checkbox"]', function(){
                   $(this).closest('label').removeClass('focused');
               });
   
               // USER CALLBACK
               if( typeof instance.options.onLoad === 'function' ) {
                   instance.options.onLoad( instance.element );
               }
   
               // hide native select list
               $(instance.element).hide();
           },
   
           /* LOAD SELECT OPTIONS */
           loadOptions: function( options, overwrite, updateSelect ) {
               overwrite    = (typeof overwrite == 'boolean') ? overwrite : true;
               updateSelect = (typeof updateSelect == 'boolean') ? updateSelect : true;
   
               var instance    = this;
               var select      = $(instance.element);
               var optionsList = select.siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> .ms-options > ul');
               var optionsWrap = select.siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> .ms-options');
   
               if( overwrite ) {
                   optionsList.find('> li').remove();
   
                   if( updateSelect ) {
                       select.find('> *').remove();
                   }
               }
   
               var containers = [];
               for( var key in options ) {
                   // Prevent prototype methods injected into options from being iterated over.
                   if( !options.hasOwnProperty( key ) ) {
                       continue;
                   }
   
                   var thisOption      = options[ key ];
                   var container       = $('<li/>');
                   var appendContainer = true;
   
                   // OPTION
                   if( thisOption.hasOwnProperty('value') ) {
                       if( instance.options.showCheckbox && instance.options.checkboxAutoFit ) {
                           container.addClass('ms-reflow');
                       }
   
                       // add option to ms dropdown
                       instance._addOption( container, thisOption );
   
                       if( updateSelect ) {
                           var selOption = $('<option value="'+ thisOption.value +'">'+ thisOption.name +'</option>');
   
                           // add custom user attributes
                           if( thisOption.hasOwnProperty('attributes') && Object.keys( thisOption.attributes ).length ) {
                               selOption.attr( thisOption.attributes );
                           }
   
                           // mark option as selected
                           if( thisOption.checked ) {
                               selOption.prop( 'selected', true );
                           }
   
                           select.append( selOption );
                       }
                   }
                   // OPTGROUP
                   else if( thisOption.hasOwnProperty('options') ) {
                       var optGroup = $('<optgroup label="'+ thisOption.label +'"></optgroup>');
   
                       optionsList.find('> li.optgroup > span.label').each(function(){
                           if( $(this).text() == thisOption.label ) {
                               container       = $(this).closest('.optgroup');
                               appendContainer = false;
                           }
                       });
   
                       // prepare to append optgroup to select element
                       if( updateSelect ) {
                           if( select.find('optgroup[label="'+ thisOption.label +'"]').length ) {
                               optGroup = select.find('optgroup[label="'+ thisOption.label +'"]');
                           }
                           else {
                               select.append( optGroup );
                           }
                       }
   
                       // setup container
                       if( appendContainer ) {
                           container.addClass('optgroup');
                           container.append('<span class="label">'+ thisOption.label +'</span>');
                           container.find('> .label').css({
                               clear: 'both'
                           });
   
                           // add select all link
                           if( instance.options.selectGroup ) {
                               container.append('<a href="#" class="ms-selectall">' + instance.options.texts.selectAll + '</a>');
                           }
   
                           container.append('<ul/>');
                       }
   
                       for( var gKey in thisOption.options ) {
                           // Prevent prototype methods injected into options from
                           // being iterated over.
                           if( !thisOption.options.hasOwnProperty( gKey ) ) {
                               continue;
                           }
   
                           var thisGOption = thisOption.options[ gKey ];
                           var gContainer  = $('<li/>');
                           if( instance.options.showCheckbox && instance.options.checkboxAutoFit ) {
                               gContainer.addClass('ms-reflow');
                           }
   
                           // no clue what this is we hit (skip)
                           if( !thisGOption.hasOwnProperty('value') ) {
                               continue;
                           }
   
                           instance._addOption( gContainer, thisGOption );
   
                           container.find('> ul').append( gContainer );
   
                           // add option to optgroup in select element
                           if( updateSelect ) {
                               var selOption = $('<option value="'+ thisGOption.value +'">'+ thisGOption.name +'</option>');
   
                               // add custom user attributes
                               if( thisGOption.hasOwnProperty('attributes') && Object.keys( thisGOption.attributes ).length ) {
                                   selOption.attr( thisGOption.attributes );
                               }
   
                               // mark option as selected
                               if( thisGOption.checked ) {
                                   selOption.prop( 'selected', true );
                               }
   
                               optGroup.append( selOption );
                           }
                       }
                   }
                   else {
                       // no clue what this is we hit (skip)
                       continue;
                   }
   
                   if( appendContainer ) {
                       containers.push( container );
                   }
               }
               optionsList.append( containers );
   
               // pad out label for room for the checkbox
               if( instance.options.checkboxAutoFit && instance.options.showCheckbox && !optionsWrap.hasClass('hide-checkbox') ) {
                   var chkbx = optionsList.find('.ms-reflow:eq(0) input[type="checkbox"]');
                   if( chkbx.length ) {
                       var checkboxWidth = chkbx.outerWidth();
                           checkboxWidth = checkboxWidth ? checkboxWidth : 15;
   
                       optionsList.find('.ms-reflow label').css(
                           'padding-left',
                           (parseInt( chkbx.closest('label').css('padding-left') ) * 2) + checkboxWidth
                       );
   
                       optionsList.find('.ms-reflow').removeClass('ms-reflow');
                   }
               }
   
               // update placeholder text
               instance._updatePlaceholderText();
   
               // RESET COLUMN STYLES
               optionsWrap.find('ul').css({
                   'column-count'        : '',
                   'column-gap'          : '',
                   '-webkit-column-count': '',
                   '-webkit-column-gap'  : '',
                   '-moz-column-count'   : '',
                   '-moz-column-gap'     : ''
               });
   
               // COLUMNIZE
               if( select.find('optgroup').length ) {
                   // float non grouped options
                   optionsList.find('> li:not(.optgroup)').css({
                       'float': 'left',
                       width: (100 / instance.options.columns) +'%'
                   });
   
                   // add CSS3 column styles
                   optionsList.find('li.optgroup').css({
                       clear: 'both'
                   }).find('> ul').css({
                       'column-count'        : instance.options.columns,
                       'column-gap'          : 0,
                       '-webkit-column-count': instance.options.columns,
                       '-webkit-column-gap'  : 0,
                       '-moz-column-count'   : instance.options.columns,
                       '-moz-column-gap'     : 0
                   });
   
                   // for crappy IE versions float grouped options
                   if( this._ieVersion() && (this._ieVersion() < 10) ) {
                       optionsList.find('li.optgroup > ul > li').css({
                           'float': 'left',
                           width: (100 / instance.options.columns) +'%'
                       });
                   }
               }
               else {
                   // add CSS3 column styles
                   optionsList.css({
                       'column-count'        : instance.options.columns,
                       'column-gap'          : 0,
                       '-webkit-column-count': instance.options.columns,
                       '-webkit-column-gap'  : 0,
                       '-moz-column-count'   : instance.options.columns,
                       '-moz-column-gap'     : 0
                   });
   
                   // for crappy IE versions float grouped options
                   if( this._ieVersion() && (this._ieVersion() < 10) ) {
                       optionsList.find('> li').css({
                           'float': 'left',
                           width: (100 / instance.options.columns) +'%'
                       });
                   }
               }
   
               // update un/select all logic
               instance._updateSelectAllText();
           },
   
           /* UPDATE MULTISELECT CONFIG OPTIONS */
           settings: function( options ) {
               this.options = $.extend( true, {}, this.options, options );
               this.reload();
           },
   
           /* RESET THE DOM */
           unload: function() {
               $(this.element).siblings('#ms-list-'+ this.listNumber +'.ms-options-wrap').remove();
               $(this.element).show(function(){
                   $(this).css('display','').removeClass('jqmsLoaded');
               });
           },
   
           /* RELOAD JQ MULTISELECT LIST */
           reload: function() {
               // remove existing options
               $(this.element).siblings('#ms-list-'+ this.listNumber +'.ms-options-wrap').remove();
               $(this.element).removeClass('jqmsLoaded');
   
               // load element
               this.load();
           },
   
           // RESET BACK TO DEFAULT VALUES & RELOAD
           reset: function() {
               var defaultVals = [];
               $(this.element).find('option').each(function(){
                   if( $(this).prop('defaultSelected') ) {
                       defaultVals.push( $(this).val() );
                   }
               });
   
               $(this.element).val( defaultVals );
   
               this.reload();
           },
   
           disable: function( status ) {
               status = (typeof status === 'boolean') ? status : true;
               $(this.element).prop( 'disabled', status );
               $(this.element).siblings('#ms-list-'+ this.listNumber +'.ms-options-wrap').find('button:first-child')
                   .prop( 'disabled', status );
           },
   
           /** PRIVATE FUNCTIONS **/
           // update the un/select all texts based on selected options and visibility
           _updateSelectAllText: function(){
               if( !this.updateSelectAll ) {
                   return;
               }
   
               var instance = this;
   
               // select all not used at all so just do nothing
               if( !instance.options.selectAll && !instance.options.selectGroup ) {
                   return;
               }
   
               var optionsWrap = $(instance.element).siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> .ms-options');
   
               // update un/select all text
               optionsWrap.find('.ms-selectall').each(function(){
                   var unselected = $(this).parent().find('li:not(.optgroup,.selected,.ms-hidden)');
   
                   $(this).text(
                       unselected.length ? instance.options.texts.selectAll : instance.options.texts.unselectAll
                   );
               });
           },
   
           // update selected placeholder text
           _updatePlaceholderText: function(){
               if( !this.updatePlaceholder ) {
                   return;
               }
   
               var instance       = this;
               var select         = $(instance.element);
               var selectVals     = select.val() ? select.val() : [];
               var placeholder    = select.siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> button:first-child');
               var placeholderTxt = placeholder.find('span');
               var optionsWrap    = select.siblings('#ms-list-'+ instance.listNumber +'.ms-options-wrap').find('> .ms-options');
   
               // if there are disabled options get those values as well
               if( select.find('option:selected:disabled').length ) {
                   selectVals = [];
                   select.find('option:selected').each(function(){
                       selectVals.push( $(this).val() );
                   });
               }
   
               // get selected options
               var selOpts = [];
               for( var key in selectVals ) {
                   // Prevent prototype methods injected into options from being iterated over.
                   if( !selectVals.hasOwnProperty( key ) ) {
                       continue;
                   }
   
                   selOpts.push(
                       $.trim( select.find('option[value="'+ instance._escapeSelector( selectVals[ key ] ) +'"]').text() )
                   );
   
                   if( selOpts.length >= instance.options.maxPlaceholderOpts ) {
                       break;
                   }
               }
   
               // UPDATE PLACEHOLDER TEXT WITH OPTIONS SELECTED
               placeholderTxt.text( selOpts.join( ', ' ) );
   
               if( selOpts.length ) {
                   optionsWrap.closest('.ms-options-wrap').addClass('ms-has-selections');
   
                   // USER CALLBACK
                   if( typeof instance.options.onPlaceholder == 'function' ) {
                       instance.options.onPlaceholder( instance.element, placeholderTxt, selOpts );
                   }
               }
               else {
                   optionsWrap.closest('.ms-options-wrap').removeClass('ms-has-selections');
               }
   
               // replace placeholder text
               if( !selOpts.length ) {
                   placeholderTxt.text( instance.options.texts.placeholder );
               }
               // if copy is larger than button width use "# selected"
               else if( (placeholderTxt.width() > placeholder.width()) || (selOpts.length != selectVals.length) ) {
                   placeholderTxt.text( selectVals.length + instance.options.texts.selectedOptions );
               }
           },
   
           // Add option to the custom dom list
           _addOption: function( container, option ) {
               var instance = this;
               var thisOption = $('<label/>', {
                   for : 'ms-opt-'+ msOptCounter,
                   text: option.name
               });
   
               var thisCheckbox = $('<input>', {
                   type : 'checkbox',
                   title: option.name,
                   id   : 'ms-opt-'+ msOptCounter,
                   value: option.value
               });
   
               // add user defined attributes
               if( option.hasOwnProperty('attributes') && Object.keys( option.attributes ).length ) {
                   thisCheckbox.attr( option.attributes );
               }
   
               if( option.checked ) {
                   container.addClass('default selected');
                   thisCheckbox.prop( 'checked', true );
               }
   
               thisOption.prepend( thisCheckbox );
   
               var searchTerm = '';
               if( instance.options.searchOptions.searchText ) {
                   searchTerm += ' ' + option.name.toLowerCase();
               }
               if( instance.options.searchOptions.searchValue ) {
                   searchTerm += ' ' + option.value.toLowerCase();
               }
   
               container.attr( 'data-search-term', $.trim( searchTerm ) ).prepend( thisOption );
   
               msOptCounter = msOptCounter + 1;
           },
   
           // check ie version
           _ieVersion: function() {
               var myNav = navigator.userAgent.toLowerCase();
               return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
           },
   
           // escape selector
           _escapeSelector: function( string ) {
               if( typeof $.escapeSelector == 'function' ) {
                   return $.escapeSelector( string );
               }
               else {
                   return string.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
               }
           }
       };
   
       // ENABLE JQUERY PLUGIN FUNCTION
       $.fn.multiselect = function( options ){
           if( !this.length ) {
               return;
           }
   
           var args = arguments;
           var ret;
   
           // menuize each list
           if( (options === undefined) || (typeof options === 'object') ) {
               return this.each(function(){
                   if( !$.data( this, 'plugin_multiselect' ) ) {
                       $.data( this, 'plugin_multiselect', new MultiSelect( this, options ) );
                   }
               });
           } else if( (typeof options === 'string') && (options[0] !== '_') && (options !== 'init') ) {
               this.each(function(){
                   var instance = $.data( this, 'plugin_multiselect' );
   
                   if( instance instanceof MultiSelect && typeof instance[ options ] === 'function' ) {
                       ret = instance[ options ].apply( instance, Array.prototype.slice.call( args, 1 ) );
                   }
   
                   // special destruct handler
                   if( options === 'unload' ) {
                       $.data( this, 'plugin_multiselect', null );
                   }
               });
   
               return ret;
           }
       };
   }(jQuery));
   
   
   //# sourceMappingURL=vendor.js.map
   