var _ADMOB_WRAPPER,
	_ADMOB_PUBID = 'a14eba45e8a8d39',
	_ADMOB_USE = (window.localStorage.getItem('_useAdmob') === "true") ?  true : false,
	_DEBUG = true,
	_DEVICE_RUNTIME = 'Android';
	

function init() {
try{

	var agent = navigator.userAgent;
	if(/(iPad|iPhone|iPod)/i.test(agent)) _DEVICE_RUNTIME = 'iOS';
	if (/(Android 4)/i.test(agent)) _DEVICE_RUNTIME = 'ICS';
	
	document.body.className = _DEVICE_RUNTIME.toLowerCase();
    
	// 최초 한번 초기화 필요
	var pageOption = {
			menuId: 'pageMenu',	// required
			mainPageId: 'pageMain',	// required
			useAdmob: _ADMOB_USE	// true/false
		};
	xx.page.init(pageOption);
	
	// add page
	xx.page.add({id: 'pageMain', type: 'main'});

	xx.page.add({
		id: 'pageRoom',
		type: 'vertical',
		onPageLoad: function() {
			//initOption();	// "js/app_page_option.js"
			updateTwitterUI();
			updateFacebookUI();	
		},
		onPageHide: function() {
			//ax.ext.ui.removeWebView();
		}
	});
	
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
						toggleOption();
						break;
					case '':
						toggleMenu();
						break;
					case 'Back':
					case 'Close':
						goBack();
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



/* 메뉴 터치시 페이지 이동처리 */
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
				case 'Contact':
					xx.page['contact'].onMenuSelect();
				break;
				case 'Device interaction':
					xx.page['deviceinteraction'].onMenuSelect();
				break;
				case 'Accelerometer':
					xx.page['accelerometer'].onMenuSelect();
				break;
				case 'Orientation':
					xx.page['orientation'].onMenuSelect();
				break;
				case 'Geolocation':
					xx.page['geolocation'].onMenuSelect();
				break;
				case 'Messaging':
					xx.page['messaging'].onMenuSelect();
				break;
				case 'Camera - Liveview':
					xx.page['camera_liveview'].onMenuSelect();
				break;
				case 'Camera - Capture Image':
					xx.page['camera_capture_image'].onMenuSelect();
				break;
				case 'Camera - Capture Video':
					xx.page['camera_capture_video'].onMenuSelect();
				break;
				case 'File Read/Write':
					xx.page['file_read_write'].onMenuSelect();
				break;
				case 'File Explorer':
					xx.page['file_explorer'].onMenuSelect();
				break;
				case 'Cross Domain Ajax':
					xx.page['crossdomain'].onMenuSelect();
				break;
				case 'Curl':
					xx.page['extapi_curl'].onMenuSelect();
				break;
				case 'Upload':
					xx.page['extapi_upload'].onMenuSelect();
				break;
				case 'Download':
					xx.page['extapi_download'].onMenuSelect();
				break;
				case 'Send Mail':
					xx.page['extapi_sendmail'].onMenuSelect();
				break;
				case 'Capture/Pick Image':
					xx.page['extapi_capture_image'].onMenuSelect();
				break;
				case 'Contact (ax.ext)':
					xx.page['extapi_contact'].onMenuSelect();
				break;
				case 'Child browser':
					xx.page['extapi_browser'].onMenuSelect();
				break;
				case 'Zip':
					xx.page['extapi_zip'].onMenuSelect();
				break;
				case 'Dialogue':
					xx.page['extapi_dialogue'].onMenuSelect();
				break;
				case 'Facebook':
					xx.page['facebook_account'].onMenuSelect();
				break;
				case 'Twitter':
					xx.page['twitter_timeline'].onMenuSelect();
				break;
				case 'Post to Social Network':
					xx.page['social_update'].onMenuSelect();
				break;
				case 'Admob':
					xx.page['admob'].onMenuSelect();
				break;
			}
		}, 200);
		
	}
};

/**
 * 메뉴 iScroll 적용
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
			}, 'Quit Appspresso KitchenSink?');
		};

		ax.ext.android.setOnBackPressed(onBackPressed);
		
		var callback = function(selectedMenu) {
			if (selectedMenu === 0) {
				toggleMenu();
			} else if (selectedMenu === 1) {
				toggleOption();
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

function toggleMenu() {
	var optionPage = xx.page['pageRoom'];
	if (optionPage.info.isShown) {
		optionPage.hide();
	}
	
	xx.page.toggleMenu();
	xx.scroll.wrapperMenu.refresh();
}

function toggleOption() {
	if (xx.page.isToggleMenu) {
		xx.page.toggleMenu();
	}
	
	var page = xx.page['pageRoom'];
	
	if (page.info.isShown) {
		page.hide();
	} else {
		page.show();
	}
}


	   
