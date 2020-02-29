const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const fetch = require('node-fetch');
const cors = require('cors')
const db = require("./db");
const groupBy = require("./groupBy");
const uuidv1 = require('uuid/v1');
const schema = process.env.SCHEMA;
const getProfile = process.env.GETPROFILE;
const postProfile = process.env.POSTPROFILE;
const debug = process.env.DEBUG;
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://39cd071f77f34837ad6c930c5c7fc322@sentry.io/1987793' });

var app = express();

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline' *.typekit.net; img-src 'self' *.sfmc-content.com "+process.env.IMAGE_CDN+"; frame-ancestors 'none'; frame-src 'none'; font-src 'self' *.typekit.net;");
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Strict-Transport-Security', 'max-age=200'); 
  res.set('X-Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline' *.typekit.net; img-src 'self' *.sfmc-content.com "+process.env.IMAGE_CDN+"; frame-ancestors 'none'; frame-src 'none'; font-src 'self' *.typekit.net;");
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'deny');
  res.set('X-Powered-By', '');
  res.set('X-WebKit-CSP',  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline' *.typekit.net; img-src 'self' *.sfmc-content.com "+process.env.IMAGE_CDN+"; frame-ancestors 'none'; frame-src 'none'; font-src 'self' *.typekit.net;");
  res.set('X-XSS-Protection', '1; mode=block');
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client/build'));
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.end();
});
var whitelist = process.env.ENV_URL
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

/*=========================*/
/*====== GET Routes =======*/
/*=========================*/
app.get('/', cors(corsOptions), async function(req, res, next) {
  console.log(process.env.DATABASE_URL);
  var id = req.query.id; 
  var langBU = req.query.langBU;

  try{
    if(id && langBU){
      res.render('index', {});
    }else{
      res.render('error', {});
    }
  } catch (err) {
    return next(err);
  }
})

app.get('/error', cors(corsOptions), async function(req, res, next) {
  res.render('error', {});
})

app.get('/maintenance', cors(corsOptions), async function(req, res, next) {
  res.render('error', {});
})

app.get('/api/subscriptions', cors(corsOptions), async function(req, res, next) {
  var id = req.query.id; 
  var langBU = req.query.langBU;

  try{
    let leadOrContact = id.substring(0,3) == '00Q' ? 'sub.ncpc__Lead__c' : 'sub.ncpc__Contact__c';
    var split = langBU.split('-');
    var lang = split[0];
    var bu = split[1];
    var variantLangBUClause = lang === '' ? "variant.ncpc__Default_Variant__c = 'true' AND variant.ncpc__Business_Unit_Parameter__c = '"+bu+"'" : "variant.ncpc__Parameter__c = '"+ langBU +"'";
    var catLangBUClause = lang === '' ? "cat.ncpc__Default_Variant__c = 'true' AND cat.ncpc__Business_Unit_Parameter__c = '"+bu+"'" : "cat.ncpc__Parameter__c = '"+ langBU +"'";
    var cvLangBUClause = lang === '' ? "cv.ncpc__Default_Variant__c = 'true' AND cv.ncpc__Business_Unit_Parameter__c = '"+bu+"'" : "cv.ncpc__Parameter__c = '"+ langBU +"'";

    const avails = await db.query("SELECT *, avail.sfid as availableSubId, ncpc__categoryorder__c as catorder, cm.sfid as campaignMemberId, c.sfid as campaignId, (SELECT sub.ncpc__Opt_In__c FROM "+schema+".ncpc__PC_Subscription__c as sub WHERE " + leadOrContact + " = '" + id + "' AND avail.sfid = sub.ncpc__Related_Subscription_Interest__c) as OptInState, (SELECT sfid as userSubId FROM "+schema+".ncpc__PC_Subscription__c as sub WHERE " + leadOrContact + " = '" + id + "' AND avail.sfid = sub.ncpc__Related_Subscription_Interest__c) as userSubId, (SELECT cat.ncpc__Display_Category_Text__c FROM "+schema+".ncpc__Category_Variant__c as cat WHERE avail.ncpc__CategoryId__c = cat.ncpc__Category__c AND "+ catLangBUClause +") as CategoryName, (SELECT cv.ncpc__Display_Text__c FROM "+schema+".ncpc__Campaign_Variant__c as cv WHERE c.sfid = cv.ncpc__Campaign__c AND "+ cvLangBUClause +") as campaignname FROM "+schema+".ncpc__PC_Available_Subscription_Interest__c as avail INNER JOIN "+schema+".ncpc__Available_Subscription_Variant__c as variant ON avail.sfid = variant.ncpc__Available_Subscription_Interest__c LEFT JOIN "+schema+".campaign c ON c.ncpc__related_subscription__c = avail.sfid LEFT JOIN "+schema+".campaignmember cm ON cm.campaignid = c.sfid WHERE avail.ncpc__Status__c = true AND avail.ncpc__Type__c = 'Subscription' AND "+ variantLangBUClause +" ORDER BY avail.ncpc__order__c");

    const groupedCampaign = groupBy.groupBySubscriptionCampaign(avails.rows, 'availablesubid');
    const groupedAvails = groupBy.groupBySubscription(groupedCampaign, 'catid');

    if(debug){console.log("groupedAvails "+JSON.stringify(groupedAvails));}

    res.render('subscriptions', {
      subscriptions: groupedAvails
    });
  } catch (err) {
    return next(err);
  }
})

app.get('/api/interests', cors(corsOptions), async function(req, res, next) {
  var id = req.query.id; 
  var langBU = req.query.langBU;

  try{
    let leadOrContact = id.substring(0,3) == '00Q' ? 'int.ncpc__Lead__c' : 'int.ncpc__Contact__c';
    var split = langBU.split('-');
    var lang = split[0];
    var bu = split[1];
    var variantLangBUClause = lang === '' ? "variant.ncpc__Default_Variant__c = 'true' AND variant.ncpc__Business_Unit_Parameter__c = '"+bu+"'" : "variant.ncpc__Parameter__c = '"+ langBU +"'";
    var catLangBUClause = lang === '' ? "cat.ncpc__Default_Variant__c = 'true' AND cat.ncpc__Business_Unit_Parameter__c = '"+bu+"'" : "cat.ncpc__Parameter__c = '"+ langBU +"'";

    const avails = await db.query("SELECT *, avail.sfid as availableIntId, (SELECT int.ncpc__selected__c FROM "+schema+".ncpc__PC_Interest__c as int WHERE " + leadOrContact + " = '" + id + "' AND avail.sfid = int.ncpc__interest_selected__c) as OptInState, (SELECT sfid as userSubId FROM "+schema+".ncpc__PC_Interest__c as int WHERE " + leadOrContact + " = '" + id + "' AND avail.sfid = int.ncpc__Interest_Selected__c) as userIntId, (SELECT cat.ncpc__Display_Category_Text__c FROM "+schema+".ncpc__Category_Variant__c as cat WHERE avail.ncpc__CategoryId__c = cat.ncpc__Category__c AND "+ catLangBUClause +") as CategoryName FROM "+schema+".ncpc__PC_Available_Subscription_Interest__c as avail INNER JOIN "+schema+".ncpc__Available_Subscription_Variant__c as variant ON avail.sfid = variant.ncpc__Available_Subscription_Interest__c WHERE avail.ncpc__Status__c = true AND avail.ncpc__Type__c = 'Interest' AND "+ variantLangBUClause +" ORDER BY avail.ncpc__order__c");
    
    const groupedAvails = groupBy.groupByInterest(avails.rows, 'ncpc__display_category__c');

    if(debug){console.log("groupedAvails "+JSON.stringify(groupedAvails));}

    res.render('interests', {
      interests: groupedAvails
    });
  } catch (err) {
    return next(err);
  }
})

app.get('/api/profiles', cors(corsOptions), async function(req, res, next) {
  var id = req.query.id; 
  var langBU = req.query.langBU;

  try{
    let leadOrContact = id.substring(0,3) == '00Q' ? 'lead' : 'contact';
    var split = langBU.split('-');
    var lang = split[0];
    var bu = split[1];
    var variantLangBUClause = lang === '' ? "variant.ncpc__default_variant__c = 'true' AND variant.ncpc__business_unit_parameter__c = '"+bu+"'" : "variant.ncpc__parameter__c = '"+ langBU +"'";
    var vpOptionLangBUClause = lang === '' ? "pvOption.ncpc__default_variant__c = 'true' AND pvOption.ncpc__business_unit_parameter__c = '"+bu+"'" : "pvOption.ncpc__parameter__c = '"+ langBU +"'";

    const profile = await db.query("SELECT prof.sfid as profid, prof.ncpc__field_type__c as fieldType, prof.ncpc__editable__c as disabled, prof.ncpc__order__c as order, variant.ncpc__field_text__c as label, variant.ncpc__field_placeholder_text__c as placeholder, pOption.ncpc__order__c as optionorder, pvOption.ncpc__value__c as optionvalue, pvOption.ncpc__option__c as optionlabel, pOption.sfid as optionid, * FROM "+schema+".ncpc__pc_profile_field__c as prof INNER JOIN "+schema+".ncpc__profile_field_variant__c as variant ON prof.sfid = variant.ncpc__profile_field__c LEFT JOIN "+schema+".ncpc__pc_profile_option__c as pOption ON prof.sfid = pOption.ncpc__profile_field__c LEFT JOIN "+schema+".ncpc__profile_option_variant__c as pvOption ON pOption.sfid = pvOption.ncpc__profile_option__c AND "+vpOptionLangBUClause+" WHERE prof.ncpc__status__c = true AND "+variantLangBUClause+" ORDER BY prof.ncpc__order__c");
    var profileRows = profile.rows;

    if(debug){console.log("profileRows "+JSON.stringify(profileRows));}

    const groupedProfile = groupBy.groupByProfile(profileRows, 'ncpc__'+leadOrContact+'mappedfield__c');
    var profileArray = groupedProfile.map(groupedProfile => groupedProfile.mappedField).join(',');

    // if an external endpoint needs to be called, make a post call to that service for the users detail
    if(getProfile){
      let data = {
        id: id,
        object: leadOrContact,
        fields: profileArray
      };
      var headers = {
        "Content-Type": "application/json"
      }
      
      const userRows = await fetch(getProfile, { method: 'POST', headers: headers, body: JSON.stringify(data)});
      const user = await userRows.json();
    
      if(debug){console.log("user "+JSON.stringify(user));}

      var fieldKeys = Object.keys(user[0]);
      for (var i=0; i<fieldKeys.length; i++) {
        var fieldValue = user[0][fieldKeys[i]];
        var getField = groupedProfile.find(field => field.mappedField === fieldKeys[i]);
        if(getField){
          getField['value'] = fieldValue;
        }
      }
      if(debug){console.log("groupedProfile "+JSON.stringify(groupedProfile));}
      res.render('profile', {
        profile: groupedProfile
      });
    }else{
      const user = await db.query("SELECT "+profileArray+" FROM "+schema+"."+leadOrContact+" WHERE sfid = '"+id+"'");

      if(debug){console.log("user "+JSON.stringify(user.rows));}

      var fieldKeys = Object.keys(user.rows[0])
      for (var i=0; i<fieldKeys.length; i++) {
        var fieldValue = user.rows[0][fieldKeys[i]];
        var getField = groupedProfile.find(field => field.mappedField.toLowerCase() === fieldKeys[i]);
        if(getField){
          getField['value'] = fieldValue;
        }
      }
      if(debug){console.log("groupedProfile "+JSON.stringify(groupedProfile));}
      res.render('profile', {
        profile: groupedProfile
      });
    }

  } catch (err) {
    return next(err);
  }
})

app.get('/api/package', cors(corsOptions), async function(req, res, next) {
  var langBU = req.query.langBU;

  try{
    if(langBU){
      var split = langBU.split('-');
      var lang = split[0];
      var bu = split[1];
      // get correct package configuration
      const packageConfig = await db.query("SELECT * FROM "+schema+".ncpc__pc_package_configuration__c WHERE ncpc__parameter__c = '"+langBU+"'");
      // get Business unit langauge records to identify what languages to show in drop down
      const languages = await db.query("SELECT * FROM "+schema+".ncpc__businessunit_language__c WHERE ncpc__business_unit_parameter__c = '"+bu+"'");

      var package = {};
      package.config = packageConfig.rows;
      package.languages = languages.rows;

      if(debug){console.log("package "+JSON.stringify(package));}

      res.render('package', {
        config: package
      });
    }else{
      res.render('error', {});
    }
  } catch (err) {
    return next(err);
  }
})

/*==========================*/
/*====== POST Routes =======*/
/*==========================*/

app.post("/api/subscription", cors(corsOptions), async function(req, res, next) {
  var availableSubId = req.body.availableSubId;
  var value = req.body.value;
  var id = req.body.id; 
  var today = dateFormat(new Date(), "yyyy-mm-dd");
  try {
    let leadOrContact = id.substring(0,3) == '00Q' ? 'ncpc__lead__c' : 'ncpc__contact__c';
    if(availableSubId && id){
      const subs = await db.query("SELECT * FROM "+schema+".ncpc__pc_subscription__c WHERE ncpc__related_subscription_interest__c = '" + availableSubId + "' AND "+leadOrContact+" = '"+id+"'");
      if(subs.rows.length > 0){
        var customerSubId = subs.rows[0].sfid;
        var externalKey = subs.rows[0].ncpc__external_id__c === '' ? uuidv1() : subs.rows[0].ncpc__external_id__c;
        var dateField = value === 'true' ? 'ncpc__opt_in_date__c' : 'ncpc__opt_out_date__c';
        // Subscription exists, update existing
        const result = await db.query(
          "UPDATE "+schema+".ncpc__pc_subscription__c SET "+dateField+"=$1, ncpc__opt_in__c=$2, ncpc__subscription_type__c=$3, ncpc__external_Id__c=$4 WHERE sfid=$5 RETURNING *",
          [today, value, 'Expressed', externalKey, customerSubId]
        );
        res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
      }else{
        // Net new Subscription, create record
        const result = await db.query(
          "INSERT INTO "+schema+".ncpc__pc_subscription__c ("+leadOrContact+",ncpc__related_subscription_interest__c,ncpc__subscription_type__c,ncpc__opt_in_date__c,ncpc__initial_opt_in_date__c,ncpc__opt_in_source__c,ncpc__opt_in__c, ncpc__external_id__c) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [id, availableSubId, 'Expressed', today, today, 'Preference Center', value, uuidv1()]
        );
        res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
      }
      }else{
        console.log("Subscription Post - Missing Required Data: " + JSON.stringify(req.body));
        res.json({"success":"fail","status":402,"message":"Missing required data","body":req.body});
      }
  } catch (e) {
    console.log("Post Log Error: " + JSON.stringify(e));
    res.json({"success":"fail","status":401,"message":"Error Occured","body":e});
  }
});

app.post('/api/profile', async function(req, res, next) {
  var field = req.body.field;
  var value = req.body.value;
  var id = req.body.id; 

  try {
    let leadOrContact = id.substring(0,3) == '00Q' ? 'lead' : 'contact';

    if (id && field && value) {
      if (postProfile) {
        let data = {
          field: field,
          id: id,
          value: value,
          object: leadOrContact
        };
        var headers = {
          "Content-Type": "application/json"
        }
        
        const userRows = await fetch(postProfile, { method: 'POST', headers: headers, body: JSON.stringify(data)});
        const user = await userRows.json();

        res.json({
          'success': user.success,
          'status': user.status,
          'message': user.message,
          'body': user.body
        });
      } else {
        const updateProfile = await db.query(
          `UPDATE ${schema}.${leadOrContact} SET ${field}=$1 WHERE sfid=$2 RETURNING *`,
          [value, id]
        );

        res.json({
          'success': true,
          'status': 200,
          'message': 'Update Successful',
          'body': updateProfile.rows
        });
      }
    } else {
      if (debug) { console.log('Profile Post - Missing Required Data: ' + JSON.stringify(req.body)); }

      res.json({
        'success':'fail',
        'status':402,
        'message':'Missing required data',
        'body':req.body
      });
    }
  }  catch(e) {
    if (debug) { console.log('Post Log Error: ' + JSON.stringify(e)) };

    res.json({
      'success': 'fail', 
      'status': 401, 
      'message': 'Error Occured', 
      'body': e
    });
  }
});

app.post('/api/interest', cors(corsOptions), async function(req, res, next) {
  var availableIntId = req.body.availableIntId;
  var value = req.body.value;
  var id = req.body.id; 
  var today = dateFormat(new Date(), "yyyy-mm-dd");

  try {
    let leadOrContact = id.substring(0,3) == '00Q' ? 'ncpc__Lead__c' : 'ncpc__Contact__c';
    if(availableIntId && id){
      const ints = await db.query("SELECT * FROM "+schema+".ncpc__PC_Interest__c WHERE ncpc__interest_selected__c = '" + availableIntId + "' AND "+leadOrContact+" = '"+id+"'");
      if(ints.rows.length > 0){
        var customerIntId = ints.rows[0].sfid;
        var externalKey = ints.rows[0].ncpc__external_id__c === '' ? uuidv1() : ints.rows[0].ncpc__external_id__c;
        // Interest exists, update existing
        const result = await db.query(
          "UPDATE "+schema+".ncpc__PC_Interest__c SET ncpc__Captured_Date__c=$1, ncpc__Selected__c=$2, ncpc__External_Id__c=$3 WHERE sfid=$4 RETURNING *",
          [today, value, externalKey, customerIntId]
        );
        res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
      }else{
        // Net new Interest, create record
        const result = await db.query(
          "INSERT INTO "+schema+".ncpc__PC_Interest__c ("+leadOrContact+",ncpc__Interest_Selected__c,ncpc__Captured_Date__c,ncpc__Selected__c,ncpc__External_Id__c) VALUES ($1,$2,$3,$4,$5) RETURNING *",
          [id, availableIntId, today, value, uuidv1()]
        );
        res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
      }
    }else{
      console.log("Interest Post - Missing Required Data: " + JSON.stringify(req.body));
      res.json({"success":"fail","status":402,"message":"Error Occured","body":req.body});
    }
  } catch (e) {
    console.log("Post Log Error: " + JSON.stringify(e));
    res.json({"success":"fail","status":401,"message":"Error Occured","body":e});
  }
});

app.post('/api/log', cors(corsOptions), async function(req, res, next) {
  var overallStatus = req.body.overallStatus;
  var errorMessage = req.body.errorMessage;
  var requestPayload = req.body.requestPayload;
  var endpoint = req.body.endpoint; 

  try{
    if(endpoint && overallStatus){
      const result = await db.query(
        "INSERT INTO "+schema+".ncpc__PC_Log__c (ncpc__overallStatus__c,ncpc__errorMessage__c,ncpc__requestPayload__c,ncpc__endpoint__c,ncpc__External_Id__c) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [overallStatus, errorMessage, requestPayload, endpoint, uuidv1()]
      );
      res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
    }else{
      console.log("Log Post - Missing Required Data: " + JSON.stringify(req.body));
      res.json({"success":"fail","status":402,"message":"Error Occured","body":req.body});
    }
  }catch(e){
    console.log("Post Log Error: " + JSON.stringify(e));
    res.json({"success":"fail","status":401,"message":"Error Occured","body":e});
  }
});

app.post('/api/unsubscribeAll', cors(corsOptions), async function(req, res, next) {
  var id = req.body.id; 
  var today = dateFormat(new Date(), "yyyy-mm-dd");

  try{
    if(id){
      let leadOrContact = id.substring(0,3) == '00Q' ? 'ncpc__Lead__c' : 'ncpc__Contact__c';
      const subs = await db.query("SELECT * FROM "+schema+".ncpc__PC_Subscription__c WHERE "+leadOrContact+" = '" + id + "' AND ncpc__Opt_In__c = 'true'");

      if(subs.rows.length > 0){
        for (var i=0; i<subs.rows.length; i++) {
          var externalKey = subs.rows[i].ncpc__external_id__c === '' ? uuidv1() : subs.rows[i].ncpc__external_id__c;
          if(externalKey){
            const result = await db.query(
              "UPDATE "+schema+".ncpc__PC_Subscription__c SET ncpc__Opt_Out_Date__c=$1, ncpc__Opt_In__c=$2, ncpc__subscription_type__c=$3 WHERE "+leadOrContact+"=$4 RETURNING *",
              [today, 'false', 'Expressed', id]
            );
            if(i != subs.rows.length - 1 || subs.rows.length == 1){
              res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
            }
          }else{
            const result = await db.query(
              "UPDATE "+schema+".ncpc__PC_Subscription__c SET ncpc__Opt_Out_Date__c=$1, ncpc__Opt_In__c=$2, ncpc__External_Id__c=$3, ncpc__subscription_type__c=$4 WHERE "+leadOrContact+"=$5 RETURNING *",
              [today, 'false', externalKey, 'Expressed', id]
            );
            if(i != subs.rows.length - 1 || subs.rows.length == 1){
              res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
            }
          }
        }
      }else{
        res.json({"success":true,"status":200,"message":"No records to update","body":""});
      }
    }else{
      console.log("Unsubscribe All Post - Missing Required Data: " + JSON.stringify(req.body));
      res.json({"success":"fail","status":402,"message":"Error Occured","body":req.body});
    }
  }catch(e){
    console.log("Post UnsubscribeAll Error: " + JSON.stringify(e));
    res.json({"success":"fail","status":401,"message":"Error Occured","body":e});
  }
});

app.post('/api/campaignMember', cors(corsOptions), async function(req, res, next) {
  var id = req.body.id; 
  var campaignMemberId = req.body.campaignMemberId;
  var value = req.body.value;
 
  try{
    if(id && campaignMemberId && value){
      const cm = await db.query("SELECT * FROM "+schema+".campaignmember WHERE sfid = '" + campaignMemberId + "'");
      if(cm.rows.length > 0){
        var externalKey = cm.rows[0].ncpc__external_id__c === '' ? uuidv1() : cm.rows[0].ncpc__external_id__c;
        // Update campaign member status 
        const result = await db.query(
          "UPDATE "+schema+".campaignmember SET ncpc__Subscribed__c=$1, ncpc__External_Id__c=$2 WHERE sfid=$3 RETURNING *",
          [value, externalKey, campaignMemberId]
        );
        res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
      }
      res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});
    }else{
      console.log("Campaign Member Post - Missing Required Data: " + JSON.stringify(req.body));
      res.json({"success":"fail","status":402,"message":"Error Occured","body":req.body});
    }
  }catch(e){
    console.log("Post Campaign Error: " + JSON.stringify(e));
    res.json({"success":"fail","status":401,"message":"Error Occured","body":e});
  }
});

/*** error handler middleware ***/

app.use((req, res, next) => {
  res.render('error', {});
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
      },
    });
  });

app.listen(process.env.PORT || 5000);