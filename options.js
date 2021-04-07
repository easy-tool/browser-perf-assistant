
function optSave() {
	let optVal = document.getElementById('timeRange').value;
	let lp = document.getElementsByTagName("input");
	let options = "{";
	for(let i=0; i<lp.length; i++) {
		if (lp[i].type == "checkbox") {
			options += '"'+ lp[i].id + '" : ' +lp[i].checked+',';
		}
	}
	options = options.slice(0, -1); options += "}";
	chrome.storage.sync.set({
		ClearBrowserTimeRange:optVal,
		ClearBrowserOption:options
	}, function() {
		let status = document.getElementById('status');
		status.textContent = '保存成功！';
		setTimeout(function() {status.textContent = '';}, 1750);
	}); 
}


function optReload() {
   let options = '{"appcache":false,"cache":true,"cacheStorage":true,"cookies":true,"downloads":false,"fileSystems":false,"formData":false,"history":true,"indexedDB":false,"localStorage":false,"passwords":false,"serviceWorkers":false,"webSQL":false}';

   chrome.storage.sync.get({ClearBrowserOption:options,ClearBrowserTimeRange:'0'}, function (obj) {
		document.getElementById('timeRange').value = obj.ClearBrowserTimeRange;
		let obj1 = JSON.parse(obj.ClearBrowserOption);
      	document.getElementById('appcache').checked = obj1.appcache;
		document.getElementById('cache').checked = obj1.cache;
		document.getElementById('cacheStorage').checked = obj1.cacheStorage;
		document.getElementById('cookies').checked = obj1.cookies;
        document.getElementById('downloads').checked = obj1.downloads;
		document.getElementById('fileSystems').checked = obj1.fileSystems;
		document.getElementById('formData').checked = obj1.formData;
        document.getElementById('history').checked = obj1.history;
		document.getElementById('indexedDB').checked = obj1.indexedDB;
		document.getElementById('localStorage').checked = obj1.localStorage;
        document.getElementById('passwords').checked = obj1.passwords;
		document.getElementById('serviceWorkers').checked = obj1.serviceWorkers;
		document.getElementById('webSQL').checked = obj1.webSQL;
    });
}

document.addEventListener('DOMContentLoaded', optReload);
document.getElementById('setPref').addEventListener('click',optSave);
