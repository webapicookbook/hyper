/****************************
 * SIREN command module
 ****************************/
 
// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('./hyper-utils');

// exports
module.exports = main;

// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};

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
    case "ID": // entities -- by convention, tho
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

