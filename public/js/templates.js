(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["footer.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "EN-US") {
  output += "\n  CLIENT\n";
  ;
  }
  output += "\n\n";
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "EN-CA") {
  output += "\n  CLIENT\n";
  ;
  }
  output += "\n\n";
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "FR-CA") {
  output += "\n  CLIENT\n";
  ;
  }
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["language-selector.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  output += "<div class=\"language-selector-container\">\n  <div class=\"language-selector\">\n    ";
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"lang") == "EN-US") {
  output += "\n      <div class=\"language-selector-toggle lang-us\" href=\"#\">English</span></div>\n    ";
  ;
  }
  else {
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"lang") == "EN-CA") {
  output += "\n      <a class=\"language-selector-toggle\" href=\"#\">English</span></a>\n    ";
  ;
  }
  else {
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"lang") == "FR-CA") {
  output += "\n      <a class=\"language-selector-toggle\" href=\"#\">French</span></a>\n    ";
  ;
  }
  ;
  }
  ;
  }
  output += "\n    \n\n    ";
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"lang") == "EN-US") {
  output += "\n    ";
  output += "\n    ";
  ;
  }
  else {
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"lang") == "EN-CA") {
  output += "\n      <ul id=\"language-selector\" class=\"language-selector-list\">\n        <li><a href=\"";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "baseUrl"), env.opts.autoescape);
  output += "?id=";
  output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"id"), env.opts.autoescape);
  output += "&bu=CA&lang=FR-CA\" data-lang=\"FR-CA\">French</a></li>\n      </ul>\n    ";
  ;
  }
  else {
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"lang") == "FR-CA") {
  output += "\n      <ul id=\"language-selector\" class=\"language-selector-list\">\n        <li><a href=\"";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "baseUrl"), env.opts.autoescape);
  output += "?id=";
  output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "profile")),"id"), env.opts.autoescape);
  output += "&bu=CA&lang=EN-CA\" data-lang=\"EN-CA\">English</a></li>\n      </ul>\n    ";
  ;
  }
  ;
  }
  ;
  }
  output += "\n  </div>\n</div>";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["pc-interests.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  var t_1;
  t_1 = "Unsubscribe All";
  frame.set("unsubscribe", t_1, true);
  if(frame.topLevel) {
  context.setVariable("unsubscribe", t_1);
  }
  if(frame.topLevel) {
  context.addExport("unsubscribe", t_1);
  }
  output += "\n";
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "FR-CA") {
  output += "\n  ";
  var t_2;
  t_2 = "Se désabonner de tout";
  frame.set("unsubscribe", t_2, true);
  if(frame.topLevel) {
  context.setVariable("unsubscribe", t_2);
  }
  if(frame.topLevel) {
  context.addExport("unsubscribe", t_2);
  }
  output += "\n";
  ;
  }
  output += "\n<hr class=\"hr-large\">\n<div class=\"row\">\n  <div class=\"col\">\n    <h2 id=\"interests\">My Interests</h2>\n  </div>\n</div>\n<div class=\"interest-cards\">\n  <div>\n    ";
  frame = frame.push();
  var t_5 = env.getFilter("sort").call(context, runtime.contextOrFrameLookup(context, frame, "Interest"),false,true,"ncpc__Order__c");
  if(t_5) {t_5 = runtime.fromIterator(t_5);
  var t_4 = t_5.length;
  for(var t_3=0; t_3 < t_5.length; t_3++) {
  var t_6 = t_5[t_3];
  frame.set("int", t_6);
  frame.set("loop.index", t_3 + 1);
  frame.set("loop.index0", t_3);
  frame.set("loop.revindex", t_4 - t_3);
  frame.set("loop.revindex0", t_4 - t_3 - 1);
  frame.set("loop.first", t_3 === 0);
  frame.set("loop.last", t_3 === t_4 - 1);
  frame.set("loop.length", t_4);
  output += "\n      ";
  var t_7;
  t_7 = "";
  frame.set("checked", t_7, true);
  if(frame.topLevel) {
  context.setVariable("checked", t_7);
  }
  if(frame.topLevel) {
  context.addExport("checked", t_7);
  }
  output += "\n      ";
  var t_8;
  t_8 = "";
  frame.set("active", t_8, true);
  if(frame.topLevel) {
  context.setVariable("active", t_8);
  }
  if(frame.topLevel) {
  context.addExport("active", t_8);
  }
  output += "\n      ";
  var t_9;
  t_9 = runtime.memberLookup((t_6),"ncpc__Display_Text__c");
  frame.set("title", t_9, true);
  if(frame.topLevel) {
  context.setVariable("title", t_9);
  }
  if(frame.topLevel) {
  context.addExport("title", t_9);
  }
  output += "\n      ";
  var t_10;
  t_10 = runtime.memberLookup((t_6),"ncpc__Display_Description__c");
  frame.set("description", t_10, true);
  if(frame.topLevel) {
  context.setVariable("description", t_10);
  }
  if(frame.topLevel) {
  context.addExport("description", t_10);
  }
  output += "\n      ";
  var t_11;
  t_11 = "Unsubscribe All";
  frame.set("unsubscribe", t_11, true);
  if(frame.topLevel) {
  context.setVariable("unsubscribe", t_11);
  }
  if(frame.topLevel) {
  context.addExport("unsubscribe", t_11);
  }
  output += "\n      ";
  if(runtime.memberLookup((t_6),"fieldValue")) {
  output += "\n        ";
  var t_12;
  t_12 = "checked";
  frame.set("checked", t_12, true);
  if(frame.topLevel) {
  context.setVariable("checked", t_12);
  }
  if(frame.topLevel) {
  context.addExport("checked", t_12);
  }
  output += "\n        ";
  var t_13;
  t_13 = "active";
  frame.set("active", t_13, true);
  if(frame.topLevel) {
  context.setVariable("active", t_13);
  }
  if(frame.topLevel) {
  context.addExport("active", t_13);
  }
  output += "\n      ";
  ;
  }
  output += "\n        <div class=\"interest-card ";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "active"), env.opts.autoescape);
  output += "\">\n          <div>\n          ";
  if(runtime.memberLookup((t_6),"ncpc__Icon_URL__c")) {
  output += "\n            <a>\n                <img class=\"img-fluid\" src=\"";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup((t_6),"ncpc__Icon_URL__c")), env.opts.autoescape);
  output += "\" alt=\"\">\n          ";
  ;
  }
  else {
  output += "\n            <a class=\"nullImg\">\n          ";
  ;
  }
  output += "\n              <div class=\"form-check\">\n                  <input type=\"checkbox\" ";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "checked"), env.opts.autoescape);
  output += " data-customer-int-id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_6),"contactIntId"), env.opts.autoescape);
  output += "\" data-available-int-id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_6),"Id"), env.opts.autoescape);
  output += "\" class=\"form-check-input form-field\">\n                  \n                  <label class=\"form-check-label\" for=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_6),"Id"), env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "title")), env.opts.autoescape);
  output += "\n                  <p>";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "description")), env.opts.autoescape);
  output += "</p>\n                  </label>\n              </div>\n            </a>\n          </div>\n        </div>     \n    ";
  ;
  }
  }
  frame = frame.pop();
  output += "\n  </div>\n</div>";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["pc-profile.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  output += "\n<div class=\"row\">\n  ";
  frame = frame.push();
  var t_3 = env.getFilter("sort").call(context, runtime.contextOrFrameLookup(context, frame, "ProfileFields"),false,true,"ncpc__Order__c");
  if(t_3) {t_3 = runtime.fromIterator(t_3);
  var t_2 = t_3.length;
  for(var t_1=0; t_1 < t_3.length; t_1++) {
  var t_4 = t_3[t_1];
  frame.set("field", t_4);
  frame.set("loop.index", t_1 + 1);
  frame.set("loop.index0", t_1);
  frame.set("loop.revindex", t_2 - t_1);
  frame.set("loop.revindex0", t_2 - t_1 - 1);
  frame.set("loop.first", t_1 === 0);
  frame.set("loop.last", t_1 === t_2 - 1);
  frame.set("loop.length", t_2);
  output += "\n    ";
  output += "\n    ";
  var t_5;
  t_5 = runtime.memberLookup((t_4),"ncpc__Field_Text__c");
  frame.set("label", t_5, true);
  if(frame.topLevel) {
  context.setVariable("label", t_5);
  }
  if(frame.topLevel) {
  context.addExport("label", t_5);
  }
  output += "\n    ";
  var t_6;
  t_6 = runtime.memberLookup((t_4),"ncpc__Field_Placeholder_Text__c");
  frame.set("placeholder", t_6, true);
  if(frame.topLevel) {
  context.setVariable("placeholder", t_6);
  }
  if(frame.topLevel) {
  context.addExport("placeholder", t_6);
  }
  output += "\n\n    ";
  if(runtime.contextOrFrameLookup(context, frame, "language") == "FR-CA") {
  output += "\n      ";
  var t_7;
  t_7 = runtime.memberLookup((t_4),"ncpc__Field_Text__c");
  frame.set("label", t_7, true);
  if(frame.topLevel) {
  context.setVariable("label", t_7);
  }
  if(frame.topLevel) {
  context.addExport("label", t_7);
  }
  output += "\n      ";
  var t_8;
  t_8 = runtime.memberLookup((t_4),"ncpc__Field_Placeholder_Text__c");
  frame.set("placeholder", t_8, true);
  if(frame.topLevel) {
  context.setVariable("placeholder", t_8);
  }
  if(frame.topLevel) {
  context.addExport("placeholder", t_8);
  }
  output += "\n    ";
  ;
  }
  output += "\n\n    ";
  if(runtime.memberLookup((t_4),"ncpc__Field_Type__c") !== "Multi-Picklist") {
  output += "\n      <div class=\"form-group col-sm-6\">\n        <label for=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Contact_Mapped_Field__c"), env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "label"), env.opts.autoescape);
  output += "</label>\n        <input required \n          ";
  if(runtime.memberLookup((t_4),"ncpc__Editable__c")) {
  output += " disabled ";
  ;
  }
  output += "  \n          type=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Field_Type__c"), env.opts.autoescape);
  output += "\" \n          name=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Contact_Mapped_Field__c"), env.opts.autoescape);
  output += "\"\n          minlength=\"1\"\n          maxlength=\"80\"\n          class=\"form-control profile-input\"\n          id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Contact_Mapped_Field__c"), env.opts.autoescape);
  output += "\"\n          placeholder=\"";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "placeholder"), env.opts.autoescape);
  output += "\"\n          value=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"fieldValue"), env.opts.autoescape);
  output += "\"\n          data-mapped-field=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Contact_Mapped_Field__c"), env.opts.autoescape);
  output += "\">\n      </div>\n      ";
  ;
  }
  else {
  output += "\n      <div class=\"form-group col-sm-6\">\n      <label for=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Contact_Mapped_Field__c"), env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "label"), env.opts.autoescape);
  output += "</label>\n          <select type=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Field_Type__c"), env.opts.autoescape);
  output += "\" multiple=\"multiple\" class=\"multi-select\" data-mapped-field=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"ncpc__Contact_Mapped_Field__c"), env.opts.autoescape);
  output += "\">\n              ";
  frame = frame.push();
  var t_11 = runtime.memberLookup((runtime.memberLookup((t_4),"fieldOptions")),0);
  if(t_11) {t_11 = runtime.fromIterator(t_11);
  var t_9;
  if(runtime.isArray(t_11)) {
  var t_10 = t_11.length;
  for(t_9=0; t_9 < t_11.length; t_9++) {
  var t_12 = t_11[t_9][0];
  frame.set("[object Object]", t_11[t_9][0]);
  var t_13 = t_11[t_9][1];
  frame.set("[object Object]", t_11[t_9][1]);
  frame.set("loop.index", t_9 + 1);
  frame.set("loop.index0", t_9);
  frame.set("loop.revindex", t_10 - t_9);
  frame.set("loop.revindex0", t_10 - t_9 - 1);
  frame.set("loop.first", t_9 === 0);
  frame.set("loop.last", t_9 === t_10 - 1);
  frame.set("loop.length", t_10);
  output += "\n                <option value=\"";
  output += runtime.suppressValue(t_13, env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(t_13, env.opts.autoescape);
  output += "</option>\n              ";
  ;
  }
  } else {
  t_9 = -1;
  var t_10 = runtime.keys(t_11).length;
  for(var t_14 in t_11) {
  t_9++;
  var t_15 = t_11[t_14];
  frame.set("key", t_14);
  frame.set("item", t_15);
  frame.set("loop.index", t_9 + 1);
  frame.set("loop.index0", t_9);
  frame.set("loop.revindex", t_10 - t_9);
  frame.set("loop.revindex0", t_10 - t_9 - 1);
  frame.set("loop.first", t_9 === 0);
  frame.set("loop.last", t_9 === t_10 - 1);
  frame.set("loop.length", t_10);
  output += "\n                <option value=\"";
  output += runtime.suppressValue(t_15, env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(t_15, env.opts.autoescape);
  output += "</option>\n              ";
  ;
  }
  }
  }
  frame = frame.pop();
  output += "\n          </select>\n    </div>\n    ";
  ;
  }
  output += "\n";
  ;
  }
  }
  frame = frame.pop();
  output += "\n</div>\n\n\n\n\n";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["pc-profileFields.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  output += "<div class=\"row profile-field-fields\">\n  ";
  frame = frame.push();
  var t_3 = env.getFilter("sort").call(context, runtime.contextOrFrameLookup(context, frame, "ProfileFields"),false,true,"ncpc__Order__c");
  if(t_3) {t_3 = runtime.fromIterator(t_3);
  var t_2 = t_3.length;
  for(var t_1=0; t_1 < t_3.length; t_1++) {
  var t_4 = t_3[t_1];
  frame.set("field", t_4);
  frame.set("loop.index", t_1 + 1);
  frame.set("loop.index0", t_1);
  frame.set("loop.revindex", t_2 - t_1);
  frame.set("loop.revindex0", t_2 - t_1 - 1);
  frame.set("loop.first", t_1 === 0);
  frame.set("loop.last", t_1 === t_2 - 1);
  frame.set("loop.length", t_2);
  output += "\n    ";
  output += "\n    ";
  var t_5;
  t_5 = runtime.memberLookup((t_4),"englishLabel");
  frame.set("label", t_5, true);
  if(frame.topLevel) {
  context.setVariable("label", t_5);
  }
  if(frame.topLevel) {
  context.addExport("label", t_5);
  }
  output += "\n    ";
  var t_6;
  t_6 = runtime.memberLookup((t_4),"englishPlaceholder");
  frame.set("placeholder", t_6, true);
  if(frame.topLevel) {
  context.setVariable("placeholder", t_6);
  }
  if(frame.topLevel) {
  context.addExport("placeholder", t_6);
  }
  output += "\n\n    ";
  if(runtime.contextOrFrameLookup(context, frame, "language") == "FR-CA") {
  output += "\n      ";
  var t_7;
  t_7 = runtime.memberLookup((t_4),"frenchLabel");
  frame.set("label", t_7, true);
  if(frame.topLevel) {
  context.setVariable("label", t_7);
  }
  if(frame.topLevel) {
  context.addExport("label", t_7);
  }
  output += "\n      ";
  var t_8;
  t_8 = runtime.memberLookup((t_4),"frenchPlaceholder");
  frame.set("placeholder", t_8, true);
  if(frame.topLevel) {
  context.setVariable("placeholder", t_8);
  }
  if(frame.topLevel) {
  context.addExport("placeholder", t_8);
  }
  output += "\n    ";
  ;
  }
  output += "\n\n    ";
  if(runtime.memberLookup((t_4),"fieldType") !== "Multi-Picklist") {
  output += "\n      <div class=\"form-group col-sm-6\">\n        <label for=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"mappedField"), env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "label"), env.opts.autoescape);
  output += "</label>\n        <input required \n          ";
  if(runtime.memberLookup((t_4),"disabled")) {
  output += " disabled ";
  ;
  }
  output += "  \n          type=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"fieldType"), env.opts.autoescape);
  output += "\" \n          name=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"mappedField"), env.opts.autoescape);
  output += "\"\n          minlength=\"1\"\n          maxlength=\"80\"\n          class=\"form-control profile-input\"\n          id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"mappedField"), env.opts.autoescape);
  output += "\"\n          placeholder=\"";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "placeholder"), env.opts.autoescape);
  output += "\"\n          value=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"fieldValue"), env.opts.autoescape);
  output += "\"\n          data-mapped-field=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"mappedField"), env.opts.autoescape);
  output += "\">\n      </div>\n    ";
  ;
  }
  output += "\n";
  ;
  }
  }
  frame = frame.pop();
  output += "\n</div>\n";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["pc-profilePicklist.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  output += "<div class=\"row profile-field-options\">\n";
  frame = frame.push();
  var t_3 = env.getFilter("sort").call(context, runtime.contextOrFrameLookup(context, frame, "ProfileFieldOptions"),false,true,"ncpc__Order__c");
  if(t_3) {t_3 = runtime.fromIterator(t_3);
  var t_2 = t_3.length;
  for(var t_1=0; t_1 < t_3.length; t_1++) {
  var t_4 = t_3[t_1];
  frame.set("field", t_4);
  frame.set("loop.index", t_1 + 1);
  frame.set("loop.index0", t_1);
  frame.set("loop.revindex", t_2 - t_1);
  frame.set("loop.revindex0", t_2 - t_1 - 1);
  frame.set("loop.first", t_1 === 0);
  frame.set("loop.last", t_1 === t_2 - 1);
  frame.set("loop.length", t_2);
  output += "\n  ";
  output += "\n  ";
  var t_5;
  t_5 = runtime.memberLookup((t_4),"englishLabel");
  frame.set("label", t_5, true);
  if(frame.topLevel) {
  context.setVariable("label", t_5);
  }
  if(frame.topLevel) {
  context.addExport("label", t_5);
  }
  output += "\n  ";
  var t_6;
  t_6 = runtime.memberLookup((t_4),"englishPlaceholder");
  frame.set("placeholder", t_6, true);
  if(frame.topLevel) {
  context.setVariable("placeholder", t_6);
  }
  if(frame.topLevel) {
  context.addExport("placeholder", t_6);
  }
  output += "\n\n  ";
  if(runtime.contextOrFrameLookup(context, frame, "language") == "FR-CA") {
  output += "\n    ";
  var t_7;
  t_7 = runtime.memberLookup((t_4),"frenchLabel");
  frame.set("label", t_7, true);
  if(frame.topLevel) {
  context.setVariable("label", t_7);
  }
  if(frame.topLevel) {
  context.addExport("label", t_7);
  }
  output += "\n    ";
  var t_8;
  t_8 = runtime.memberLookup((t_4),"frenchPlaceholder");
  frame.set("placeholder", t_8, true);
  if(frame.topLevel) {
  context.setVariable("placeholder", t_8);
  }
  if(frame.topLevel) {
  context.addExport("placeholder", t_8);
  }
  output += "\n  ";
  ;
  }
  output += "\n  ";
  if(runtime.memberLookup((t_4),"fieldType") == "Multi-Picklist") {
  output += "\n    <div class=\"form-group col-sm-6\">\n      <label for=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"mappedField"), env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "label"), env.opts.autoescape);
  output += "</label>\n          <select type=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"fieldType"), env.opts.autoescape);
  output += "\" multiple=\"multiple\" class=\"multi-select\" data-mapped-field=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_4),"mappedField"), env.opts.autoescape);
  output += "\">\n              ";
  frame = frame.push();
  var t_11 = runtime.memberLookup((runtime.memberLookup((t_4),"fieldOptions")),0);
  if(t_11) {t_11 = runtime.fromIterator(t_11);
  var t_9;
  if(runtime.isArray(t_11)) {
  var t_10 = t_11.length;
  for(t_9=0; t_9 < t_11.length; t_9++) {
  var t_12 = t_11[t_9][0];
  frame.set("[object Object]", t_11[t_9][0]);
  var t_13 = t_11[t_9][1];
  frame.set("[object Object]", t_11[t_9][1]);
  frame.set("loop.index", t_9 + 1);
  frame.set("loop.index0", t_9);
  frame.set("loop.revindex", t_10 - t_9);
  frame.set("loop.revindex0", t_10 - t_9 - 1);
  frame.set("loop.first", t_9 === 0);
  frame.set("loop.last", t_9 === t_10 - 1);
  frame.set("loop.length", t_10);
  output += "\n                <option value=\"";
  output += runtime.suppressValue(t_13, env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(t_13, env.opts.autoescape);
  output += "</option>\n              ";
  ;
  }
  } else {
  t_9 = -1;
  var t_10 = runtime.keys(t_11).length;
  for(var t_14 in t_11) {
  t_9++;
  var t_15 = t_11[t_14];
  frame.set("key", t_14);
  frame.set("item", t_15);
  frame.set("loop.index", t_9 + 1);
  frame.set("loop.index0", t_9);
  frame.set("loop.revindex", t_10 - t_9);
  frame.set("loop.revindex0", t_10 - t_9 - 1);
  frame.set("loop.first", t_9 === 0);
  frame.set("loop.last", t_9 === t_10 - 1);
  frame.set("loop.length", t_10);
  output += "\n                <option value=\"";
  output += runtime.suppressValue(t_15, env.opts.autoescape);
  output += "\">";
  output += runtime.suppressValue(t_15, env.opts.autoescape);
  output += "</option>\n              ";
  ;
  }
  }
  }
  frame = frame.pop();
  output += "\n          </select>\n    </div>\n      ";
  ;
  }
  output += "\n    ";
  ;
  }
  }
  frame = frame.pop();
  output += "\n\n</div>\n\n";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["pc-subscriptions.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  var t_1;
  t_1 = "Unsubscribe All";
  frame.set("unsubscribe", t_1, true);
  if(frame.topLevel) {
  context.setVariable("unsubscribe", t_1);
  }
  if(frame.topLevel) {
  context.addExport("unsubscribe", t_1);
  }
  output += "\n<hr class=\"hr-large\">\n<div class=\"row\">\n  <div class=\"col\">\n    <h2 id=\"subscriptions\">My Subscriptions</h2>\n  </div>\n</div>\n<!-- add 'wide' class below for full width cards -->\n<div class=\"subscription-cards ";
  output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "config")),"layout"), env.opts.autoescape);
  output += "\">\n  ";
  frame = frame.push();
  var t_4 = env.getFilter("sort").call(context, runtime.contextOrFrameLookup(context, frame, "Categories"),false,true,"order");
  if(t_4) {t_4 = runtime.fromIterator(t_4);
  var t_3 = t_4.length;
  for(var t_2=0; t_2 < t_4.length; t_2++) {
  var t_5 = t_4[t_2];
  frame.set("cat", t_5);
  frame.set("loop.index", t_2 + 1);
  frame.set("loop.index0", t_2);
  frame.set("loop.revindex", t_3 - t_2);
  frame.set("loop.revindex0", t_3 - t_2 - 1);
  frame.set("loop.first", t_2 === 0);
  frame.set("loop.last", t_2 === t_3 - 1);
  frame.set("loop.length", t_3);
  output += "\n    ";
  var t_6;
  t_6 = runtime.memberLookup((t_5),"CategoryName");
  frame.set("catTitle", t_6, true);
  if(frame.topLevel) {
  context.setVariable("catTitle", t_6);
  }
  if(frame.topLevel) {
  context.addExport("catTitle", t_6);
  }
  output += "\n    ";
  var t_7;
  t_7 = runtime.memberLookup((t_5),"CategoryId");
  frame.set("collapseId", t_7, true);
  if(frame.topLevel) {
  context.setVariable("collapseId", t_7);
  }
  if(frame.topLevel) {
  context.addExport("collapseId", t_7);
  }
  output += "\n      <div class=\"section\">\n        <div class=\"category collapsed\" data-toggle=\"collapse\" href=\"#collapse";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "collapseId"), env.opts.autoescape);
  output += "\" aria-expanded=\"false\" aria-controls=\"collapse";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "collapseId"), env.opts.autoescape);
  output += "\">\n          <h3>";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "catTitle"), env.opts.autoescape);
  output += "</h3> <span class=\"chevron bottom\"></span>\n        </div>\n        <div class=\"collapse\" id=\"collapse";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "collapseId"), env.opts.autoescape);
  output += "\">\n          <div class=\"row\">\n            ";
  frame = frame.push();
  var t_10 = env.getFilter("sort").call(context, runtime.memberLookup((t_5),"Subscription"),false,true,"ncpc__Order__c");
  if(t_10) {t_10 = runtime.fromIterator(t_10);
  var t_9 = t_10.length;
  for(var t_8=0; t_8 < t_10.length; t_8++) {
  var t_11 = t_10[t_8];
  frame.set("sub", t_11);
  frame.set("loop.index", t_8 + 1);
  frame.set("loop.index0", t_8);
  frame.set("loop.revindex", t_9 - t_8);
  frame.set("loop.revindex0", t_9 - t_8 - 1);
  frame.set("loop.first", t_8 === 0);
  frame.set("loop.last", t_8 === t_9 - 1);
  frame.set("loop.length", t_9);
  output += "\n              ";
  var t_12;
  t_12 = "";
  frame.set("checked", t_12, true);
  if(frame.topLevel) {
  context.setVariable("checked", t_12);
  }
  if(frame.topLevel) {
  context.addExport("checked", t_12);
  }
  output += "\n              ";
  var t_13;
  t_13 = "";
  frame.set("disabled", t_13, true);
  if(frame.topLevel) {
  context.setVariable("disabled", t_13);
  }
  if(frame.topLevel) {
  context.addExport("disabled", t_13);
  }
  output += "\n              ";
  var t_14;
  t_14 = runtime.memberLookup((t_11),"ncpc__Display_Text__c");
  frame.set("title", t_14, true);
  if(frame.topLevel) {
  context.setVariable("title", t_14);
  }
  if(frame.topLevel) {
  context.addExport("title", t_14);
  }
  output += "\n              ";
  var t_15;
  t_15 = runtime.memberLookup((t_11),"ncpc__Display_Description__c");
  frame.set("description", t_15, true);
  if(frame.topLevel) {
  context.setVariable("description", t_15);
  }
  if(frame.topLevel) {
  context.addExport("description", t_15);
  }
  output += "\n              ";
  var t_16;
  t_16 = "Unsubscribe All";
  frame.set("unsubscribe", t_16, true);
  if(frame.topLevel) {
  context.setVariable("unsubscribe", t_16);
  }
  if(frame.topLevel) {
  context.addExport("unsubscribe", t_16);
  }
  output += "\n              ";
  if(runtime.memberLookup((t_11),"fieldValue")) {
  output += "\n                ";
  var t_17;
  t_17 = "checked";
  frame.set("checked", t_17, true);
  if(frame.topLevel) {
  context.setVariable("checked", t_17);
  }
  if(frame.topLevel) {
  context.addExport("checked", t_17);
  }
  output += "\n              ";
  ;
  }
  output += "\n\n              ";
  if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "config")),"layout") == "wide") {
  output += "\n                <div class=\"subscription-card\">\n                  <div class=\"subscription-card-content\">\n                    <div class=\"subscription-card-heading row\">\n                      <div class=\"subscription-card-title\">";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "title")), env.opts.autoescape);
  output += " \n                        <p class=\"subscription-card-description\">";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "description")), env.opts.autoescape);
  output += "</p>\n                      </div>\n                      ";
  if(runtime.memberLookup((t_11),"ncpc__Channel__c") == "SMS") {
  output += "\n                        <div class=\"label label-default sms\"><span>";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"ncpc__Channel__c"), env.opts.autoescape);
  output += "</span></div>\n                      ";
  ;
  }
  else {
  output += "\n                        <div class=\"label label-default email\"><span>";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"ncpc__Channel__c"), env.opts.autoescape);
  output += "</span></div>\n                      ";
  ;
  }
  output += "\n                      <div class=\"subscription-card-toggle\">\n                        <label class=\"switch\">\n                          <input class=\"";
  output += runtime.suppressValue(env.getFilter("lower").call(context, runtime.memberLookup((t_11),"ncpc__Channel__c")), env.opts.autoescape);
  output += "\" type=\"checkbox\" ";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "checked"), env.opts.autoescape);
  output += " ";
  if(runtime.memberLookup((t_11),"disabled")) {
  output += " disabled ";
  ;
  }
  output += " data-customer-sub-id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"contactSubId"), env.opts.autoescape);
  output += "\" data-available-sub-id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"Id"), env.opts.autoescape);
  output += "\">\n                          <span class=\"slider\"></span>\n                          <span class=\"switch-indicator\" data-subscribed=\"Subscribed!\" data-unsubscribed=\"Unsubscribed\"></span>\n                        </label>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                ";
  ;
  }
  else {
  output += "\n                <div class=\"subscription-card col-lg-4\">\n                  <div class=\"subscription-card-content\">\n                    <div class=\"subscription-card-heading row\">\n                      <div class=\"subscription-card-title\"\">";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "title")), env.opts.autoescape);
  output += "</div>\n                      ";
  if(runtime.memberLookup((t_11),"ncpc__Channel__c") == "SMS") {
  output += "\n                        <div class=\"label label-default sms\"><span>";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"ncpc__Channel__c"), env.opts.autoescape);
  output += "</span></div>\n                      ";
  ;
  }
  else {
  output += "\n                        <div class=\"label label-default email\"><span>";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"ncpc__Channel__c"), env.opts.autoescape);
  output += "</span></div>\n                      ";
  ;
  }
  output += "\n                    </div>\n                    <p class=\"subscription-card-description\">";
  output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "description")), env.opts.autoescape);
  output += "</p>\n                    <div class=\"subscription-card-toggle\">\n                      <label class=\"switch\">\n                        <input type=\"checkbox\" ";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "checked"), env.opts.autoescape);
  output += " ";
  if(runtime.memberLookup((t_11),"ncpc__Disabled__c")) {
  output += " disabled ";
  ;
  }
  output += " data-customer-sub-id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"contactSubId"), env.opts.autoescape);
  output += "\" data-available-sub-id=\"";
  output += runtime.suppressValue(runtime.memberLookup((t_11),"Id"), env.opts.autoescape);
  output += "\">\n                        <span class=\"slider\"></span>\n                        <span class=\"switch-indicator\" data-subscribed=\"Subscribed!\" data-unsubscribed=\"Unsubscribed\"></span>\n                      </label>\n                    </div>\n                </div>\n              </div>\n              ";
  ;
  }
  output += "\n            ";
  ;
  }
  }
  frame = frame.pop();
  output += "\n          </div>\n        </div>\n      </div>\n  ";
  ;
  }
  }
  frame = frame.pop();
  output += "\n</div>\n\n<div class=\"row\">\n  <div class=\"col\">\n    <button class=\"btn btn-dark-gray btn-large\" href=\"#\" id=\"unsubscribe-all\">";
  output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "unsubscribe"), env.opts.autoescape);
  output += "</a>\n  </div>\n</div>";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["preference-center.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  output += "<div class=\"container preference-center\">\n  <div class=\"row\">\n    <div class=\"col-lg-3 pc-sidebar\">\n      <a href=\"#subscription-profile\">Subscription Profile</a>\n      <a href=\"#my-subscriptions\">My Subscriptions</a>\n      <br><br>\n      <button class=\"btn btn-blue btn-large\">Save Changes</button>\n    </div>\n\n    <div class=\"col-lg-9 pc-main-content\">\n      <div class=\"row\">\n        <div class=\"col-12\">\n          <h2 id=\"subscription-profile\">Subscription Profile</h2>\n          <p>We need your email for sure, but we also want to know you better by name as well!</p>\n\n      \n      </div>\n        </div>\n      </div>\n\n      <label>What is your name?</label>\n      <div class=\"form-row\">\n        <div class=\"form-group col-md-6\">\n          <input type=\"text\" class=\"form-control\" name=\"name\" placeholder=\"First Name\" value=\"";
  output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "ProfileInfo")),"First_Name"), env.opts.autoescape);
  output += "\">\n        </div>\n        <div class=\"form-group col-md-6\">\n          <input type=\"text\" class=\"form-control\" name=\"name\" placeholder=\"Last Name\" value=\"";
  output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "ProfileInfo")),"Last_Name"), env.opts.autoescape);
  output += "\">\n        </div>\n      </div>\n\n      <div class=\"form-group\">\n        <label for=\"email\">What is your email address?</label>\n        <input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Enter your email address\" value=\"";
  output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "ProfileInfo")),"Email"), env.opts.autoescape);
  output += "\">\n      </div>\n\n      <div class=\"form-group\">\n        <label for=\"location\">Where are you located?</label>\n        <input type=\"tel\" class=\"form-control\" id=\"location\" placeholder=\"Enter your zip/postal code\">\n      </div>\n      \n\n      <hr class=\"hr-large\">\n\n      <div class=\"row\">\n        <div class=\"col\">\n          <div class=\"form-group checkboxes\">\n            <label>\n              <input type=\"checkbox\" value=\"Architect and Design News\"> Architect and Design News\n            </label>\n            <label>\n              <input type=\"checkbox\" checked value=\"Fabricator News\"> Fabricator News\n            </label>\n            <label>\n              <input type=\"checkbox\" value=\"Homeowner News\"> Homeowner News\n            </label>\n            <label>\n              <input type=\"checkbox\" value=\"Kitchen and Bath News\"> Kitchen and Bath News\n            </label>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>";
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  
  (function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["sidebar.njx"] = (function() {
  function root(env, context, frame, runtime, cb) {
  var lineno = null;
  var colno = null;
  var output = "";
  try {
  var parentTemplate = null;
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "EN-US") {
  output += "\n  <div class=\"pc-sidebar-links\">\n    <a href=\"#subscription-profile\">Subscription Profile</a>\n    <a href=\"#my-interests\">My Interests</a>\n    <a href=\"#my-subscriptions\">My Subscriptions</a>\n    <button class=\"btn btn-green btn-large\" id=\"pc-save\" data-text=\"Save\" data-saving-text=\"Saving...\"></button>\n  </div>\n";
  ;
  }
  output += "\n\n";
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "EN-CA") {
  output += "\n  <div class=\"pc-sidebar-links\">\n    <a href=\"#subscription-profile\">Subscription Profile</a>\n    <a href=\"#my-subscriptions\">My Subscriptions</a>\n    <button class=\"btn btn-green btn-large\" id=\"pc-save\" data-text=\"Save\" data-saving-text=\"Saving...\"></button>\n  </div>\n";
  ;
  }
  output += "\n\n";
  if(runtime.contextOrFrameLookup(context, frame, "lang") == "FR-CA") {
  output += "\n  <div class=\"pc-sidebar-links\">\n    <a href=\"#subscription-profile\">Profil d'abonnement</a>\n    <a href=\"#my-subscriptions\">Mes inscriptions</a>\n    <button class=\"btn btn-green btn-large\" id=\"pc-save\" data-text=\"Sauvegarder\" data-saving-text=\"Le Sauvetage...\"></button>\n  </div>\n";
  ;
  }
  if(parentTemplate) {
  parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
  } else {
  cb(null, output);
  }
  ;
  } catch (e) {
    cb(runtime.handleError(e, lineno, colno));
  }
  }
  return {
  root: root
  };
  
  })();
  })();
  