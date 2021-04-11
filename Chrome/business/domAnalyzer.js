class DomAnalyzer {
    constructor(db, application) {
        this.db = db;
        this.application = application;
        this.libsInfo = [];
    }

    init() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/libs.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.libsInfo = data;
                resolve();
            });
        });
    }

    async run() {
        await this.init();
        this.analyzeInfos();
        this.analyzeLibs();
    }

    analyzeInfos() {
        const data = this.getInfos();
        this.db.put("application", data, data.domain);
    }

    getInfos() {
        this.application.domain = window.location.host;
        this.application.title = document.title;
        const metaDescription = document.getElementsByTagName("meta").Description;
        if (metaDescription) {
            this.application.description = metaDescription.getAttribute("content");
        }
        const metaKeywords = document.getElementsByTagName("meta").Keywords;
        if (metaKeywords) {
            this.application.description = metaKeywords.getAttribute("content");
        }
        return {
            "domain": this.application.domain,
            "title": this.application.title,
            "description": this.application.description,
            "keywords": this.application.keywords
        }
    }

    async analyzeLibs() {
        const libs = await this.getLibs();
        libs.forEach(lib => {
            this.db.put("libs", lib, lib.name);
        });
        this.application.technologies.forEach(technology => {
            this.db.put("technologies", technology, technology.name);
        });
    }

    getLibs() {
        return new Promise((resolve) => {

            // Download source code presents in 
            const scriptsTag = Array.from(document.getElementsByTagName("script"));
            const scriptsUrl = scriptsTag.filter(s => { return s.src.endsWith("js") }).map(s => { return s.src; });
            const requests = scriptsUrl.map(s => { return fetch(s); });
            Promise.all(requests).then(data => {
                const promises = data.map(d => { return d.text() });
                Promise.all(promises).then(texts => {
                    texts.forEach((value, index) => {
                        const content = value.trim();

                        // Compute source code hash
                        const checksum = sjcl.hash.sha256.hash(content);
                        const sha256 = sjcl.codec.hex.fromBits(checksum);

                        // Compute name
                        const url = new URL(scriptsUrl[index]);
                        let name = url.pathname;
                        const i = url.pathname.lastIndexOf("/");
                        if (i > -1) { name = url.pathname.substr(i+1); }

                        // Add library to array
                        const lib = new Lib();
                        lib.name = name;
                        lib.url = scriptsUrl[index];
                        lib.checksum = sha256;
                        this.getLibInfos(lib);
                        this.application.addLib(lib);
                    });
                    resolve(this.application.libs);
                });
            });
        })
    }

    getLibInfos(lib) {
        const libFound = this.libsInfo.find(l => { return l.checksum == lib.checksum; });
        if (libFound) {

            // Update library
            lib.technology = libFound.name;
            lib.version = libFound.version;
            lib.versionDetails = libFound.versionDetails;

            // Add technology
            const technology = new Technology();
            technology.name = libFound.name;
            technology.version = libFound.version;
            technology.versionDetails = libFound.versionDetails;
            this.application.addTechnology(technology);
        }
    }
}