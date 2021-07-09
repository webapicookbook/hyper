/**************************************
  common utility module
***************************************/

// import list
const { spawnSync, execSync, execFileSync } = require("child_process");

// export list
exports.fixUrl = fixUrl;
exports.runShell = runShell;
exports.echo = echo;
exports.showHelp = showHelp;
exports.timeStamp = timeStamp;
exports.configValue = configValue;
exports.stackValue = stackValue;

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
  words.forEach(function peek(w) {
    rt += "word="+w+"\n";
  });
  return rt;
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
  ******************************************
  HYPER - v1.0 : 2021-07
  ******************************************

  ACTIVATE|A|GO|GOTO|CALL -- synonyms
    WITH-URL <url|$#>
    WITH-REL <string|$#> 
    WITH-NAME <string|$#> 
    WITH-ID <string|$#>
    WITH-PATH <json-path-string|$#> (applies JSONPath that returns URL)
    WITH-PROFILE (uses confg.profile property)
    WITH-FORMAT (uses config.accept property)
    WITH-QUERY <{n:v,...}|$>
    WITH-BODY <name=value&..|{"name":"value",...}|$>
    WITH-HEADERS <{"name":"value",...}|$>
    WITH-ENCODING <string|$$>
    WITH-METHOD <string>
    WITH-FORM <form-identifier-string|$>
    WITH-STACK (uses top stack item for input/query values)
  CLEAR
  VERSION (returns version of hyper repl)
  SHELL command-string <== "Here be dragons!"
    LS || DIR [folder-string]
  PLUGINS (returns list of loaded plug-in modules)  
  CONFIG
    READ
    SET <{"name":"value",...}>
    REMOVE <string> 
    CLEAR (removes all settings)
    RESET (resets to default settings : "hyper.cfg")
    FILE|LOAD [file-string] : defaults to "hyper.cfg"
    SAVE|WRITE [file-string] : defaults to "hyper.cfg"
  STACK 
    PEEK 
    PUSH <{"n":"v",...}>
    PUSH WITH-RESPONSE
    PUSH WITH-PATH <json-path-string>
    POP
    SET <{"n":"v",...}>
    EXPAND-ARRAY [name] : expands array on the stop of the stack using _name_
    LOAD|FILE [file-string] : defaults to hyper.dat
    SAVE|WRITE [file-string] : defaults to hyper.dat
    DUMP [file-strin]g : defaults to hyper.dmp
    FILL [file-string] : defaults to hyper.dmp
    CLEAR|FLUSH
    LEN|LENGTH
  DISPLAY
    URL
    STATUS|STATUS-CODE
    CONTENT-TYPE
    HEADERS
    PEEK
    POP
    LENGTH|LEN
    PATH <jsonpath-string|$>
  CJ
    METADATA
    LINKS
    ITEMS
    QUERIES
    TEMPLATE
    RELATED
    ERRORS|ERROR
    ID|REL|NAME|TAG <string|$#> (returns matching nodes)
    IDS|RELS|NAMES|TAGS (returns simple list)
    PATH <jsonpath-string|$#>
  HAL
    LINKS|_LINKS
    ENBEDDED|_EMBEDDED
    ID|REL|KEY|NAME|TAG <string|$#> (returns matching nodes)
    IDS|RELS|KEYSTAGS (returns simple list)
    PATH <jsonpath-string|$#>
  SIREN
    LINKS
    ENTITIES
    ACTIONS|FORMS
    PROPERTIES
    IDS|RELS|NAMES|FORMS|TAGS|CLASSES (returns simple list)
    TAG|CLASS <string|$#> returns matching nodes
    ID|ENTITY <string|$#> (for Entities)
    REL|LINK <string|$#> (for Links)
    NAME|FORM|ACTION <string|$> (for Actions)
    PATH <jsonpath-string|$>
  WSTL
    TITLE
    DATA
    CONTENT
    ACTIONS
    RELATED
    IDS|RELS|NAMES|FORMS|TAGS|TARGETS (returns simple list)
    ID|REL|NAME|FORM|TAG|TARGET <string|$#> returns matching nodes
    PATH <json-path|$>
`;
  return rt;
}
