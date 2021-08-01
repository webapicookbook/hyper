/**************************************
  common utility module
***************************************/

// import list
const { spawnSync, execSync, execFileSync } = require("child_process");

// export list
exports.fixString = fixString;
exports.fixUrl = fixUrl;
exports.runShell = runShell;
exports.echo = echo;
exports.showHelp = showHelp;
exports.timeStamp = timeStamp;
exports.configValue = configValue;
exports.stackValue = stackValue;
exports.clearGreeting = clearGreeting;
exports.joshua = joshua;

// clean up strings
// replace \.\ with " "
function fixString(token) {
  var rt = "";
  var regex = /\\.\\/gi;
  rt = token.replace(regex, ' ');
  return rt;
}

// clean up any supplied URL
function fixUrl(url) {
  if(url.indexOf("http:")==-1 && url.indexOf("https:")==-1) {
    if(url.indexOf("//")==-1) {
      url = "http://" + url;
    }
    else {
      url = "http:" + url;
    }
  }
  return url;
}

// run an external shell command
function runShell(words) {
  var rt = "";
  var token = words[1]||"";
  
  switch (token.toLowerCase()) {
    case "ls":
    case "dir":
      token = words[2]||".";
      try {
        rt = spawnSync("ls -l "+token,{shell:true, encoding:'utf8'}).stdout; 
      } catch {
        // no-op
      }
      break;
    default: 
      try {
        var cmd = words.slice(1);
        token = cmd.join(" ");
        rt = spawnSync(token,{shell:true, encoding:'utf8'}).stdout;   
      } catch {
        // no-op
      }  
      break;
  }
  return rt;
}

// echo whatever is on the command line
// ECHO {strings}
function echo(words) {
  rt = "";
  
  /*
  words.forEach(function peek(w) {
    rt += "word="+w+"\n";
  });
  */
  if(words[0].toUpperCase()==="ECHO") {
    words.shift();
  }  
  rt = words.join(" ");
  
  return rt;
}

// inside joke
function joshua(words) {
  var thisWord = (words[1]||"");
  var rt = "";
  
  if(thisWord.toUpperCase()==="JOSHUA") {
    rt = "GREETINGS, PROFESSOR FALKEN. WOULD YOU LIKE TO PLAY A GAME?";
  }
  
  if(words[0].toUpperCase()==="PLAY"|| words[0].toUpperCase()==="PLAY?") {
    rt = "HOW ABOUT A NICE GAME OF HYPERMEDIA?";
  }

  if(words[0].toUpperCase()==="NOW"|| words[0].toUpperCase()==="NOT"|| words[0].toUpperCase()==="NO") {
    rt = "OK, MAYBE LATER.";
  }

  return rt;
}

// clear friendly "greeting" words from the line
function clearGreeting(words) {
  var friendly = " HUH UM HMMM HMM OK OK, FINALLY FINALLY, LASTLY LASTLY, AND WHAT GAME SHALL SHOULD WE LET'S THE NOW NOW, THEN THEN, ALSO ALSO, NEXT NEXT, THANKS THANKS, THANKYOU THANKYOU, THANK YES YES, HELLO HELLO, PLEASE PLEASE, I'D LIKE YOU TO JOSHUA JOSHUA, HYPERION HYPERION, HYPER HYPER, "; 
  var i,x;
  
  try {
    while(friendly.indexOf(" "+words[0]+" ".toUpperCase())!==-1) {
      words.splice(0,1)
    }
  } catch(err) {
    // no-op
  }
  return words;
}

// generate a unique string based on date/time
function timeStamp() {
  return Date.now().toString(36)
}

// pluck config value from varpointer
// args: {config:config,value:value}
function configValue(args) {
  var rt = "";
  config = args.config||{};
  val = args.value||"";
  rt = val;  
  
  if(config!=={} && val!=="" && val.length>4) {
    if(val.substring(0,2)==="$$" &&  val.substring(val.length-2)==="$$") {
      val = val.substring(2,val.length-2);
      rt = config[val]||val;
    } 
    else {
      rt = val;
    }  
  }
  return rt;
}

function stackValue(args) {
  var rt = "";
  dataStack = args.dataStack||{};
  val = args.value||"";
  rt = val;  
  
  try {
    if(dataStack!=={} && val!=="" && val.length>4) {
      if(val.substring(0,2)==="##" &&  val.substring(val.length-2)==="##") {
        val = val.substring(2,val.length-2);
        rt = dataStack.peek();
        rt = rt[val]||val;
      } 
      else {
        rt = val;
      }  
    }
  } catch (err) {
    // console.log(err);
  }
  return rt;
}

// display help content
function showHelp() {
  var rt = "";

  rt  = `
  ACTIVATE|A|GO|GOTO|CALL|REQUEST|REQ -- synonyms
    WITH-URL <url|$#>
    WITH-REL <string|$#> 
    WITH-NAME <string|$#> 
    WITH-ID <string|$#>
    WITH-PATH <json-path-string|$#> (applies JSONPath that returns URL)
    WITH-OAUTH <string|$#> (sets the HTTP authorization header from named OAUTH config)
    WITH-ACCEPT <string|$#> (sets the HTTP accept header directly)
    WITH-FORMAT (uses config.accept property)
    WITH-PROFILE (uses confg.profile property)
    WITH-QUERY <{n:v,...}|$#>
    WITH-BODY <name=value&..|{"name":"value",...}|$#>
    WITH-HEADERS <{"name":"value",...}|$#>
    WITH-ENCODING <string|$#>
    WITH-METHOD <string>
    WITH-FORM <form-identifier-string|#>
    WITH-STACK (uses top stack item for input/query values)
    WITH-DATA <{n:v,...}|$#> (uses JSON object for input/query values)
  CLEAR
  VERSION (returns version of hyper repl)
  SHELL command-string <== "Here be dragons!"
    LS || DIR [folder-string]
  PLUGINS (returns list of loaded plug-in modules)

  See also: HELP STACK, HELP CONFIG, HELP DISPLAY and HELP <PLUGIN>`;

  return rt;
}
