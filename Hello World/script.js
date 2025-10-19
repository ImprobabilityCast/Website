//Comment
/*
Comment.  Comment.  Identifier rules: letter 1=letter,underscore(_), or a dollar sign ($).Commmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmment.  
subsequent letters may be: letters, digits, underscores, or dollar signs.  Numbers are not allowed for the 1st character.  This way jscript can easily distinguish IDs from numbers.
*/
//js=Case *SENSITIVE* NO HYPHENS. (-) are for subtraction.  
//Use Camel Case with first letter notCapitalized.  CHARSET=Unicode
//Extra spaces are not req. Will not exe. good 2 put spacs round ( = + - */ )
//(=) is assignment operator not "equal to" x = x + 5 adds 5 to x
//(+= adds to var.  -= subtracts from var etc. etc.
// != not equal , !== not equal value or not equal type , == equal to
//=== equal value and equal type
//% operator = modular modulus(pl).  Returns division remainder. 10**2 = 100
/*
var y = 123e10;
var z = 124e-3;
Math.random();	//returns a random number {0 <= x < 1}
Math.min(354, -7984, 3, 1099, 0, -45, 7);	//returns -7984
Math.max(354, -7984, 3, 1099, 0, -45, 7);	//returns 1099
Math.round(23.6);	//returns 24
Math.round(3.3);	//returns 3
Math.ceil(34.4);	//returns 35
Math.floor(10.8);	//returns 10
*/
/*
ISO 8601 is the international standard for the representation of dates and times. 
YYYY-MM-DD  YYYY-MM  YYYY  YYYY-MM-DDTHH:MM:SS
Universal Time Coordinated(UTC) = Greenwich Mean Time(GMT)
Commas are ignored.  Names are case insensitive. Long Date = MMM DD YYYY   DD MMM YYYY
Months con be abbrev. or not.  In all short dates and ISO dates, months come before days.
Short dates = MM/DD/YYYY or YYYY/MM/DD
JANUARY = 00 , DECEMBER = 11  <=less than or equal to.  >=greater than or equal to.
&& - and
|| - or
! - not
varname = (codition) ? value1true:value2false;
bitwise operators:
&	AND
|	OR
~	NOT
^	XOR
<<	Left shift
>>	right shift
these change numbers to 32-bit, operate, and untransform them.
switch(expression)	{
case n:
case n:
case n:
	code block;
	break;
case n:
	code block;
	break;
default:
	default code;
break = stops exe of code and case testing
don't use for last in list
for (statement 1; statement 2; statement 3) {
	code block;
}
statement1 = exe bfore loop(code block) starts
statement2 = defines condition for running the loop(code block)
statement3 = is exe each time after the loop(code block) has been exe
while (condition) {
	code block to b exe
}
do {
	code block 2 B exe
}
while (condition);
continue = skip and continue
label:
statements
labels statments
code block = anything between " { " and " } "
reg express = /pattern/modifiers;
n.replace(/word/i, "tigger");	replaces word with tigger.  
MODIFIERS
i	means case insensitve
g	means perform a global match (find all matches instead of stopping after 1st match)
m	perform multiline matching
EXPRESSIONS
[abc]	finds any of the characters between the brackets
[0-9]	finds any of the digits between the brackets
(x|y)	find any of the alternatives seperated with |
METACHARACTERS
\d	find a digit
\s	find a whitespace character
\b	find a match at the beginning or end of a word
\uxxxx	find the Unicode character specif by the hexadecimal number xxxx
\xdd        find the unicode char sped by hexadecimal dd
\xxx        find the unicode char spec by octal xxx
QUANTIFIERS
n+	matches ant string that contains at least one "n"
n*	matches any string that contains zero or more occur of "n"
n?	matches any string that contains zero or one occur of "n"
/n/.test("")	tests string for n ret true if so
/n/.exec("")	searches string for n ret n if so.  ret null if none
try {
	Block of code to test for errs
}
catch(err) {
	Block of code to exe if errs found
}
finally {
	code exe regardles de try + catch
}
"use strict"; uses strict mode. not supp here.  =directive. reconized at beginning of scrip or func
4 spaces indent code blocks
DO NOT USE TABS!!!!!!!!  (stop using tabs!!!)
obj end = };
complex statements = ;
}
constants are UPPERCASE (PI)
.html not .htm
line length < 80
use {} not new obj
use "" not new string
use 0 not new num
use false not new bool
[] instead of new array
use /()/ instead of new RegExp
use function (){} not new Function()
eval() func is used to run text as code.   = security problem. = don't use.
concatenation is adding strings
var x = "Hellllloooooo \
World!!!";
not var x = "hello 
world";
numbers are stored as 64-bit floating point numbers (floats)
NEVER BREAK A RETURN STATEMEMT
<script defer="true"></script>works only for external scripts. means exe afer page has finished parsing
object = unordered collection of vars called named values
named values = prop and method
obj method = obj prop containing a func def
obj constructor function name
new name() creates new object from constuctor prototype
to add a new prop to a proto you must add it to the constuctor function directly
or use constuctname.prototype.name = "etc."
DO NOT MODIFY STANDARD JAVASCRIPT PROTOTYPES
when var x = func the func doesn't need a name, it is called by the var
(func())() will self-invoke
arguments are not changed outside of a func
obj props are changed outside of a func
DOM = Document Object Model
W3C = world wide web consortium
.innerHTML prop can be used to change any HTML Element INCLUDING <html> and <body>
document.getElementById("id")
document.getElementsByTagName("name")
X not in IE8 document.getElementsByClassName("name")
ELEMENT.innerHTML = NEW HTML CONTENT
ELEMENT.attribute = new value
ELEMENT.setAttribute(attribute, value)
ELEMENT.style.PROPERTY = NEW STYLE
document.createElement(element)
document.removeChild(element)
document.appendChild(element)
document.replaceChild(element)
document.write(text)           write into HTML output stream    NEVER Use after doc is loaded
document.getElementById(id).EVENT = function() {code}     adds handler code to an event
document.anchors                      Ret all <a> elements that have a name attrib
document.applets                  Ret all <applet> elements (not in HTML5)
document.baseURI              Ret absolute base URI of the doc
document.body                  Ret <body> element
document.cookie                       Ret document's cookie
document.doctype                 Ret document's doctype
document.documentElement                Ret <html> element
document.documentMode            Ret mode used by the browser
document.documentURI                      Ret URI of the document
document.domain                         Ret domain name of doc server
document.domConfig                         OBSOLETE       Ret DOM config
document.embeds                         Ret all <embed> elements
document.forms                    Ret all <form> elements
document.head                               Ret <head> elements
document.images                   Ret all <img> elements
document.implementation                   Ret DOM implementation
document.inputEncoding      Ret document's encoding (char set)
document.lastModified                       Ret date and time the document was update
document.links                     Ret all <area> and <a> elements that have a href attrib
document.readyState                           Returns the (loading) status of the document
document.referrer                Ret the URI of the referrer (the linking document)
document.scripts                                      Returns all <script> elements
document.strictErrorChecking        Ret if error checking is enforced
document.title                                        Ret <title> element
document.URL                                                  Ret complete URL of document  
documen.OBJcOLLECTION["id"]      finds the element in the Obj Collection an displays all ele vals
U+0020 - U+007E
U+00A0 - U+00FF
document.getElementById("goop").style.PROPERTY = NEWPROPERTY;
String.fromCharCode(xxxx);
NOT IN IE8 element.addEventListener(event, function, useCapture);      uCap = true; bub= false
event=event
function=what to do
useCapture= boolean spec whether bubble or capture, Optional
bubble = inner element handled first
capture = outermost element handled first
document.body    gets body
document.documentElement    gets entire doc
window.open
.close
.resizeTo()
.moveTo()
doc.bod.clientHeight
doc.docEle.clientHeight
screen.width
.height
.availWidth
.availHeight
.colorDepth
.pixelDepth
window.location
.assign()

window.history.back()
window.history.forward()
window.confirm()
'ok'=true
'cancel'=false
window.alert()  = must 'ok' to proceed
window.prompt(text, default text)
'ok' ret input
'cancel' ret null
setTimeout(func, millisec)  exe func aft spec milli
setInterval(func, milisec)    exe func coninuously aft spec milli
window.clearTimeout(timeout var)
window.clearInterval(interval var)
document.cookie     ret all cookies in string

Date()
new Date();
.toDateString()
.toUTCString()


.match(regExp)
*/
function q112()  {
    document.getElementById("p1").innerHTML += "1";
    setTimeout("q112()", 4000);
}
q112();



