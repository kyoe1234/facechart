var _DEBUG = true,
	_DEVICE_RUNTIME = 'Android';
var user = {
	email:		'guest',
	devicemodel:''
};
var gameInfo = '';
var faceUrl = 'http://14.63.221.243/facechart/api/';

function init() {
	try{
		console.log('tournament init start!!!');
		//userInfo Set - email, devicemodel
		deviceapis.devicestatus.getPropertyValue( 
				function (value) { user.devicemodel = value; },  
				errorCallback, { aspect: "Device", property : "model"});
		
		var userInfoData = window.localStorage.getItem('userInfoData');
		user['email'] = userInfoData || 'guest';
		
		tournamentListRequest();
		initTournamentList();
		
		document.body.addEventListener('touchstart', onTouchButton, false);
		
		//개발중엔 백버튼 클릭시 차트메뉴로 이동
		androidBack();
	} catch (e) {
		console.log('tournament init error : ', e.message);
	}
}

function onTouchButton(e) {
	var target = e.target.id;
	switch(target) {
		case 'mainBtn':
			document.location.href="main.html";
			break;
			
		case 'randomBtn':
			//alert(document.getElementsByTagName('LI').length);
			var randomNum = Math.floor(Math.random() * (document.getElementsByTagName('LI').length));
			var tournamentidx = document.getElementsByTagName('LI')[randomNum].id;
			tournamentSelectRequest(tournamentidx);
			break;
	}
	
}

//백버튼클릭시
function androidBack(){
	try{
		var onBackPressed = function() {
			document.location.href="main.html";
		};
		ax.ext.android.setOnBackPressed(onBackPressed);
	}catch(e) {
		// iOS? WAC?
	}
}

//접속 후 토너먼트 선택 전 REQUEST - tournament List
function tournamentListRequest(){
	var params = {'email': user.email};
	ax.ext.net.post(faceUrl + 'tournament/list.php', params,
			tournamentListSuccessCallback, errorCallback);
}
function tournamentListSuccessCallback(result){
	if (result.status >= 200 && result.status < 300) {
		var listResponse = JSON.parse(result.data);
		//jzOpenObj(listResponse[1]);
		var tmpStr = '';
		for (var key in listResponse) {
			//tmpStr = tmpStr + '\n' + key + ' :: {gamename: ' + listResponse[key].title + ', tag: ' + listResponse[key].tag + '}';
			tmpStr += '<li id=\"' + listResponse[key].tournamentidx + '\"><img src=\"'
					+ 'image/starline.png' +'\"/>' 
					+ listResponse[key].title + '</li>'; 
		}
		console.log(tmpStr);
		document.getElementById('tournamentListContent').innerHTML = tmpStr;
	}
}
function errorCallback(error) {
	alert("tournament error : " + error);
}

function initTournamentList() {
	var scrollOption = {
			wrapperId: 'wrapperTournamentList',
			onTouchEnd: tournamentSelect,
			scrollbarClass: 'noScroll'
		};
	xx.scroll.addScroll(scrollOption);
}

//토너먼트 선택 - TounamentList Click
function tournamentSelect(e) {
	var tournamentidx = e.target.id;
	tournamentSelectRequest(tournamentidx);
};

//토너먼트 선택 후 Request
function tournamentSelectRequest(e) {
	var tournamentidx = e;
	jzOpenObj(tournamentidx);
	var params = {'tournamentidx': tournamentidx, 'email': user.email, 'devicemodel': user.devicemodel};
	ax.ext.net.post(faceUrl + 'tournament/game.php', params,
			tournamentSelectSuccessCallback, errorCallback);
};

//토너먼트정보 받고 게임시작 
function tournamentSelectSuccessCallback(result){
	if (result.status >= 200 && result.status < 300) {
		gameInfo = JSON.parse(result.data);
		//gameInfo.idx, gameInfo.title, gameInfo.tag,
		//gameInfo.userlist[0].useridx, useremail, username, photoidx, photourl
		//alert(gameInfo.userlist[0].photourl);
		gameInfo.remainingAr 	= gameInfo.userlist;	//현재 토너먼트에서 살아 남아있는 배열 
		gameInfo.resultAr		= [];					//떨어지면 들어갈 배열 초기
		gameInfo.tmpAr 			= [];					//선택되면 들어갈 임시배열
		tournamentGameRoundGirl();
	}
}

//게임중간 RoundGirl Page (토너먼트 제목과 16강) 
function tournamentGameRoundGirl() {
	try{
	gameInfo.recentCnt  = 0; //카운팅 초기화 
	gameInfo.remainingArLength	= gameInfo.remainingAr.length; //토너먼트 round 셋팅 
	//사진을 미리 뿌려둔다.
	var doc = window.document,
		max = gameInfo.remainingArLength,
		str = '<div id=\"tournamentVs\"></div>';
	for (var i = 0; i < max; i += 2) {
		str +=	'<div id=\"tournament_' + i + '\" class="gameTop"><img id=\"tournamentImg_' + i + '\" class=\"gameImgTop\" src=\"' + gameInfo.remainingAr[i].photourl + '\"></div>'
			+	'<div id=\"tournament_' + (i + 1) + '\" class="gameBottom"><img id=\"tournamentImg_' + (i + 1) + '\" class=\"gameImgBottom\" src=\"' + gameInfo.remainingAr[i + 1].photourl + '\"></div>';
	}
	
	console.log(str);
	doc.getElementById('pageTournamentGame').removeEventListener('touchstart', touchFace, false);
	doc.getElementById('pageTournamentGame').innerHTML = str;
	doc.getElementById('pageTournamentGame').addEventListener('touchstart', touchFace, false);
	
	doc.getElementById('pageTournamentList').style.display 		= 'none';
	doc.getElementById('tournamentTitle').style.backgroundImage = 'url(../image/bridge' + max + '.png)';
	doc.getElementById('tournamentRoundName').innerHTML 		= gameInfo.title;
	doc.getElementById('pageTournamentBridge').className 		= 'page';
	setTimeout(function(){
		doc.getElementById('leftPunch').className 		= 'move';
		doc.getElementById('rightPunch').className 		= 'move';
	}, 100);
	
	setTimeout(function() { 
		doc.getElementById('pageTournamentBridge').className	= 'page hide';
		doc.getElementById('pageTournamentGame').className 		= 'page';
		doc.getElementById('leftPunch').className 	= 'stop';
		doc.getElementById('rightPunch').className 	= 'stop';
		tournamentGameDoing();
	}, 1600);
	
	}catch(e){
		alert(e.message);
	}
}

function tournamentGameDoing() {
	var doc = window.document,
		cnt = gameInfo.recentCnt;
	//xx강 진행
	if (cnt !== gameInfo.remainingArLength) {
		//차후 애니매이션 효과 고려 
		doc.getElementById('tournament_' + cnt).style.display 		= 'block';
		doc.getElementById('tournament_' + (cnt+1)).style.display 	= 'block';
		doc.getElementById('tournamentVs').style.display 			= 'block';
		
	//토너먼트 완료 
	} else if (cnt === 2){
		gameInfo.resultAr.push(gameInfo.tmpAr[0]);
		
		var max 	  = gameInfo.resultAr.length,
			resultAr  = gameInfo.resultAr,
			resultStr = resultAr[0].username,
			resultIdx = resultAr[0].photoidx;
		for (var i = 1; i < max; i += 1) {
			resultStr += ',' + resultAr[i].username;
			resultIdx += ',' + resultAr[i].photoidx;
		}
		console.log(resultStr);
		console.log(resultIdx);
		
		//우승자화면 셋팅 
		doc.getElementById('pageTournamentGame').className		= 'page hide';
		doc.getElementById('pageTournamentResult').className	= 'page';
		//doc.getElementById('resultTitle').innerHTML = gameInfo.title;
		//doc.getElementById('resultName').innerHTML 	= resultAr[max-1].username;
		//doc.getElementById("resultImg").setAttribute('src', resultAr[max-1].photourl);
		doc.getElementById("resultImg").style.backgroundImage = 'url('+resultAr[max-1].photourl+')';

		//토너먼트결과 서버전송 
		tournamentResultRequest(resultIdx);
		
		//페이지이동 버튼 셋팅 
		doc.addEventListener('touchstart', function(e) {
			try{
				var target = e.target,
					preClass;
				if(target.tagName === 'BUTTON') {

					preClass = target.className;
					target.className = preClass + ' ' + 'pressed';
					
					setTimeout(function() {
						target.className = preClass;
						
						switch(target.id) {
							case 'goTournamentBtn':
								location.reload();
								break;
							case 'goRoomBtn':
								window.localStorage.setItem('targetPage', resultAr[max-1].useridx);
								document.location.href="main.html";
								break;
							case 'goChartBtn':
								window.localStorage.setItem('targetPage', 'pageMain');
								document.location.href="main.html";
								break;
						}
					}, 200);
					
					e.stopPropagation();
				} 
			}catch(e) {
				console.log('button err:', e.message);
			}
		}, false);
		
	//xx강 완료 
	} else {
//		gameInfo.remainingAr = [];
		gameInfo.remainingAr = gameInfo.tmpAr;
		//완료
		gameInfo.tmpAr = [];
		tournamentGameRoundGirl();
	}
}
function touchFace(e){
	var clickCnt = e.target.id;
	if(clickCnt.search("tournamentImg_") === 0){
		clickCnt = clickCnt.replace('tournamentImg_', '');
		setTimeout(function(){
			selectFace(clickCnt);
		}, 200);
		
	} else {
		alert("다시 시도해주세요.");
	}
}
function selectFace(clickCnt){
	try{
		var doc 		= window.document,
			cnt 		= gameInfo.recentCnt,
			selectIdx	= clickCnt * 1,
			otherIdx	= (selectIdx % 2 === 1)? selectIdx - 1: selectIdx + 1;
		doc.getElementById('tournamentVs').style.display 		= 'none';
		doc.getElementById('tournament_' + otherIdx).className 		+= " hiden";
		doc.getElementById('tournament_' + selectIdx).className 	+= " winner";
		
		setTimeout(
				function(){
					var img1 = doc.getElementById('tournament_' + cnt),
					img2 = doc.getElementById('tournament_' + (cnt+1));
					img1.parentNode.removeChild(img1);
					img2.parentNode.removeChild(img2);
					///// userName 이 사라짐. jzOpenObj(gameInfo.remainingAr[selectIdx]);
					console.log(gameInfo.remainingAr[selectIdx].username);
					gameInfo.resultAr.push(gameInfo.remainingAr[otherIdx]);
					gameInfo.tmpAr.push(gameInfo.remainingAr[selectIdx]);
					gameInfo.recentCnt = cnt + 2;
					
					setTimeout(tournamentGameDoing, 200);
				}
		,800);
	
	}catch(e){
		alert(e.message);
	}
}

//토너먼트 결과 REQUEST - 해당 tag 차트 순위 list
function tournamentResultRequest(resultIdx){
	try{
//	var params = {'tournamentidx': gameInfo.idx, 'email': user.email,
//			'photoidx': resultIdx,
//			'photopoint': '1,1,1,1,1,1,1,1,3,3,3,3,6,6,9,12'};
	//5번전문이나 일단 4번으로 구현 
	console.log('tournamentResultRequest');
//	jzOpenObj(params);
//	ax.ext.net.post(faceUrl + 'tournament/result.php', params,
//			tournamentResultSuccessCallback, errorCallback);
	var userEmail = user.email;
	if (userEmail === null || userEmail === 'null'){
		userEmail = 'guest';
	}
	var loStr = faceUrl + 'tournament/result.php' + '?tournamentidx='
				+ gameInfo.idx + '&email=' + userEmail + '&photoidx=' + resultIdx 
				+ '&photopoint=' + '1,1,1,1,1,1,1,1,3,3,3,3,6,6,9,12';
	console.log(loStr);
	ax.ext.net.get(loStr,
			tournamentResultSuccessCallback, errorCallback);
	}catch(e){
		alert('tournamentResultRequest : ' + e.message);
	}
}

function tournamentResultSuccessCallback(result){
	try{
		if (result.status >= 200 && result.status < 300) {
			window.localStorage.setItem('chartListData', result.data);
			console.log(result.data);
		} else {
			jzOpenObj(result);
		}
	}catch(e){
		alert('tournamentResultSuccessCallback error :: ' + e.message);
	}
}

function jzOpenObj(obj) {
	var json 	= obj,
		str		= '';
	for (var x in json) {
		str = str + '\n' + x + ' : ' + json[x];  
	}
	console.log(str);
}
