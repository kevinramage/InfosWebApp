class Application {
    constructor(){
        this.domain = "";
        this.title = "";
        this.description = "";
        this.keywords = "";
        this.libs = [];
        this.technologies = [];
        this.cookies = [];
        this.urls = [];
        this.languages = [];
        this.fingerPrints = [];
    }

    read(db) {
        return new Promise(async resolve => {
            await this.readApplicationInfo(db);
            await this.readTechnologies(db);
            await this.readLibs(db);
            await this.readCookies(db);
            resolve();
        });
    }

    readApplicationInfo(db) {
        return new Promise((resolve) => {
            db.getAll("application").then(applications => {
                if (applications && applications.length > 0) {
                    this.description = applications[0].description;
                    this.domain  = applications[0].domain;
                    this.title = applications[0].title;
                    this.keywords = applications[0].keywords;
                }
                resolve();
            });
        });
    }

    readTechnologies(db) {
        return new Promise((resolve) => {
            db.getAll("technologies").then(technologies => {
                technologies.forEach(data => {
                    const technology = new Technology();
                    technology.name = data.name;
                    technology.version = data.version;
                    technology.versionDetails = data.versionDetails;
                    technology.category = data.category;
                    this.technologies.push(technology);
                });
                resolve();
            });
        });
    }

    readLibs(db) {
        return new Promise((resolve) => {
            db.getAll("libs").then(libs => {
                libs.forEach(data => {
                    const lib = new Lib();
                    lib.name = data.name;
                    lib.checksum = data.checksum;
                    lib.technology = data.technology;
                    lib.version = data.version;
                    lib.versionDetails = data.versionDetails;
                    lib.url = data.url;
                    this.libs.push(lib);
                });
                resolve();
            });
        });
    }

    readCookies(db) {
        return new Promise((resolve) => {
            db.getAll("cookies").then(cookies => {
                cookies.forEach(data => {
                    const cookie = new Cookie();
                    cookie.cookieName = data.cookieName;
                    cookie.expires = data.expires;
                    cookie.maxAge = data.maxAge;
                    cookie.domain = data.domain;
                    cookie.path = data.path;
                    cookie.secure = data.secure;
                    cookie.httpOnly = data.httpOnly;
                    cookie.sameSite = data.sameSite;
                    cookie.sessionIdLength = data.sessionIdLength;
                    this.cookies.push(cookie);
                });
                resolve();
            });
        });
    }

    addLib(lib) {
        const exists = this.existsLib(lib);
        if (!exists) {
            this.libs.push(lib);
        }
    }

    existsLib(lib) {
        return !!this.libs.find(l => { return lib.name && l.name.toLowerCase() == lib.name.toLowerCase(); })
    }

    addTechnology(technology) {
        const exists = this.existsTechnology(technology);
        if (!exists) {
            this.technologies.push(technology);
        }
    }

    existsTechnology(technology) {
        return !!this.technologies.find(t => { return technology.name && t.name.toLowerCase() == technology.name.toLowerCase(); })
    }

    addCookie(cookie) {
        const exists = this.existsCookie(cookie);
        if (!exists) {
            if (cookie.domain == "") {
                cookie.domain = this.domain;
            }
            this.cookies.push(cookie);
        }
    }

    existsCookie(cookie) {
        return !!this.cookies.find(c => { return cookie.cookieName && c.cookieName.toLowerCase() == cookie.cookieName.toLowerCase(); })
    }

    addLanguage(language) {
        const exists = this.existsLanguage(language);
        if (!exists) {
            this.languages.push(language);
        }
    }

    existsLanguage(language) {
        return !!this.languages.find(l => { return l.toLowerCase() == language.toLowerCase(); })
    }

    addUrl(url) {
        const exists = this.existsUrl(url);
        if (!exists) {
            this.urls.push(url);
        }
    }

    existsUrl(url) {
        return !!this.urls.find(u => { return u.toLowerCase() == url.toLowerCase(); })
    }

    addFingerPrint(fingerPrint) {
        const exists = this.existsFingerPrint(fingerPrint);
        if (!exists) {
            this.fingerPrints.push(fingerPrint);
        }
    }

    existsFingerPrint(fingerPrint) {
        return !!this.fingerPrints.find(f => { return f.key == fingerPrint.key; })
    }
}

class Lib {
    constructor() {
        this.name = "";
        this.checksum = "";
        this.technology = "";
        this.version = "";
        this.versionDetails = "";
        this.url = "";
    }
}

class Technology {
    constructor() {
        this.name = "";
        this.version = "";
        this.versionDetails = "";
        this.category = "";
    }
}

class Cookie {
    constructor() {
        this.cookieName = "";
        this.expires = "Session";
        this.maxAge = "";
        this.domain = "";
        this.path = "";
        this.secure = false;
        this.httpOnly = false;
        this.sameSite = "";
        this.sessionIdLength = 0;
    }

    fromString(setCookieHeader) {
        const args = setCookieHeader.split(";");
        if (args.length > 0) {
            if (args[0].indexOf("=") > -1) {
            this.cookieName = args[0].split("=")[0].trim();
            const cookieValue = args[0].split("=")[1].trim();
            this.sessionIdLength = cookieValue.length;
            } else {
                console.error("An error occured during fromString - not equals symbol: " + args[0]);
            }
        } else {
            console.error("An error occured during fromString - Invalid args: " + args);
        }
        for (var i = 1; i < args.length; i++) {
            if (args[i].includes("=")) {
                const headerName = args[i].split("=")[0].toLowerCase().trim();
                const headerValue = args[i].split("=")[1];
                switch (headerName) {
                    case "expires": this.expires = headerValue; break;
                    case "max-age": this.maxAge = headerValue; break;
                    case "domain": this.domain = headerValue; break;
                    case "path": this.path = headerValue; break;
                    case "samesite": this.sameSite = headerValue; break;
                }

            } else if (args[i].trim().toLowerCase() == "secure") {
                this.secure = true;

            } else if (args[i].trim().toLowerCase() == "httponly") {
                this.httpOnly = true;
            }
        }
    }
}

class FingerPrint {
    constructor() {
        this.key = "";
        this.applications = "";
    }
}