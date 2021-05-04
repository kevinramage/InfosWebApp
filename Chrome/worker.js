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
        chrome.tabs.query({}, (allTabs) => {
            const tabs = allTabs.filter(t => { return t.url.startsWith("http"); })
            if (!chrome.runtime.lastError) {
                const promises = tabs.map(t => { return getApplication(t.id, t.url); });
                Promise.all(promises).then((apps) => {
                    const applications = apps.filter(a => { return !!a; });
                    console.info("GetAllApplications", applications);
                    const myEvent = { "type": "GetAllApplicationsResponse", data: applications };
                    const tabId = sender.tab.id;
                    chrome.tabs.sendMessage(tabId, myEvent);
                });
            }
        });
        sendResponse("OK");
    } else {
        sendResponse("KO");
    }
    return true;
});

function getApplication(tabId, url) {
    return new Promise((resolve) => {
        const myEvent = { "type": "GetApplication" };
        chrome.tabs.sendMessage(tabId, myEvent, (response) => {
            if (!chrome.runtime.lastError) {
                resolve(response);
            } else {
                //console.error("An error occured during getApplication: " + tabId + " - " + url);
                //console.error(chrome.runtime.lastError);
                resolve(null);
            }
        });
    });
}