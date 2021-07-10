/****************************
 * JSON+FORMS command module
 ****************************/
 
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
function mediaType () {
  return "application/forms+json";
}

// support for WITH-REL
function withRel(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var token = "";
  var rt = "";  
  
  token = "$..*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^"
  
  try {
    rt = JSONPath({path:token, json:response})[0].href;
  } catch (err){
    // no-op
    console.log(err);
  }
  return rt; 
}

// support for WITH-ID
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var token = "";
  var rt = "";  
  
  token = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^"
  
  try {
    rt = JSONPath({path:token, json:response})[0].href;
  } catch (err){
    // no-op
    // console.log(err);
  }
  return rt; 
}

// support for WITH-NAME
function withName(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var token = "";
  var rt = "";
  
  token = "$..*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^"
  
  try {
    rt = JSONPath({path:token, json:response})[0].href;
  } catch (err){
    // no-op
    // console.log(err);
  }
  return rt; 
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
  var action, form, path;
  
  path = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^";

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
  if(form && form.properties) {
    fields = form.properties; // we'll use these later
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

// display and parse a JSON+FORMS response
// JF {command}
// args: {responses:responses,dataStack:dataStack,config:config,words:words}
function main(args) {
  config = args.config;
  responses = args.responses;
  dataStack = args.dataStack;
  var words = args.words;
  var rt="";
  var token = words[1]||"";
  var response;
  var node = {};
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
    case "METADATA":
      token = "$..metadata";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt})[0];
      } catch {
        // no-op
      }
      break;
    case "ITEMS":
      token = "$..items";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt})[0];
      } catch {
        // no-op
      }
      break;
    case "LINKS":
      token = "$..links";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt})[0];
      } catch (err) {
        // no-op
        console.log(err);
      }
    break;
    case "FORMS":
      token = "$..links.*[?(@property==='href')]^.id";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt});
        var fin = [];
        for(f in rt) {
          if(fin.indexOf(rt[f])===-1) {
            fin.push(rt[f]);
          }
        }
        rt = fin;
      } catch {
        // no-op
      }
      break;
    case "NAMES":
      token = "$..*[?(@property==='name')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt});
        var fin = [];
        for(f in rt) {
          if(fin.indexOf(rt[f])===-1) {
            fin.push(rt[f]);
          }
        }
        rt = fin;
      } catch {
        // no-op
      }
      break;
    case "IDS":
      token = "$..*[?(@property==='id')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt});
        var fin = [];
        for(f in rt) {
          if(fin.indexOf(rt[f])===-1) {
            fin.push(rt[f]);
          }
        }
        rt = fin;
      } catch {
        // no-op
      }
      break;
    case "TAGS":
      token = "$..*[?(@property==='tags')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt});
        var fin = [];
        for(f in rt) {
          var rf = rt[f].split(" ");
          for(r in rf) {
            if(fin.indexOf(rf[r])===-1) {
              fin.push(rf[r]);
            }
          }
        }
        rt = fin;
      } catch {
        // no-op
      }
      break;
    case "RELS":
      token = "$..*[?(@property==='rel')]";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token,json:rt});
        var fin = [];
        for(f in rt) {
          var rf = rt[f].split(" ");
          for(r in rf) {
            if(fin.indexOf(rf[r])===-1) {
              fin.push(rf[r]);
            }
          }
        }
        rt = fin;
       } catch {
        // no-op
      }
      break;
    case "TAG": 
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token = "$..*[?(@property==='tags'&&@.match(/"+thisWord+"/i))]^"
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    case "ID": 
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^"
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    case "NAME":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token = "$..*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^"
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    case "REL":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token = "$..*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-
      }
      break;
    case "FORM":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^"
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
        var fin = [];
        for(r in rt) {
          if(rt[r].href && fin.indexOf(rt[r])===-1) {
            fin.push(rt[r]);
          }
        }
        rt = fin;
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
  return {responses:responses,dataStack:dataStack,config:config,words:words,rt:JSON.stringify(rt, null, 2)};
}

// show help text
function showHelp(thisWord) {
  var rt = ""
  rt = 
 `FJ
    METADATA
    LINKS
    ITEMS
    IDS|RELS|NAMES|FORMS|TAGS (returns simple list)
    ID|REL|NAME|FORM|TAG <string|$#> (returns matching modes)
    PATH`;
      
    console.log(rt);    
  
  return "";
}



