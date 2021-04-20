console.info("欢迎使用性能优化助手");

const observer = new PerformanceObserver(function(list) {
    const perfEntries = list.getEntries();
    for (let i = 0; i < perfEntries.length; i++) {
        console.log(perfEntries[i])
    }
});
// longtask: any uninterrupted period where the main UI thread is busy for 50 ms or longer
observer.observe({entryTypes: ["longtask", "largest-contentful-paint", "layout-shift"]});

function measureFPS(report) {
    const samplesSize = 120;
    const samples = [];
    const reportAt = Math.round(samplesSize / 4);

    let samplesIndex = 0;
    let prevTime = 0;

    const maxMissedReports = 2;
    const reportTimeMissThreshold = (reportAt/60) * maxMissedReports * 1000;
    let lastReportTime = 0;

    const sample = (time) => {
        samples[samplesIndex++] = time - prevTime;
        prevTime = time;
        if (samples.length == samplesSize) {
            if (samplesIndex == samplesSize) {
                samplesIndex = 0;
            }
            if (samplesIndex % reportAt == 0) {
                let now = Date.now();
                if (lastReportTime != 0 && now - lastReportTime > reportTimeMissThreshold) {
                    samples.length = 0;
                    lastReportTime = 0;
                    samplesIndex = 0;
                } else {
                    lastReportTime = now;
                    let avgFrameTime = samples.reduce((v, a) => a + v) / samplesSize;
                    report(1000/avgFrameTime);
                }
            }
        }
        requestAnimationFrame(sample)
    }
    requestAnimationFrame(time => {
        prevTime = time
        requestAnimationFrame(sample)
    })
}

measureFPS(fps => {
    console.log("fps: ", fps);
})
