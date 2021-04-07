function draw() {
	chrome.system.cpu.getInfo(function(info) {
		chrome.storage.local.get(["previousCPU"], ({ previousCPU }) => {
			previousCPU = previousCPU || 0;
			let usedInPercentage = 0;
			let usedPers = 0;
			for (let i = 0; i < info.numOfProcessors; i++) {
				let usage = info.processors[i].usage;
				if (previousCPU != 0) {
					let oldUsage = previousCPU.processors[i].usage;
					usedInPercentage = Math.floor((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) / (usage.total - oldUsage.total) * 100);
				} else {
					usedInPercentage = Math.floor((usage.kernel + usage.user) / usage.total * 100);
				}
				usedPers = usedPers + usedInPercentage;
			}
			usedPers = Math.round(usedPers/info.numOfProcessors);
			let strColor = "green";
			if (usedPers > 90) {
				strColor = "red";
			}
			if (usedPers < 10) {
				usedPers = "0"+ usedPers;
			}
			chrome.storage.local.get(["hoverMsg"], ({ hoverMsg }) => {
				hoverMsg = hoverMsg || {cpuVal: 0, memVal: 0};
				chrome.storage.local.set({hoverMsg: { cpuVal: usedPers, memVal: hoverMsg.memVal }, previousCPU: info});
				chrome.action.setTitle({title: "CPU 使用:"+ usedPers +"% - 内存 使用:"+ hoverMsg.memVal +"%"});
			});
			chrome.action.setBadgeText({text: ''+ usedPers +''});
			chrome.action.setBadgeBackgroundColor({color:''+strColor+''});
		});
	});

	chrome.system.memory.getInfo(function (info) {
		let memUtil = 100 - Math.round((info.availableCapacity / info.capacity) * 100);
		chrome.storage.local.get(["hoverMsg"], ({ hoverMsg }) => {
			hoverMsg = hoverMsg || {cpuVal: 0, memVal: 0};
			chrome.storage.local.set({hoverMsg: { memVal: memUtil, cpuVal: hoverMsg.cpuVal }});
			chrome.action.setTitle({title: "CPU 使用:"+ hoverMsg.cpuVal +"% - 内存 使用:"+ memUtil +"%"});
		});
	});
}

chrome.runtime.onInstalled.addListener(() => {
	chrome.alarms.get('alarm', a => {
		if (!a) {
			chrome.alarms.create('alarm', { delayInMinutes: 0.02, periodInMinutes: 0.05 });
		}
	});
});

chrome.alarms.onAlarm.addListener(draw);
