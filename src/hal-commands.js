/*************************************
 * HAL commands module
 *************************************/
 
// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');

 // exports
 module.exports = main;
 
 // internals
var responses = new Stack();
var dataStack = new Stack();

// display and parse a HAL response
// HAL {command}
// args: {responses:responses,dataStack:dataStack,words:words}
function main(args) {
  responses = args.responses;
  dataStack = args.dataStack;
  var words = args.words;
  var rt = {};
  var token = words[1]||"";
  var response;
  
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
      token  = "$..*[?(@property==='"+words[2]+"')]";
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
  return {responses:responses, dataStack:dataStack, words:words, rt:JSON.stringify(rt, null, 2)};
}

