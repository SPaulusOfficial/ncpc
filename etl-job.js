var jsforce = require('jsforce');
const db = require("./db");

var conn = new jsforce.Connection({
    oauth2 : {
        clientId : process.env.CONSUMER_KEY,
        clientSecret : process.env.CONSUMER_SECRET,
        redirectUri : process.env.ENV_URL
    }
});
conn.login("shanesmyth8+nocodepc@gmail.com", "cM375!355nlPhuRyiZh1E7fXQogrj5QD5", function(err, userInfo) {
    if (err) { return console.error(err); }
});
//
// Get authorization url and redirect to it.
//
app.get('/oauth2/auth', function(req, res) {
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});


function sayHello() {
    console.log('Hello');
}

//  pull delta's / inserts for contact, lead, campaignmember from postgres tables
//  upsert into the respective tables
/*
function getRecords(){
    const profile = await db.query("SELECT prof.sfid as profid, prof.ncpc__field_type__c as fieldType, prof.ncpc__editable__c as disabled, prof.ncpc__order__c as order, variant.ncpc__field_text__c as label, variant.ncpc__field_placeholder_text__c as placeholder, pOption.ncpc__order__c as optionorder, pvOption.ncpc__value__c as optionvalue, pvOption.ncpc__option__c as optionlabel, pOption.sfid as optionid, * FROM "+schema+".ncpc__pc_profile_field__c as prof INNER JOIN "+schema+".ncpc__profile_field_variant__c as variant ON prof.sfid = variant.ncpc__profile_field__c LEFT JOIN "+schema+".ncpc__pc_profile_option__c as pOption ON prof.sfid = pOption.ncpc__profile_field__c LEFT JOIN "+schema+".ncpc__profile_option_variant__c as pvOption ON pOption.sfid = pvOption.ncpc__profile_option__c AND "+vpOptionLangBUClause+" WHERE prof.ncpc__status__c = true AND "+variantLangBUClause+" ORDER BY prof.ncpc__order__c");
    var profileRows = profile.rows;
    batchRecords(records, 'contact', 'update');
}*/

//records, object, type
function batchRecords(){
    // Provide records
    var subs = [
        { id : 'a022E00000XerA0QAJ', ncpc__Contact__c: "0032E00002SKfXdQAL", ncpc__Related_Subscription_Interest__c: "a012E00000jdwlsQAA", ncpc__Opt_In__c: "false"},
        { id : 'a022E00000Xf1LoQAJ', ncpc__Contact__c: "0032E00002SKfXkQAL", ncpc__Related_Subscription_Interest__c: "a012E00000hJ2uPQAS", ncpc__Opt_In__c: "true"},
        { id : '', ncpc__Contact__c: "0032E00002jqaniQAA", ncpc__Related_Subscription_Interest__c: "a012E00000hJ2uKQAS", ncpc__Opt_In__c: "true"}
    ];
    // Create job and batch
    var job = conn.bulk.createJob("ncpc__PC_Subscription__c", "upsert");
    var batch = job.createBatch();
    // start job
    batch.execute(subs);
    // listen for events
    batch.on("error", function(batchInfo) { // fired when batch request is queued in server.
        console.log('Error, batchInfo:', batchInfo);
    });
    batch.on("queue", function(batchInfo) { // fired when batch request is queued in server.
        console.log('queue, batchInfo:', batchInfo);
        batch.poll(1000 /* interval(ms) */, 20000 /* timeout(ms) */); // start polling - Do not poll until the batch has started
    });
    batch.on("response", function(rets) { // fired when batch finished and result retrieved
        for (var i=0; i < rets.length; i++) {
        if (rets[i].success) {
            console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
        } else {
            console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
        }
        }
        // ...
    });
}

sayHello();
batchRecords()