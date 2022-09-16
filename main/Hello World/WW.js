var a = "0123456789abcdefghijklmnopqrstuvwxyz";
var j = 0;
function loopyDo()  {
    if(j > 35)  {j = 0}
    postMessage(a.charAt(j));
    j++;
    setTimeout("loopyDo()", 1000);
}
loopyDo();