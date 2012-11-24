var _DEBUG = true,
	_DEVICE_RUNTIME = 'Android';

var user = {};	//사용자관련 정보
var chartListData = null;
var beforeRoomList = null;

function init() {
	try{
		
		deviceapis.devicestatus.getPropertyValue( 
				function (value) { user.devicemodel = value; },  
				errorCallback, { aspect: "Device", property : "model"});
		
		//setChartData(); //차트정보

		//_DEVICE_RUNTIME = android, ics, ios 세가지 중 하나 
		var agent = navigator.userAgent;
		if(/(iPad|iPhone|iPod)/i.test(agent)) _DEVICE_RUNTIME = 'iOS';
		if (/(Android 4)/i.test(agent)) _DEVICE_RUNTIME = 'ICS';
		document.body.className = _DEVICE_RUNTIME.toLowerCase();
	    
		// 최초 한번 초기화 필요
		var pageOption = {
				menuId: 'pageMenu',	// required
				mainPageId: 'pageMain'	// required
			};
		xx.page.init(pageOption);
		
		// add page
		xx.page.add({id: 'pageIntro', type: 'main'});
		xx.page.add({id: 'pageLogin', type: 'main'});
		xx.page.add({id: 'pageMain', type: 'main'});
		xx.page.add({id: 'pageRoom', type: 'vertical'});
		
		//click Handler
		document.body.addEventListener('touchstart', onTouchButton, false);
	
		//scroll Set
		xx.scroll.addScroll({wrapperId: 'wrapperMain', onTouchEnd: onTouchChartList, scrollbarClass: 'noScroll'});
		xx.scroll.addScroll({wrapperId: 'wrapperMenu', onTouchEnd: onTouchMenu, scrollbarClass: 'noScroll'});
		
//		initAndroid();
	
//		document.getElementById('pageMain').className  += ' hide';
//		document.getElementById('pageMenu').className  += ' hide';
//		document.getElementById('pageIntro').className += ' hide';
		
		//시작 후 폰에 저장된 사용자 정보부터 가져온다
		var doc = window.document,
			userInfoData = window.localStorage.getItem('userInfoData'),
			targetPage	 = window.localStorage.getItem('targetPage');
		//userInfoData가 있다면 메뉴정보를 받아온다.
		
		
//		//보여줄 페이지가 지정되어 있지 않다면 (첫실행)
//		if (targetPage === null || targetPage === 'null') {
//			
//			//2초간 인트로 화면 
//			doc.getElementById('pageMain').className += ' hide';
//			
//			//ax.ext.ui.showProgress('faceChart');//(프로그레스)
//			
//			//자동로그인 상태 아니면 로그인창으로 
//			if (userInfoData === null) {
//				targetPage = "pageLogin";
//				
//			//자동 로그인 상태면 메인 화면으로   
//			} else {
//				/////작업예정-메뉴정보받아오기 --회원가입시, 로그인시 userInfoData 저장
//				//menuDataRequest(userInfoData.email, userInfoData.pass);
//				targetPage = "pageMain";
//			}
//			
//			setTimeout(function(){
//				doc.getElementById(targetPage).className = 'page';
//			}, 2000);
//			
//		//다른 페이지에서 온 경우 
//		} else {
//			window.localStorage.setItem('targetPage', null);
//			/////pageMain이면 차트를 보이고(Default), pageRoom이면 룸을 보인다.
//			if (targetPage !== 'pageMain') {
//				console.log(targetPage + '의 방으로 이동.');
				roomDataRequest(targetPage);
//			}
//		}
		
		
		
		
//		//5초 후 차트 화면으로 
//		setTimeout(function(){
//			ax.ext.ui.hideProgress();
//			document.getElementById('pageIntro').className += ' hide';
//			document.getElementById('pageMain').className = 'page';
//		}, 5000);
		
//		//데이터공유
//		window.localStorage.setItem('key', 'value');
//		var temp = window.localStorage.setItem('key');
//		//이건 앱스프레소에서 현재 debug 모드는 지원안한다.
//		widget.preferences.setItem('hello', 'world');
//		var value = widget.preferences.getItem('hello'); // 'world'
		
	}catch(e) {
		console.log('init err:',e.message);
	}
}

//room 게시물리스트 request (6)
function roomDataRequest(targetUseridx, lastIndex, limited){
//	useridx | email, limitphotoidx, limit, devicemodel
	var email 			= targetUseridx,
		limitphotoidx 	= lastIndex || '0',
		limit			= limited || '10',
		devicemodel 	= user.devicemodel;
	//console.log(email + ' : ' + limitphotoidx  + ' : ' + limit + ' : ' + devicemodel);
	var params = {	'email'			: email, 
					'limitphotoidx'	: limitphotoidx,
					'limit'			: limit,
					'devicemodel'	: devicemodel};
	ax.ext.net.post('http://14.63.221.243/facechart/api/user/list.php', params,
		roomListSuccessCallback, errorCallback);
}


function roomListSuccessCallback(result){
	try{
		if (result.status >= 200 && result.status < 300) {
			var roomData = JSON.parse(result.data);
			//roomData.roominfo.useridx, username, mainphotourl, profilephotourl, roomtitle, totalpoint
			//roomData.contentlist[0].photoidx, title, point, photourl, commentcnt, createdate, comments
			var doc = document,
				max = roomData.contentlist.length,
				roomContent = '';

			//만약 더보기 중이라면 추가한다.
			if (doc.getElementById('roomTitle').innerHTML === roomData.roominfo.username && askMoreList === true) {
				roomContent += beforeRoomList;
			}
			
			//사진게시물 
			for (var i = 0; i < max; i += 1) {
				roomContent += '<li><div class=\"roomMainRow\">'
							+ '<img class=\"roomMainRowImage\" src=\"'
							+ roomData.contentlist[i].photourl + '\">'
							+ '<span class=\"liDate\">'
							+ roomData.contentlist[i].createdate + '</span><div class=\"right\"><span class=\"liPoints\">'
							+ roomData.contentlist[i].point + '</span><span class=\"liComments\">'
							+ roomData.contentlist[i].commentcnt + '</span><Button id=\"commentWrite\"></Button></div>'
							+ '<span class=\"liTitle\">'
							+ roomData.contentlist[i].title + '</span></div>';
				
				//댓글 
				if (0 < roomData.contentlist[i].commentcnt * 1) {
					roomContent += '<div class=\"roomCommentBox\">';
					for (var j = 0; j < roomData.contentlist[i].commentcnt; j += 1){
						//roomData.contentlist[0].comments[0].useridx, name, content, photourl, createdate
						roomContent += '<div class=\"roomCommentRow\" style=\"background-image:url('
									+ roomData.contentlist[i].comments[j].photourl + ')\"><div class=\"roomCommentRowVisitorDate\"><span class=\"roomCommentRowVisitor\">'
									+ roomData.contentlist[i].comments[j].name + '</span><span class=\"roomCommentRowDate\">'
									+ roomData.contentlist[i].comments[j].createdate + '</span></div><div class="roomCommentRowContent">'
									+ roomData.contentlist[i].comments[j].content + '</div></div>';
					}
					roomContent += '</div>';
				}
				
				roomContent += '</li>';
			}
			
			var resultStr = '<div class=\"roomMain\" style=\"background-image:url('
				+ roomData.roominfo.mainphotourl + ')\"><div class=\"topBox\" style=\"background-image:url('
				+ roomData.roominfo.profilephotourl + '), url(../image/roommainprofile.png);\"></div><div class=\"bottomBox\">'
				+ roomData.roominfo.roomtitle + '<div id=\"totalpoint\">'
				+ roomData.roominfo.totalpoint + '</div>' +'</div></div>'
				+ roomContent;
	
			//더보기
			var isMoreStr = (max > 9)? 'roomMore': 'roomLast';
			resultStr += '<a id=\"roomMoreBtn\" class=\"'
						+ isMoreStr + '\"></a>';
			
			doc.getElementById('roomTitle').innerHTML = roomData.roominfo.username;
			console.log(resultStr);
			document.getElementById('roomDataList').innerHTML = resultStr;
			setTimeout(toggleRoom, 200);
			
			//더보기를 위한 데이터 저장 
			beforeRoomList = roomContent;
		}
	}catch(e){
		alert('roomListSuccessCallback error :: ' + e.message);
	}
}

//menuButton : 좌측 메뉴 활성화변경 
function toggleMenu() {
	var roomPage = xx.page['pageRoom'];
	if (roomPage.info.isShown) {
		roomPage.hide();
	}
	
	xx.page.toggleMenu();
	xx.scroll.wrapperMenu.refresh();
}

function toggleRoom() {
	if (xx.page.isToggleMenu) {
		xx.page.toggleMenu();
	}
	
	var roomPage = xx.page['pageRoom'];
	
	if (roomPage.info.isShown) {
		roomPage.hide();
	} else {
		roomPage.show();
		//test
		var scrollOption3 = {
				wrapperId: 'wrapper_page_room',
				onTouchEnd: onTouchMenu,
				scrollbarClass: 'noScroll'
			};
		xx.scroll.addScroll(scrollOption3);
	}
}

function onTouchButton(e) {
	try{
		var target 	= e.target,
			preClass,
			doc 	= document;
		console.log('onTouchButton :: ' + target.tagName + ' :: ' + target.id);
		
		if(target.tagName === 'A') {
			switch(target.id) {
				case 'linkSignup':
					goSignup();
					break;
				case 'linkTournament':
					goTournament();
					break;
				case 'linkResignup':
					alert('페이지만들어야함 ');
					//goResignup();
					break;
			}
		}
		
		if(target.tagName === 'BUTTON') {

			preClass = target.className;
			target.className = preClass + ' ' + 'pressed';
			
			setTimeout(function() {
				target.className = preClass;
				
				switch(target.id) {
					case 'menuBtn':
						toggleMenu();
						break;
						
					case 'tournamentBtn':
						goTournament();
						break;
						
					case 'goLoginpageBtn':
						doc.getElementById('signupEmail').value = '',
						doc.getElementById('signupName').value = '',
						doc.getElementById('signupPass').value = '',
						doc.getElementById('signupRePass').value = '';
						
						doc.getElementById("pageSignup").className += ' hide';
						doc.getElementById("pageLogin").className = 'page';
						break;
						
					case 'signupBtn':
						signupRequest();
						break;
						
					case 'loginBtn':
						var tmpEmail 	= doc.getElementById("inputId").value,
							tmpPass		= doc.getElementById("inputPass").value;
						menuDataRequest(tmpEmail, tmpPass);  //유저정보 
						break;
				}
//				switch(e.target.innerHTML) {
//					case 'Room':
//						toggleRoom();
//						break;
//					case '':
//						toggleMenu();
//						break;
//	//					case 'Back':
//	//					case 'Close':
//	//						goBack();
//				}
			}, 200);
			
			e.stopPropagation();
		} 
	}catch(e) {
		console.log('button err:', e.message);
	}
}
function onTouchChartList(e){
	var target 			= e.target,
		targetUseridx	= '';
	
	if (target.tagName === "LI") {
		targetUseridx = target.id;
	} else {
		targetUseridx = target.parentElement.id;
	}
	roomDataRequest(targetUseridx);
	//toggleRoom();
}

//pageMenu Test
function onTouchMenu(e) {
	var target = e.target,
		menu = '',
		className,
		i=4;

	while(i--) {
		if(target.querySelector('span') !== null) {
			menu = target.querySelector('span').innerHTML;
			break;
		}
		target = target.parentNode;
	}

	//menu = target.parentNode.querySelector('span').innerHTML;
	className = target.className;

	console.log('------------------------------------------------', menu, className);
	
	if (className.match(/d1/)) {
		target.style.borderTop = '1px solid #262C3A';
		target.style.backgroundColor = '#262C3A';
		
		setTimeout(function() {
			target.style.borderTop = '';
			target.style.backgroundColor = '';
			
			switch(menu) {
				case 'Device status':
					xx.page['devicestatus'].onMenuSelect();
				break;
			}
		}, 200);
		
	}
};
function errorCallback(error) {
	alert("error : " + error);
}

function jzOpenObj(obj){
	var o = obj,
		str = '';
	for (var ini in o){
		str += ini + " : " + o[ini] + "\n";
	}
	console.log(str);
}