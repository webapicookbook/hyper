/*************************************
 * HAL commands module
 *************************************/
 
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

// display and parse a HAL response
// HAL {command}
// args: {responses:responses,dataStack:dataStack,words:words}
function main(args) {
  config = args.config;
  responses = args.responses;
  dataStack = args.dataStack;
  var words = args.words;
  var rt = {};
  var token = words[1]||"";
  var response;
  var thisWord = "";

  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "LINKS":
    case "_LINKS":
      rt = JSON.parse(response.getBody('UTF8'))._links;
      break;
    case "EMBEDDED":
    case "_EMBEDDED":
      rt = JSON.parse(response.getBody('UTF8'))._embedded;
      break;
    case "REL":
    case "ID":
    case "KEY":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      token  = "$..*[?(@property==='"+thisWord+"')]";
      if("rel id key".toLowerCase().indexOf(token.toLowerCase())==-1) {
        try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:token, json:rt});
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
      token = utils.configValues({config:config,value:thisWord});
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
  return {responses:responses, dataStack:dataStack, config:config, words:words, rt:JSON.stringify(rt, null, 2)};
}

