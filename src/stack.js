/************************************
 * stack management module
 * **********************************/

// imports
var Stack = require('stack-lifo');
const fs = require('fs');

// exports
module.exports = main;

// internals
var dataStack = new Stack();

// manage json object data stack
// args:{dataStack:dataStack,words:words}
// function main(words) {
function main(args) {
  var words = args.words||[];
  dataStack = args.dataStack;
  var rt = "";
  var file = "";
  var set = {};
  var data = "";
  var token = words[1]||"";
  
  switch (token.toUpperCase()) {
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
      rt = dsPush(words[2]||"");
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
  //return rt;
}

// load an item and add to top of stack
function dsLoad(file) {
  var rt = "";
  var set = {};
  var data = "";
  var target = file||"./hyper.dat";
  
  try {
    console.log(target);
    if(target==="") {target = "./hyper.dat"};
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
  target = file||"./hyper.dat";
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
  
  target = file||"./hyper.dmp";
  
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
  var target = file||"./hyper.dmp";
  
  try {
    if(target==="") {target = "./hyper.dmp"};
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
function dsPush(token) {
  var rt = "";
  var item = {};
  
  try {
    regex = /\\.\\/gi
    token = token.replace(regex,' ')
    item = JSON.parse(token);
    dataStack.push(item);
  } catch {
    // no-op
  }  
  return item;
}

// update the JSON object on the top of the stack
function dsSet(token) {
  var rt = "";
  var set = {};
  var item = {};
  
  try {
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
  } catch {
    // no-op
  }  
  return item;
}

