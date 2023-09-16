/*****************************************
 * OAuth module
 *****************************************/
 
 // imports
const request = require('sync-request');
const querystring = require('querystring');
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');
const fs = require('fs');

// exports
module.exports = {main, mediaType, withOAuth, withRel, withId, withName, withForm, withBasic};
 
// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};
var authStore = {};

var defaultFile = __dirname + "/../oauth.env";

// return media type
function mediaType() {
  return "NO-MEDIA-TYPE"; // fits no types
} 

// support pulling token into request
function withOAuth(args) {
  var rt = "";
  var name = args.thisWord;
  authStore = args.authStore;
  
  if(authStore==={}) {
    oauthLoad();
  }
 
  //console.log(name);
  try {
    if(name==="twitter") {
      rt = authStore[name].user_access_token;
    }
    else {
      rt = authStore[name].access_token;
    }  
  } catch {
    // no op
  }
  //console.log(rt);
  return rt;
}

function withBasic(args) {
  var rt = "";
  var buff;
  var data;
  var name = args.thisWord;
  authStore = args.authStore;
  
  if(authStore==={}) {
    oauthLoad();
  }
  
  try {
    data = authStore[name].username + ":" + authStore[name].password;
    buff = Buffer.from(data);
    rt = buff.toString("base64");
  } catch {
    // no op
  }
  return rt;
}


// support WITH-REL
function withRel(args) {
  return "#";
}

// support WITH-ID
function withId(args) {
  return "#";
}

// support WITH-NAME
function withName(args) {
  return "#";
}

// support WITH-FORM
function withForm(args) {
  var response = args.response;
  var thisWord = args.thisWord
  var headers = args.headers;
  var method = args.method;
  var body = args.body;
  var fields = args.fields
  var fieldSet = args.fieldSet;
  var url = args.url;
  return  {headers:headers, method:method, body:body, url:url, fields:fields, fieldSet:fieldSet}  
}
// handle oauth
// args: {responses:responses,dataStack:dataStack,config:config,words:words:authStore:authStore}
function main(args) {
  config = args.config;
  responses = args.responses;
  dataStack = args.dataStack;  
  var words = args.words;
  authStore = args.authStore;
  var rt = {};
  var index = 0;
  var token = words[1]||"";
  var response;
  var thisWord = "";
  var path = "";
    
  switch (token.toUpperCase()) {
    case "HELP":
      rt = showHelp(words);
      break;
    case "LIST":
      rt = oauthList(words);
      break;
   case "DEFINE":
      rt = oauthDefine(words);
      break;
    case "UPDATE":
      rt = oauthUpdate(words);
      break;
    case "REMOVE":
      rt = oauthRemove(words);
      break;
    case "GEN":  
    case "GENERATE":
      rt = oauthGenerate(words);
      break;
    case "SAVE":
      rt = oauthSave(words);
      break;
    case "LOAD":
      rt = oauthLoad(words);
      break;
    default: 
      rt = {};
  }
  return {responses:responses, dataStack:dataStack, config:config, authStore:authStore, words:words, rt:JSON.stringify(rt, null, 2)};
}

function oauthList(words) {
  var rt = "";
  var name = words[2]||"";
  
  if(name!=="" && authStore[name]) {
    rt = authStore[name];
  }
  else {
    rt = authStore;
  }
  return rt;
}

function oauthDefine(words) {
  var rt = "";
  var set = {};
  var name = words[2]||"";
  var token = words[3]||"{}";
   
  try {
    set = JSON.parse(token);
    authStore[name] = set;
  } catch {
      // no-op
  }
  return set;
}

// update names definition
function oauthUpdate(words) {
  var rt = "";
  var set = {};
  var name = words[2]||"";
  var token = words[3]||"{}";
  var props = {};
  
  try {
    set = JSON.parse(token);
    props = authStore[name]||{};
    if(props!=={}) {
      for(var c in set) {
        props[c] = set[c];
      }
      authStore[name] = props;
    }  
  } catch {
    // no-op
  }  
  return authStore;
}

// remove named definition
function oauthRemove(words) {
  var rt = "";
  var set = {};
  name = words[2]||"";
  
  try {
    for(var c in authStore) {
      if(c!==name) {
        set[c] = authStore[c];
      }
    }
    authStore = set;
  } catch {
    // no-op
  }
  return authStore;
}

function oauthGenerate(words) {
  var rt = {};
  var response = null;
  var name = words[2]||"";
  var body = {};
  var set = {};
  var headers = {};
  var encodedBody = "";
  var flavor = "";
  if(name!=="" && authStore[name]) {
  
    url = authStore[name].url||"#";
    flavor = authStore[name].flavor||"#";
    
    switch (flavor.toLowerCase()) {
      case "okta":
        body.grant_type = "client_credentials";
        body.scope=authStore[name].scope||"customScope";
        try {
          var data = authStore[name].id + ":" + authStore[name].secret;
          var buff = Buffer.from(data);
          var basic = buff.toString("base64");
          headers["authorization"]="Basic "+basic;
          headers["accept"]="application/json";
          headers["cache-control"]="no-cache";
        } catch {
          // no op
        }
        break;
      case "twitter2":
      case "twitter":
        try {
          var data = authStore[name].id+":"+authStore[name].secret;
          var buff = Buffer.from(data);
          var basic = buff.toString("base64");
          headers["authorization"]="Basic "+basic;        
        } catch {
          // no-op
        }
        break;
      case "auth0":
        try {
          body.grant_type = "client_credentials";
          body.client_id = authStore[name].id||"";
          body.client_secret = authStore[name].secret||"";
          body.audience = authStore[name].audience||"";
          headers["content-type"]="application/json";
        } catch {
          // no-op
        }
        break;
      case "mastodon":
        try {
          body.grant_type = "client_credentials";
          body.client_id = authStore[name].client_id||"";
          body.client_secret = authStore[name].client_secret||"";
          body.redirect_uri = authStor[name].redirect_uri||"urn:ietf:oauth:2.0:oob";
          body.scopes = "read write follow push";
        } catch {
          // no-op
        }
        break;
      case "oauth":     
      default :
        try {
          body.grant_type = "client_credentials";
          body.client_id = authStore[name].id||"";
          body.client_secret = authStore[name].secret||"";
        } catch {
          // no-op
        }  
        break;      
    }
        
    if(authStore[name] && authStore[name]["content-type"]) {
      headers["content-type"]=utils.fixString(authStore[name]["content-type"]);
    }   
    
    if(utils.fixString(headers["content-type"])==="application/x-www-form-urlencoded") {
      encodedBody = querystring.stringify(body);
    }
    else {
      encodedBody = JSON.stringify(body);
    }
    
    response = request("POST", url, {headers:headers, body:encodedBody});
    
    set = JSON.parse(response.getBody("UTF8"));
    for(var s in set) {
      authStore[name][s] = set[s];
    }
    rt = set;
  }
  return ""; //rt;
}

// save oauthStore file to disk
function oauthSave(words) {
  var rt = "";
  var data = "";
  var target = "";
  data = JSON.stringify(authStore, null, 2);
  target = words[2]||defaultFile;
  
  console.log(__dirname);
  
  try {
    fs.writeFileSync(target,data);
    rt = "oAuth store saved as ["+target+"]";
  } catch (err) {
    rt = "ERR: " + console.error(err);
  }
  return rt;
}

// load oauthStore from file
// overwrites any existing settings of the same name
function oauthLoad(words) {
  var rt = "";
  var set = {};
  var data = "";
  var target = words[2]||defaultFile;

  try {
    if(fs.existsSync(target)) {
      data = fs.readFileSync(target, {encoding:'utf8', flag:'r'});
      set = JSON.parse(data);
      for(var c in set) {
        authStore[c] = set[c];
      }
      rt = ""; //authStore;
    }
    else {
      rt = "can't open ["+target+"]";
    }  
  } catch(err) {
    rt = "ERR: "+console.error(err);
  }
  return rt;
}



// show help text
function showHelp(thisWord) {
  var rt = ""
  rt = 
 `OAUTH
    LIST [name|$#] (lists existing OAUTH definitions using optional name filter
    DEFINE <name> <{"url":"...","id":"...","secret":"...","audience":"...","type":"..."}> (creates a new definition)
    UPDATE <name|$#> <{"n":"...","v":"..."}> (updates existing <name> definition)
    REMOVE <name|$#> (removes <name> from OAUTH collection
    GENERATE <auth-name|$#> (gets a token from OAUTH provider and loads it into the <name> definition)
    SAVE [file-name|$#] saves entire configuration set to disk (defaults to oauth.env)
    LOAD [file-name|$#] reads entire configuration set from disk (defaults to oauth.env)
 `;
      
  console.log(rt);    
  
  return "";
}

