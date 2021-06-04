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
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'i> '
});

var responses = [];
var config = {};

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
    case "ACTIVATE":
      console.log(activate(words));  
      break;
    case "DISPLAY":
      console.log(display(words));
      break;
    case "CONFIG-SET":
      console.log(configSet(words));
      break;  
    case "RESPONSES":
      console.log(responses.length);
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

// display a saved response
// DISPLAY 
// - LENGTH returns number of responses saved
// - {index} returns the response at that index
function display(words) {
  var rt = "";
  var index = 0;
  var token = words[1]||"0";
  
  switch (token.toLowerCase()) {
    case "len":
    case "length":
      rt = responses.length;
      break;
    default:
      index = parseInt(token);  
      if(index<0) {index=0};
      if(index>responses.length-1) {index=responses.length-1};
      try {
        rt = responses[index].getBody("UTF8");
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
  var qs = {};
  var method = "GET";
  var response;
  var thisWord = "";
  var pointer = 2;
  
  while (pointer<words.length) {
    thisWord = words[pointer++];
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
        qs = thisWord;
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

  console.log("\n******************");
  console.log(url);
  console.log(qs);
  console.log(headers);
  console.log(method);
  console.log(body);
  console.log("******************\n");
  
  // make the actual call
  try {
    if(body) {
      response = request(method, url, {headers:headers, body:body, qs:qs});
    } else {
      response = request(method, url, {headers:headers});
    }
    responses.push(response);
    rt = "\n"+response.getBody("UTF8")+"\n";
  }
  catch (err) {
   rt = "\n"+err.toString()+"\n";
  }
    
  return rt;
}

// generate a unique string based on date/time
function timeStamp() {
  return Date.now().toString(36)
}

