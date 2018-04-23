var noUsr = [
	"Username is required.",
	"I really don't think you're that anonymous.",
	"I can't help you if you've forgotten your name.",
	"I'm sorry, we don't support names with zero characters.",
	"I will only make an exception if you have a good reason or are a unicorn.",
	"Name, rank, and serial number too much for you, huh.",
	"Long time ago I used to have a life, until someone told me"+
	" to create a Facebook account. - http://coolfunnyquotes.com",
	"'Si Patrón.'  Say it.",
	"We've been over this.",
	"Some people are like clouds. When they go away, "+
	"it's a brighter day. - http://coolfunnyquotes.com",
	"Maybe if we tell people the brain is an app, they'll"+
	" start using it. - http://coolfunnyquotes.com"
];
	
var noPswd = [
	"Um. Your password is kind of required...",
	"Try 'password' or maybe your birthday.",
	"How about my birthday.",
	"Think about this.  When did you see your password last.",
	"You. Are. A. Terrible. Hacker.",
	"This is not an Easter Egg, this is serious.",
	"Have you even tried guessing.",
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed"+
	" dignissim lorem non nisi imperdiet aliquam in a magna. Aenean"+
	" sit amet laoreet neque. Mauris diam turpis, tempor ac luctus"+
	" et, blandit nec est. Nullam porttitor non mauris at ultricies."+
	" Mauris libero felis, auctor et rutrum non, consectetur vel "+
	"mauris. Maecenas pretium id ligula id varius. Duis accumsan "+
	"magna nec nisi iaculis, in mattis augue vulputate. Praesent "+
	"iaculis nulla congue, ultrices ligula sed, dignissim elit. "+
	"Aenean vel vulputate nulla. Fusce nec orci nec quam efficitur congue.",
	"Go play video games.",
	"Whenever I'm sad, you're there. Whenever I have problems, "+
	"you're there. Whenever I lose control, you're there. Let's "+
	"face it, you are bad luck. - http://coolfunnyquotes.com" 
];
					
var neither = [
	"Password and Username fields are required, duh.",
	"Pay attention.  This really isn't that difficult.",
	"I'm not out to get you.",
	"I hope I'm not talking to a cat.",
	"Beware of computer programmers that carry screwdrivers. "+
	"- Leonard Brandwein - http://coolfunnyquotes.com",
	"You can do this.  It's not like it's life or death or anything.",
	"I'm thinking that you must really like the color red.",
	"I don't like the color red.",
	"They say \"don't try this at home\" so I'm coming over to"+
	" your house to try it. - http://coolfunnyquotes.com",
	"Why don't you find something else to do.",
	"Lick your keyboard.",
	"When you fall, I will be there to catch you - With love, "+
	"the floor. - http://coolfunnyquotes.com",
	"I did not trip and fall. I attacked the floor and I believe"+
	" I am winning. - http://coolfunnyquotes.com"
];

var noUsrCnt=0;
var noPswdCnt=0;
var neitherCnt=0;
var errElem = document.getElementById("error");
function fade() {
	errElem.style.transition = "opacity 1.5s";
	errElem.style.opacity=1;
}
function checkInput(e) {
	e.preventDefault();
	var iuser = ("" === document.getElementById("iuser").value);
	var ikey = ("" === document.getElementById("ikey").value);
	if (ikey || iuser) {
		errElem.style.transition = "";
		errElem.style.opacity=0;
		setTimeout(fade,100);
	}
	if (ikey && iuser) {
		errElem.innerHTML = neither[neitherCnt];
		neitherCnt++;
		if (neitherCnt === neither.length)
			neitherCnt=0;
		return false;
	}
	else if (ikey) {
		errElem.innerHTML = noPswd[noPswdCnt];
		noPswdCnt++;
		if(noPswdCnt === noPswd.length)
			noPswdCnt=0;
		return false;
	}
	else if (iuser) {
		errElem.innerHTML = noUsr[noUsrCnt];
		noUsrCnt++;
		if (noUsrCnt === noUsr.length)
			noUsrCnt=0;
		return false;
	}
	return true;
}
