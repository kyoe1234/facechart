
function showProgress(ttl, msg){
	try{
		ax.ext.ui.showProgress(msg || 'Loading...');		
		setTimeout(function(){
			hideProgress();
		}, ttl || 6000);
	} catch (e) {
		console.log('show progress error: ' + e);
	}
}

function hideProgress() {
	try {
		ax.ext.ui.hideProgress();
	} catch (e) {
		console.log('hide progress error: ' + e);
	}
}


function addWebView(url, loadCallback) {

	/** TODO: 확인필요. Android 의 경우 좌표를 디바이스 실제 해상도를 사용하고, iOS는 상대 해상도를 사용하여 출력함. - althjs
	 */
	var ratio = (_DEVICE_RUNTIME !== 'iOS') ? (window.outerWidth / window.innerWidth) : 1,
		top = 44, 
		left = 0,
		width = window.innerWidth,
		height = window.innerHeight - top;

	ratio = 1;
	
	var opts = {
				left: left *= ratio,
				top: top *= ratio,
				width: width *= ratio,
				height: height *= ratio
			};
	
	if (typeof loadCallback === 'function') {
		var urlCallback = function(maybe, url) {
			var theURL = /^\w+:\/\//.test(maybe) ? maybe : url;
			console.log('load callback url: ' + theURL);
			loadCallback(theURL);
		};

		if (_DEVICE_RUNTIME === 'iOS') {
			opts.load = urlCallback;
		} else if (_DEVICE_RUNTIME === 'Android' || _DEVICE_RUNTIME === 'ICS') {
			opts.start = urlCallback;
		} else {
			console.log('unsupported devide: ' + navigator.userAgent);
			return;
		}
	}
	
	
	console.log('addWebView opts:',opts);
	
	ax.ext.ui.addWebView(function(result) {
		console.log('>>>>>>>>>>>addWebView: ' + result);
	}, url, opts);
    
    //console.log('success call api');
}


function removeWebView() {
	ax.ext.ui.removeWebView(function() {}, 'webView');
}
