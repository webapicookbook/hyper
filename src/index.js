/**********************************************
 *
 * interactive hypermedia console
 *
 * ********************************************/


const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter blank for timestamp, timestamp for date or exit> '
});

rl.prompt();

rl.on('line', (line) => {
  if (line.toLowerCase() === "exit") {
    console.log('Exiting!\n');
    process.exit(0);        
  } else if (line.trim() === "") {
    console.log(timeStamp()+"\n");
  } else {
    console.log(dateTime(line)+"\n");
  }
  rl.prompt();

}).on('close', () => {
  console.log('Exiting!');
  process.exit(0);
});

function timeStamp() {
  return Date.now().toString(36)
}

function dateTime(line) {
  return new Date(parseInt(line, 36)).toString();
}

