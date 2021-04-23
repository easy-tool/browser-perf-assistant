console.info("欢迎使用性能优化助手");

let cls = 0;
const observer = new PerformanceObserver(function(list) {
    const perfEntries = list.getEntries();
    for (const entry of perfEntries) {
        switch (entry.entryType) {
            case 'largest-contentful-paint':
                console.log('LCP: ', entry.startTime, entry);
                break;
            case 'first-input':
                const delay = entry.processingStart - entry.startTime;
                console.log('FID: ', delay, entry);
                break;
            case 'layout-shift':
                if (!entry.hadRecentInput) {
                    cls += entry.value;
                    if (cls > 0.15) {
                        console.log('CLS: ', cls, entry);
                    }
                }
                break;
            case 'longtask':
                console.log('LongTask: ', entry.duration, entry);
                break;
            default:
                console.log(entry.entryType, entry);
        }
    }
});
observer.observe({
    // longtask: any uninterrupted period where the main UI thread is busy for 50 ms or longer
    entryTypes: ["longtask", "largest-contentful-paint", "first-input", "layout-shift"]
});

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
    if ( fps < 55 || fps > 65) {
        console.log("FPS: ", fps);
    }
})


function measurementInterval() {
    const MEAN_INTERVAL_IN_MS = 5 * 60 * 1000;
    return -Math.log(Math.random()) * MEAN_INTERVAL_IN_MS;
}
async function performMeasurement() {
    let result;
    try {
        result = await performance.measureUserAgentSpecificMemory();
    } catch (error) {
        // https://web.dev/why-coop-coep
        if (error instanceof DOMException &&
            error.name === "SecurityError") {
            console.log("The context is not secure.");
            return;
        }
        throw error;
    }
    console.log("Memory usage:", result);
    scheduleMeasurement();
}
function scheduleMeasurement() {
    if (!performance.measureUserAgentSpecificMemory) {
        console.log("performance.measureUserAgentSpecificMemory() is not available.");
        return;
    }
    const interval = measurementInterval();
    console.log("Scheduling memory measurement in " + Math.round(interval / 1000) + " seconds.");
    setTimeout(performMeasurement, interval);
}
window.onload = function () {
    scheduleMeasurement();
}
