/*************************************
 * PHTAL commands module
 *************************************/
 
// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');

// exports
module.exports = {main, mediaType, withRel, withForm};
 
// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};

// return media type
function mediaType() {
  return "application/vnd.phtal+json";
}

// support for WITH-REL
function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "";
  var rt = "";
  
  path = "$..*[?(@property==='"+thisWord+"')][0].href";
  
  try {
    rt = JSONPath({path:path,json:response})[0];
  } catch (err) {
    // no-op
  }
  
  return rt;
}


// support for WITH-FORM
function withForm(args) {
  var response = args.response;
  var thisWord = args.thisWord
  var headers = args.headers;
  var method = args.method;
  var body = args.body;
  var fields = args.fields
  var fieldSet = args.fieldSet;
  var url = args.url;
  var action, form, path;

  path = "$..*[?(@property==='"+thisWord+"')][0]";

  form = JSONPath({path:path, json:response})[0];
  if(form && form.href) {
    url = form.href;
    url = utils.fixUrl(url);
  }
  else {
    url = "#";
  }
  if(form && form.operation?.HTTP?.method) {
    method = form.operation.HTTP.method;
  }
  else {
    method = "GET";
  }

  return  {headers:headers, method:method, body:body, url:url, fields:fields, fieldSet:fieldSet}
}

// display and parse a PHTAL response
// PHTAL {command}
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

  if(token.toUpperCase()!=="HELP") {
    try {
      response = responses.peek();
    } catch {
      token="";
    }
  }
  
  switch (token.toUpperCase()) {
    case "HELP":
      rt = showHelp(words[2]||"");
      break;
    case "LINKS":
    case "_LINKS":
      rt = JSON.parse(response.getBody('UTF8'))._links;
      break;
    case "REL":
    case "KEY":
    case "NAME":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token  = "$..*[?(@property==='"+thisWord+"')]";
      if("rel id key".toLowerCase().indexOf(token.toLowerCase())==-1) {
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
    case "KEYS":
      rt = JSON.parse(response.getBody('UTF8'));
      var final = [];
      var rel = [];
      try {
        var list = Object.keys(rt._links);
        for(var i=0; i<list.length; i++) {
          rel = list[i];
          if(final.indexOf(rel)===-1) {
            final.push(rel);
          }
        }
        rt = final;
      } catch (err){
        // no-op
        console.log(err);
      }
      break;
    case "PATH":  
      token = words[2]||"$";
      token = utils.configValue({config:config,value:token});
      token = utils.stackValue({dataStack:dataStack,value:token});
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

// show help text
function showHelp(thisWord) {
  var rt = ""
  rt = 
 `PHTAL
    LINKS|_LINKS
    REL|KEY|NAME <string|$#> (returns matching nodes)
    RELS|KEYS (returns simple list)
    PATH <jsonpath-string|$#>
`;
      
    console.log(rt);    
  
  return "";
}

