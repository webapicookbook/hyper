/*****************************************
 * collection-json module
 *****************************************/
 
// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('../src/hyper-utils');

// exports
module.exports = {main, mediaType, withRel, withId, withForm};
 
// internals
var responses = new Stack();
var dataStack = new Stack();
var config = {};
 
// return media type
function mediaType() {
  return "application/vnd.collection+json";
}
 
function withRel(args) {
 var response = args.response;
 var thisWord = args.thisWord;
 var path = "$..*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^";
 return JSONPath({path:path,json:response})[0].href;
}

// support WITH-ID 
// soft support (items MAY have ids)
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  thisWord = utils.configValue({config:config,value:thisWord});
  var token = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^"
  try {
    rt = JSONPath({path:token, json:response})[0].href;
  } catch (err){
    // no-op
    // console.log(err);
  }
  return rt; 
}

// support WITH-NAME
function withName(args) {
  // no support for name -> href in CJ
}

// support WITH-FORM
// queries in CJ
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
  var path = "$.collection.queries.*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^";

  form = JSONPath({path:path, json:response})[0];
  if(form && form.href) {
    url = form.href;  
    url = utils.fixUrl(url);
  }
  else {
    url = "#";
  }          
  if(form && form.method) {
    method = form.method;
  }
  else {
    method = "GET";
  }
  if(form && form.data) {
    fields = form.data; // we'll use these later
    fields.forEach(function dataField(f) {
      fieldSet[f.name] = "";
    });
  }
  if(form & form.type) {
    if(form.type!=="") {
      headers["content-type"] = form.type;
    } 
  }
  return  {headers:headers, method:method, body:body, url:url, fields:fields, fieldSet:fieldSet}  
}
 
// display a parse CollectionJSON object
// CJ {command}
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

  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "METADATA":
      rt = JSON.parse(response.getBody('UTF8')).collection.metadata||[];
      break;
   case "LINKS":
      rt = JSON.parse(response.getBody('UTF8')).collection.links;
      break;
    case "ITEMS":
      rt = JSON.parse(response.getBody('UTF8')).collection.items;
      break;
    case "QUERIES":
      rt = JSON.parse(response.getBody('UTF8')).collection.queries;
      break;
    case "TEMPLATE":
      rt = JSON.parse(response.getBody('UTF8')).collection.template;
      break;
    case "ERROR":
      rt = JSON.parse(response.getBody('UTF8')).collection.error||{};
      break;
    case "RELATED":
      rt = JSON.parse(response.getBody('UTF8')).collection.related||{};
      break;
    case "REL":
    case "ID":
    case "NAME":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      token  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+thisWord+"/i))]^";
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
    case "IDS":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='id')]";
      try {
        rt = JSONPath({path:token,json:rt});
      } catch {
        // no-op
      }
      break;
    case "RELS":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='rel')]";
      var final = [];
      try {
        rt = JSONPath({path:token,json:rt});
        for(var i=0; i<rt.length; i++) {
          var rel = rt[i];
          rel = rel.split(" ");
          for(var j=0; j<rel.length; j++) {
            if(final.indexOf(rel[j])===-1) {
              final.push(rel[j]);
            }    
          }
        }  
        rt = final;  
      } catch (err) {
        // no-op
        // console.log(err)
      }
      break;
    case "NAMES":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='name')]";
      var final = [];
      try {
        rt = JSONPath({path:token,json:rt});
        for(var i=0; i<rt.length; i++) {
          var rel = rt[i];
          rel = rel.split(" ");
          for(var j=0; j<rel.length; j++) {
            if(final.indexOf(rel[j])===-1) {
              final.push(rel[j]);
            }    
          }
        }  
        rt = final;  
      } catch (err) {
        // no-op
        // console.log(err)
      }
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

