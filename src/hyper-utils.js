/**************************************
  common utility module
***************************************/

// import list
const { spawnSync, execSync, execFileSync } = require("child_process");
const say = require('say');

// export list
exports.fixString = fixString;
exports.fixUrl = fixUrl;
exports.runShell = runShell;
//exports.echo = echo;
exports.showHelp = showHelp;
exports.timeStamp = timeStamp;
exports.configValue = configValue;
exports.stackValue = stackValue;
exports.stackValueEm = stackValueEm;
exports.clearGreeting = clearGreeting;
exports.joshua = joshua;
exports.fixRaw = fixRaw;

// clean up strings
// replace \.\ with " "
function fixString(token) {
  var rt = "";
  var regex = /\\.\\/gi;
  try {
    rt = token.replace(regex, ' ');
  } catch (err) {
    rt = token;
  }
  return rt;
}

// fix up word list, if needed
function fixRaw(words) {
  //return words;
  
  var rt = [];
  var raw = "";
  var flag = false;

  for(var w of words) {
    if(w==="[%") {
      flag=true;
      raw = "";
      continue;
    }
    if(w==="%]") {
      rt.push(raw.trim());
      flag=false;
      continue;
    }
    if(flag===false) {
      rt.push(w);
    }
    else {
      raw += w + " ";
    }
  }
  return rt;
}

// clean up any supplied URL
function fixUrl(url) {
  try {
    if(url.indexOf("http:")==-1 && url.indexOf("https:")==-1) {
      if(url.indexOf("//")==-1) {
        url = "http://" + url;
      }
      else {
        url = "http:" + url;
      }
    }
  } catch (err) {
    // no ope
  }
  var regex = /\"/gi;
  url = url.replace(regex,'');
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

  try {
    say.speak(rt);
  } catch {}
  
  return rt;
}

// clear friendly "greeting" words from the line
function clearGreeting(words) {
  var rt  = [];
  var friendly = " ME US WE THEM HUH UM HMMM HMM OK OK, FINALLY FINALLY, LASTLY LASTLY, AND WHAT GAME SHALL SHOULD WE LET'S THE NOW NOW, THEN THEN, ALSO ALSO, NEXT NEXT, THANKS THANKS, THANKYOU THANKYOU, THANK YES YES, HELLO HELLO, PLEASE PLEASE, JOSH JOSH, CAN I'D LIKE YOU TO HYPERION HYPERION, HYPER HYPER, HI HI, THERE"; 
  
  try {
    for(var w of words) {
      if(friendly.indexOf(" "+w.toUpperCase()+" ")===-1) {
        rt.push(w);
      }
    };
    words = rt;
  } catch(err) {
    // no-op
    // console.log(err)
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
      try {
        rt = JSON.stringify(config[val]);
      } catch (err) {
        rt = config[val]||val;
      }
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

function stackValueEm(args) {
  var rt = "";
  var p=-1;
  var pp=-1;
  var mac="";
  var stk="";
  dataStack = args.dataStack||{};
  val = args.value||"";
  rt = val;  
  
  try {
    if(dataStack!=={} && val!=="" && val.length>4) {
      p = val.indexOf("##")
      do {
        if(p!==-1) {
          pp = val.substring(p+2).indexOf("##");
          if(p!==-1 && pp!==-1) {
            mac = val.substring(p+2,pp+p+2);
            stk = dataStack.peek();
            rt = stk[mac]||mac;
            val = val.replace("##"+mac+"##",rt);
          }
        }
        else {
          rt = val;
        }
        p = val.indexOf("##")    
      } while (p!==-1)
      rt = val;  
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
    WITH-BASIC <string|$#> (uses username and password stored at <string> for basic auth)
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

  See also: STACK HELP, CONFIG HELP, DISPLAY HELP and <PLUGIN> HELP
  
  Use $>hyper < command-file > output-file to execute HyperLANG scripts
  Use $>hyper "line1;line2;line3" to execute HyperLANG from command line`;

  return rt;
}
