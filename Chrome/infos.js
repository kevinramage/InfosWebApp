let data = [];

window.onload = () => {
    //document.getElementById("btnRefresh").addEventListener('click', (e) => { onRefresh(e); });
    //document.getElementById("selectApplications").addEventListener("change", (e) => { onChange(e); });
    //onRefresh();
}
/*
function onRefresh() {

    // Send application to worker
    chrome.runtime.sendMessage({"type": "GETALL"}, (applications) => {
        data = applications;
        updateApplications(applications);
        if (applications && applications.length > 0) {
            updateApplication(applications[0]);
        }
    });
}

function onChange(e) {
    const application = data.find(app => { return app.domain == e.target.value; });
    updateApplication(application);
}

function updateApplications(data) {
    console.info(data);
    const options = data.map(app => {
        return "<option value='" + app.domain + "'>" + app.domain + "</option>";
    });
    document.getElementById("selectApplications").innerHTML = options;
}

function updateApplication(data) {
    updateApplicationInfos(data);
    updateApplicationTechnologies(data);
    updateApplicationCookies(data);
}

function updateApplicationInfos(app) {
    let result = "<ul>";
    if (app.domain && app.domain != "") {
        result += '<li class="info"><span><span class="label">Domain: </span><span class="value">' + app.domain + '</span></span></li>';
    }
    if (app.title && app.title != "") {
        result += '<li class="info"><span><span class="label">Title: </span><span class="value">' + app.title + '</span></span></li>';
    }
    if (app.description && app.description != "") {
        result += '<li class="info"><span><span class="label">Description: </span><span class="value">' + app.description + '</span></span></li>';
    }
    if (app.keywords && app.keywords != "") {
        result += '<li class="info"><span><span class="label">Keywords: </span><span class="value">' + app.keywords + '</span></span></li>';
    }
    result += "</ul>";
    document.getElementById("txtInfos").innerHTML = result;
}

function updateApplicationTechnologies(app) {
    if (app.technologies) {
        let content = app.technologies.map(t => {
            let result = '<li class="technology">';
            result += '<span><span class="label">Name: </span><span class="value">' + t.name + '</span></span>';
            if (t.version && t.version != "") {
                result += '<span><span class="label">Version: </span><span class="value">' + t.version + '</span></span>';
            }
            if (t.category && t.category != "") {
                result += '<span><span class="label">Category: </span><span class="value">' + t.category + '</span></span>';
            }
            result += '</li>';
            return result;
        });
        content = "<ul>" + content + "</ul>";
        document.getElementById("txtTechnologies").innerHTML = content;
    }
}

function updateApplicationCookies(app) {
    if (app.cookies) {
        let content = app.cookies.map(c => {
            let result = '<li class="cookie">';
            result += '<span><span class="label">Cookie name: </span><span class="value">' + c.cookieName + '</span></span>';
            result += '<span><span class="label flag">Secure: </span><span class="value">' + c.secure + '</span></span>';
            result += '<span><span class="label flag">HttpOnly: </span><span class="value">' + c.httpOnly + '</span></span>';
            if (c.sameSite && c.sameSite != "") {
                result += '<span><span class="label">SameSite: </span><span class="value">' + c.sameSite + '</span></span>';
            }
            if (c.sessionIdLength && c.sessionIdLength > 0 ) {
                result += '<span><span class="label">Session id length: </span><span class="value">' + c.sessionIdLength + '</span></span>';
            }
            result += '</li>';
            return result;
        });
        content = "<ul>" + content + "</ul>";
        document.getElementById("txtCookies").innerHTML = content;
    }
}
*/

const myEvent = { "type": "GetAllApplications" }

chrome.runtime.sendMessage(myEvent, (response) => {
    console.info(response);
    return true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request) {
        if (request.type == "GetAllApplicationsResponse") {
            console.info(request);
            sendResponse("OK");
            
        }
    }
    return true;
});