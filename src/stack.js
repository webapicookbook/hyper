/************************************
 * stack management module
 * **********************************/

// imports
const {JSONPath} = require('jsonpath-plus');
const Stack = require('stack-lifo');
const fs = require('fs');
const utils = require ('./hyper-utils');

// exports
module.exports = main;

// internals
var dataStack = new Stack();
var responses = new Stack();
var defaultItemFile = __dirname + "/../hyper.stack";
var defaultStackFile = __dirname + "/../hyper.dump";

// manage json object data stack
// args:{dataStack:dataStack,responses:responses,words:words}
function main(args) {
  responses = args.responses;
  dataStack = args.dataStack;
  var words = args.words||[];
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
    case "LOAD": // load a JSON object item from disk
      rt = dsLoad(words[2]||"");
      break;
    case "WRITE": 
    case "SAVE": // write the current JSON item to disk
      rt = dsWrite(words[2]||"");
      break;
    case "SET": // update the JSON object at the stop of the stack
      rt = dsSet(words[2]||"");
      break;  
    case "LEN":
    case "LENGTH": // stack length
      try {
        rt = dataStack.size();
      } catch {
        rt = "0";
      }
      break;  
    case "PUSH": // add a new item to the stack
      //rt = dsPush(words[2]||"");
      rt = dsPush(words);
      break;      
    case "POP": // pop off the top of the stack
      try {
        dataStack.pop();
      } catch {
        // no-op
      }
      rt = "OK";
      break;
    case "DUMP":
      rt = dsDump(words[2]||"");
      break;  
    case "FILL":
      rt = dsFill(words[2]||"");
      break;  
    case "CLEAR":
    case "FLUSH":
      dataStack.clear();
      rt = "OK";
      break;
    case "EXPAND-ARRAY":
      list = dataStack.peek();
      var name = words[2]||"value";
      if(Array.isArray(list)===true) {
        list = list.reverse();
        dataStack.pop();
        for(var i in list) {
          ds = {};
          ds[name] = list[i];
          dataStack.push(ds);
        }
      }
      rt = list;
      break;
    case "PEEK": // get the current item from the top of the stack
    default:
      try {
        rt = dataStack.peek();
      } catch {
        rt = "no data";
      }  
      break;      
  }
  return {dataStack:dataStack,words:words,rt:rt}
}

// load an item and add to top of stack
function dsLoad(file) {
  var rt = "";
  var set = {};
  var data = "";
  var target = file||defaultItemFile;
  
  try {
    if(fs.existsSync(target)) {
      data = fs.readFileSync(target, {encoding:'utf8', flag:'r'});
      set = JSON.parse(data);
      dataStack.push(set);
      rt = dataStack.peek();
    }
    else {
      rt = "can't open ["+target+"]";
    }  
  } catch(err) {
    rt = "ERR: "+console.error(err);
  }
  return rt;
}

// write a top stack item to disk
function dsWrite(file) {
  var rt = "";
  var data = "";
  var target = "";

  data = JSON.stringify(dataStack.peek(), null, 2);
  target = file||defaultItemFile;
  
  try {
    fs.writeFileSync(target,data);
    rt = "stack item saved as ["+target+"]";
  } catch (err) {
    rt = "ERR: " + console.error(err);
  }
  return rt;
}

// dump a full stack to disk
function dsDump(file) {
  var rt = "";
  var data = "";
  var coll = [];
  var item = {};
  var target = "";
  var cpStack = new Stack();
  
  target = file||defaultStackFile;
  
  // drain the current stack
  while (!dataStack.isEmpty()) {
    item = dataStack.peek();
    coll.push(item);
    dataStack.pop();
  }
  data = JSON.stringify(coll, null, 2);

  // refill the stack with the copied data
  coll = coll.reverse();
  for(c in coll) {
    dataStack.push(coll[c]);
  }
  
  // write the serialized data
  try {
    fs.writeFileSync(target,data);
    rt = "stack dumped to ["+target+"]";
  } catch (err) {
    rt = "ERR: " + console.error(err);
  }
  return rt;
}

// load a full stack from disk
function dsFill(file) {
  var rt = "";
  var set = {};
  var data = "";
  var target = file||defaultStackFile;
  
  try {
    if(fs.existsSync(target)) {
      data = fs.readFileSync(target, {encoding:'utf8', flag:'r'});
      set = JSON.parse(data);
      // load "backwards" to restore stack
      set = set.reverse();
      dataStack.clear();
      for(s in set) {
        dataStack.push(set[s]);
      }
      rt = "stack filled from ["+target+"]";
    }
    else {
      rt = "can't open ["+target+"]";
    }  
  } catch(err) {
    rt = "ERR: "+console.error(err);
  }
  return rt;
}

// add a new item to the stack
function dsPush(words) {
  var rt = "";
  var item = {};
  var list =[];
  var token = words[2]||"";
  var path = words[3]||"$";

  try {
    token = utils.fixString(token);
    switch (token.toLowerCase()) {
      case "with-response":
        item = JSON.parse(responses.peek().getBody('UTF8'));
        break;
      case "with-path":
        item = JSON.parse(responses.peek().getBody('UTF8'));
        item = JSONPath({path:path,json:item});
        if(Array.isArray(item) && item.length<2) {
          item = item[0];
        }
        break;
     default:
        item = JSON.parse(token);
        break;
    }
    dataStack.push(item);
  } catch (err) {
    // no-op
    console.log(err);
  }  
  return item;
}

// update the JSON object on the top of the stack
function dsSet(token) {
  var rt = "";
  var set = {};
  var item = {};
  
  try {
    token = utils.fixString(token);
    set = JSON.parse(token);
    if(dataStack.size()>0) {
      item = dataStack.peek();
    } 
    for(var c in set) {
      item[c] = set[c];
      if(dataStack.size()>0) {
        dataStack.pop();
      }
      dataStack.push(item);
    }
  } catch (err){
    // no-op
    console.log(err)
  }  
  return item;
}

// show help text
function showHelp(thisWord) {
  var rt = ""
  rt = 
   `STACK 
      PEEK 
      PUSH <{"n":"v",...}>
      PUSH WITH-RESPONSE
      PUSH WITH-PATH <json-path-string>
      POP
      SET <{"n":"v",...}>
      EXPAND-ARRAY [name] : expands array on the stop of the stack using _name_
      LOAD|FILE [file-string] : defaults to hyper.stack
      SAVE|WRITE [file-string] : defaults to hyper.stack
      DUMP [file-string] : defaults to hyper.dump
      FILL [file-string] : defaults to hyper.dump
      CLEAR|FLUSH
      LEN|LENGTH`;
      
    console.log(rt);    
  
  return "";
}

