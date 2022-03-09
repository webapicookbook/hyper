/**************************************
  config module
***************************************/

// imports
const fs = require('fs');
const utils = require('./hyper-utils');

// exports
module.exports = main;

// internals
var config = {};
var defaultFile = __dirname + "/../hyper.config";

// configuration operations
// args = {config:config,words:words}
function main(args) {
  var words = args.words||[];
  config = args.config||{};
  var rt = "";
  var file = "";
  var set = {};
  var data = "";
  var token = words[1]||"";
  
  switch (token.toUpperCase()) {
    case "HELP":
      rt = showHelp(words[2]||"");
      break;
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
    case "REMOVE":
      rt = configRemove(words[2]);
      break;
    case "CLEAR":
      config = {};
      rt = config;config
      break;
    case "RESET":
      config = {};
      rt = configLoad(""); 
    case "READ":
    default:
      rt = config  
  }
  return {config:config,words:words,rt:rt};
}

// save config file to disk
function configSave(file) {
  var rt = "";
  var data = "";
  var target = "";
  data = JSON.stringify(config, null, 2);
  target = file||defaultFile;
  
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
  var target = file||defaultFile;
  
  try {
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
    token = utils.fixString(token);
    set = JSON.parse(token);
    for(var c in set) {
    config[c] = set[c];
    }
  } catch {
    // no-op
  }  
  return config;
}

// remove named item
function configRemove(token) {
  var rt = "";
  var set = {};
  
  try {
    for(var c in config) {
      if(c!==token) {
        set[c] = config[c];
      }
    }
    config = set;
  } catch {
    // no-op
  }
  return config;
}

function showHelp(thisWord) {
  var rt = "";
  
  rt = `
  CONFIG
    READ (returns all the config values)
    SET <{"name":"value",...}> (writes one or more config values to the list)
    REMOVE <string> (removes the named config value from the list)
    CLEAR (removes all settings)
    RESET (resets to default settings : "hyper.config")
    FILE|LOAD [file-string] : defaults to "hyper.config"
    SAVE|WRITE [file-string] : defaults to "hyper.config"
    
    Using $$name$$ macros in commands replaces the placeholder with correspond config value`

  console.log(rt);
  return "";
}


