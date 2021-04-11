console.info("ContentScript");

/*
const description = document.getElementsByTagName("meta").Description;
const keywords = document.getElementsByTagName("meta").Keywords;

// Create application
const application = new Application();
application.domain = window.location.host;
application.title = document.title;
application.description = "";
if (description) {
    application.description = description.getAttribute("content");
}
application.keywords = "";
if (keywords) {
    application.keywords = keywords.getAttribute("content");
}
application.ssl = "HTTPS";

// Create an event
const myEvent = new MyEvent();
myEvent.type = ENUMTYPE_INIT;
myEvent.data = application;

// Send application to worker
chrome.runtime.sendMessage(myEvent, (resp) => {
    console.info(resp);
});
*/

idb.openDB('technoInfoApp', 1, {
    upgrade(db) {
        db.createObjectStore('application');
        db.createObjectStore('technologies');
        db.createObjectStore('cookies');
        db.createObjectStore('libs');
        db.createObjectStore('urls');
        db.createObjectStore('languages');
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
            const headersAnalyzer = new HeadersAnalyzer(db, application);
            headersAnalyzer.run(request.data.headers);
        } else {
            sendResponse("KO");
        }
        return true;
    });
});

