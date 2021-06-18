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

const request = require('sync-request');
const querystring = require('querystring');
const {JSONPath} = require('jsonpath-plus');

const readline = require('readline');
const fs = require('fs');

const utils = require ('./hyper-utils');
const configOp = require('./config');

var Stack = require('stack-lifo');
var responses = new Stack();
var dataStack = new Stack();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'i> '
});

var config = {};
config.verbose = "false";
var args = configOp({config:config,words:["LOAD"]});
config = args.config;

var currentResponse = {};

// check for input args
var args = process.argv.slice(2);
try {
  if(args.length>0) {
    console.log(showHelp());
  }  
} catch {
  // no-op
}

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
      console.log(manageStack(words));
      break;  
    case "CONFIG":
      args = {config:config,words:words};
      args = configOp(args);
      config = args.config;
      words = args.words;
      console.log(args.rt);
      break;  
    case "RESPONSES":
      console.log(responses.size());
      break;
    case "TIMESTAMP":
      console.log(utils.timeStamp(line)+"\n");
      break;
    case "A":
    case "GO":
    case "GOTO":
    case "CALL":  
    case "ACTIVATE":
      console.log(activate(words));  
      break;
    case "DISPLAY":
      console.log(display(words));
      break;
    case "CJ":
      console.log(cjCommands(words));
      break;  
    case "HAL":
      console.log(halCommands(words));
      break;  
    case "SIREN":
      console.log(sirenCommands(words));
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

// manage json object data stack
function manageStack(words) {
  var rt = "";
  var file = "";
  var set = {};
  var data = "";
  var token = words[1]||"";
  
  switch (token.toUpperCase()) {
    case "FILE":
    case "LOAD": // load a JSON object item from disk
      rt = dsLoad(words[2]||"");
      break;
    case "WRITE": 
    case "SAVE": // write the current JSON item to disk
      rt = dsWrite(words[2]||"");
      break;
    case "SET": // update the JSON object at the stop of the stack
      rt = dsSet(words[2]||"");
      break;  
    case "LEN":
    case "LENGTH": // stack length
      try {
        rt = dataStack.size();
      } catch {
        rt = "0";
      }
      break;  
    case "PUSH": // add a new item to the stack
      rt = dsPush(words[2]||"");
      break;      
    case "POP": // pop off the top of the stack
      try {
        dataStack.pop();
      } catch {
        // no-op
      }
      rt = "OK";
      break;
    case "DUMP":
      rt = dsDump(words[2]||"");
      break;  
    case "FILL":
      rt = dsFill(words[2]||"");
      break;  
    case "CLEAR":
    case "FLUSH":
      dataStack.clear();
      rt = "OK";
      break;  
    case "PEEK": // get the current item from the top of the stack
    default:
      try {
        rt = dataStack.peek();
      } catch {
        rt = "no data";
      }  
      break;      
  }
  return rt;
}

// load an item and add to top of stack
function dsLoad(file) {
  var rt = "";
  var set = {};
  var data = "";
  var target = file||"./hyper.dat";
  
  try {
    console.log(target);
    if(target==="") {target = "./hyper.dat"};
    if(fs.existsSync(target)) {
      data = fs.readFileSync(target, {encoding:'utf8', flag:'r'});
      set = JSON.parse(data);
      dataStack.push(set);
      rt = dataStack.peek();
    }
    else {
      rt = "can't open ["+target+"]";
    }  
  } catch(err) {
    rt = "ERR: "+console.error(err);
  }
  return rt;
}

// write a top stack item to disk
function dsWrite(file) {
  var rt = "";
  var data = "";
  var target = "";

  data = JSON.stringify(dataStack.peek(), null, 2);
  target = file||"./hyper.dat";
  try {
    fs.writeFileSync(target,data);
    rt = "stack item saved as ["+target+"]";
  } catch (err) {
    rt = "ERR: " + console.error(err);
  }
  return rt;
}

// dump a full stack to disk
function dsDump(file) {
  var rt = "";
  var data = "";
  var coll = [];
  var item = {};
  var target = "";
  var cpStack = new Stack();
  
  target = file||"./hyper.dmp";
  
  // drain the current stack
  while (!dataStack.isEmpty()) {
    item = dataStack.peek();
    coll.push(item);
    dataStack.pop();
  }
  data = JSON.stringify(coll, null, 2);

  // refill the stack with the copied data
  coll = coll.reverse();
  for(c in coll) {
    dataStack.push(coll[c]);
  }
  
  // write the serialized data
  try {
    fs.writeFileSync(target,data);
    rt = "stack dumped to ["+target+"]";
  } catch (err) {
    rt = "ERR: " + console.error(err);
  }
  return rt;
}

// load a full stack from disk
function dsFill(file) {
  var rt = "";
  var set = {};
  var data = "";
  var target = file||"./hyper.dmp";
  
  try {
    if(target==="") {target = "./hyper.dmp"};
    if(fs.existsSync(target)) {
      data = fs.readFileSync(target, {encoding:'utf8', flag:'r'});
      set = JSON.parse(data);
      // load "backwards" to restore stack
      set = set.reverse();
      dataStack.clear();
      for(s in set) {
        dataStack.push(set[s]);
      }
      rt = "stack filled from ["+target+"]";
    }
    else {
      rt = "can't open ["+target+"]";
    }  
  } catch(err) {
    rt = "ERR: "+console.error(err);
  }
  return rt;
}

// add a new item to the stack
function dsPush(token) {
  var rt = "";
  var item = {};
  
  try {
    regex = /\\.\\/gi
    token = token.replace(regex,' ')
    item = JSON.parse(token);
    dataStack.push(item);
  } catch {
    // no-op
  }  
  return item;
}

// update the JSON object on the top of the stack
function dsSet(token) {
  var rt = "";
  var set = {};
  var item = {};
  
  try {
    set = JSON.parse(token);
    if(dataStack.size()>0) {
      item = dataStack.peek();
    } 
    for(var c in set) {
      item[c] = set[c];
      if(dataStack.size()>0) {
        dataStack.pop();
      }
      dataStack.push(item);
    }
  } catch {
    // no-op
  }  
  return item;
}

// configuration operations
/*
function configOp(words) {
  var rt = "";
  var file = "";
  var set = {};
  var data = "";
  var token = words[1]||"";
  
  switch (token.toUpperCase()) {
    case "FILE":
    case "LOAD":
      rt = configLoad(words[2]||"");
      break;
    case "WRITE":
    case "SAVE":
      rt = configSave(words[2]||"");  
      break;
    case "SET":
      rt = configSet(words[2]);
      break;  
    case "READ":
    default:
      rt = config  
  }
  return rt;
}
*/

// save config file to disk
function configSave(file) {
  var rt = "";
  var data = "";
  var target = "";
  data = JSON.stringify(config, null, 2);
  target = file||"./hyper.cfg";
  try {
    fs.writeFileSync(target,data);
    rt = "config saved as ["+target+"]";
  } catch (err) {
    rt = "ERR: " + console.error(err);
  }
  return rt;
}

// load config from file
// overwrites any existing settings of the same name
function configLoad(file) {
  var rt = "";
  var set = {};
  var data = "";
  var target = file||"./hyper.cfg";
  
  try {
    console.log(target);
    if(target==="") {target = "./hyper.cfg"};
    if(fs.existsSync(target)) {
      data = fs.readFileSync(target, {encoding:'utf8', flag:'r'});
      set = JSON.parse(data);
      for(var c in set) {
        config[c] = set[c];
      }
      rt = config;
    }
    else {
      rt = "can't open ["+target+"]";
    }  
  } catch(err) {
    rt = "ERR: "+console.error(err);
  }
  return rt;
}

// set config values
// CONFIG-SET {n:v,...}
function configSet(token) {
  var rt = "";
  var set = {};
  
  try {
    set = JSON.parse(token);
    for(var c in set) {
    config[c] = set[c];
    }
  } catch {
    // no-op
  }  
  return config;
}


// display and parse a SIREN response
// SIREN {command}
function sirenCommands(words) {
  var rt="";
  var token = words[1]||"";
  var response;
  var node = {};

  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "LINKS":
      rt = JSON.parse(response.getBody('UTF8')).links;
      break;
    case "PROPERTIES":
      rt = JSON.parse(response.getBody('UTF8')).properties;
      break;
   case "ACTIONS":
      rt = JSON.parse(response.getBody('UTF8')).actions;
      break;
    case "ENTITIES":
      rt = JSON.parse(response.getBody('UTF8')).entities;
      break;
    case "ID": // entities -- by convention, tho
      token = "$.entities.*[?(@property==='id'&&@.match(/"+words[2]+"/i))]^"
      if("rel id name".toLowerCase().indexOf(token.toLowerCase())==-1) {
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
    case "NAME": // actions
      token = "$.actions.*[?(@property==='name'&&@.match(/"+words[2]+"/i))]^"
      if("rel id name".toLowerCase().indexOf(token.toLowerCase())==-1) {
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
    case "REL": // links
      token = "$.links"
      if("rel id name".toLowerCase().indexOf(token.toLowerCase())==-1) {
        try {
          rt = JSON.parse(response.getBody('UTF8'));
          rt = JSONPath({path:token, json:rt})[0];
          for(var i=0; i<rt.length; i++) {
            var link = rt[i];
            for(var j=0; j<link.rel.length; j++) {
              if(link.rel[j]===words[2]) {
                node = link;
              }
            }
          }
          rt = node;
        } catch {
          // no-op
        }
      }  
      else {
        rt = "no response";
      }  
      break;
    case "PATH":  
      token = words[2]||"$";
      console.log(token);
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    default:  
      try {
        response = responses.peek()
        rt = JSON.parse(response.getBody("UTF8"));
      } catch {
        rt = "no response";
      }
  }
  return JSON.stringify(rt, null, 2);
}

// display and parse a HAL response
// HAL {command}
function halCommands(words) {
  var rt = {};
  var token = words[1]||"";
  var response;
  
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
      token  = "$..*[?(@property==='"+words[2]+"')]";
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
    case "PATH":  
      token = words[2]||"$";
      console.log(token);
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    default:  
      try {
        response = responses.peek()
        rt = JSON.parse(response.getBody("UTF8"));
      } catch {
        rt = "no response";
      }
  }
  return JSON.stringify(rt, null, 2);
}
// display a parse CollectionJSON object
// CJ {command}
function cjCommands(words) {
  var rt = {};
  var index = 0;
  var token = words[1]||"";
  var response;

  try {
    response = responses.peek();
  } catch {
    token="";
  }
  
  switch (token.toUpperCase()) {
    case "METADATA":
      rt = JSON.parse(response.getBody('UTF8')).collection.metadata;
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
      rt = JSON.parse(response.getBody('UTF8')).collection.error;
      break;
    case "REL":
    case "ID":
    case "NAME":
      token  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+words[2]+"/i))]^";
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
    case "PATH":  
      token = words[2]||"$";
      console.log(token);
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    default:  
      try {
        response = responses.peek()
        rt = JSON.parse(response.getBody("UTF8"));
      } catch {
        rt = "no response";
      }
  }
  return JSON.stringify(rt, null, 2);
}


// display a saved response
// DISPLAY 
// - LENGTH returns number of responses saved
// - {index} returns the response at that index
function display(words) {
  var rt = "";
  var index = 0;
  var token = words[1]||"0";
  var response;
  
  
  // shortcut for error
  try {
    response = responses.peek();
  } catch {
    rt = "no response";
    return rt;
  }  

  switch (token.toUpperCase()) {
    case "LEN":
    case "lENGTH":
      rt = responses.size();
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
      rt = response.statusCode;  
      break;
    case "HEADERS":
      rt = response.headers;  
      break;
    case "URL":
      rt = response.url;  
      break;
    case "CONTENT-TYPE":
      rt = currentResponse.contentType;
      break;  
    case "PATH":
      token = words[2]||"$";
      console.log(token);
      try {
        rt = JSON.parse(response.getBody('UTF8'));
        rt = JSONPath({path:token, json:rt});
      } catch {
        // no-op
      }
      break;
    case "PEEK":
    default:
      try {
        rt = response.getBody("UTF8");
      } catch {
        rt = "no response";
      }
  }
  return rt;
}

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
