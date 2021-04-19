function init() {
	let previousCPU = 0;
	let osName = "Windows";
	if (/\bCrOS\b/.test(navigator.userAgent)) {
		osName = "Chrome";
	}
 	document.getElementById("verChrome").innerHTML = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1];
	
	if (navigator.onLine) {
		document.getElementById('ntwTabs').innerHTML = "Connected/" + navigator.connection.effectiveType;
	} else {
		document.getElementById('ntwTabs').innerHTML = "Not Connected";
	}
	
	chrome.windows.getAll({ populate: true }, function(windowList) {
		let totTabs = 0;
		document.getElementById('cTwin').innerHTML = windowList.length;
		for (let i = 0; i < windowList.length; i++) {
			totTabs = totTabs + windowList[i].tabs.length;
		}
		document.getElementById('cTtabs').innerHTML = totTabs;
	});

    document.getElementById("ReleaseMem").addEventListener("click", releaseResource);
    document.getElementById("ResetChrome").addEventListener("click", function(){chrome.tabs.create({url: "chrome://settings/resetProfileSettings"});});
    document.getElementById("ClearCache").addEventListener("click", clearBrowserData);

    let ctx = document.getElementById('myChart');
	let newDataSet = {
		datasets : [
			{
				label:"Memory Utilization",
				backgroundColor:'rgba(200, 255, 200, 0.4)',
			},
			{
				label:"CPU Utilization",
				backgroundColor:'rgba(200, 50, 50, 0.4)',
			}
		]
	}
	if (osName == "Chrome") {
	    newDataSet = {
            datasets : [
                {
                    label:"Memory Utilization",
                    backgroundColor:'rgba(200, 255, 200, 0.4)',
                },
                {
                    label:"CPU Utilization",
                    backgroundColor:'rgba(200, 50, 50, 0.4)',
                },
				{
					label: "CPU Temprature",
					backgroundColor: 'rgba(99, 99, 230, 0.4)',
				}
            ]
        }
	}

    let myChart = new Chart(ctx, {
        type: 'line',
        data: newDataSet,
        options: {
			legend: {
				display: true,
				position: "bottom",
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
        }
    });


	(function getSysdetails(){
        chrome.system.cpu.getInfo(function(info){
			let usedInPercentage = 0;
			let usedPers = 0;
			for (let i = 0; i < info.numOfProcessors; i++) {
				let usage = info.processors[i].usage;
				if (previousCPU!=0) {
					let oldUsage = previousCPU.processors[i].usage;
					usedInPercentage = Math.floor((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) / (usage.total - oldUsage.total) * 100);
				} else {
					usedInPercentage = Math.floor((usage.kernel + usage.user) / usage.total * 100);
				}
				usedPers = usedPers +usedInPercentage;
			}
			usedPers = Math.round(usedPers/info.numOfProcessors);
			myChart.data.datasets[1].data.push(usedPers);
			
			if (osName=="Chrome") {
				let temp = 0;
				let tempF = 0;
				for (let i = 0; i < info.temperatures.length; i++) {
					tempF = (1.8 * info.temperatures[i]) + 32
					temp = temp + tempF;
				}
				if (temp > 0) {
					temp = Math.round(temp/info.temperatures.length);
					myChart.data.datasets[2].data.push(temp);
				}
			}	

			document.getElementById("CpuDetail").innerHTML = info.modelName;

			if(usedPers > 90 ) {
				document.getElementById("CpuUtil").className = "PercMonRed";
			} else {
				document.getElementById("CpuUtil").className = "PercMon";
			}

			if (usedPers < 10) {
				usedPers = "0" + usedPers;
			}
			document.getElementById("CpuUtil").innerHTML = usedPers + "%"; 

			previousCPU = info;      
		});
	
		chrome.system.memory.getInfo(function (info) {
			let capacity = Math.round((info.capacity / 1.074e+9)*100)/100;
			let used = Math.round(((info.capacity-info.availableCapacity) / 1.074e+9)*100)/100;
			let usedInPercentage =  100 - Math.round((info.availableCapacity / info.capacity) * 100);
			
			document.getElementById("MemDetail").innerHTML = used +" / "+capacity+" GB";
			document.getElementById("MemUtil").innerHTML = usedInPercentage + "%";

			if (usedInPercentage > 90) {
				document.getElementById("MemUtil").className = "PercMonRed";
			} else {
				document.getElementById("MemUtil").className = "PercMon";
			}

			let today = new Date();
			let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			myChart.data.datasets[0].data.push(usedInPercentage);
			myChart.data.labels.push(time);
			myChart.update();
		});
		
		setTimeout(getSysdetails, 2000);
	})();
}

document.addEventListener('DOMContentLoaded', init);

function releaseResource() {
	chrome.tabs.query({discarded:false, active: false}, function(tabs) {
	for (let i=0;i<tabs.length; i++) {
	  chrome.tabs.discard(tabs[i].id);
	}
	 let status = document.getElementById('status');
	 if (tabs.length>0) {
		status.textContent = '释放成功！ ' + tabs.length + ' Inactive background tabs found/discarded. Minimum ~' + tabs.length*50 + 'MB Memory will be released.';
	 } else {
	 	status.textContent = '无可释放内存或CPU占用！';
	 }
	 setTimeout(function() {document.getElementById('status').textContent = '';}, 2500);
});
};

function clearBrowserData(){
	let defaultOpt = '{"appcache":false,"cache":true,"cacheStorage":true,"cookies":true,"downloads":false,"fileSystems":false,"formData":false,"history":true,"indexedDB":false,"localStorage":false,"passwords":false,"serviceWorkers":false,"webSQL":false}';
	let isStorage = false;
	let options;
	chrome.storage.sync.get({ClearBrowserOption:'',ClearBrowserTimeRange:'0'}, function (obj) {
		let clearOption = defaultOpt;
		if (obj.ClearBrowserOption) {
			clearOption = obj.ClearBrowserOption;
			isStorage = true;
		}
		if (!isStorage) {
			let strConfirm = confirm("您还没有设置要清除数据的配置项，请点击 'OK' 去配置或点击 'Cancel' 采用默认配置。");
			if (strConfirm) {
				chrome.runtime.openOptionsPage();
			}
		}
		document.getElementById('status').textContent = "清理数据中......";
		options = JSON.parse(clearOption);
		let TimeRange = 1000 * 60 * 60 * obj.ClearBrowserTimeRange;
		if (TimeRange == 0) {
			TimeRange = 1000 * 60 * 60 * 24 * 365;
		}

		chrome.browsingData.remove({
			"since":TimeRange
		}, {
		"appcache": options.appcache,
		"cache": options.cache,
		"cacheStorage": options.ccacheStorage,
		"cookies" : options.cookies,
		"downloads": options.downloads,
		"fileSystems": options.fileSystems,
		"formData": options.formData,
		"history": options.history,
		"indexedDB": options.indexedDB,
		"localStorage": options.localStorage,
		"passwords": options.passwords,
		"serviceWorkers": options.serviceWorkers,
		"webSQL": options.webSQL
		}, function () {
			document.getElementById('status').textContent = "清除成功！";
			setTimeout(function() {document.getElementById('status').textContent = '';}, 2000);
		});
  	});
}
