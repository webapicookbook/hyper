/*****************************************
 * sample math plug-in
 *****************************************/
 
 // imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');

// exports
module.exports = {main, mediaType, withRel, withId, withName, withForm};
 
// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};

// return media type : returns the |single| media type this plug in supports
// many commands validate the media type 
function mediaType() {
  return "application/vnd.wstl+json";
} 

// support WITH-REL : returns URL
// args: {response:response, thisWord:thisWord}
function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var url = "";
  
  return url;
}

// support WITH-ID : returns URL
// args: {response:response, thisWord:thisWord}
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var url = "";
  
  return url;
}

// support WITH-NAME : returns URL
// args: {response:response, thisWord:thisWord}
function withName(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var url = "";
  
  return url;
}

// support WITH-FORM : handles HTTP FORM details (url, method, body, fields, etc.)
// args: {response:response, thisWord:thisWord, headers:headers, method:method, 
//       body:body, url:url, fields:fields, fieldSet:fieldSet}
function withForm(args) {
  var response = args.response;
  var thisWord = args.thisWord
  var headers = args.headers;
  var method = args.method;
  var body = args.body;
  var fields = args.fields
  var fieldSet = args.fieldSet;
  var url = args.url;
  
  return  {headers:headers, method:method, body:body, url:url, fields:fields, fieldSet:fieldSet}  
}
// mainline support
// <name of this file (e.g. WSTL.js == WSTL) invokes this plugin
// args: {responses:responses,dataStack:dataStack,config:config,words:words}
// NOTE: sample code below is an old version of WSTL support
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
 
  switch (token.toUpperCase()) {
    case "HELP":
      rt = showHelp(words[2]||"");
      break;
    case "ADD":
      var x,y;
      x = parseInt(words[2]);
      y = parseInt(words[3]);
      rt = (x + y).toString();
      break;
    case "SUB":
    case "SUBTRACT":
      var x,y;
      x = parseInt(words[2]);
      y = parseInt(words[3]);
      rt = (x - y).toString();
      break;
    case "MUL": 
    case "MULTIPLY":
      var x,y;
      x = parseInt(words[2]);
      y = parseInt(words[3]);
      rt = (x*y).toString();
      break;
    case "DIV":  
    case "DIVIDE":
      var x,y;
      x = parseInt(words[2]);
      y = parseInt(words[3]);
      rt = (x/y).toString();
      break;  
    default: 
      rt = "";
  }
  // return REPL state (possibly updated)
  return {responses:responses, dataStack:dataStack, config:config,  
    words:words, rt:JSON.stringify(rt, null, 2)};
}


// show help text
function showHelp(thisWord) {
  var rt = ""
  rt = 
 `MATH
    ADD x y (x plus y)
    SUB|SUBTRACT x y (x minus y)
    MUL|MULTIPLY (x y (x times y)
    DIV|DIVIDE x y (x devided by y)`;
      
    console.log(rt);    
  
  return "";
}

