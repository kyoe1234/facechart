/**
 * Option Page Initialization 
 */
function initOption(){
	try{
		
		var admobEl = document.getElementById('admobToggle').querySelector('a');
		
		if (_ADMOB_USE) {
			admobEl.innerHTML = 'on';
		} else {
			admobEl.innerHTML = 'off';
		}
		
		var onOptionTouchEnd = function(e){
			var target = e.target,
				i=4;

			while(i--) {
				if(target.tagName === 'LI') {
					if (target.id) target.style.backgroundColor = '#ddd';
					break;
				}
				target = target.parentNode;
			}
			
			setTimeout(function(){
				target.style.backgroundColor = '';
				
				switch (target.id){
				case 'admobToggle':
					
					if (_DEVICE_RUNTIME !== 'iOS') {
						alert('Appspresso will support Android Admob in next version.');
						break;
					}
					
					if (_ADMOB_USE) {
						_ADMOB_USE = false;
						target.querySelector('a').innerHTML = 'off';
						hideAdmob();
					} else {
						_ADMOB_USE = true;
						target.querySelector('a').innerHTML = 'on';
						showAdmob();
					}
					window.localStorage.setItem('_useAdmob', _ADMOB_USE);
					break;
				case 'option_twitter':
					onClickTwitter();
					break;
				case 'option_facebook':
					onClickFacebook();
					break;
				case 'link_group_en':
				case 'link_group_ko':
				case 'link_iscroll4':
				case 'link_icons':
				case 'link_css':
					ax.ext.ui.confirm(function(res){
						if(res){
							ax.ext.ui.open(e.target.getAttribute('link'));
						}
					}, 'Would you like to open this link with Browser?');
					break;
				}
			}, 200);

		};

		if(typeof xx.scroll.wrapper_page_room === 'undefined'){
			var scrollOption = {
				'wrapperId': 'wrapper_page_room',
				scrollbarClass: 'noScroll',
				onTouchEnd: onOptionTouchEnd
			};
			xx.scroll.addScroll(scrollOption);
		}
		
		
		initOption = function(){console.log('initOption already called');};
	}catch(e){
		console.log('initOption err:', e.message);
	}
}


function updateTwitterUI() {
    if (twitter.is_connected) {
	    document.body.querySelector('#option_twitter .account').innerHTML = '@' + twitter.user_name;
    } else {
    	document.body.querySelector('#option_twitter .account').innerHTML = '';
    }
}

function updateFacebookUI() {
	try{
	    if (facebook.is_connected) {
	    	document.body.querySelector('#option_facebook .account').innerHTML = '@' + facebook.user_name;
	    } else {
	    	document.body.querySelector('#option_facebook .account').innerHTML = '';
	    }
	} catch (e){
		console.log('updateFacebookUI err', e.message);
	}
}


var lock = false;
function onClickTwitter() {
	try{
		console.log('onclick-twitter, lock: ' + lock);
	
		// prevent reentrant
		if (lock) return;
	
		lock = true;
		setTimeout(function() {
			lock = false;
		}, 10 * 1000);
	
		function connectTwitter() {
			twitter.connect(function() {
	            updateTwitterUI();
			}, function(e) {
				console.log('twitter account setting fail:', e.message);
				
				alert('Twitter connect failed. Please retry.');
	            updateTwitterUI();
			});
			lock = false;
		}
	
		if (twitter.is_connected) {
			ax.ext.ui.confirm(function(yes) {
				if (yes) {
					twitter.disconnect();
					//connectTwitter();
					updateTwitterUI();
				}
				lock = false;
			}, 'Do you want to log off the Twitter?');
		} else {
			connectTwitter();
		}
	}catch(e){
		lock = false;
		console.log('onClickTwitter err:' , e.message);
	}
}



function onClickFacebook() {
	try{
		console.log('onclick-facebook, lock: ' + lock);

		// prevent reentrant
		if (lock)
			return;

		lock = true;
		setTimeout(function() {
			lock = false;
		}, 10 * 1000);

		function connectFacebook() {
			console.log('connectFacebook');
			facebook.connect(function() {
	            updateFacebookUI();
			}, function(e) {
				console.log('facebook account setting fail:', e.message);
				alert('Facebook connect failed. Please retry.');
				updateFacebookUI();
			});
			lock = false;
		}

		if (facebook.is_connected) {
			ax.ext.ui.confirm(function(yes) {
					if (yes) {
						facebook.disconnect();
						updateFacebookUI();
					} 
					lock = false;
				}, 'Do you want to log off the Facebook?');
		} else {
			connectFacebook();
		}
	}catch(e){
		console.log('onClickFacebook err:' , e.message);
	}
}

