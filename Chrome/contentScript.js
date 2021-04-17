idb.openDB('technoInfoApp', 1, {
    upgrade(db) {
        db.createObjectStore('application');
        db.createObjectStore('technologies');
        db.createObjectStore('cookies');
        db.createObjectStore('libs');
        db.createObjectStore('urls');
        db.createObjectStore('languages');
        db.createObjectStore('fingerprints');
    },
}).then(db => {

    // Create application
    const application = new Application();

    // Run DOM analyze
    const domAnalyzer = new DomAnalyzer(db, application);
    domAnalyzer.run();

    // Run headers analyse
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.type === "GetApplication") {
            sendResponse(domAnalyzer.application);
        } else if (request.type === "EmitHeaders") {
            
            // Run headers analyzer
            const headersAnalyzer = new HeadersAnalyzer(db, application);
            headersAnalyzer.run(request.data.headers, request.data.url);

            // Run FingerPrint analyzer
            const fingerPrintAnalyzer = new FingerPrintAnalyzer(db, application);
            fingerPrintAnalyzer.run(request.data.headers);
        } else {
            sendResponse("KO");
        }
        return true;
    });
});

