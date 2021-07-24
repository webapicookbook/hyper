/*******************************
 * response display module
 * *******************************/

// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('./hyper-utils');
const fs = require('fs');

// exports
module.exports = main;

// internals
var responses = new Stack();
var config = {};

var defaultItemFile = __dirname + "/../hyper.response";
var defaultStackFile = __dirname + "/../hyper.responses";


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
      rt = responses.peek().statusCode;  
      break;
    case "HEADERS":
      rt = responses.peek().headers;  
      break;
    case "URL":
      rt = responses.peek().url;  
      break;
    case "CONTENT-TYPE":
      rt = responses.peek().headers["content-type"];
      break;  
    case "CLEAR":
    case "FLUSH":
      responses.clear();
      rt = "OK";
      break;
    case "PATH":
      token = words[2]||"$";
      token = utils.configValue({config:config,value:token});
      console.log(token);
      try {
        rt = JSON.parse(responses.peek().getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    case "PEEK":
    default:
      try {
        rt = responses.peek().getBody("UTF8");
      } catch (err){
        rt = "no response";
        //console.log(err);
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
    CLEAR|FLUSH
    PATH <jsonpath-string|$>`

  console.log(rt);
  return "";
}

