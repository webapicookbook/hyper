#!/usr/bin/env node
/**********************************************
 * hyper: interactive hypermedia console
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
const path = require('path');
const fs = require('fs');

// installed modules
const glob = require('glob');
const request = require('sync-request');
const querystring = require('querystring');
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');

// local modules
const utils = require ('./hyper-utils');
const configOp = require('./config');
const manageStack = require('./stack');
const display = require('./display');
const oAuth = require('./../plug-ins/oauth');

// holds external plug-ins
var plugins = {};
plugins = loadPlugins(plugins);

// version info
var versionInfo = {"hyper-cli":{"version":"1.0","rel":"2021-07","author":"@mamund"}}

// state vars
var responses = new Stack();
var dataStack = new Stack();
var config = {};
var authStore = {};

// init config and load default file
config.verbose = "false";
var args = configOp({config:config,words:["CONFIG", "LOAD"]});
config = args.config;

// see if we can pre-load the OAUTH data
try {
  args = oAuth.oauthLoad({authStore:authStore,words:["OAUTH","LOAD"]});
} catch {
  // no-op
}
  

//var authFile = __dirname + "/../oauth.env";

// check for input args
// always just show help
var args = process.argv.slice(2);
try {
  if(args.length>0) {
    console.log(utils.showHelp());
  }  
} catch {
  // no-op
}

// readline instance
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// get first input
rl.prompt();

// process a line
rl.on('line', (line) => {
  line = line.trim();
  var words = line.split(" ");
  var args = {};
  var act = words[0].toUpperCase();
  
  // friendly touch
  words = utils.clearGreeting(words);
  if(words.length!==0) {
    act = words[0].toUpperCase();
  }
  else {
    act = "";
  }
   
  // process each word in turn
  switch (act) {
    case "#":
    case "":
      break;
    case "GREETINGS":
    case "GREETINGS,": 
    case "PLAY":
    case "PLAY?":
    case "NO":
    case "NO,":
    case "NOT":
    case "NOW":
      console.log(utils.joshua(words));
      break;  
    case "VERSION":
      console.log(showVersionInfo());
      break;  
    case "EXIT-ERR":
      process.exit(1);
      break;
    case "EXIT":
    case "STOP":
      process.exit(0)
      break;
    case "GOODBYE":
    case "BYE":
      console.log("SO LONG!")
      process.exit(0)
      break;
    case "CLEAR":
      console.clear();
      break;
    case "HELP":
      console.log(utils.showHelp(words));
      break;
    case "SHELL":
      console.log(utils.runShell(words));
      break;  
    case "PLUGINS":
      plugins = loadPlugins(plugins);
      console.log(JSON.stringify(Object.keys(plugins)).toUpperCase());
      break;
    case "TIMESTAMP":
      console.log(utils.timeStamp(line));
      break;
    case "STACK":
      console.log(JSON.stringify(run(manageStack,words), null, 2));
      break;  
    case "CONFIG":
      console.log(run(configOp,words));
      break;  
    case "DISPLAY":
    case "SHOW":
      console.log(run(display, words));
      break;
    case "A":
    case "GO":
    case "GOTO":
    case "CALL":  
    case "REQUEST":
    case "REQ":
    case "ACTIVATE":
      console.log(activate(words));  
      break;
    case "ECHO":  
      console.log(utils.echo(words));  
      break;
    default:
      if(plugins.hasOwnProperty(act.toLowerCase())) {
        console.log(run(plugins[act.toLowerCase()].main,words));
      }
      else {
        console.log(utils.echo(words)+"?");
      }       
      break;
  }
  // wait for another input
  rl.prompt();

// safe exit at the end of inputs
}).on('close', () => {
  process.exit(0);
});

// fire off external module
// collect context object, call,
// update local context
// show results
function run(moduleName, words) {
  var args = {};
  var rt = "";
  
  try {
    args = moduleName(
      {
        responses:responses,
        dataStack:dataStack,
        config:config,
        words:words,
        authStore:authStore
      });
    if(args.responses) {responses = args.responses};
    if(args.dataStack) {dataStack = args.dataStack};
    if(args.config) {config = args.config};
    if(args.words) {words = args.words};
    if(args.authStore) {authStore = args.authStore};
    rt = args.rt||"";
  } catch (err) {
    rt = console.log(err.message);
  }      
  return rt;
}

// load/refresh external plugins
function loadPlugins(plugins) {
  try {
    glob.sync(__dirname + '/../plug-ins/*.js').forEach(function(file) {
      let dash = file.split("/");
      let dot = dash[dash.length-1].split(".");
      if(dot.length == 2) {
        let key = dot[0];
        plugins[key] = require(file);
      }
    });
  } catch (err) {
    console.log(err);
    plugins = {}
  }  
  return plugins;
}

// return version info block
function showVersionInfo() {
  return versionInfo
}

// ***********************************************************************************
// process synchronous HTTP request
// ACTIVATE|REQUEST|REQ|GOTO|CALL|GO|A  (all synonyms)
// - WITH-URL <url|$#>
// - WITH-REL <string|$#> : string is a REL within the document
// - WITH-ID <string|$#> : string is an ID within the document
// - WITH-NAME <string|$#> : string is a NAME within the document
// - WITH-PATH <string|$#> :json-path against current response that returns a URL
// - WITH-HEADERS <{n:v,...}|$#>
// - WITH-QUERY <{<n:v,...}|$#> (optionally, use "?...." on the URL, too)
// - WITH-BODY <string|$#> (defaults to form-urlencoded)
// - WITH-METHOD <string|$#> (defaults to GET)
// - WITH-ENCODING <string|$#> (defaults to application/x-www-form-urlencoded))
// - WITH-FORMAT (emits accept header based on config setting)
// - WITH-PROFILE (emits link profile header based on config setting)
// - WITH-FORM <string|$#> (uses FORM metadata to set HTTP request details)
// - WITH-STACK (uses data on the top of the stack to fill in a request (form, query)
// - WITH-DATA <{n:v,...}|$#> (uses data in JSON object to fill in a request (form, query)
// - WITH-OAUTH <string|$#> (uses token stored at <string> for authentication header)
// - WITH-BASIC <string|$#> (uses username and password stored at <string> for basic auth)
// ***********************************************************************************
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

    // use the JSON object to fill in fields (form/query)
    if(thisWord && thisWord.toUpperCase()==="WITH-DATA") {
      thisWord = words[pointer++];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      thisWord = utils.fixString(thisWord);
      dataSet = JSON.parse(thisWord);
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
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      form = {};
      
      try {
        // strong-type the body here
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];
        
        // loop through plugins for WITH-FORM support
        for(var p in plugins) {
          if(ctype.indexOf(plugins[p].mediaType())!==-1) {
            var formObject = plugins[p].withForm(
              {response:response, thisWord:thisWord, headers:headers, method:method, 
              body:body, url:url, fields:fields, fieldSet:fieldSet}
            );
            headers = formObject.headers||[];
            method = formObject.method||"GET";
            body = formObject.body||{};
            fields = formObject.fields||[];
            fieldSet = formObject.fieldSet||{};
            url = formObject.url||"";
            url = utils.fixUrl(url);
          }
        }
      } catch {
        // no-op
      }       
    }

    // activate via ID
    if(thisWord && thisWord.toUpperCase()==="WITH-ID") {
      thisWord = words[pointer++];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      url = "with-id";
      
      try {
        // strong-type the body here
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];

        /// loop through plug-ins for WITH-ID support
        for(var p in plugins) {
          if(ctype.indexOf(plugins[p].mediaType())!==-1) {
            url = plugins[p].withId({response:response, thisWord:thisWord});
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
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
      url = "with-name";
      
      try {
        // strong-type the body here
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];

        // loop through plugins for WITH-NAME support
        for(var p in plugins) {
          if(ctype.indexOf(plugins[p].mediaType())!==-1) {
            url = plugins[p].withName({response:response, thisWord:thisWord});
          }
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
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});

      try {
        response = JSON.parse(responses.peek().getBody('UTF8'));
        ctype = responses.peek().headers["content-type"];

        // loop through plugins for WITH-REL support        
        for(var p in plugins) {
          if(ctype.indexOf(plugins[p].mediaType())!==-1) {
            url = plugins[p].withRel({response:response, thisWord:thisWord});
          }
        }
        if(url.toLowerCase()==="with-rel") {
          rt = "no response";
        }
        else {
          url = utils.fixUrl(url);
        }  
      } catch(err) {
        // console.log(err)
        // no-op
      } 
    }
    // pull oauth
    if(thisWord && thisWord.toUpperCase()==="WITH-OAUTH") {
      thisWord = words[pointer++];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});

      try {
        var oAuthToken = "";
        // loop through plugins for WITH-OAUTH support        
        for(var p in plugins) {
          if(plugins[p].withOAuth) {
            oAuthToken = plugins[p].withOAuth({authStore:authStore,thisWord:thisWord});
            headers.authorization = "Bearer "+oAuthToken;
          }
        }
      } catch {
        // no-op
      } 
    }

    // pull basic-auth
    if(thisWord && thisWord.toUpperCase()==="WITH-BASIC") {
      thisWord = words[pointer++];
      thisWord = utils.configValue({config:config,value:thisWord});
      thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});

      try {
        var oAuthToken = "";
        // loop through plugins for WITH-OAUTH support        
        for(var p in plugins) {
          if(plugins[p].withBasic) {
            var basicToken = plugins[p].withBasic({authStore:authStore,thisWord:thisWord});
            headers.authorization = "Basic "+basicToken;
          }
        }
      } catch {
        // no-op
      } 
    }
    
    // path
    if(thisWord && thisWord.toUpperCase()==="WITH-PATH") {
      try {
        var wpath = words[pointer++];
        wpath = utils.configValue({config:config,value:wpath})
        wpath = utils.stackValue({dataStack:dataStack,value:wpath});
        rt = JSON.parse(responses.peek().getBody('UTF8'));
        rt = JSONPath({path:wpath, json:rt})[0];
        url = utils.fixUrl(rt);
      } catch (err) {
        // no-op
        // console.log(err)
      }
    }
    // url
    if(thisWord && thisWord.toUpperCase()==="WITH-URL") {
      try {
        url = words[pointer++];
        url = utils.configValue({config:config,value:url})
        url = utils.stackValue({dataStack:dataStack,value:url});
        url = utils.fixUrl(url);
      } catch {
        // no-op
      }
    }
    // direct headers
    if(thisWord && thisWord.toUpperCase()==="WITH-HEADERS") {
      try {
        thisWord = words[pointer++];
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
        thisWord = utils.fixString(thisWord);
        var set = JSON.parse(thisWord)
        for(var s in set) {
          headers[s] = set[s];
        }
        //headers = JSON.parse(thisWord); // this is replace, should be merge
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
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
        body = utils.fixString(thisWord);
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
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
        thisWord = utils.fixString(thisWord);
        if(typeof thisWord === 'object') {
          thisWord = JSON.stringify(thisWord);
        }
        query = querystring.stringify(JSON.parse(thisWord));
        url = url+'?'+query;
      } catch (err) {
        // no-op
        console.log(err);
      }
    }
    // add method
    // support for put-c[reate] w/ if-none-match header
    if(thisWord && thisWord.toUpperCase()==="WITH-METHOD") {
      try {
        thisWord = words[pointer++];
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
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
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
        headers["content-type"] = thisWord;
      } catch {
        // no-op
      }
    }
    // set accept header
    if(thisWord && thisWord.toUpperCase()==="WITH-ACCEPT") {
      try {
        thisWord = words[pointer++];
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
        headers["accept"] = thisWord;
      } catch {
        // no-op
      }
    }

    // set user-agent value
    if(thisWord && thisWord.toUpperCase()==="WITH-AGENT") {
      try {
        thisWord = words[pointer++];
        thisWord = utils.configValue({config:config,value:thisWord});
        thisWord = utils.stackValue({dataStack:dataStack,value:thisWord});
        headers["user-agent"] = thisWord;
      } catch {
        // no-op
      }  
    }
  }

  // make sure there is some user agent value set
  if(!headers["user-agent"]) {
    headers["user-agent"] ="hyper-cli";
  }
    
  if(config.verbose!=="false") {
    console.log("\n******************");
    console.log("URL: " + url);
    console.log("QUERY: " + JSON.stringify(query));
    console.log("HEADERS: " + JSON.stringify(headers));
    console.log("METHOD: " + method);
    console.log("BODY: " + body);
    console.log("******************\n");
  }
    
  // make the actual call
  try {
    if(body && method.toUpperCase()!=="GET") {
      if(method.toUpperCase()==="DELETE") {
        response = request(method, url, {headers:headers});        
      }
      else {
        response = request(method, url, {headers:headers, body:body});
      }
    } else {
      if(body) {
        url = url + querystring.stringify(body);
      }
      response = request(method, url, {headers:headers});
    }
    responses.push(response);
    rt = "\n"+response.getBody("UTF8")+"\n";
  }
  catch (err) {
   rt = "\n"+err.toString()+"\n";
  }
 
  try {
    if(config.verbose==="false") {
      rt = "STATUS "+response.statusCode+"\n"+response.url+"\n"+response.headers["content-type"];
    }

  } catch {
    // no-op
  } 
    
  return rt;
}
