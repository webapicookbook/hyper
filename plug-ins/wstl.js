/*****************************************
 * wstl-json module
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

// return media type
function mediaType() {
  return "application/vnd.wstl+json";
} 

// support WITH-REL
function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$..actions"; 
  var url = "";
  var rt, link;
  
  try {
    rt = JSONPath({path:path, json:response})[0];
    for(var i=0; i<rt.length; i++) {
      var link = rt[i];
      for(var j=0; j<link.rel.length; j++) {
        if(link.rel[j]===thisWord) {
          url = link.href; // finally got it!
        }
      }
    }
  } catch (err){
    // no-op
  }
  return url;
}

// support WITH-ID
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$.data.*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^";
  var url = "";
  
  try {
    url = JSONPath({path:path,json:response})[0].href;
  } catch {
    // no-op
  }
  return url;
}

// support WITH-NAME
function withName(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "$..*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^";
  var url = "";
  
  try {
    url = JSONPath({path:path,json:response})[0].href;
  } catch (err) {
    // no-op
    // console.log(err);
  }
  return url;
}

// support WITH-FORM
function withForm(args) {
  var response = args.response;
  var thisWord = args.thisWord
  var headers = args.headers;
  var method = args.method;
  var body = args.body;
  var fields = args.fields
  var fieldSet = args.fieldSet;
  var url = args.url;
  var action, form;
  var path = "$.wstl.actions.*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^";

  form = JSONPath({path:token, json:response})[0];
  if(form && form.href) {
    url = form.href;  
    url = utils.fixUrl(url);
  }
  else {
    url = "#";
  }          
  if(form && form.action) {
    action = form.action.toLowerCase(); // resolve for action words
    switch (action) {
      case "add":
      case "append":
        method = "POST";
        break;
      case "update":
        method = "PUT";
        break;
      case "remove":
        method = "DELETE";
        break;
      case "diff":
        method = "PATCH";
        break;      
      case "read":
      default:
        method = "GET";
        break;
    }          
  }
  if(form && form.inputs) { // resolve for **inputs**
    fields = form.inputs; // we'll use these later
    fields.forEach(function dataField(f) {
      fieldSet[f.name] = "";
    });
  }
  if(form & form.format) {
    if(form.format!=="") {
      headers["content-type"] = form.format;
    }
    else {
      headers["content-type"] = "application/x-www-form-urlencoded";
    } 
  }
  return  {headers:headers, method:method, body:body, url:url, fields:fields, fieldSet:fieldSet}  
}
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
  var thisWord = "";
  var path = "";
  
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
    case "TAGS":
    case "TARGETS":
      token =   "$..*[?(@property==='target')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
        var final = [];
        for(var i in rt) {
          var p = rt[i].split(" ");
          for (var j in p) {
            if(final.indexOf(p[j])===-1) {
              final.push(p[j]);
            }
          }
        }
        rt = final;
      } catch (err) {
        // no-op
        console.log(err);
      }
      break;  
    case "NAMES":
      token =   "$..*[?(@property==='name')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;  
    case "FORMS":  
      token = "$.wstl.actions.*[?(@property==='name')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;  
    case "IDS":
      token = "$..*[?(@property==='id')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;  
    case "RELS":
      token = "$..*[?(@property==='rel')]";
      var final = [];
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
        for(var i=0; i<rt.length; i++) {
          var rel = rt[i];
          for(var j=0; j<rel.length; j++) {
            if(final.indexOf(rel[j])===-1) {
              final.push(rel[j]);
            }    
          }
        }
        rt = final;
      } catch (err){
        // no-op
        //console.log(err);
      }
      break;  
    case "TAG":
    case "TARGET":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      path  = "$.wstl.actions.*[?(@property==='target'&&@.match(/"+thisWord+"/i))]^";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:path, json:rt});
      } catch {
        // no-op
      }
      break;
    case "FORM":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      path  = "$.wstl.actions.*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:path, json:rt})[0];
      } catch {
        // no-op
      }
      break;
    case "ID":
    case "NAME":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      path  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+thisWord+"/i))]^";
      if("rel id name".toLowerCase().indexOf(token.toLowerCase)===-1) {
        try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:path, json:rt})[0];
        } catch {
          // no-op
        }
      }  
      else {
        rt = "no response";
      }  
      break;
    case "REL":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      try {
        rt = JSON.parse(response.getBody('UTF8')).wstl.actions;
        for(var i=0; i<rt.length; i++) {
          var action = rt[i];
          for(var j=0; j<action.rel.length; j++) {
            if(action.rel[j]===thisWord) {
              node = action;
            }
          }
        }
        rt = node;
      } catch {
        // no-op
      }
      break;
    case "PATH":  
      token = words[2]||"$";
      token = utils.configValue({config:config,value:token});
      token = utils.stackValue({dataStack:dataStack,value:token});
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
  return {responses:responses, dataStack:dataStack, config:config, config:config, words:words, rt:JSON.stringify(rt, null, 2)};
}

