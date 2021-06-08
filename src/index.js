#!/usr/bin/env node
/**********************************************
 * i-hyper: interactive hypermedia console
 * @mamund - 2021-06
 *
 * NOTES:
 *   A simple interactive hypermedia client
 *   type 'hyper' at command line to interactive mode
 *   pipe a file in for script mode
 *   pipe a file out to save session output
 * ********************************************/

const request = require('sync-request');
const querystring = require('querystring');
const {JSONPath} = require('jsonpath-plus');
const readline = require('readline');

var Stack = require('stack-lifo');
var responses = new Stack();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'i> '
});

var config = {};
config.verbose = "false";

var currentResponse = {};


rl.prompt();

rl.on('line', (line) => {
  line = line.trim();
  var words = line.split(" ");
  switch (words[0].toUpperCase()) {
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
    case "A":
    case "GO":
    case "CALL":  
    case "ACTIVATE":
      console.log(activate(words));  
      break;
    case "DISPLAY":
      console.log(display(words));
      break;
    case "CJ":
      console.log(displayCJ(words));
      break;  
    case "CONFIG-SET":
      console.log(configSet(words));
      break;  
    case "CONFIG-READ":
      console.log(config);
      break;  
    case "RESPONSES":
      console.log(responses.size());
      break;
    case "TIMESTAMP":
      console.log(timeStamp(line)+"\n");
      break;
    case "ECHO":  
    default:
      console.log(echo(words)+"\n");
      break;
  }
  rl.prompt();

}).on('close', () => {
  process.exit(0);
});

// echo the command line
// ECHO {strings{}
function echo(words) {
  rt = "";
  words.forEach(function peek(w) {
    rt += "word="+w+"\n";
  });
  return rt;
}

// set config values
// CONFIG-SET {n:v,...}
function configSet(words) {
  var rt = "";
  var set = {};
  
  if(words[1]) {
    try {
      set = JSON.parse(words[1]);
      for(var c in set) {
      config[c] = set[c];
      }
    } catch {
      // no-op
    }  
  }
  return config;
}

// display a parse CJ object
// DISPLAY-CJ {int}
function displayCJ(words) {
  var rt = {};
  var index = 0;
  var token = words[1]||"";
  var response = responses.peek()
  
  switch (token.toUpperCase()) {
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
    case "REL":
    case "ID":
    case "NAME":
      token  = "$..*[?(@property==='"+token.toLowerCase()+"'&&@.match(/"+words[2]+"/i))]^href";
      if("with-rel with-id with-name".toLowerCase().indexOf(token.toLowerCase)!==-1) {
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
      index = respIdx(token);
      response = responses.peek()
      try {
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
      //index = respIdx(index);
      rt = response.statusCode;  
      break;
    case "HEADERS":
      index = respIdx(index);
      rt = response.headers;  
      break;
    case "URL":
      index = respIdx(index);
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
  
  while (pointer<words.length) {
    thisWord = words[pointer++];
    // activate via rel
    if(thisWord && thisWord.toUpperCase()==="WITH-REL") {
      thisWord = words[pointer++];
      try {
        response = JSON.parse(response.peek().getBody('UTF8'));
        url= JSONPath({path:"$..*[?(@property==='rel'&&@.match(/"+thisWord+"/i))]^",json:response})[0].href;
        if(url.toLowerCase()==="with-rel") {
          rt = "no response";
        }
        else {
          if(url.indexOf("http:")==-1 && url.indexOf("https:")==-1) {
            if(url.indexOf("//")==-1) {
              url = "http://" + url;
            }
            else {
              url = "http:" + url;
            }
          }
        }  
      } catch {
        // no-op
      } 
      console.log(url); 
    }
    // url
    if(thisWord && thisWord.toUpperCase()==="WITH-URL") {
      try {
      url = words[pointer++];
      if(url.indexOf("http:")==-1 && url.indexOf("https:")==-1) {
        if(url.indexOf("//")==-1) {
          url = "http://" + url;
        }
        else {
          url = "http:" + url;
        }
      }
      
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
        console.log(query);
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
  
  if(config.verbose==="false" && response.statusCode<400) {
    try {
      rt = "STATUS "+response.statusCode+"\n"+response.url;
    } catch {
      // no-op
    }
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

// generate a unique string based on date/time
function timeStamp() {
  return Date.now().toString(36)
}

// return safe index into response collection
function respIdx(index) {
  var rt = 0;
  /*
  try {
    rt = parseInt(index);
    if(rt<0) {rt=0};
    if(rt>responses.length-1) {rt=responses.length-1};
  } catch {
    // no-op
  }
  */
  return rt;
}

