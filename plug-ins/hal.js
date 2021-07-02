/*************************************
 * HAL commands module
 *************************************/
 
// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');

// exports
module.exports = {main, mediaType, withRel, withId, withName};
 
// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};

// return media type
function mediaType() {
  return "application/vnd.hal+json";
}

// support for WITH-REL
function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$..*[?(@property==='"+thisWord+"')].href";
  return JSONPath({path:path,json:response})[0];
}

// soft support for WITH-ID
// just use REL instead
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$..*[?(@property==='"+thisWord+"')].href";
  return JSONPath({path:path,json:response})[0];
}

// no support for WITH-NAME in HAL
// just use REL instead
function withName(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$..*[?(@property==='"+thisWord+"')].href";
  return JSONPath({path:path,json:response})[0];
}

// support for WITH-FORM
// no support for forms in HAL
// consider supporting HAL-FORMS instead
function withForm(args) {
}

// display and parse a HAL response
// HAL {command}
// args: {responses:responses,dataStack:dataStack,config:config,words:words}
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
    case "NAME":
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
    case "KEYS":
      rt = JSON.parse(response.getBody('UTF8'));
      var final = [];
      try {
        rt = Object.keys(rt);
        for(var i=0; i<rt.length; i++) {
          var rel = rt[i];
          //for(var j=0; j<rel.length; j++) {
            if(final.indexOf(rel)===-1) {
              final.push(rel);
          //  }    
          }
        }
        rt = final;        
      } catch (err){
        // no-op
        // console.log(err);
      }
      break;
    case "PATH":  
      token = words[2]||"$";
      token = utils.configValue({config:config,value:thisWord});
      console.log(token);
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    default: 
      /* 
      try {
        response = responses.peek()
        rt = JSON.parse(response.getBody("UTF8"));
      } catch {
        rt = "no response";
      }
      */
      rt = "";
  }
  return {responses:responses, dataStack:dataStack, config:config, words:words, rt:JSON.stringify(rt, null, 2)};
}

