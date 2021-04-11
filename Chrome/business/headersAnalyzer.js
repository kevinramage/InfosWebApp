class HeadersAnalyzer {
    constructor(db, application) {
        this.db = db;
        this.application = application;
        this.customHeaders = [];
        this.serverHeaders = ["x-powered-by", "server", "via", "x-turbo-charged-by", "x-powered-by-plesk", "x-cdn", "x-server-powered-by"];
        this.classicalCookies = [];
        this.classicalExtensions = [];
    }

    init() {
        const promises = [ 
            this.initHeaders(),
            this.initCookies(),
            this.initExtensions()
        ];
        return new Promise.all(promises);
    }

    initHeaders() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/headers.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.headers = data;
                resolve();
            });
        });
    }

    initCookies() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/cookies.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.classicalCookies = data;
                resolve();
            });
        });
    }

    initExtensions() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/extensions.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.classicalExtensions = data;
                resolve();
            });
        });
    }

    async run(headers) {
        await this.init();
        if (headers) {
            this.analyzeCustomHeaders(headers);
            this.analyzeServerHeaders(headers);
            this.analyzeASPNetHeader(headers);
            this.analyzeSetCookieHeaders(headers);
            this.addUrls(headers);
            this.analyseCookies();
            this.analyseExtensions();
            this.update();
        }
    }

    analyzeCustomHeaders(headers) {
        headers.forEach(header => {
            const customHeader = this.customHeaders.find(h => { return header.name.toLowerCase() == h.headerName; });
            if (customHeader) {
                const technology = new Technology();
                technology.name = customHeader.headerValue;
                this.application.addTechnology(technology);
            }
        });
    }

    analyzeServerHeaders(headers) {
        headers.forEach(header => {
            const serverHeader = this.serverHeaders.find(h => { return header.name.toLowerCase() == h; });
            if (serverHeader) {

                // Create technology
                const technology = new Technology();
                technology.name = header.value;

                // Detect name with a regex
                const regex = /(?<app>[\w\-_\+\-'@\.%$&]+?)\/(?<version>[0-9]+(\.[0-9]+)*)\s*(\((?<details>.+)\))?/g;
                const match = regex.exec(header.value);
                if (match && match.groups) {
                    technology.name = match.groups.app;
                    technology.version = match.groups.version;
                    if (match.groups.details) {
                        technology.versionDetails = match.groups.details;
                    }
                }
                
                // Add technology
                this.application.addTechnology(technology);
            }
        });
    }

    analyzeASPNetHeader(header) {

        // x-aspnet-version
        let serverHeader = headers.find(header => { return header.name.toLowerCase() == "x-aspnet-version" });
        if (serverHeader) {

            // Create technology
            const technology = new Technology();
            technology.name = "ASP.net";
            
            // Detect version
            const regex = /(?<version>[0-9]+(\.[0-9]+)*)/g;
            const match = regex.exec(header.value);
            if (match && match.groups) {
                technology.verson = match.groups.version;
            }
            
            // Add technology
            this.application.addTechnology(technology);
        }

        // x-aspnetmvc-version
        serverHeader = headers.find(header => { return header.name.toLowerCase() == "x-aspnetmvc-version" });
        if (serverHeader) {

            // Create technology
            const technology = new Technology();
            technology.name = "ASP.net MVC";
            
            // Detect version
            const regex = /(?<version>[0-9]+(\.[0-9]+)*)/g;
            const match = regex.exec(header.value);
            if (match && match.groups) {
                technology.verson = match.groups.version;
            }
            
            // Add technology
            this.application.addTechnology(technology);
        }
        
    }

    analyzeSetCookieHeaders(headers) {
        const setCookieHeader = headers.find(h => { return h.name && h.name.toLowerCase() == "set-cookie" });
        if (setCookieHeader){
            
            // Add cookie
            const cookie = new Cookie();
            cookie.fromString(setCookieHeader.value);
            this.application.addCookie(cookie);
        }
    }

    addUrls(headers) {
        this.application.addUrl(headers.url);
    }

    analyseCookies() {
        this.application.cookies.forEach(cookie => {
            const cookieIdentified = this.classicalCookies.find(c => { return cookie.cookieName && c.name.toLowerCase() == cookie.cookieName.toLowerCase() });
            if ( cookieIdentified ) {
                this.application.addLanguage(cookieIdentified.language);
            }
        });
    }

    analyseExtensions() {
        this.application.urls.forEach(url => {
            const extensionIdentified = this.classicalExtensions.find(c => { return url.toLowerCase().endsWith(c.extension.toLowerCase()); });
            if ( extensionIdentified ) {
                this.application.addLanguage(extensionIdentified.language);
            }
        });
    }

    update() {
        this.updateTechnologies();
        this.updateCookies();
        this.updateLanguages();
        this.updateURLs();
    }

    updateTechnologies() {
        this.application.technologies.forEach(technology => {
            this.db.put("technologies", technology, technology.name);
        });
    }

    updateCookies() {
        this.application.cookies.forEach(cookie => {
            this.db.put("cookies", cookie, cookie.cookieName);
        });
    }

    updateLanguages() {
        this.application.languages.forEach(language => {
            this.db.put("languages", language, language);
        });
    }

    updateURLs() {
        this.application.urls.forEach(url => {
            this.db.put("urls", url, url);
        });
    }
}