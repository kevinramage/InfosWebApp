let data = [];

window.onload = () => {
    document.getElementById("btnRefresh").addEventListener("click", updateApplications);
    document.getElementById("lnkInfos").addEventListener("click", displayInfoTab);
    document.getElementById("lnkTechnologies").addEventListener("click", displayTechnologiesTab);
    document.getElementById("lnkLibrairies").addEventListener("click", displayLibrairiesTab);
    document.getElementById("lnkCookies").addEventListener("click", displayCookiesTab);

    chrome.tabs.query({url: window.location.href}).then(tab => {
        //console.info("Onload current tab id: " + tab && tab.length > 0 ? tab[0].id : undefined);
    });
}

let allApplications = null;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.info("Response received ...");
    console.info(request);
    if (!chrome.runtime.lastError) {
        if (request.type == "GetAllApplicationsResponse") {
            sendResponse("OK");
            allApplications = request.data;
            updateApplication();
        } else {
            console.error("An error occured during chrome.runtime.onMessage.addListener - Invalid type: " + request.type);
        }
    } else {
        console.error("An error occured during chrome.runtime.onMessage.addListener: ", chrome.runtime.onMessage.addListener);
    }
    //return true;
});

function updateApplications(e) {
    console.info("updateApplications - Send getApplications message");
    const myEvent = { "type": "GetAllApplications" };
    chrome.runtime.sendMessage(myEvent, (response) => {
        if (chrome.runtime.lastError) {
            console.error("An error occured during updateApplications: ", chrome.runtime.lastError);
            setTimeout(updateApplications, 1000);
        }
    });
}

function updateApplication(domain) {
    const selectedApplication = getSelectedApplication(allApplications, domain);
    writeApplicationsInfo(allApplications);
    writeApplicationInfo(selectedApplication);
    writeTechnologiesInfo(selectedApplication);
    writeLibrairiesInfo(selectedApplication);
    writeCookiesInfo(selectedApplication);
}

function hideAllTabs() {
    document.getElementById("sctAppInfos").style.display = "none";
    document.getElementById("sctTechnologyInfos").style.display = "none";
    document.getElementById("sctLibrairiesInfos").style.display = "none";
    document.getElementById("sctCookiesInfos").style.display = "none";
    document.getElementById("lnkInfos").classList.remove("active");
    document.getElementById("lnkTechnologies").classList.remove("active");
    document.getElementById("lnkLibrairies").classList.remove("active");
    document.getElementById("lnkCookies").classList.remove("active");
}

function displayInfoTab() {
    hideAllTabs();
    document.getElementById("sctAppInfos").style.display = "block";
    document.getElementById("lnkInfos").classList.add("active");
}

function displayTechnologiesTab() {
    hideAllTabs();
    document.getElementById("sctTechnologyInfos").style.display = "block";
    document.getElementById("lnkTechnologies").classList.add("active");
}

function displayLibrairiesTab() {
    hideAllTabs();
    document.getElementById("sctLibrairiesInfos").style.display = "block";
    document.getElementById("lnkLibrairies").classList.add("active");
}

function displayCookiesTab() {
    hideAllTabs();
    document.getElementById("sctCookiesInfos").style.display = "block";
    document.getElementById("lnkCookies").classList.add("active");
}

function menuItemOnClick(e) {
    const domain = e.target.innerText;
    if (document.getElementById("navbarDropdown")) {
        updateApplication(domain);
        document.getElementById("navbarDropdown").innerText = domain;
    } else {
        console.error("An error occured during menuItemOnClick - element navbarDropdown not found"); 
    }
}

function writeApplicationsInfo(applications) {
    let content = "";
    applications.forEach(application => {
        content += '<li><a class="dropdown-item" href="#">' + application.domain + '</a></li>';
    });
    if (document.getElementById("navbarDropdown") && applications.length > 0) {
        document.getElementById("navbarDropdown").innerText = applications[0].domain;
    } else if (!document.getElementById("navbarDropdown")) {
        console.error("An error occured during writeApplicationsInfo - element navbarDropdown not found");
    }
    if (document.getElementById("lstApps")) {
        document.getElementById("lstApps").innerHTML = content;
        document.getElementById("lstApps").childNodes.forEach(childNode => {
            const link = childNode.childNodes[0];
            link.addEventListener("click", menuItemOnClick);
        });
    } else {
        console.error("An error occured during writeApplicationsInfo - element lstApps not found");
    }
}

function getSelectedApplication(applications, domainName) {
    let selectedApplication = null;
    if (domainName) {
        const searchApplication = applications.find(a => { return a.domain === domainName; });
        if (searchApplication) {
            selectedApplication = searchApplication;
        } else {
            console.error("An error occured during getSelectedApplication - application " + domainName + " not found, applications: ", applications);
        }
    }
    if (selectedApplication == null && document.getElementById("navbarDropdown") && document.getElementById("navbarDropdown").innerText && document.getElementById("navbarDropdown").innerText.trim() != "Select applications") {
        const searchApplication = applications.find(a => { return a.domain === document.getElementById("navbarDropdown").innerText; });
        if (searchApplication) {
            selectedApplication = searchApplication;
        } else {
            console.error("An error occured during getSelectedApplication - application " + document.getElementById("navbarDropdown").innerText + " not found, applications: ", applications);
        }
    }
    if (selectedApplication == null && applications && applications.length > 0) {
        selectedApplication = applications[0];
    } else {
        console.error("An error occured during getSelectedApplication - selected application not identified");
    }
    return selectedApplication;
}

function writeApplicationInfo(selectedApplication) {

    // Update content
    if (selectedApplication) {
        if (document.getElementById("txtDomain")) {
            document.getElementById("txtDomain").value = selectedApplication.domain;
        } else {
            console.error("An error occured during writeApplicationInfo - element txtDomain not found");
        }
        if (document.getElementById("txtTitle")) {
            document.getElementById("txtTitle").value = selectedApplication.title;
        } else {
            console.error("An error occured during writeApplicationInfo - element txtTitle not found");
        }
        if (document.getElementById("txtKeywords")) {
            document.getElementById("txtKeywords").value = selectedApplication.keywords;
        } else {
            console.error("An error occured during writeApplicationInfo - element txtKeywords not found");
        }
    }
}

function writeTechnologiesInfo(selectedApplication) {
    let content = '<thead><th scope="col">#</th><th scope="col">Name</th><th scope="col">Version</th><th scope="col">Details</th><th scope="col">Category</th></tr></thead><tbody>';

    // Update content
    if (selectedApplication) {
        selectedApplication.technologies.forEach((t, index) => {
            content += '<tr>';
            content += '<td scope="row">' + (index+1) + '</td>';
            content += '<td>' + t.name + '</td>';
            content += '<td>' + t.version + '</td>';
            content += '<td>' + t.versionDetails + '</td>';
            content += '<td>' + t.category + '</td>';
            content += '</tr>';
        });
    }
    content += '</tbody>';
    if (document.getElementById("sctTechnologyInfos")) {
        document.getElementById("sctTechnologyInfos").style.display = "none";
        document.getElementById("sctTechnologyInfos").innerHTML = content;
    } else {
        console.error("An error occured during writeTechnologiesInfo - element sctTechnologyInfos not found");
    }
}

function writeLibrairiesInfo(selectedApplication) {
    let content = '<thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Version</th><th scope="col">Details</th><th scope="col">Script name</th></tr></thead><tbody>';

    // Update content
    if (selectedApplication) {
        selectedApplication.libs.forEach((l, index) => {
            content += '<tr>';
            content += '<td scope="row">' + (index+1) + '</td>';
            content += '<td>' + l.technology + '</td>';
            content += '<td>' + l.version + '</td>';
            content += '<td>' + l.versionDetails + '</td>';
            content += '<td>' + l.name + '</td>';
            content += '</tr>';
        });
    }
    content += '</tbody>';
    if (document.getElementById("sctLibrairiesInfos")) {
        document.getElementById("sctLibrairiesInfos").style.display = "none";
        document.getElementById("sctLibrairiesInfos").innerHTML = content;
    }
}

function writeCookiesInfo(selectedApplication) {
    let content = '<thead><tr><th scope="col">#</th><th scope="col">Cookie name</th><th scope="col">Expires</th><th scope="col">Max-age</th><th scope="col">Domain</th><th scope="col">Path</th><th scope="col">Secure</th><th scope="col">HttpOnly</th><th scope="col">SameSite</th><th scope="col">Session entropy</th></tr></thead><tbody>';

    // Update content
    if (selectedApplication) {
        selectedApplication.cookies.forEach((c, index) => {
            content += '<tr>';
            content += '<td scope="row">' + (index+1) + '</td>';
            content += '<td>' + c.cookieName + '</td>';
            content += '<td>' + c.expires + '</td>';
            content += '<td>' + c.maxAge + '</td>';
            content += '<td>' + c.domain + '</td>';
            content += '<td>' + c.path + '</td>';
            content += '<td>' + c.secure + '</td>';
            content += '<td>' + c.httpOnly + '</td>';
            content += '<td>' + c.sameSite + '</td>';
            content += '<td>' + c.sessionIdLength + '</td>';
            content += '</tr>';
        });
    }
    content += '</tbody>';
    if (document.getElementById("sctCookiesInfos")) {
        document.getElementById("sctCookiesInfos").style.display = "none";
        document.getElementById("sctCookiesInfos").innerHTML = content;
    } else {
        console.error("An error occured during writeCookiesInfo - element sctCookiesInfos not found");
    }
}