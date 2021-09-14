/*******************************
 * response display module
 * *******************************/

// imports
const xpath = require('xpath')
const dom = require('xmldom').DOMParser;
const xmlformat = require('xml-formatter');
const prettify = require('html-prettify'); 
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const utils = require('./hyper-utils');
const fs = require('fs');

// exports
module.exports = main;

// internals
var responses = new Stack();
var config = {};

var defaultItemFile = __dirname + "/../hyper.response";
var defaultStackFile = __dirname + "/../hyper.responses";

// display a saved response
// args:{responses:responses,words:words}
function main(args) {
  config = args.config;
  responses = args.responses;
  var words = args.words||[];
  var rt = "";
  var index = 0;
  var token = words[1]||"0";
  var response;
    
  switch (token.toUpperCase()) {
    case "HELP":
      rt = showHelp(words[2]||"");
      break;
    case "LEN":
    case "lENGTH":
      if(responses.isEmpty()) {
        rt = "0";
      }
      else {
        rt = responses.size().toString();
      }
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
    case "STATUS-CODE":
      rt = responses.peek().statusCode;  
      break;
    case "HEADERS":
      rt = JSON.stringify(responses.peek().headers,null,2);  
      break;
    case "URL":
    case "HREF":
      rt = responses.peek().url;  
      break;
    case "CONTENT-TYPE":
      rt = responses.peek().headers["content-type"];
      break; 
    case "META":  
    case "METADATA":
      var metadata = {};
      metadata.url = responses.peek().url;
      metadata.statusCode = responses.peek().statusCode;
      metadata.headers = responses.peek().headers;
      rt = JSON.stringify(metadata, null, 2 );
      break;  
    case "REQUEST":
      rt = JSON.stringify(responses.peek().requestInfo,null,2);
      break;
    case "ALL":
      var rsp = {};
      rsp.request = responses.peek().requestInfo;
      rsp.response = {};
      rsp.response.metadata = {};
      rsp.response.metadata.url = responses.peek().url;
      rsp.response.metadata.statusCode = responses.peek().statusCode;
      rsp.response.metadata.headers = responses.peek().headers;
      try {
        rsp.response.body = JSON.parse(responses.peek().getBody('UTF8'));
      } catch(err) {
        rsp.response.body = responses.peek().getBody('UTF8');
      }
      rt = JSON.stringify(rsp, null, 2);
      break;
    case "CLEAR":
    case "FLUSH":
      responses.clear();
      rt = "OK";
      break;
    case "XPATH":
      rt = pathxml(words);
      break;
    case "JPATH":  
      rt = pathjson(words);
      break;
    case "PATH":
      // smart enough to pick JSONPath or XPath based on content type
      if(responses.peek().headers["content-type"].indexOf("xml")!==-1) {
        // use XPath
        rt = pathxml(words);
      }
      else {
        rt = pathjson(words);
      }
      break;
    case "PEEK":
    case "RESPONSE":
    default:
      try {
        if(responses.peek().headers["content-type"].indexOf("xml")!==-1) {
          try {
            rt = responses.peek().getBody("UTF8");
            rt = xmlformat(rt, {indentation:'  ',collapseContent:true});
          } catch(err) {
            // console.log(err)
          }
        }
        else {
          rt = responses.peek().getBody("UTF8");
          rt = JSON.parse(responses.peek().getBody("UTF8"),null,2);
          if(rt.length===1) {
            rt = rt[0];
          }
          rt = JSON.stringify(rt,null,2);
        }
      }  
      catch(err) {
      // console.log(err)
      }  
  }
  return {responses:responses,config:config,words:words,rt:rt}
}

// execute json path query
function pathjson(words) {
  var rt =  "";

  token = words[2]||"$";
  token = utils.configValue({config:config,value:token});
  console.log(token);
  try {
    rt = JSON.parse(responses.peek().getBody('UTF8'));
    rt = JSONPath({path:token, json:rt});
    if(rt.length===1) {
      rt = rt[0];
    }
    rt = JSON.stringify(rt,null,2);
  } catch {
    // no-op
  }
  return rt;
}

// execute xml path query
function pathxml(words) {
  var rt = "";

  token = words[2]||"//";
  token = utils.configValue({config:config,value:token});
  console.log(token);
  try {
    var doc = new dom().parseFromString(responses.peek().getBody('UTF8'));
    var results = xpath.evaluate(token, doc, null, xpath.XPathResult.ANY_TYPE, null);
    var node = results.iterateNext();
    rt = "<xml>";
    while(node) {
      rt += node.toString();
      node = results.iterateNext();
    }
    rt += "</xml>";
    rt = xmlformat(rt, {indentation:'  ',collapseContent:true});
  } catch(err) {
    console.log(err);
  }  
  return rt;
}

function showHelp(thisWord) {
  var rt = "";
  
  rt = `
  DISPLAY|SHOW (synonyms)
    ALL : returns the complete interaction (request, response metadata, response body)
    REQUEST : returns the details of the request (URL, headers, querystring, method, body)
    METADATA|META : returns the response metadata (URL, status, & headers)
    URL|HREF : returns the URL of the current response
    STATUS|STATUS-CODE : returns the HTTP status code of the current response
    CONTENT-TYPE : returns the content-type of the current response
    HEADERS : returns the HTTP headers of the current response
    PEEK : displays the most recent response on the top of the stack (non-destructive)
    POP : pops off [removes] the top item on the response stack
    LENGTH|LEN : returns the count of the responses on the response stack
    CLEAR|FLUSH : clears the response stack
    PATH <jsonpath|xmlpath|$#> : based on response content type, applies supplied query (JSON/XML)
    JPATH <jsonpath-string|$#> : applies the JSON Path query to the response at the top of the stack
    XPATH <xmlpath-string|$#> : applies the XPATH query to the response at the top of the stack`;

  console.log(rt);
  return "";
}

