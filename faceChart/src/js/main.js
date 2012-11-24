var _DEBUG = true,
	_DEVICE_RUNTIME = 'Android';

var user = {};	//사용자관련 정보
var chartListData = null;
var beforeRoomList = null;	//더보기를 위한 데이터 
var askMoreList = false;	//더보기 버튼이 클릭된 상태인가
var faceUrl = 'http://14.63.221.243/facechart/api/';

function init() {
	try{

		deviceapis.devicestatus.getPropertyValue( 
				function (value) { user.devicemodel = value; },  
				errorCallback, { aspect: "Device", property : "model"});
		
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
		
		setLocalText();
		initAndroid();
	
//		document.getElementById('pageMain').className  += ' hide';
//		document.getElementById('pageMenu').className  += ' hide';
//		document.getElementById('pageIntro').className += ' hide';
		
		//자동로그인 초기화시 사
		//window.localStorage.setItem('userInfoData', null);
		
		//시작 후 폰에 저장된 사용자 정보부터 가져온다
		var doc = window.document,
			userInfoData = window.localStorage.getItem('userInfoData'),
			targetPage	 = window.localStorage.getItem('targetPage');
		console.log("init :: " + userInfoData + " : " + targetPage);
		//토너먼트결과를 차트에 셋팅한다
		var tournamentResult = window.localStorage.getItem('chartListData');
		if (tournamentResult !== null && tournamentResult !=='') {
			console.log(97);
			setChartData(tournamentResult);
			window.localStorage.setItem('chartListData', '');
			console.log(100);
		} else {
			console.log(102);
			chartListRequest();
			console.log(104);
		}
		
		//보여줄 페이지가 지정되어 있지 않다면 (첫실행)
		if (targetPage === null || targetPage === 'null') {
			
			//2초간 인트로 화면 
			doc.getElementById('pageMain').className += ' hide';
			//ax.ext.ui.showProgress('faceChart');//(프로그레스)
			
			//임시
			//userInfoData = 'jaezinpark@gmail.com';
			//자동로그인 상태 아니면 로그인창으로 
			if (userInfoData === null || userInfoData === 'null') {
				targetPage = "pageLogin";
				
			//자동 로그인 상태면 메인 화면으로   
			} else {
				/////작업예정-메뉴정보받아오기 --회원가입시, 로그인시 userInfoData 저장
				targetPage = "pageMain";
				user['email'] = userInfoData;
				menuDataRequest(userInfoData);/////
			}
			xx.scroll.wrapperMain.refresh();
			setTimeout(function(){
				//menuDataRequest(userInfoData);/////
				doc.getElementById(targetPage).className = 'page';
				xx.scroll.wrapperMain.refresh();
			}, 2000);
			
		//다른 페이지에서 온 경우 
		} else {
			user['email'] = userInfoData;
			
			/////pageMain이면 차트를 보이고(Default), pageRoom이면 룸을 보인다.
			if (targetPage !== 'pageMain') {
				console.log('90. ' + targetPage + '의 방으로 이동.');
				roomDataRequest(targetPage);
				console.log(92);
			}
			window.localStorage.setItem('targetPage', 'null');
		}
		
	}catch(e) {
		console.log('init err:',e.message);
	}
}

//사용국가별 언어를 셋팅한다. on The Fly에서는 Default폴더로 가진다.
function setLocalText(){
	var doc = document;
	doc.getElementById('inputId').placeholder				= txt.email;
	doc.getElementById('inputPass').placeholder				= txt.password;
	doc.getElementById('linkSignupLabel').innerHTML			= txt.linkSignupLabel;
	doc.getElementById('linkSignup').innerHTML				= txt.linkSignup;
	doc.getElementById('linkTournamentLabel').innerHTML		= txt.linkTournamentLabel;
	doc.getElementById('linkTournament').innerHTML			= txt.linkTournament;
	doc.getElementById('linkResignupLabel').innerHTML		= txt.linkResignupLabel;
	doc.getElementById('linkResignup').innerHTML			= txt.linkResignup;
	doc.getElementById('signupEmail').placeholder			= txt.signupEmail;
	doc.getElementById('signupName').placeholder			= txt.signupName;
	doc.getElementById('signupPass').placeholder			= txt.signupPass;
	doc.getElementById('signupRePass').placeholder			= txt.signupRePass;		
}

/***
 * Click Handler
 * @param e
 */
/////
function onTouchChartList(e){
	var target 			= e.target,
		targetUseridx	= '';
	if(target.tagName !== "A") {
		if (target.tagName === "LI") {
			targetUseridx = target.id;
		} else if (target.tagName === "SPAN") {
			targetUseridx = target.parentElement.parentElement.id;
		} else if (target.tagName === "DIV") {
			targetUseridx = target.parentElement.id;
		}
		roomDataRequest(targetUseridx);
	}
	
	console.log("onTouchChartList : " + target.tagName + " : " + targetUseridx);
}

//pageMenu Test
function onTouchMenu(e) {
	try{
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
	}catch(e){
		if (e.message === "Cannot call method \'match\' of null") {
			console.log('onTouchMenu method error');
		} else { 
			alert('onTouchMenu error : ' + e.message);
		}
	}
};

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
					
				case 'roomMoreBtn':
					if (target.className === 'roomMore') {
						askMoreList = true;
						roomDataRequest(target.datauser, target.name);
					}
					break;
					
				case 'chartMoreBtn':
					if (target.className === 'roomMore') {
						//jzOpenObj(target);
						askMoreList = true;
						chartListRequest(target.tag, target.name);
					}
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
						loginRequest(tmpEmail, tmpPass);  //유저정보 
						break;

					case 'commentWrite':
						var inputStr = '<input id=\"'
							+ target.name + '_input'
							+ '\" type=\"text\"><button id="replySendBtn" name=\"'
							+ target.name + '\"></input>';
						var lobox = doc.getElementById(target.name + '_reply');
						lobox.innerHTML = inputStr;
						lobox.style.display = "block";
						doc.getElementById('roomHeader').style.display = 'none';
						doc.getElementById('replyHeader').style.display = 'block';
						doc.getElementById('replyCancleBtn').setAttribute('name', target.name);
						setTimeout(function(){
							var loInput = doc.getElementById(target.name + '_input');
							loInput.placeholder = txt.writeReply;
							loInput.focus();
						}, 300);
						break;
						
					case 'replySendBtn':
						var replyStr = doc.getElementById(target.name + '_input').value;
						console.log("replySendBtn click : " + target.name + ', ' + replyStr);
						replySendRequest(target.name, replyStr);
						break;
						
					case 'replyCancleBtn':
						doc.getElementById('roomHeader').style.display = 'block';
						doc.getElementById('replyHeader').style.display = 'none';
						var replyBox = doc.getElementById(target.name + '_reply');
						replyBox.innerHTML = '';
						replyBox.style.display = 'none';
						break;
						
					case 'uploadBtn':
						alert("uploadBtn 업로드페이지 구현예정입니다.");
						/////
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

//Android Button
function initAndroid() {
	try{
		//BackButton
		var onBackPressed = function() {
			var currentPage = xx.page.currentPage();
			
			if (currentPage == 'menu') {
				toggleMenu();
				return;
			} else if (xx.page.history.length > 1) {
				xx.page.back();
				return;
			}
			
			ax.ext.ui.confirm(function(res) {
				if (res) {
					try {
						ax.ext.android.finish();
					} catch(e) {
						ax.ext.ios.finish();
					}
				}
			}, txt.exitFC);
		};
		ax.ext.android.setOnBackPressed(onBackPressed);
		
		//Option Button
		var callback = function(selectedMenu) {
			if (selectedMenu === 0) {
				toggleMenu();
			} else if (selectedMenu === 1) {
				toggleRoom();
			} else if (selectedMenu === 2) {
				goTournament();
			} else if (xx.page.history.length > 2) {
				xx.page.back();
			}
		};
		ax.ext.android.setOnOptionsItemSelected(callback);
		ax.ext.android.setOptionsItems(['Menu','Room', 'Tournament']);
		
	}catch(e) {
		// iOS? WAC?
	}
}

/*
 * function
 */
//차트리스트 셋.
function setChartData(str){
	try{
		console.log("setChartData start : " );
		if (str){
			//string을 json으로 변환 후  
			var chartData = JSON.parse(str);
			//alert(chartData.taglist);
			//taglist, chartlist
			//chartData.userlist[0].useridx, useremail, username, photoidx, photourl
			//alert(gameInfo.userlist[0].photourl);
			//var chartDataAr = chartData.userlist;
			var max = 0,
				content = '',
				lastCnt = 0;
			
			if (askMoreList) {
				content = chartListData;
				askMoreList = false;
			}
			
			for (var i in chartData.chartlist) {
				var useridx 	= chartData.chartlist[i].user_idx,
					useremail 	= chartData.chartlist[i].user_email,
					username 	= chartData.chartlist[i].nickname,
					userpoint 	= chartData.chartlist[i].point,
					userphotourl= chartData.chartlist[i].photourl;
				
				content += '<li id=\"' + useremail + '\"><div class=\"chartCount\"';
				//100보다크면 숫자로 보여준다. 10보다 작으면 앞에 숫자 안붙인다.
				if (i * 1 > 99) {
					content += '>' + i + '</div>';
				} else {
					//1단위
					content += ' style=\"background-image:url(image/chartnum/rank' 
							+ (i % 10) + '.png)';
					//10단위
					if (i * 1 > 9) {
						content += ', url(image/chartnum/rank'
									+ parseInt(i / 10) + '0.png)';
					}
					content += ';\"></div>';
				}
							
				content += '<div class=\"chartWhitebox\"><img src=\"'
							+ userphotourl + '\"><span class=\"userId\">' 
							+ username + '</span><span class=\"chartPoint\">'
							+ userpoint + '</span></div></li>';
				max 	= max + 1;
				lastCnt = (i * 1 < lastCnt)? lastCnt : i; 
			}
			chartListData = content;
			
			//더보기
			var isMoreStr = (max > 19)? 'roomMore': 'roomLast';
			var resultStr = content + '<a id=\"chartMoreBtn\" class=\"'
						+ isMoreStr + '\" tag=\"' 
						+ chartData.taglist + '\" name=\"'
						+ lastCnt + '\"></a>';
			
			document.getElementById('chartList').innerHTML = resultStr;
			
			//console.log('setChartData success : ' + resultStr);
			
			xx.scroll.wrapperMain.refresh();
			setTimeout(function(){xx.scroll.wrapperMain.refresh();}, 2000);
			
		//로컬에 저장된 데이터가 없는 경우 가입자 전체순위를 request
		} else {
			console.log('setChartData error : 토컬에 저장된 차트리스트가 없었습니다.');
			chartListRequest();
		}
		console.log("setChartData finish : " );
	}catch(e){
		alert('setChartData error : ' + e.message);
	}
}

function goTournament(){
	document.location.href = "tournament.html";
}

//menuButton : 좌측 메뉴 활성화변경 
function toggleMenu() {
	var roomPage = xx.page['pageRoom'];
	if (roomPage.info.isShown) {
		roomPage.hide();
	}
	document.getElementById('pageIntro').style.display = 'none';
	
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

function goSignup(){
	document.getElementById("pageSignup").className = 'page';
}

function jzOpenObj(obj){
	var o = obj,
		str = '';
	for (var ini in o){
		str += ini + " : " + o[ini] + "\n";
	}
	console.log(str);
}

function getAgoDate(yyyy, mm, dd) {
	var today 		= new Date();
	var year 		= today.getFullYear();
	var month 		= today.getMonth();
	var day 		= today.getDate();
	var resultDate 	= new Date(yyyy+year, month+mm, day+dd);
 
	year = resultDate.getFullYear();
	month = resultDate.getMonth() + 1;
	day = resultDate.getDate();

	if (month < 10)
       month = "0" + month;
	if (day < 10)
       day = "0" + day;

	return year + "" + month + "" + day;
}

function chartListSuccessCallback(result){
	try{
		console.log("chartListSuccessCallback start : " );
		if (result.status >= 200 && result.status < 300) {
			//window.localStorage.setItem('chartListData', result.data);
			setChartData(result.data);
		} else {
			alert('chartListSuccessCallback error : ' + result.status);
			jzOpenObj(result);
		}
		console.log("chartListSuccessCallback finish : " );
	}catch(e){
		alert('chartListRequest error :: ' + e.message);
	}
}

//roomData Setting
function roomListSuccessCallback(result){
	try{
		if (result.status >= 200 && result.status < 300) {
			var roomData = JSON.parse(result.data);
			//roomData.roominfo.useridx, username, mainphotourl, profilephotourl, roomtitle, totalpoint
			//roomData.contentlist[0].photoidx, title, point, photourl, commentcnt, createdate, comments
			var doc = document,
				max = roomData.contentlist.length,
				roomContent = '';
			//만약 더보기 중이라면 추가한다.//doc.getElementById('roomTitle').innerHTML === roomData.roominfo.username
			if (askMoreList) {
				roomContent += beforeRoomList;
				askMoreList = false;
			}
			//사진게시물 
			for (var i = 0; i < max; i += 1) {
				roomContent += '<li><div class=\"roomMainRow\">'
							+ '<img class=\"roomMainRowImage\" src=\"'
							+ roomData.contentlist[i].photourl + '\">'
							+ '<span class=\"liDate\">'
							+ roomData.contentlist[i].createdate + '</span><div class=\"right\"><span class=\"liPoints\">'
							+ roomData.contentlist[i].point + '</span><span class=\"liComments\">'
							+ roomData.contentlist[i].commentcnt + '</span><Button id=\"commentWrite\" name=\"'
							+ roomData.contentlist[i].photoidx +'\"></Button></div>'
							+ '<span class=\"liTitle\">'
							+ roomData.contentlist[i].title + '</span></div>'
							+ '<div id=\"'
							+ roomData.contentlist[i].photoidx + '_reply\" class=\"replyBox\"'
							+ '\"></div>';
				
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
				
				//댓글달 숨긴 태그 넣고 닫기
				roomContent += '</li>';
			}
			
			var resultStr = '<div class=\"roomMain\" style=\"background-image:url('
				+ roomData.roominfo.mainphotourl + ')\"><div class=\"topBox\" style=\"background-image:url('
				+ roomData.roominfo.profilephotourl + '), url(../image/roommainprofile.png);\"></div><div class=\"bottomBox\">'
				+ roomData.roominfo.title + '<div id=\"totalpoint\">'
				+ roomData.roominfo.totalpoint + '</div>' +'</div></div>'
				+ roomContent;
	
			//더보기
			var isMoreStr = (max > 9)? 'roomMore': 'roomLast';
			resultStr += '<a id=\"roomMoreBtn\" class=\"'
						+ isMoreStr + '\" datauser=\"' 
						+ roomData.roominfo.useridx + '\" name=\"'
						+ roomData.contentlist[max-1].photoidx + '\"></a>';
			
			doc.getElementById('roomTitle').innerHTML = roomData.roominfo.username;
			console.log(resultStr);
			document.getElementById('roomDataList').innerHTML = resultStr;
			
			if (!xx.page['pageRoom'].info.isShown) {
				setTimeout(toggleRoom, 200);
			} else {
				xx.scroll.wrapper_page_room.refresh();
			}
			
			//더보기를 위한 데이터 저장 
			beforeRoomList = roomContent;
			
			setTimeout(function(){xx.scroll.wrapper_page_room.refresh();}, 2000);
			
			//메뉴데이터받아둔다.
			menuDataRequest(user.email);
		} else {
			alert('roomListSuccessCallback error :: ' + result.status);
			jzOpenObj(result);
		}
	}catch(e){
		if (e.message === '\'undefined\' is not an object') {
			alert(txt.hasntRoom);
		} else {
			alert('roomListSuccessCallback error :: ' + e.message);
		}
	}
}

//
function loginsuccessCallback(result) {
	if(result.status >= 200 && result.status < 300) {
		var tmpObj  = JSON.parse(result.data),
		 	tmpStr  = '',
		 	doc		= document;
		//localData를 업데이트 
		for (var ini in tmpObj){
			user[ini] = tmpObj[ini];
			console.log(ini + ' : ' + tmpObj[ini]);
		}
		jzOpenObj(tmpObj);
		//회원이 맞으면
		if (user.user_idx !== null) {
			menuDataRequest(user.user_idx);
			
			xx.scroll.wrapperMain.refresh();
			setTimeout(function(){xx.scroll.wrapperMain.refresh();}, 2000);
		} else {
			//메뉴버튼을 회원가입버튼으로
			//"가입되지 않은 회원입니다."
			alert(txt.nonmember);
		}
		
	} else if (result.status === 400) {
		var tmpStr = JSON.parse(result.data);
		if (tmpStr.text === "email is duplicated") {
			alert(txt.emailIsDuplicated);
		} else if (tmpStr.text === "login failed") {
			alert(txt.loginFailed);
		} else {
			alert('loginsuccessCallback error : ' + tmpStr.text);
		}
	} else if (result.status === 100){
		alert(txt.loginFailed);
	} else {
		alert('loginsuccessCallback error : ' + result.status);
		jzOpenObj(result);
	}
}

//로그인, 회원가입 성공시 개인메뉴 데이터를 받아 뿌려준다 + 저장해 둔다.
function menuDatasuccessCallback(result) {
	if(result.status >= 200 && result.status < 300) {
		var tmpObj  = JSON.parse(result.data),
		 	tmpStr  = '',
		 	doc		= document;
		//jzOpenObj(tmpObj);
		//localData를 업데이트 
		for (var ini in tmpObj){
			user[ini] = tmpObj[ini];
			console.log(ini + ' : ' + tmpObj[ini]);
		}
		
		//회원이 맞으면(회원번호가 존재한다면)
		if (user.user_idx !== null) {
			//tagBox
			//chart
			tmpStr += '<div class=\"split\"></div>';
			tmpStr += '<div class=\"menu-item d0\">faceChart</div>';
			//favorite_tag
			tmpStr += '<div class=\"menu-item d0\">favorite tag</div>';
			for (var i in user.favorite_tag){
				tmpStr += '<div class=\"menu-item d1 tagP\">';
//				for (var j in user.favorite_tag[i]) {
//					tmpStr += '<span class=\"tag\">' + user.favorite_tag[i][j] + '</span>';
//				}
				//var tmpAr = user.favorite_tag[i].split(',');
				for(var j = 0; j < user.favorite_tag[i].length; j += 1) {
					tmpStr += '<span class=\"tag\">' + user.favorite_tag[i][j] + '</span>';
				} 
				tmpStr += '</div>';
			}
			//history_tag
			tmpStr += '<div class=\"menu-item d0\">history tag</div>';
			for (var i in user.history_tag){
				tmpStr += '<div class=\"menu-item d1 tagP\">';
				//var tmpAr = user.history_tag[i].split(',');
				for(var j = 0; j < user.history_tag[i].length; j += 1) {
					tmpStr += '<span class=\"tag\">' + user.history_tag[i][j] + '</span>';
				} 
				tmpStr += '</div>';
			}
			
			tmpStr += '<div class=\"split\"></div>';
			tmpStr += '<div class=\"menu-item d0\">faceRoom</div>';
			//favorite_room
			tmpStr += '<div class=\"menu-item d0\">favorite room</div>';
			for (var i in user.favorite_room){
				tmpStr += '<div class=\"menu-item d1 tagP\">' + user.favorite_room[i].nickname + '</div>';
				//user_idx, user_email, nickname
			}
			
			//history_room
			tmpStr += '<div class=\"menu-item d0\">history room</div>';
			for (var i in user.history_room){
				tmpStr += '<div class=\"menu-item d1 tagP\">' + user.history_room[i].nickname + '</div>';
			}
			
			//myroom
			tmpStr += '<div class=\"menu-item d0\">' +
					user.name + ' 님의 Room</div>';
			tmpStr += '<div class=\"menu-item d1 accelerometer\"><span>Points</span><span class=\"count\">'
					+ user.point + '</span></div>';
			tmpStr += '<div class=\"menu-item d1 messaging\"><span>Comments</span><span class=\"count\">'
					+ user.comment + '</span></div>';
			
			//sns
			tmpStr += '<div class=\"menu-item d0\">SNS</div>';
			for (var i in user.sns){
				tmpStr += '<div class=\"menu-item d1 tagP\">' + user.sns[i] + '</div>';
			}
			tmpStr += '<div class=\"menu-item\" style=\"height: 50px;\"></div>';
			
			
			//myroom
			//sns
//			user_idx : 51
//			email : garyuwer@gmail.com
//			name : 김태진
//			point : 25/896
//			comment : 15/775
//			favorite_room : [object Object],[object Object],[object Object]
//			history_room : [object Object],[object Object],[object Object]
//			favorite_tag : [object Object]
//			history_tag : [object Object]
//			user_tag : 기혼,남자,서울,직장인,프로그래머
//			sns : 
//			last_login : 20120620111115
//			visit_count : 3
//			updated_date : 20120620111115
			
//			devicemodel : x86_64
			
			document.getElementById('menuList').innerHTML = tmpStr;

			//마지막 로그인이 오늘이 아니면 토너먼트 페이지로 이동  
//			if (user.last_login.substring(0, 8) !== getAgoDate(0, 0, 0)) {
//				goTournament();
//			} else {
				doc.getElementById('pageMain').className   = 'page';
				doc.getElementById("pageLogin").className  = 'page hide';
				doc.getElementById("pageSignup").className = 'page hide';
//			}
			window.localStorage.setItem('userInfoData', user.email);
		} else {
			/////alert("가입되지 않은 회원입니다.");
		}
		
	} else if (result.status === 400) {
		var tmpStr = JSON.parse(result.data);
		if (tmpStr.text === "email is duplicated") {
			alert(txt.emailIsDuplicated);
		}
	}
}

//덧글등록 callback- 덧글정보
function replySendSuccessCallback(result){
	try{
		if (result.status >= 200 && result.status < 300) {
			var tmpObj  = JSON.parse(result.data);
			//tmpObj.idx, roomuseridx,  photoidx, content, createdate
			jzOpenObj(tmpObj);
			var doc = document;
			doc.getElementById('replyHeader').style.display = 'none';
			doc.getElementById('roomHeader').style.display  = 'block';
			
			//일단 데이터를 재요청하여 받아온다. 차후 서버전문교체 요청
			//doc.getElementById(target.name + '_reply').innerHTML = '';
			roomDataRequest(tmpObj.roomuseridx, tmpObj.photoidx);
		}
	}catch(e){
		alert('replySendSuccessCallback error :: ' + e.message);
	}
}

function errorCallback(error) {
	alert("error : " + error);
}

/*
 * Request
 */
//chart 차트리스트 request - 해당 tag 차트 순위 list (15)
function chartListRequest(tagStr, lastTagetIndex){
	//taglist =’1,2,3’, useridx | email, limituseridx, limit=20,
	try{
		console.log("chartListRequest start : " + tagStr + ", " + lastTagetIndex);
		var params;
		if (tagStr !== undefined) {
			params = {	'taglist'		: tagStr, 
						'email'			: user.email || 'guest',
						'limituseridx'	: lastTagetIndex || '0',
						'limit'			: 20};
		} else {
			params = {	'email'			: user.email || 'guest',
						'limituseridx'	: lastTagetIndex || '0',
						'limit'			: 20};
		}
		
		jzOpenObj(params);
		ax.ext.net.post(faceUrl + 'tournament/chart.php', params,
				chartListSuccessCallback, errorCallback);
		console.log("chartListRequest finish");
	}catch(e){
		alert('chartListRequest : ' + e.message);
	}
}

//room 게시물리스트 request (6)
function roomDataRequest(targetUseridx, lastIndex){
	try{
		console.log("roomDataRequest start : " + targetUseridx + ', ' + lastIndex);
//	useridx | email, limitphotoidx, limit, devicemodel
	var userStr 		= targetUseridx,
		limitphotoidx 	= lastIndex || '0',
		limit			= 20,
		devicemodel 	= user.devicemodel,
		params;
	//@가 있으면 email로 없으면 useridx로 request
	if (userStr.match('@')) {
		params = {	'email'		: userStr,
				'limitphotoidx'	: limitphotoidx,
				'limit'			: limit,
				'devicemodel'	: devicemodel};
	} else {
		params = {	'useridx'	: userStr,
				//'limitphotoidx'	: limitphotoidx,
				'limit'			: limit,
				'devicemodel'	: devicemodel};
	}
	jzOpenObj(params);
	ax.ext.net.post(faceUrl + 'photo/list.php', params,
		roomListSuccessCallback, errorCallback);
	
	console.log("roomDataRequest finish ");
	}catch(e){
		if (e.message === "Cannot call method \'match\' of null") {
			console.log('roomDataRequest method error');
		} else { 
			alert('roomDataRequest error : ' + e.message);
		}
	}
}

//로그인 request - 개인메뉴정보
function loginRequest(str1, str2){
	try{
		var loMail = str1,
			loPass = str2,
			logStr = faceUrl + 'user/login.php?email='
					//+ 'garyuwer@gmail.com'//임시
					+ loMail 
					+ '&password=' + loPass;
		//임시 
		//user.email = 'garyuwer@gmail.com';
		console.log('loginRequest : ' + logStr);
		ax.ext.net.get(logStr, loginsuccessCallback, errorCallback);
	}catch(e){
		alert('loginRequest error : ' + e.message);
	}
}

//개인메뉴정보 request
function menuDataRequest(useridx){
	try{
		var str = useridx,
			loTag = 'useridx';
		if (str !== undefined || str !== null){
			if (str.match('@')) {
				loTag = 'email';
			}
			var logStr = faceUrl + 'user/userinfo.php?' + loTag + '=' + str;
			//user.email = 'garyuwer@gmail.com';
			console.log('menuDataRequest : ' + logStr);
			ax.ext.net.get(logStr, menuDatasuccessCallback, errorCallback);
		} else {
			console.log('menuDataRequest 비가입자 : ' + str);
		}
		
	}catch(e){
		if (e.message === "Cannot call method \'match\' of null") {
			console.log('menuDataRequest method error');
		} else { 
			alert('menuDataRequest error : ' + e.message);
		}
	}
}

/////회원가입 request - 개인메뉴정보와 콜백은 일치. 차후 유효성검사 로직 추가 필요.
function signupRequest(){
	try{
		var doc 	= document,
			loMail 	= doc.getElementById('signupEmail').value,
			loName 	= doc.getElementById('signupName').value,
			loPass 	= doc.getElementById('signupPass').value,
			rePass 	= doc.getElementById('signupRePass');
		console.log('signupRequest : ' + loMail + ' : ' + loName + ' : ' + loPass + ' : ' + rePass);
		if (loPass === rePass.value) {
			ax.ext.net.get(faceUrl + 'user/join.php?email='
					+ loMail + '&password=' + loPass + '&name=' + loName, menuDatasuccessCallback, errorCallback);
		} else {
			alert(txt.wrongPassword);
			rePass.value = '';
		}
	} catch (e) {
		alert('signupRequest : ' + e.message);
	}
}

//덧글 등록
function replySendRequest(idx, str){
	try{
		var params = {	'email'		: user.email,
						'photoidx'	: idx,
						'content'	: str};
		ax.ext.net.post(faceUrl + 'photocomment/update.php', params,
				replySendSuccessCallback, errorCallback);
	}catch(e){
		alert('replySendRequest : ' + e.message);
	}
}

/*
//댓글 등록
url
    http://14.63.221.243/facechart/api/photocomment/update.php
param
    useridx, photoidx, content
method
    post
    
//삭제
url
    http://14.63.221.243/facechart/api/photocomment/delete.php
param
    commentidx, useridx
method
    post

//목록
url
    http://14.63.221.243/facechart/api/photocomment/list.php
param
    photoidx
method
    post
    
    
페이스차트 웹 주소: http://14.63.221.243/facechart/
api 주소: http://14.63.221.243/facechart/api/
이미지 등록 테스트 페이지 주소: http://14.63.221.243/facechart/web/test/userphoto.php
*/