console.info("欢迎使用性能优化助手");

const observer = new PerformanceObserver(function(list) {
    const perfEntries = list.getEntries();
    for (let i = 0; i < perfEntries.length; i++) {
        console.log(perfEntries[i])
    }
});
// longtask: any uninterrupted period where the main UI thread is busy for 50 ms or longer
observer.observe({entryTypes: ["longtask", "largest-contentful-paint", "layout-shift"]});
