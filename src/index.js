#!/usr/bin/env node
/**********************************************
 * i-hyper: interactive hypermedia console
 * @mamund - 2021-06
 *
 * NOTES:
 *   A simple interactive hypermedia client
 *   type 'hyper' at command line for interactive mode
 *   pipe a file in for script mode
 *   pipe a file out to save session output
 * ********************************************/

// node modules
const readline = require('readline');
const fs = require('fs');

// installed modules
const request = require('sync-request');
const querystring = require('querystring');
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');

// local modules
const utils = require ('./hyper-utils');
const configOp = require('./config');
const manageStack = require('./stack');
const display = require('./display');
const cjCommands = require('./cj-commands');
const halCommands = require('./hal-commands');
const sirenCommands = require('./siren-commands');

// state vars
var responses = new Stack();
var dataStack = new Stack();
var currentResponse = {};

var config = {};
config.verbose = "false";
var args = configOp({config:config,words:["CONFIG", "LOAD"]});
config = args.config;

// check for input args
// always just show help
var args = process.argv.slice(2);
try {
  if(args.length>0) {
    console.log(showHelp());
  }  
} catch {
  // no-op
}

/*
gobble commandline and inject into stdin
var cargs = process.argv.slice(2);
try {
  if(cargs.length>0) {
    rl.write(cargs.join(" "));
  }
} catch {
  // no-op
}
*/

// readline instance
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'i> '
});

rl.prompt();

rl.on('line', (line) => {
  line = line.trim();
  var words = line.split(" ");
  var args = {};
  
  switch (words[0].toUpperCase()) {
    case "HELP":
      console.log(utils.showHelp(words));
      break;
    case "EXIT":
    case "STOP":
      process.exit(0)
      break;
    case "#":
    case "":
      break;  
    case "CLEAR":
      console.clear();
      break;
    case "SHELL":
      console.log(utils.runShell(words));
      break;  
    case "STACK":
      args = manageStack({dataStack:dataStack,words:words});
      dataStack = args.dataStack;
      words = args.words;
      console.log(args.rt);
      break;  
    case "CONFIG":
      args = configOp({config:config,words:words});
      config = args.config;
      words = args.words;
      console.log(args.rt);
      break;  
    case "RESPONSES":
      console.log(responses.size());
      break;
    case "TIMESTAMP":
      console.log(utils.timeStamp(line));
      break;
    case "A":
    case "GO":
    case "GOTO":
    case "CALL":  
    case "ACTIVATE":
      console.log(activate(words));  
      break;
    case "DISPLAY":
      args = display({responses:responses,currentResponse:currentResponse,words:words});
      responses = args.responses;
      currentResponse = args.currentResponse;
      words = args.words;
      console.log(args.rt);
      break;
    case "CJ":
      args = cjCommands({responses:responses,dataStack:dataStack,words:words});
      responses = args.responses;
      dataStack = args.dataStack;
      words = args.words;
      console.log(args.rt);
      break;  
    case "HAL":
      args = halCommands({responses:responses,dataStack:dataStack,words:words});
      responses = args.responses;
      dataStack = args.dataStack;
      words = args.words;
      console.log(args.rt);
      break;  
    case "SIREN":
      args = sirenCommands({responses:responses,dataStack:dataStack,words:words});
      responses = args.responses;
      dataStack = args.dataStack;
      words = args.words;
      console.log(args.rt);
      break;
    case "ECHO":  
    default:
      console.log(utils.echo(words));
      break;
  }
  rl.prompt();

}).on('close', () => {
  process.exit(0);
});

// synchronous HTTP request
// ACTIVATE {url}
// - WITH-HEADERS {n:v,...}
// - WITH-QUERY {n:v,...} (optional, can use "?...." on the URL, too)
// - WITH-BODY ... (defaults to form-urlencoded)
// - WITH-METHOD get (defaults to GET)
// - WITH-ENCODING application/json
// - WITH-FORMAT (emits accept header based on config setting)
// - WITH-PROFILE (emits link profile header based on config setting)
// - WITH-FORM (uses form metadata  to set HTTP request details)
// - WITH-STACK (uses data on the top of the stack to fill in a request (form, query)
function activate(words) {
  var rt = "";
  var url = words[1]||"#";
  var headers = {};
  var body = "";
  var query = {}
  var method = "GET";
  var response;
  var thisWord = "";
  var pointer = 1;
  var ctype = "";
  var form = {};
  var fields = [];
  var encoding = "";
  var fieldSet = {};
  var dataSet= {};
  
  while (pointer<words.length) {
    thisWord = words[pointer++];

    // use item on the top of the stack to fill in fields (form/query)
    if(thisWord && thisWord.toUpperCase()==="WITH-STACK") {
      dataSet = dataStack.peek();
      for(var d in fieldSet) {
        fieldSet[d] = dataSet[d];
      };
      if(method!=="GET") {
        body = querystring.stringify(fieldSet);
        headers["content-type"] = "application/x-www-form-urlencoded";        
      }      
      else {
        url = url + "?" + querystring.stringify(fieldSet);  
      }
    }
    
    // pull form metadata (strong-typed)
    if(thisWord && thisWord.toUpperCase()==="WITH-FORM") {
      // set up  url, method, headers, encoding from identified form
      thisWord = words[pointer++];
      form = {};
      
      try {
        // strong-type the body here
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];
        // siren
        if(ctype.indexOf("vnd.siren+json")!==-1) {
          token = "$.actions.*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^";
          form = JSONPath({path:token, json:response})[0];
          if(form && form.href) {
            url = form.href;  
            if(url.indexOf("http:")==-1 && url.indexOf("https:")==-1) {
              if(url.indexOf("//")==-1) {
                url = "http://" + url;
              }
              else {
                url = "http:" + url;
              }
            }
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
          if(form && form.fields) {
            fields = form.fields; // we'll use these later
            fields.forEach(function dataField(f) {
              fieldSet[f.name] = "";
            });
          }
          if(form & form.type) {
            if(form.type!=="") {
              headers["content-type"] = form.type;
            } 
          }
        }
      } catch {
        // no-op
      }       
    }

    // activate via ID (for SIREN only)
    if(thisWord && thisWord.toUpperCase()==="WITH-ID") {
      thisWord = words[pointer++];
      url = "with-id";
      
      try {
        // strong-type the body here
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];
        // siren
        if(ctype.indexOf("vnd.siren+json")!==-1) {
          token = "$.entities.*[?(@property==='id'&&@.match(/"+words[2]+"/i))]^"
          url = JSONPath({path:token, json:response})[0].href;
          if(url.toLowerCase()==="with-name") {
            rt = "no response";
          }
          else {
            url = utils.fixUrl(url);
          }  
        }
      } catch {
        // no-op
      }
    } 
    // activate via name
    if(thisWord && thisWord.toUpperCase()==="WITH-NAME") {
      thisWord = words[pointer++];
      url = "with-name";
      
      try {
        // strong-type the body here
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];
        // siren
        if(ctype.indexOf("vnd.siren+json")!==-1) {
          token = "$.actions.*[?(@property==='name'&&@.match(/"+thisWord+"/i))]^";
          url = JSONPath({path:token, json:response})[0].href;
        }
        if(url.toLowerCase()==="with-name") {
          rt = "no response";
        }
        else {
          url = utils.fixUrl(url);
        }  
      } catch {
        // no-op
      }       
    }
    // activate via rel
    if(thisWord && thisWord.toUpperCase()==="WITH-REL") {
      thisWord = words[pointer++];
      try {
        response = JSON.parse(responses.peek().getBody('UTF8'));
        // strong-type the body here
        ctype = responses.peek().headers["content-type"];
        // cj
        if(ctype.indexOf("vnd.collection+json")!==-1) {
          url = JSONPath({path:"$..*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^",json:response})[0].href;
        }
        // hal
        if(ctype.indexOf("vnd.hal+json")!==-1) {
          url = JSONPath({path:"$..*[?(@property==='"+thisWord+"')].href",json:response})[0];
        }
        // siren (it's gnarly!)
        if(ctype.indexOf("vnd.siren+json")!==-1) {
          url = "with-rel";
          token = "$.links"
          try {
            rt = JSONPath({path:token, json:response})[0];
            for(var i=0; i<rt.length; i++) {
              var link = rt[i];
              for(var j=0; j<link.rel.length; j++) {
                if(link.rel[j]===thisWord) {
                  url = link.href; // finally got it!
                }
              }
            }
          } catch {
            // no-op
          }
        }
        if(url.toLowerCase()==="with-rel") {
          rt = "no response";
        }
        else {
          url = utils.fixUrl(url);
        }  
      } catch {
        // no-op
      } 
    }
    // url
    if(thisWord && thisWord.toUpperCase()==="WITH-URL") {
      try {
        url = words[pointer++];
        url = utils.fixUrl(url);
      } catch {
        // no-op
      }
    }
    // direct headers
    if(thisWord && thisWord.toUpperCase()==="WITH-HEADERS") {
      try {
        thisWord = words[pointer++];
        headers = JSON.parse(thisWord);
      } catch {
        // no-op
      }  
    }
    // add default accept header
    if(thisWord && thisWord.toUpperCase()==="WITH-FORMAT") {
      try {
        thisWord = words[pointer++];
        headers.accept = config.accept||"application/vnd.collection+json";
      } catch {
        // no-op
      }
    }
    // add default profile link header
    if(thisWord && thisWord.toUpperCase()==="WITH-PROFILE") {
      try {
        thisWord = words[pointer++];
        if(config.profile) {
          headers.link = "<"+config.profile+">;rel=profile";
        }  
        if(words[pointer-1].indexOf("$$")!==-1) {
          thisWord = words[pointer-1];
          headers.link = "<"+config[thisWord.substring(2)]+">;rel=profile";
        }
      } catch {
        // no-op
      }
    }
    // add body
    if(thisWord && thisWord.toUpperCase()==="WITH-BODY") {
      try {
        thisWord = words[pointer++];
        body = thisWord;
        headers["content-type"] = "application/x-www-form-urlencoded";
      } catch {
        // no-op
      }
    }
    // add query string
    // JSON object {completeFlag:false}
    if(thisWord && thisWord.toUpperCase()==="WITH-QUERY") {
      try {
        thisWord = words[pointer++];
        query = querystring.stringify(JSON.parse(thisWord));
        url = url+'?'+query
      } catch {
        // no-op
      }
    }
    // add method
    // support for put-c[reate] w/ if-none-match header
    if(thisWord && thisWord.toUpperCase()==="WITH-METHOD") {
      try {
        thisWord = words[pointer++];
        if(thisWord.toLowerCase()==="put-c" || thisWord.toLowerCase()==="put-create") {
          method="PUT";
          headers["if-none-match"]="*";
        } else {
          method = thisWord;
        }
      } catch {
        // no-op
      }
    }
    // add body encoding
    if(thisWord && thisWord.toUpperCase()==="WITH-ENCODING") {
      try {
        thisWord = words[pointer++];
        headers["content-type"] = thisWord;
      } catch {
        // no-op
      }
    }
  }

  if(config.verbose!=="false") {
    console.log("\n******************");
    console.log(url);
    console.log(query);
    console.log(headers);
    console.log(method);
    console.log(body);
    console.log("******************\n");
  }
    
  // make the actual call
  try {
    if(body) {
      response = request(method, url, {headers:headers, body:body});
    } else {
      response = request(method, url, {headers:headers});
    }
    responses.push(response);
    rt = "\n"+response.getBody("UTF8")+"\n";
  }
  catch (err) {
   rt = "\n"+err.toString()+"\n";
  }
 
  try {
    if(config.verbose==="false" && response.statusCode<400) {
      rt = "STATUS "+response.statusCode+"\n"+response.url+"\n"+response.headers["content-type"];
    }

  } catch {
    // no-op
  } 
  
  try {
    currentResponse.url = response.url;
    currentResponse.status = response.statusCode;
    currentResponse.headers = response.headers;
    currentResponse.contentType = response.headers["content-type"];
  } catch {
    // no-op
  }  
  
  return rt;
}
