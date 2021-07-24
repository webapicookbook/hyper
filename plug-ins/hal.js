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
  var path = "";
  var rt = "";
  
  path = "$..*[?(@property==='"+thisWord+"')].href";
  
  try {
    rt = JSONPath({path:path,json:response})[0];
  } catch (err) {
    // no-op
  }
  
  return rt;
}

// soft support for WITH-ID
// just use REL instead
function withId(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "";
  var rt = "";
  
  path = "$..*[?(@property==='"+thisWord+"')].href";
  
  try {
    rt = JSONPath({path:path,json:response})[0];
  } catch (err) {
    // no-op
  }
  
  return rt;
}

// no support for WITH-NAME in HAL
// just use REL instead
function withName(args) {
  var response = args.response;
  var thisWord = args.thisWord;
  var path = "";
  var rt = "";

  path = "$..*[?(@property==='"+thisWord+"')].href";
  
  try {
    rt = JSONPath({path:path,json:response})[0];
  } catch (err) {
    // no-op
  }
  
  return rt;
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
    case "EMBEDDED":
    case "_EMBEDDED":
      rt = JSON.parse(response.getBody('UTF8'))._embedded;
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
          rt = JSONPath({path:token, json:rt});
        } catch {
          // no-op
        }
      }  
      else {
        rt = "no response";
      }  
      break;
    case "ID":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      token  = "$..*[?(@property==='id'&&@.match(/"+thisWord+"/i))]^";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt})[0];
      } catch {
        // no-op
      }
      break;    
    case "TAG":
      thisWord = words[2];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      path  = "$..*[?(@property==='target'&&@.match(/"+thisWord+"/i))]^";
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:path, json:rt});
      } catch {
        // no-op
      }
      break;
    case "KEYS":
      rt = JSON.parse(response.getBody('UTF8'));
      var final = [];
      var rel = {};
      try {
        var list = Object.keys(rt._links);
        for(var i=0; i<list.length; i++) {
          rel = list[i];
          if(final.indexOf(rel)===-1) {
            final.push(rel);
          }
        }
        list = Object.keys(rt._embedded)
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
    case "IDS":
      rt = JSON.parse(response.getBody('UTF8'));
      token = "$..*[?(@property==='id')]";
      try {
        rt = JSONPath({path:token,json:rt});
      } catch {
        // no-op
      }
      break;
    case "TAGS":
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
 `HAL
    LINKS|_LINKS
    EMBEDDED|_EMBEDDED
    ID|REL|KEY|NAME|TAG <string|$#> (returns matching nodes)
    IDS|RELS|KEYS|TAGS (returns simple list)
    PATH <jsonpath-string|$#>
`;
      
    console.log(rt);    
  
  return "";
}

