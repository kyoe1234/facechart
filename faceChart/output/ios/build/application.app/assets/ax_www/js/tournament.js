var _DEBUG = true,
	_DEVICE_RUNTIME = 'Android';
var user = {
	email:		'guest',
	devicemodel:''
};
var gameInfo = '';

function init() {
	try{
		console.log('tournament init start!!!');
		//userInfo Set - email, devicemodel
		deviceapis.devicestatus.getPropertyValue( 
				function (value) { user.devicemodel = value; },  
				errorCallback, { aspect: "Device", property : "model"});
		
		tournamentListRequest();
		initTournamentList();
	} catch (e) {
		console.log('tournament init error : ', e.message);
	}
}

//접속 후 토너먼트 선택 전 REQUEST - tournament List
function tournamentListRequest(){
	var params = {'email': user.email};
	ax.ext.net.post('http://kyoe.blogcocktail.com/facechart/api/tournament/list.php', params,
			tournamentListSuccessCallback, errorCallback);
}
function tournamentListSuccessCallback(result){
	if (result.status >= 200 && result.status < 300) {
		var listResponse = JSON.parse(result.data);
//		jzOpenObj(listResponse);
		var tmpStr = '';
		for (var key in listResponse) {
			//tmpStr = tmpStr + '\n' + key + ' :: {gamename: ' + listResponse[key].gamename + ', tag: ' + listResponse[key].tag + '}';
			tmpStr += '<li id=\"' + key + '\">' + listResponse[key].gamename + '</li>'; 
		}
		//console.log(tmpStr);
		document.getElementById('tournamentListContent').innerHTML = tmpStr;
	}
}
function errorCallback(error) {
	alert("tournament error : " + error);
}

function initTournamentList() {
	var scrollOption = {
			wrapperId: 'wrapperTournamentList',
			onTouchEnd: tournamentSelectRequest,
			scrollbarClass: 'noScroll'
		};
	xx.scroll.addScroll(scrollOption);
}

//토너먼트 선택 후 Request - TounamentList Click
function tournamentSelectRequest(e) {
	tournamentidx = e.target.id;
	var params = {'tournamentidx': tournamentidx, 'email': user.email, 'devicemodel': user.devicemodel};
	ax.ext.net.post('http://kyoe.blogcocktail.com/facechart/api/tournament/game.php', params,
			tournamentSelectSuccessCallback, errorCallback);
};

//토너먼트정보 받고 게임시작 
function tournamentSelectSuccessCallback(result){
	if (result.status >= 200 && result.status < 300) {
		gameInfo = JSON.parse(result.data);
		//gameInfo.idx, gameInfo.gamename, gameInfo.tag,
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
	gameInfo.recentCnt  = 0; //카운팅 초기화 
	gameInfo.remainingArLength	= gameInfo.remainingAr.length; //토너먼트 round 셋팅 
	//사진을 미리 뿌려둔다.
	var doc = window.document,
		max = gameInfo.remainingArLength,
		str = '<div id=\"tournamentVs\">vs</div>\n';
	for (var i = 0; i < max; i += 2) {
		str +=	'<img id=\"tournamentImg_' + i + '\" class=\"gameImgTop\" src=\"' + gameInfo.remainingAr[i].photourl + '\">\n'
			+	'<img id=\"tournamentImg_' + (i + 1) + '\" class=\"gameImgBottom\" src=\"' + gameInfo.remainingAr[i + 1].photourl + '\">\n';
	}
	console.log(str);
	doc.getElementById('pageTournamentGame').innerHTML = str;
	//이 이벤트를 처음 한번만 먹혀야한다.
	doc.getElementById('pageTournamentGame').addEventListener('touchstart', function(e){
		var clickCnt = e.target.id;
		if(clickCnt.search("tournamentImg_") === 0){
			clickCnt = clickCnt.replace('tournamentImg_', '');
			setTimeout(function(){
				selectFace(e);
			}, 200);
			
		} else {
			alert("다시 시도해주세요.");
		}
		
	}, false);
	
	doc.getElementById('pageTournamentList').style.display 	= 'none';
	doc.getElementById('tournamentTitle').innerHTML 			= gameInfo.gamename;
	doc.getElementById('tournamentRoundName').innerHTML 		= max + "강";
	doc.getElementById('pageTournamentBridge').className 		= 'page';
	setTimeout(function() { 
		doc.getElementById('pageTournamentBridge').className	= 'page hide';
		doc.getElementById('pageTournamentGame').className 	= 'page';
		tournamentGameDoing();
	}, 1000);
}

function tournamentGameDoing() {
	var doc = window.document,
		cnt = gameInfo.recentCnt;
	alert(cnt);
	if (cnt !== gameInfo.remainingArLength) {
		//차후 애니매이션 효과 고려 
		doc.getElementById('tournamentImg_' + cnt).style.display 		= 'block';
		doc.getElementById('tournamentImg_' + (cnt+1)).style.display 	= 'block';
	} else {
//		gameInfo.remainingAr = [];
		gameInfo.remainingAr = gameInfo.tmpAr;
		//완료
		gameInfo.tmpAr = [];
		tournamentGameRoundGirl();
	}
}
function selectFace(clickCnt){
	try{
	//jzOpenObj(e.target.id);
	var cnt 		= gameInfo.recentCnt,
		selectIdx	= clickCnt * 1,
		otherIdx	= (selectIdx % 2 === 1)? selectIdx - 1: selectIdx + 1;
	
	//사용된 노드 삭제 - 차후 애니매이션 효과 고려 
	var img1 = document.getElementById('tournamentImg_' + cnt),
		img2 = document.getElementById('tournamentImg_' + (cnt+1));
	img1.parentNode.removeChild(img1);
	img2.parentNode.removeChild(img2);
	
	gameInfo.resultAr.push(gameInfo.remainingAr[otherIdx]);
	gameInfo.tmpAr.push(gameInfo.remainingAr[selectIdx]);
	gameInfo.recentCnt = cnt + 2;
	
	setTimeout(tournamentGameDoing, 500);
	}catch(e){
		alert(e.message);
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