var _DEBUG = true,
	_DEVICE_RUNTIME = 'Android';
	

function init() {
	try{
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
		xx.page.add({id: 'pageMain', type: 'main'});
		xx.page.add({id: 'pageRoom', type: 'vertical'});
		
		/* apply fast button to common buttons */
		document.body.addEventListener('touchstart', function(e) {
			try{
				var target = e.target,
					preClass;
		
				if(target.tagName === 'BUTTON') {
	
					preClass = target.className;
					target.className = preClass + ' ' + 'pressed';
					
					setTimeout(function() {
						target.className = preClass;
						
						switch(e.target.innerHTML) {
							case 'Room':
								toggleRoom();
								break;
							case '':
								toggleMenu();
								break;
//							case 'Back':
//							case 'Close':
//								goBack();
						}
					}, 200);
					
					e.stopPropagation();
				} 
			}catch(e) {
				console.log('button err:', e.message);
			}
		}, false);
	
		initMenu();
		initAndroid();
	
	}catch(e) {
		console.log('init err:',e.message);
	}
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
				case 'get':
					console.log('=======================','ok');
					try{
					ax.ext.net.get('http://kyoe.blogcocktail.com/facechart/api/photo/list.php?user_id=22&file=7', successCallback, errorCallback);
					}catch(e){
						alert(e);
					}
					console.log('=======================','finish');
				break;
				case 'post':
					//아직 api없음 
//					var params = { 'firstname': 'foo', 'lastname': 'bar'};
//					ax.ext.net.post('http://kyoe.blogcocktail.com/facechart/api/photo/upload.php', params,
//						successCallback, errorCallback);
				break;
				case 'Device status':
					xx.page['devicestatus'].onMenuSelect();
				break;
				
			}
		}, 200);
		
	}
};
function successCallback(result) {
	if(result.status >= 200 && result.status < 300) {
		var json = JSON.parse(result.data);

		//console.log('=====', json.id, json.user_id, json.photo[0]);
		document.getElementById('imgTest').setAttribute("src", json.photo[0]);
	}
}
function errorCallback(error) {
	alert("error : " + error);
}

function fileUploadDemo(){
    var url = 'http://2do.kr/demo/upload.html',
        file = {'file1': 'downloads/icon.png'},
        params = {'param1':'param1 value'};
    var successCB = function(o){
        console.log('successCB:', o.status, o.data);
     
    };
    var progressCB = function(progress){    // ax.ext.net.CurlSent
        console.log('progressCB:', progress[0], progress[1]);
    };
    var errorCB = function(e){
        console.log('progressCB:', e.message, e.code);
    };
     
    ax.ext.net.upload(url, params, file, successCB ,errorCB, progressCB);
}
/**
 * pageMenu - iScroll 적용
 */
function initMenu() {
	var scrollOption = {
			wrapperId: 'wrapperMenu',
			onTouchEnd: onTouchMenu,
			scrollbarClass: 'noScroll'
		};
	xx.scroll.addScroll(scrollOption);
}

/**
 * 이전 페이지로 이동
 */
function goBack() {
	xx.page.back();
	
	if( xx.page.history.length === 1) {
		// console.log('xx.scroll.wrapperMain.refresh()');
		setTimeout(function(){
			xx.scroll.wrapperMain.refresh();
		}, 1000);
	}
}

/**
 * Android 하드웨어 버튼 대응
 */
function initAndroid() {
	try{
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
			}, 'faceChart를 종료하시겠습니?');
		};

		ax.ext.android.setOnBackPressed(onBackPressed);
		
		var callback = function(selectedMenu) {
			if (selectedMenu === 0) {
				toggleMenu();
			} else if (selectedMenu === 1) {
				toggleRoom();
			} else if (xx.page.history.length > 2) {
				xx.page.back();
			}
		};
		ax.ext.android.setOnOptionsItemSelected(callback);
		ax.ext.android.setOptionsItems(['Open Menu','Options']);
		
	}catch(e) {
		// iOS? WAC?
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
	}
}

//사진업로드 페이지이동 
function goUploadPage(){
	alert(0);
}

	   
