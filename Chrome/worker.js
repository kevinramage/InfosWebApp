chrome.webRequest.onHeadersReceived.addListener((details) => {
    if (["main_frame", "xmlhttprequest"].includes(details.type)) {
        
        // Send headers to content script
        if (details.tabId > -1) {
            chrome.tabs.get(details.tabId, () => {
                const myEvent = {
                    type: "EmitHeaders",
                    data: {
                        tabId: details.tabId,
                        headers: details.responseHeaders,
                        url: details.url,
                        type: details.type
                    }
                };
                chrome.tabs.sendMessage(details.tabId, myEvent);
            });
        }
    }
}, {urls: ["<all_urls>"]}, ["responseHeaders", "extraHeaders"]);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == "GetAllApplications") {
        chrome.tabs.query({}, (tabs) => {
            const promises = tabs.map(t => { return getAllApplication(t.id); });
            Promise.all(promises).then((apps) => {
                const applications = apps.filter(a => { return !!a; });
                const myEvent = { "type": "GetAllApplicationsResponse", data: applications };
                const tabId = sender.tab.id;
                chrome.tabs.sendMessage(tabId, myEvent);
            });
        });
        sendResponse("OK");
    } else {
        sendResponse("KO");
    }
    return true;
});

function getAllApplication(tabId) {
    return new Promise((resolve) => {
        const myEvent = { "type": "GetApplication" };
        chrome.tabs.sendMessage(tabId, myEvent, (response) => {
                resolve(response);
            if (response) {
            } else {
                resolve({});
            }
        });
    });
}