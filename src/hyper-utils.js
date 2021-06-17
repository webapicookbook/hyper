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


// display help content
function showHelp() {
  var rt = "";

  rt  = `
  ******************************************
  HYPER - v1.0 : 2021-06
  ******************************************

  ACTIVATE|A|GO|GOTO|CALL -- synonyms
    WITH-URL url
    WITH-REL string 
    WITH-NAME string (only SIREN Actions) 
    WITH-PROFILE (uses confg.profile property)
    WITH-FORMAT (uses config.accept property)
    WITH-QUERY {n:v,...}
    WITH-BODY name=value&... OR {"name":"value",...}
    WITH-HEADERS {"name":"value",...}
    WITH-ENCODING string
    WITH-METHOD string
    WITH-FORM form-identifier-string
    WITH-STACK (uses top stack item for input/query values)
  CLEAR
  SHELL command-string <== "Here be dragons!"
    LS || DIR folder-string
  CONFIG
    READ
    SET {"name":"value",...}
    FILE|LOAD (string) : defaults to "hyper.cfg"
    SAVE|WRITE (string) : defaults to "hyper.cfg"
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
    STATUS
    CONTENT-TYPE
    HEADERS
    PEEK
    POP
    LENGTH
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
