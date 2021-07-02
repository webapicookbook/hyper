/*****************************************
 * wstl-json module
 *****************************************/
 
 // imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');

// exports
module.exports = {main, mediaType, withRel};
 
// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};

// return media type
function mediaType() {
  return "application/vnd.wstl+json";
} 

function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$..actions"; 
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
  } catch (err){
    // no-op
  }
  return url;
}

// display a parse WeSTL-JSON object
// WSTL {command}
// args: {responses:responses,dataStack:dataStack,config:config,words:words}
function main(args) {
  config = args.config;
  responses = args.responses;
  dataStack = args.dataStack;  
  var words = args.words;
  var rt = {};
  var index = 0;
  var token = words[1]||"";
  var response;
  var thisWord = "";
  var path = "";
  
  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "TITLE":
      rt = JSON.parse(response.getBody('UTF8')).wstl.title||"";
      break;
   case "ACTIONS":
      rt = JSON.parse(response.getBody('UTF8')).wstl.actions||[];
      break;
    case "CONTENT":
      rt = JSON.parse(response.getBody('UTF8')).wstl.content||{};
      break;
    case "DATA":
      rt = JSON.parse(response.getBody('UTF8')).wstl.data||[];
      break;
    case "RELATED":
      rt = JSON.parse(response.getBody('UTF8')).wstl.related||{};
      break;
    case "NAMES":
      token =   "$..*[?(@property==='name')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;  
    case "IDS":
      token = "$..*[?(@property==='id')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;  
    case "RELS":
      token = "$..*[?(@property==='rel')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;  
    case "ID":
    case "NAME":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      path  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+thisWord+"/i))]^";
      if("rel id name".toLowerCase().indexOf(token.toLowerCase)===-1) {
        try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:path, json:rt})[0];
        } catch {
          // no-op
        }
      }  
      else {
        rt = "no response";
      }  
      break;
    case "REL":
      try {
        rt = JSON.parse(response.getBody('UTF8')).wstl.actions;
        for(var i=0; i<rt.length; i++) {
          var action = rt[i];
          for(var j=0; j<action.rel.length; j++) {
            if(action.rel[j]===words[2]) {
              node = action;
            }
          }
        }
        rt = node;
      } catch {
        // no-op
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
  return {responses:responses, dataStack:dataStack, config:config, config:config, words:words, rt:JSON.stringify(rt, null, 2)};
}

