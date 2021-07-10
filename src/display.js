/*******************************
 * response display module
 * *******************************/

// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('./hyper-utils');

// exports
module.exports = main;

// internals
var responses = new Stack();
var config = {};

// display a saved response
// args:{responses:responses,words:words}
function main(args) {
  config = args.config;
  responses = args.responses;
  var words = args.words||[];
  var rt = "";
  var index = 0;
  var token = words[1]||"0";
  var response;
  
  // shortcut for error
  if(token.toUpperCase()!=='HELP') {
    try {
      response = responses.peek();
    } catch {
      rt = "no response";
      return {responses:responses,words:words,rt:rt}
      //return rt;
    }  
  }
  
  switch (token.toUpperCase()) {
    case "HELP":
      rt = showHelp(words[2]||"");
      break;
    case "LEN":
    case "lENGTH":
      rt = responses.size();
      break;
    case "POP":
      try {
        responses.pop();
        rt = "OK";
      } catch {
        rt = "no response";
      } 
      break;
    case "STATUS":
    case "STATUS-CODE":
      rt = response.statusCode;  
      break;
    case "HEADERS":
      rt = response.headers;  
      break;
    case "URL":
      rt = response.url;  
      break;
    case "CONTENT-TYPE":
      rt = response.headers["content-type"];
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
    case "PEEK":
    default:
      try {
        rt = response.getBody("UTF8");
      } catch {
        rt = "no response";
      }
  }
  return {responses:responses,config:config,words:words,rt:rt}
}

function showHelp(thisWord) {
  var rt = "";
  
  rt = `
  DISPLAY
    URL
    STATUS|STATUS-CODE
    CONTENT-TYPE
    HEADERS
    PEEK
    POP
    LENGTH|LEN
    PATH <jsonpath-string|$>`

  console.log(rt);
  return "";
}

