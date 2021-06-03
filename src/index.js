#!/usr/bin/env node
/**********************************************
 *
 * interactive hypermedia console
 * @mamund - 2021-06
 *
 * ********************************************/

const request = require('sync-request');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '[i]> '
});

var responses = [];

rl.prompt();

rl.on('line', (line) => {
  line = line.trim();
  var words = line.split(" ");
  switch (words[0].toUpperCase()) {
    case "EXIT":
    case "STOP":
      console.log("EXITING!\n");
      process.exit(0)
      break;
    case "#":
    case "":
      break;  
    case "ACTIVATE":
      console.log(activate(words));  
      break;
    case "DISPLAY":
      console.log(display(words));
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
  console.log('Exiting!');
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
  var work = true;
  var thisWord = "";
  var pointer = 2;
  var response;
  var method = "GET";
  
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
      console.log("WITH-FORMAT");
      try {
        thisWord = words[pointer++];
        headers.accept = "application/json";
      } catch {
        // no-op
      }
    }
    // add default profile link header
    if(thisWord && thisWord.toUpperCase()==="WITH-PROFILE") {
      try {
        thisWord = words[pointer++];
        headers.link = "<http://profiles.example.org/person>;rel=profile";
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
    // add method
    if(thisWord && thisWord.toUpperCase()==="WITH-METHOD") {
      try {
        thisWord = words[pointer++];
        method = thisWord;
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

  console.log(body);
  
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
    
  return rt;
}

// generate a unique string based on date/time
function timeStamp() {
  return Date.now().toString(36)
}

