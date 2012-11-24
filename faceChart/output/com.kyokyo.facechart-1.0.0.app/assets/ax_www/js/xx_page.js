(function(g){
try{
	var ax = g.ax,	// require('ax');
		oPage = {},
		pages = {},
		zIndex = 100,
		history = [],
		isToggleMenu = false,
		useAdmob = false,
		admobHeight = 49,	// admob 사용시 iscroll wrapper 사이즈를 줄여주기 위함.
		menuPosition,	// number
		verticalHidePosition,	// number
		horizontalHidePosition,		// number
		screenWidth = window.innerWidth,	// number
		screenHeight = window.innerHeight,	// number
		wrapperHeight,	// wrapper 사이즈 = screenHeight - admobHeight - 헤더바 사이즈
		device = 'ANDROID';	// device type (IOS/ANDROID/ICS),
	
	var body,				// document.body
		pageMenuCloseArea,	// DOM Element
		pageMenu;			// DOM Element
	
	
	var agent = navigator.userAgent;

	if (/(iPad|iPhone|iPod)/i.test(agent)) {
		device = 'IOS';
		screenHeight = g.innerHeight;
	}
	if (/(Android 4)/i.test(agent)) {
		device = 'ICS';
	} 
	
	function init(opt){	
		if (!!!opt.mainPageId || !!!opt.menuId) {
			alert('check param: mainPageId, menuId');
			return;
		}
		
		menuPosition = opt.menuPosition || screenWidth - 50;
		verticalHidePosition = opt.verticalHidePosition || screenHeight;
		horizontalHidePosition = opt.horizontalHidePosition || screenWidth;
		useAdmob = opt.useAdmob || false;
		_getWrapperHeight();
		
		history.push(opt.mainPageId);
		
		body = g.document.body;
		
		// XXX: 옵티머스 블랙(android 2.2x) 에서 화면이 스크롤되는 증상 방지를 위한 wrapper 정의. - althjs
		// document.width가 hidden 된 영역까지 포함하여 설정됨. bodyWrapper의 position 을 relative 하게 설정 함
		// 참고: http://stackoverflow.com/questions/3970455/overflow-hidden-not-working
		//      If you are trying to hide absolute positioned elements make sure the container of those absolute positioned elements is relatively positioned.
		var bodyWrapper = body.querySelector('.bodyWrapper');
		bodyWrapper.style.height = screenHeight + 'px';
		bodyWrapper.style.width = screenWidth + 'px';
		bodyWrapper.style.overflow = 'hidden';
		bodyWrapper.style.position = 'relative';
		
		pageMenu = body.querySelector('#' + opt.menuId);
		pageMenuCloseArea = body.querySelector('.pageMenuCloseArea');
		pageMenuCloseArea.style.height = screenHeight + 'px';
		pageMenuCloseArea.style.left = (screenWidth - 50) + 'px';	
		
		setTimeout(function(){
			pageMenu.style.width = (screenWidth - 50) + 'px';
			pageMenu.style.left = 0;	
		}, 200);
	}
	
	function _getToggleMenu(){
		return isToggleMenu;
	}
	
	function _getAdmob(){
		return useAdmob;
	}
	
	function _setAdmob(use){
		
		if(use !== true && use !== false) return;
		console.log('set use admob!',use);
		
		var el;
		useAdmob = use;
		_getWrapperHeight();



        for (var id in pages){
            el = pages[id];

            el.style['-webkit-transition-duration'] = '0';
            el.style.height = use ? (screenHeight - admobHeight) + 'px' : (screenHeight) + 'px';
        }

        setTimeout(function(){
            try{
                for (var id in pages){
                    el = pages[id];
                    el.style['-webkit-transition-duration'] = '0.2s';
                    console.log(el.id);
                }
            }catch(e){
                console.log('xxxxx');
            }
        }, 20);


        // XXX: current page's iscroll refresh...
        var id = currentPage();
            wrappers = this[id].querySelectorAll('.wrapper');

        for (var i = 0, len = wrappers.length; i < len; i++){
            id = wrappers[i].id;

            if (xx.scroll[id]) {
                (function(id){
                    setTimeout(function(){
                        xx.scroll[id].refresh();
                        console.log(id,'refreshed!');
                    }, 500);
                })(id);
            }
        }


	}
	
	function _getWrapperHeight() {
		wrapperHeight = useAdmob ? (screenHeight - admobHeight - 44) : screenHeight - 44;
		//console.log('wrapperHeight', wrapperHeight);
		return wrapperHeight;
	}
	
	function _menuShow(){
		this.style.left = menuPosition + 'px';
	}
	
	function _menuHide(){
		this.style.left = 0;
	}
	
	function show(callback){
		var arg = this.info,
			THIS = this;

		history.push(arg.id);
		this.style.zIndex = ++zIndex;
		this.style.display = 'block';
	
		setTimeout(function(){
			if(arg.type === 'vertical'){
				THIS.style.top = 0;	
			}else{
				THIS.style.left = 0;	
			}
			arg.isShown = true;
			if(callback) callback();
			if(arg.onPageLoad) arg.onPageLoad();
				
		}, 300);

	}
	
	function hide(callback){
		try{
		var arg = this.info,
			THIS = this;
		
		if (history.length <= 1) return;
		
		history.pop();
		
		if(arg.type === 'vertical'){
			THIS.style.top = verticalHidePosition + 'px';	
		}else{
			THIS.style.left = horizontalHidePosition + 'px';	
		}
		
		if(arg.onPageHide) arg.onPageHide();
		
		setTimeout(function(){
			THIS.style.display = 'none';
			THIS.style.zIndex = 1;	
			THIS.info.isShown = false;
			if(callback) callback();
			if(arg.onPageHide) arg.onPageHide();
		}, 300);
		}catch(e){
			console.log('hide:',e.message);
		}
	}
	
	function back(){
		if(history.length > 1){
			var pageNameCurrent = history[history.length-1],
				pageNamePre = history[history.length-2];
			
			pageMenu.style.zIndex = 0;
			
			pages[pageNamePre].style.left = '0';
			pages[pageNamePre].style.display = 'block';
			
			if(pages[pageNamePre].info.onPageLoad) pages[pageNamePre].info.onPageLoad();
			pages[pageNameCurrent].hide();
		}
	}
	
	function onMenuSelect(callback){
		var arg = this.info,
			THIS = this,
			prePageId = history[history.length -1];
		
		if(prePageId !== arg.id){
			
			//pages[prePageId].hide();
			pages[prePageId].style.display = 'none';
			pages[prePageId].style.left = '0';
			if(pages[prePageId].info.onPageHide) pages[prePageId].info.onPageHide();
			
			history.push(arg.id);
			console.log('onMenuSelect', arg.id, history);
		
			this.style['-webkit-transition-duration'] = '0';
			
			if(arg.type === 'vertical'){
				this.style.top = 0;	
			}else{
				this.style.left = 0;	
			}
			
			this.style.display = 'block';
			this.style.zIndex = ++zIndex;
			this.info.isShown = true;
			
		}
		
		toggleMenu();
		
		setTimeout(function(){	
			THIS.style['-webkit-transition-duration'] = '';
			if(callback) callback();
			if(THIS.info.onPageLoad) THIS.info.onPageLoad();
		}, 400);

	}

	
	function toggleMenu(){
		var page = pages[history[history.length-1]],
			pagePre = pages[history[history.length - 2]];

		if(isToggleMenu){
			isToggleMenu = false;
			pageMenuCloseArea.style.display = 'none';
			page._menuHide();
		}else{
			if(pagePre) pagePre.style.display = 'none';
			isToggleMenu = true;
			pageMenuCloseArea.style.display = 'block';
			page._menuShow();
		}
	}

	function add(arg, ownerArray){
		try{
		
			var el = body.querySelector('#' + arg.id);	// page element
			
			el.hide = hide;
			el.show = show;
			el.onMenuSelect = onMenuSelect;
			el._menuShow = _menuShow;
			el._menuHide = _menuHide;
			
			arg.isShown = false;
			arg.type = arg.type || 'horizontal';
		
			//console.log(id, el.arg.type);
			if(arg.type === 'vertical'){
				el.style.top = verticalHidePosition + 'px';
			} else if (arg.type === 'horizontal') {
				el.style.left = horizontalHidePosition + 'px';
			}
			
			if (useAdmob) {
				el.style.height = (screenHeight - 49) + 'px';	// admob 사용시 wrapper 사이즈를 49px 줄임.
			}

			el.style.zIndex = 10;
			el.info = arg;
			
			pages[arg.id] = el;

		}catch(e){
			console.log('add err:',e.message);
		}
		
		if (ownerArray) ownerArray[arg.id] = el;
		
		oPage[arg.id] = el;
		return this;
	}

	function currentPage(){
		if(isToggleMenu){
			return 'menu';
		} else {
			return history[history.length -1];
		}
	}
	
	ax.def(oPage)
		.constant('history', history)
		.constant('screenWidth', screenWidth)
		.constant('screenHeight', screenHeight)
		.constant('pixelRatio', g.devicePixelRatio)
		.property('wrapperHeight', _getWrapperHeight)
		.property('useAdmob', _getAdmob, _setAdmob)
		.property('isToggleMenu', _getToggleMenu)
		.method('add', add)
		.method('init', init)
		.method('back', back)
		.method('toggleMenu', toggleMenu)
		.method('currentPage', currentPage);

	if (!g.xx) {
		ax.def(g).constant('xx', {});		
	}
	ax.def(g.xx).constant('page', oPage);

}catch(e){
	alert('oScroll def err:' + e.message);
}
})(window);
