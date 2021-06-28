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

// display help content
function showHelp() {
  var rt = "";

  rt  = `
  ******************************************
  HYPER - v1.0 : 2021-06
  ******************************************

  ACTIVATE|A|GO|GOTO|CALL -- synonyms
    WITH-URL url|$$
    WITH-REL string|$$ 
    WITH-NAME string|$$ (only SIREN Actions) 
    WITH-PROFILE (uses confg.profile property)
    WITH-FORMAT (uses config.accept property)
    WITH-QUERY {n:v,...}|$$
    WITH-BODY name=value&..|{"name":"value",...}|$$
    WITH-HEADERS {"name":"value",...}|$$
    WITH-ENCODING string|$$
    WITH-METHOD string
    WITH-FORM form-identifier-string|$$
    WITH-STACK (uses top stack item for input/query values)
  CLEAR
  SHELL command-string <== "Here be dragons!"
    LS || DIR folder-string
  CONFIG
    READ
    SET {"name":"value",...}
    REMOVE string 
    CLEAR (removes all settings)
    RESET (resets to default settings : "hyper.cfg")
    FILE|LOAD (file-string) : defaults to "hyper.cfg"
    SAVE|WRITE (file-string) : defaults to "hyper.cfg"
  STACK 
    PEEK 
    PUSH
    POP
    SET {"n":"v",...}
    LOAD|FILE file-string : defaults to hyper.dat
    SAVE|WRITE file-string : defaults to hyper.dat
    DUMP file-string : defaults to hyper.dmp
    FILL file-string : defaults to hyper.dmp
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
    PATH jsonpath-string
  CJ
    METADATA
    LINKS
    ITEMS
    QUERIES
    TEMPLATE
    REL string
    PATH jsonpath-string
  HAL
    LINKS || _LINKS
    ENBEDDED || _EMBEDDED
    REL || ID || KEY string
    PATH jsonpath-string
  SIREN
    LINKS
    ENTITIES
    ACTIONS
    PROPERTIES
    ID string (for Entities)
    REL string (for Links)
    NAME string (for Actions)
    PATH jsonpath-string
`;
  return rt;
}
