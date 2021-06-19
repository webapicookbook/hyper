/*******************************
 * response display module
 * *******************************/

// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');

// exports
module.exports = main;

// internals
var responses = new Stack();
var currentResponse = {};
var config = {};

// display a saved response
// DISPLAY 
// - LENGTH returns number of responses saved
// - {index} returns the response at that index
// args:{responses:responses,currentResponse:currentResponse,words:words}
function main(args) {
  config = args.config;
  responses = args.responses;
  currentResponse = args.currentResponse;
  var words = args.words||[];
  var rt = "";
  var index = 0;
  var token = words[1]||"0";
  var response;
  
  // shortcut for error
  try {
    response = responses.peek();
  } catch {
    rt = "no response";
    return {responses:responses,currentResponse:currentResponse,words:words,rt:rt}
    //return rt;
  }  

  switch (token.toUpperCase()) {
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
      rt = response.statusCode;  
      break;
    case "HEADERS":
      rt = response.headers;  
      break;
    case "URL":
      rt = response.url;  
      break;
    case "CONTENT-TYPE":
      rt = currentResponse.contentType;
      break;  
    case "PATH":
      token = words[2]||"$";
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
  return {responses:responses,currentResponse:currentResponse,config:config,words:words,rt:rt}
  //return rt;
}


