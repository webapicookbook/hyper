/****************************
 * SIREN command module
 ****************************/
 
// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');

// exports
module.exports = {main, mediaType, withRel, withId};

// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};

// return media type
function mediaType () {
  return "application/vnd.siren+json";
}

// support for WITH-REL
function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$.links"; 
  var url = "";
  var rt, link;
  
  try {
    rt = JSONPath({path:path, json:response})[0];
    for(var i=0; i<rt.length; i++) {
      var link = rt[i];
      for(var j=0; j<link.rel.length; j++) {
        if(link.rel[j]===thisWord) {
          url = link.href; // finally got it!
        }
      }
    }
  } catch {
    // no-op
  }
  return url;
}


// support for WITH-ID
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  thisWord = utils.configValue({config:config,value:thisWord});
  var token = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^"
  console.log(token);
  try {
    rt = JSONPath({path:token, json:response})[0].href;
  } catch (err){
    // no-op
    console.log(err);
  }
  return rt; 
}

// display and parse a SIREN response
// SIREN {command}
// args:{responses:responses,dataStack:dataStack,words:words}
function main(args) {
  responses = args.responses;
  dataStack = args.dataStack;
  var words = args.words;
  var rt="";
  var token = words[1]||"";
  var response;
  var node = {};
  var thisWord = "";

  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "LINKS":
      rt = JSON.parse(response.getBody('UTF8')).links;
      break;
    case "PROPERTIES":
      rt = JSON.parse(response.getBody('UTF8')).properties;
      break;
    case "ACTIONS":
      rt = JSON.parse(response.getBody('UTF8')).actions;
      break;
    case "ENTITIES":
      rt = JSON.parse(response.getBody('UTF8')).entities;
      break;
    case "FORMS":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$.actions.*[?(@property==='name')]";
      try {
        rt = JSONPath({path:token,json:rt});
      } catch {
        // no-op
      }
      break;
    case "NAMES":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='name')]";
      try {
        rt = JSONPath({path:token,json:rt});
      } catch {
        // no-op
      }
      break;
    case "IDS":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='id')]";
      try {
        rt = JSONPath({path:token,json:rt});
      } catch {
        // no-op
      }
      break;
    case "RELS":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='rel')]";
      try {
        rt = JSONPath({path:token,json:rt});
      } catch {
        // no-op
      }
      break;
    case "ID": // entities -- by convention, tho
    case "ENTITY":  
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      token = "$.entities.*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^"
      if("rel id name".toLowerCase().indexOf(token.toLowerCase())==-1) {
         try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:token, json:rt})[0];
        } catch {
          // no-op
        }
     }
      else {
        rt = "no response";
      }
      break;
    case "NAME": // actions
    case "FORM":
    case "ACTION":  
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      token = "$.actions.*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^"
      if("rel id name".toLowerCase().indexOf(token.toLowerCase())==-1) {
         try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:token, json:rt})[0];
        } catch {
          // no-op
        }
     }
      else {
        rt = "no response";
      }
      break;
    case "REL": // links
    case "LINK":  
      token = "$.links"
      if("rel id name".toLowerCase().indexOf(token.toLowerCase())==-1) {
        try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:token, json:rt})[0];
          for(var i=0; i<rt.length; i++) {
            var link = rt[i];
            for(var j=0; j<link.rel.length; j++) {
              if(link.rel[j]===words[2]) {
                node = link;
              }
            }
          }
          rt = node;
        } catch {
          // no-op
        }
      }  
      else {
        rt = "no response";
      }  
      break;
    case "PATH":  
      token = words[2]||"$";
      token = utils.configValue({config:config,value:token});
      console.log(token);
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    default:  
      try {
        response = responses.peek()
        rt = JSON.parse(response.getBody("UTF8"));
      } catch {
        rt = "no response";
      }
  }
  return {responses:responses,dataStack:dataStack,config:config,words:words,rt:JSON.stringify(rt, null, 2)};
}

