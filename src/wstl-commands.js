/*****************************************
 * wstl-json module
 *****************************************/
 
 // imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');

 // exports
 module.exports = main;
 
 // internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};
 
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
    case "REL":
    case "ID":
    case "NAME":
      token  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+words[2]+"/i))]^";
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

