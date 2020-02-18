<?php require "../meta-pages/head.php"; ?>
<title>Track 1 - <?php echo $_SERVER['SERVER_NAME'];?></title>

<link rel="stylesheet" type="text/css" href="/css/cdPlayer.css">
<body>
<?php
echo "<h1 id='h'>Now playing track 1 of ", $length - 2,
	 " - ", $arr[2], "</h1><br>",
	 "<audio autoplay ", /*controls */
	"id='audio' onended='next()' ondurationchange='updLen()' ",
	"ontimeupdate='updSeek()' onpause='updPauseB()' ",
	"onplay='updPauseB()' src='getTrack.php?track=0' type='audio/mpeg'>",
	"Sorry, your browser does not support the HTML5 audio tag",
	"</audio>";
?>

<div id="volDiv">
	<button id="muteB" type="button" onclick="umute()">
		<img id="muteImg" src="/images/speaker-16.png" 
			alt="Mute/Un-mute"></img>
	</button>
	<input id="volSlider" type="range" value="100" onmouseup="volMove()">
</div>
<div id="player">
	<button id="ppauseB" type="button" onclick="ppause()">
		<img id="ppauseImg" src="/images/pause-32.png" 
			alt="Play/Pause"></img>
	</button>
	<input id="seek" type="range" onmousemove="sliderSeek()">
</div>
<p><span id="current"></span>/<span id="full"></span></p>
<div id="navDiv">
	<button id="backB" class="navB" type="button" onclick="back()">
		back</button>
	<button id="nextB" class="navB" type="button" onclick="next(-1)">
		Next</button>
</div>
<ol>
	<caption>
		<h2 id="tkHeader">Tracklist</h2>
		<div id="tkHeadBorder"></div>
	</caption>
<?php
for($y=2; $y<$length; $y++){
	echo "<li><a onclick='next($y-2)'>", $arr[$y], "</a></li>\n";
}
?>
</ol>
<script>

var au = document.getElementById("audio");
var seek = document.getElementById("seek");
var current = document.getElementById("current");
var volSlider = document.getElementById("volSlider");
var len = 0;

// vars cnt, types and tracks are defined
function getTimeStr(seconds){
	var mins = Math.floor(seconds/60);
	var sec = Math.floor(seconds - mins*60)
	var hrs = Math.floor(mins/60);
	var tmStr = "";
	if(hrs > 0){
		tmStr = hrs;
		tmStr += ":";
	}
	tmStr += mins;
	if(sec < 10)
		tmStr += ":0";
	else
		tmStr += ":";
	tmStr += sec;
	return tmStr;
}
function updLen(){
	len = au.seekable.end(0);
	seek.max = len;
	document.getElementById("full").innerHTML = getTimeStr(len);
}
function updSeek(){
	seek.value = au.currentTime;
	current.innerHTML = getTimeStr(au.currentTime);
}
function sliderSeek(){ au.currentTime = seek.value; }
var storeVol = 100;
function umute(){
	if(au.muted){
		if(au.volume === storeVol / 100)
			volSlider.value = storeVol;
		document.getElementById("muteImg").src = 
			"/images/speaker-16.png";
	}
	else{
		storeVol = volSlider.value;
		volSlider.value = 0;
		document.getElementById("muteImg").src = 
			"/images/mute-2-16.png";
	}
	au.muted = !au.muted;
}
function volMove(){
	var newVol = volSlider.value / 100;
	au.volume = newVol;
	if(newVol === 0 ^ au.muted)
		umute();
}
function ppause(){
	if(au.paused)
		au.play();
	else
		au.pause();
}
function updPauseB(){
	if(au.paused)
		document.getElementById("ppauseImg").src = 
			"/images/play-32.png";
	else
		document.getElementById("ppauseImg").src = 
			"/images/pause-32.png";
}
var index=1;
function next(i = null){
	if(i !== null && i > -1)
		index = i;
//if index is >= number of tracks...
	if(index >= cnt-2){
		index = 0;
//if function is not called by pressing the next button...
		if(i !== -1)
			return;
	}
	au.src = "<?php echo $dir; ?>" + tracks[index];
	au.type = types[index];
	au.load();
	var str = "Track "; str += index+1;
	document.title =  str + " - " + 
		"<?php echo $_SERVER['SERVER_NAME']; ?>";
	str = "Now playing track ";
	str += index+1; str += " of "; str += (cnt-2);
	str += " - " + tracks[index];
	document.getElementById("h").innerHTML = str;
	index++;
}
function back(){
	//if index === the first track...
	if(index === 1)
		next(cnt-3); // -3 so that it points to the last track
	else // -2 because index is incremented at the end of 'next()'
		next(index-2);
}
</script>
</body>
</html>
