(function(g){
try{
	var ax = g.ax; // require('ax');
	var oScroll = {};
	var body; // window.document.body;

	var touchTime;
	var isScrolling = false;
	var touchStart;
	
	// XXX: iscroll을 뜯어고쳐야하나? 리스트에서 아이템 선택 반응 최적화를 위함 - althjs
	g.document.addEventListener('DOMContentLoaded', function(){
		body = g.document.body;
		body.addEventListener('touchstart', function(e){
			touchStart = new Date().getTime();
		}, false);
		
		body.addEventListener('touchmove', function(e){
			isScrolling = true;
		}, false);
		
		body.addEventListener('touchend', function(e){
			isScrolling = false;
		}, false);
	});
	
	
	/* XXX: needs zepto 
	function refreshSwipeEvent(){
		console.log('refreshSwipeEvent');
		
		$('.theList li').unbind('swipeLeft');
		$('.theList li').unbind('swipeRight');

		$('.theList li').swipeRight(function(e){
			//console.log('SWIPE Left >>' , e.target.innerHTML);
			if(e.target.querySelector('.btnDelete') == null){
				e.target.innerHTML+= '<div class="btnDelete"><button>Delete</button></div>';
			}
			
		});
		
		$('.theList li').swipeLeft(function(e){
			//console.log('SWIPE Right >>' , e.target.innerHTML);
			
			var btn = e.target.querySelector('.btnDelete');
			if(btn) btn.parentNode.removeChild(btn);
		
		});
	}
	*/
	
	function onScrollMove(){
		var args = this.args;
		
		try{
		if (args.useUpdateDown === true) {
			if(this.y > 5 && !args.pullDownEl.className.match('flip')) {
				args.pullDownEl.className = 'pullDown flip';
				args.pullDownLabel.innerHTML = 'Release to refresh...';
				this.minScrollY = 0;
			} else if(this.y < 5 && args.pullDownEl.className.match('flip')) {
				args.pullDownEl.className = 'pullDown';
				args.pullDownLabel.innerHTML = 'Pull down to refresh...';
				this.minScrollY = args.pullDownOffset;
			} 
			
		}
		
		if (args.useUpdateUp === true) {
			if(this.y < (this.maxScrollY - 5) && !args.pullUpEl.className.match('flip')) {
				args.pullUpEl.className = 'pullUp flip';
				args.pullUpLabel.innerHTML = 'Release to refresh...';
				//this.maxScrollY = this.maxScrollY;
			} else if(this.y > (this.maxScrollY + 5) && args.pullUpEl.className.match('flip')) {
				args.pullUpEl.className = 'pullUp';
				args.pullUpLabel.innerHTML = 'Pull up to load more...';
				this.maxScrollY = args.pullUpOffset;
			}
		}
		
		}catch(e){
			console.log('onScrollMove err:', e.message);
		}

	}
	
	
	function onScrollEnd(){

		var args = this.args;
		
		if (args.useUpdateDown === true) {
			if(args.pullDownEl.className.match('flip')) {
				args.pullDownEl.className = 'pullDown loading';
				args.pullDownLabel.innerHTML = 'Loading...';
				args.pullDownAction(this);
				// Execute custom function (ajax call?)
			}
		}
		
		if (args.useUpdateUp === true) {
			if(args.pullUpEl.className.match('flip')) {
				args.pullUpEl.className = 'pullUp loading';
				args.pullUpLabel.innerHTML = 'Loading...';
				args.pullUpAction(this);
				// Execute custom function (ajax call?)
			}
		}


	}

	function onTouchEnd(e){
		var args = this.args;
		
	    //console.log('onTouchEnd, isScrolling:', isScrolling, 'touchTime', touchTime);
	    
	    if (isScrolling){
	    	isScrolling = false;
	    } else {
	    	if(touchTime < 300 && touchTime > 25) if(args.onTouchEnd) args.onTouchEnd(e);
	    }
	    
	}
	
	
	function addScroll(args){
		
		console.debug("iscroll initializing: ===========================", args.wrapperId);
		
		var isFirstRefresh = true,
			wrapper = document.getElementById(args.wrapperId);

		
		if(typeof args.momentum === 'undefined') args.momentum = true;
		if(typeof args.useSwipe === 'undefined') args.useSwipe = false;

		args['wrapperEl'] = wrapper;

		if (wrapper.querySelector('.pullDown') === null) {
			args['useUpdateDown'] = false;
		} else {
			args['useUpdateDown'] = true;
			
			args['pullDownEl'] = wrapper.querySelector('.pullDown');
			args['pullDownOffset'] = args.pullDownEl.offsetHeight;
			args['pullDownLabel'] = args.pullDownEl.querySelector('.pullDownLabel');
			
			args['thelist'] = wrapper.querySelector('.theList');
		}
		
		
		if (wrapper.querySelector('.pullUp') === null) {
			args['useUpdateUp'] = false;
		} else {
			args['useUpdateUp'] = true;
			
			args['pullUpEl'] = wrapper.querySelector('.pullUp');
			args['pullUpOffset'] = args.pullUpEl.offsetHeight;
			args['pullUpLabel'] = args.pullUpEl.querySelector('.pullUpLabel');
			
			args['thelist'] = wrapper.querySelector('.theList');
		} 
		
		var myScroll = new iScroll(args.wrapperId, {

 			//iscroll full version option - scrollbar & pull up/down update related
	        hideScrollbar: true,
	        fadeScrollbar: true,
			topOffset : args.pullDownOffset,
			scrollbarClass: args.scrollbarClass || undefined,

			hScrollbar: args.hScrollbar || true,
			snap: args.snap || false,
			momentum: args.momentum,
			useTransition : false,	// performance!! 
			onRefresh: function(){
				try{
					var a = args || this.args;
					
					if(isFirstRefresh){
						this.args = args;
						isFirstRefresh = false;
					}
					if (a.useUpdateDown) {
						if(a.pullDownEl.className.match('loading')) {
							a.pullDownEl.className = 'pullDown';
							a.pullDownLabel.innerHTML = 'Pull down to refresh...';
						}
					}
					if (a.useUpdateUp) {
						if(a.pullUpEl.className.match('loading')) {
							a.pullUpEl.className = 'pullUp';
							a.pullUpLabel.innerHTML = 'Pull up to load more...';
						}
					}
				}catch(e){console.debug(e,e.message);}
		
				if(args.onRefresh) args.onRefresh();
				//if(args.useSwipe) refreshSwipeEvent();
			},
			onScrollMove: onScrollMove,
			onScrollEnd: onScrollEnd,
			onTouchEnd: onTouchEnd,
			onBeforeScrollEnd: function(){
				touchTime = (new Date().getTime()) - touchStart;
			},
			onBeforeScrollStart: function(e){
				// prevent iScroll input box focus issue
				// http://code.google.com/p/iscroll-js/issues/detail?id=17#c32
	            var target = e.target;
	            while (target.nodeType != Node.ELEMENT_NODE) target = target.parentNode;	// Node.ELEMENT_NODE = 1
	            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
	                e.preventDefault();
	            }
			}
		});

		setTimeout(function() {
			wrapper.style.left = '0';
			//if(args.useSwipe) refreshSwipeEvent();
		}, 200);
		
		oScroll[args.wrapperId] = myScroll;
		
		return myScroll;
	}
	
	ax.def(oScroll)
		.method('onTouchEnd', onTouchEnd)
		.method('addScroll', addScroll);
		//.method('refreshSwipeEvent', refreshSwipeEvent);

	if (!g.xx) {
		ax.def(g).constant('xx', {});		
	}
	ax.def(g.xx).constant('scroll', oScroll);
	
}catch(e){
	alert('oScroll def err:' + e.message);
}
})(window);



