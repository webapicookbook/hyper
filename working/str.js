
var str = "this is $$color$$ and $$size$$ and we love $$color$$ and $$size$$";
var config = {};
config.color = "red";
config.size = "large";

main(str);

function main(text) {
  console.log(text);
  while (text.indexOf("$$")>0) {
    text = ins(text,config);
    console.log(text);
  }
  return;
}

function ins(text, config) {
  var st, en, va, vax;
  var regex = /\$\$/g;

  st = text.indexOf("$$");
  en = text.indexOf("$$",st+1);
  va = text.substring(st,en+2);
  vax = va.replace(regex,"");
  text = text.replace(va,config[vax]);

  return text;
}

