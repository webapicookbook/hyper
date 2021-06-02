/**********************************************
 *
 * interactive hypermedia console
 *
 * ********************************************/

const axios = require('axios');
const request = require('request');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '[?]> '
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
    case "ACTIVATE":
      activate(words);  
      console.log("working...");
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
function echo(words) {
  rt = "";
  words.forEach(function peek(w) {
    rt += "word="+w+"\n";
  });
  return rt;
}

// display a saved response
// DISPLAY LENGTH returns number of responses saved
// DISPLAY {index} returns the response at that index
// DISPLAY returns top response in the collection
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
      rt = responses[index];
  }
  return rt;
}

// perform the HTTP query
function activate(words) {
  var rt = "working...";
  var url = words[1]||"#";
  var headers = {};
  
  if(words[2] && words[2].toUpperCase()==="WITH") {
    switch (words[3].toLowerCase()) {
      case "headers":
        try {
          headers = JSON.parse(words[4])
        } catch {
          headers = {};
        }  
        break;
    }
  }
  
  (async () => {
    try {
      const response = await axios(url,{headers:headers});
      responses.push(response);
      console.log(response);
      console.log("\n");
    }
    catch (err) {
      console.log(err);
    }
  })();
  return rt;
}

// generate a unique string based on date/time
function timeStamp() {
  return Date.now().toString(36)
}

