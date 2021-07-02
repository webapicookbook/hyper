/*****************************************
 * collection-json module
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
  return "application/vnd.collection+json";
}
 
function withRel(args) {
 var response = args.response;
 var thisWord = args.thisWord;
 var path = "$..*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^";
 return JSONPath({path:path,json:response})[0].href;
}
 
// display a parse CollectionJSON object
// CJ {command}
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

  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "METADATA":
      rt = JSON.parse(response.getBody('UTF8')).collection.metadata||[];
      break;
   case "LINKS":
      rt = JSON.parse(response.getBody('UTF8')).collection.links;
      break;
    case "ITEMS":
      rt = JSON.parse(response.getBody('UTF8')).collection.items;
      break;
    case "QUERIES":
      rt = JSON.parse(response.getBody('UTF8')).collection.queries;
      break;
    case "TEMPLATE":
      rt = JSON.parse(response.getBody('UTF8')).collection.template;
      break;
    case "ERROR":
      rt = JSON.parse(response.getBody('UTF8')).collection.error||{};
      break;
    case "RELATED":
      rt = JSON.parse(response.getBody('UTF8')).collection.related||{};
      break;
    case "REL":
    case "ID":
    case "NAME":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      token  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+thisWord+"/i))]^";
      if("rel id name".toLowerCase().indexOf(token.toLowerCase)===-1) {
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

