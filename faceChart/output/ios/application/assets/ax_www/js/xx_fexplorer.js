(function(g){
try{
var ax = g.ax; // require('ax');
var oFileExplorer = {};

var currentPath,
	parentPath = 'root',
	fileListElement,
	filePreviewElement,
	fileDetailElement,
	rootDir = [ "images", "videos", "music", "documents", "downloads", "wgt-package", "wgt-private", "wgt-private-tmp", "removable", "removable/DCIM" ];
	fileInfo = [],
	cachedHtml = '',
	iscroll = '',
	isInit = false;
	
	
function init(arg){
	
	if (isInit) return;
	
	if (navigator.userAgent.match(/iPad|iPhone|iPod/)) {
		rootDir.pop(); // IOS doesn't support removable dir
		rootDir.pop(); // IOS doesn't support removable/DCIM dir
	}
	
	fileListElement = arg.fileListElement || document.getElementById('file_list');
	filePreviewElement = arg.filePreviewElement || document.getElementById('file_preview');
	fileDetailElement = arg.fileDetailElement || document.getElementById('file_detail');
	
	iscroll = xx.scroll.addScroll({
		   wrapperId: arg.wrapperId || 'wrapper_file_explorer', 
		   onTouchEnd: _onTouchEnd
		});

	isInit = true;
}

function _setCurrentPath(path) {
	currentPath = path;
}

function _getCurrentPath() {
	return currentPath;
}
	
function _onTouchEnd(e){
	var target = e.target,
		i=4,
		className;
	
	while(i--) {
		if(target.tagName === 'LI') break;
		target = target.parentNode;
	}
	
	className = target.className;
	if (className != '') target.style.backgroundColor = '#ddd';
	
	//console.log('className', className);
	setTimeout(function(){
		try{
			target.style.backgroundColor = '';
			switch (className){
			case 'backfolder':
				console.log('target.getAttribute(parentPath)', target.getAttribute('parentPath'));
				getSubList(target.getAttribute('parentPath'));
				break;
			case 'list':
				getSubList(target.getAttribute('targetFolder'));
				break;
			case 'file':
				_getFileInfo(target.getAttribute('targetFile'));
				break;
			case 'read':
				_readFile(target.getAttribute('targetFile'));
				break;
			}
			
		}catch(e){
			console.log(e.message);
		}

	}, 200);
}

	
function _readAsText(str){
	alert(str);
}
	
function _readFile(idx){
try{
	var file = fileInfo[idx],
		filetype = file.name,
		html = '';
	
	filetype = filetype.substring(filetype.lastIndexOf('.')+1,filetype.length);
	filetype = filetype.toUpperCase();
	
	
	switch(filetype){
		case 'MP3':
		case 'WAV':
			html = '<audio src="' + file.toURI() + '" controls="controls" width="100%"></audio>';
			filePreviewElement.style.display = 'block';
			break;
		case '3GP':
		case 'MP4':
			html = '<video src="' + file.toURI() + '" controls="controls" width="100%"></video>';
			filePreviewElement.style.display = 'block';
			break;
		case 'XML':
		case 'HTML':
		case 'JS':
		case 'CSS':
		case 'TXT':
			try{
				file.readAsText(_readAsText, function(e) {
					console.log('fexplorer file readAsText err', e.message);
				}, "utf-8");
			}catch(e){
				//console.log(e.message);
			}
			break;
		case 'PNG':
		case 'JPG':
		case 'JPEG':
			html = '<img src="' + file.toURI() + '" style="max-width: 300px;"/>';
			filePreviewElement.style.display = 'block';
			break;
			
		default:
			break;
	}

	filePreviewElement.innerHTML = html;
	
	setTimeout(function(){
		iscroll.refresh();
	}, 500);
		
}catch(e){
	alert(e.message);
}
}

function _getFileInfo(idx){
		
	var file = fileInfo[idx],
		html = '',
		parentPath;
	
	try{
		parentPath = file.path.substring(0,file.path.lastIndexOf('/'));

		cachedHtml = fileListElement.innerHTML;


		html+= '<li class="backfolder" parentPath="' + parentPath + '">.. / ' + file.path + ' </li>';
		
		html+= '<li><h3>' + file.name + '</h3>';
		html+= '<p>URI: <em>' + file.toURI() + '</em><br/>';
		html+= 'Parent dir: <em>' + file.parent.name + '</em><br/>'; 
		html+= 'Readonly: <em>' + file.readOnly + '</em><br/>';
		html+= 'Created: <em>' + file.created + '</em><br/>';
		html+= 'Modified: <em>' + file.modified + '</em><br/>';
		html+= 'Path: <em>' + file.path + '</em><br/>';			
		html+= 'Path(full): <em>' + file.fullPath + '</em><br/>';
		html+= 'Size: <em>' + file.fileSize + '</em><br/>';
		html+= 'Length: <em>' + file.length + '</em><br/>';
		html+= '</li>';
		
		fileListElement.innerHTML = html;
	
		
		html = '<li class="read" targetFile="' + idx + '">View file</li>';
		//html+= '<li data-icon="alert"><a href="#not-supported">Delete file</a></li>';
		//html+= '<li data-icon="alert"><a href="#not-supported">Edit file</a></li>';
		
		fileDetailElement.innerHTML = html;
		
		setTimeout(function(){
			iscroll.refresh();	
		}, 500);
		

	}catch(e){
		console.log('getFileInfo err:', e.message);
	}	
	
}

function _getFolderIcon(dir){
	var icon = 'image/icon_folder.png';

	if(dir.indexOf('wgt-package')>=0){
		icon = 'image/icon_folder_lock.png';
	}
	return icon;
}

function _getRootList(){
	var files = rootDir,
		html = '<li>Root:</li>',
		icon = '',
		i;

	try{
		for(i=0; i<files.length; i++) { 
			icon = _getFolderIcon(files[i]);	// check readonly folder 
			html += '<li class="list" targetFolder="' + files[i] + '"><img class="ui-li-icon" src="' + icon  + '" />' + files[i] + '</li>';
		}

		fileListElement.innerHTML = html;
		
		setTimeout(function(){
				iscroll.refresh();
			},500); 
	
	}catch(e){
		console.log(e.message);
	}
}

function getSubList(path){
	
	
	//demoFileExplorerFolder = path;
	filePreviewElement.innerHTML = '';
	filePreviewElement.style.display = 'none';
	fileDetailElement.innerHTML = '';
	

	fileListElement.innerHTML = '';
	
 	if (typeof path !== 'undefined'){
		if(path === 'root'){
			_getRootList();
			return;
		}else{
			currentPath = path;
		}
	} else if (currentPath === undefined) {
		_getRootList();
		return;
	}
 	
 	console.log('getSubList ', currentPath);
	
 	
	var errorSubListCallback = function(error){
		ax.ext.ui.alert(alertCallback,"The error " + error.message + " occurend when listing the files in the selected folder");
	};	

	try{
		deviceapis.filesystem.resolve( 
			function(dir){ 
				dir.listFiles(successSubListCallback,errorSubListCallback); 
			}, function(e){ 
				alert(e.message); 
				_getRootList();
			}, currentPath,  "r" 
		); 

	}catch(e){
		console.log(e.message);
	}


}

function successSubListCallback(files){
	var html = '',
		name = '',
		icon = '',
		i,
		depth = currentPath.lastIndexOf('/');

	if(depth > 0){
		parentPath = currentPath.substring(0,depth);
	} else {
		parentPath = 'root';
	}
	
	html = '<li class="backfolder" parentPath="' + parentPath + '">.. / ' + currentPath + '</li>';

	for(i=0; i<files.length; i++) { 
		name = (files[i].name) ? files[i].name : ' ?? ';		

		if(files[i].isDirectory){	
			icon = _getFolderIcon(currentPath + '/' + name);
			html += '<li class="list" targetFolder="' + currentPath + '/' + name + '"><img class="ui-li-icon" src="' + icon + '"/>' + name + '</li>';
		}else{
			html += '<li class="file" targetFile="' + i + '">' + name + '</li>';
		}
	} 
		
	if(i == 0){
		html+= '<li>No file exists</li>';
	}

	fileInfo = files;

	fileListElement.innerHTML+= html;
	try{
		var THIS = this;
		setTimeout(function(){
			THIS.iscroll.refresh();
		}, 300);
	}catch(e){
		console.log(e.message);
		
	}		
}
	


ax.def(oFileExplorer)
	.property('currentPath', _getCurrentPath, _setCurrentPath)
	.method('init', init)
	.method('getSubList', getSubList);


ax.def(g.xx).constant('fexplorer', oFileExplorer);

}catch(e){
	console.log('fexplorer err:', e.message);
}
})(window);