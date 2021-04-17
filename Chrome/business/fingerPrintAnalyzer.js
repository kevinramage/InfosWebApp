class FingerPrintAnalyzer {
    constructor(db, application) {
        this.db = db;
        this.application = application;
        this.acceptRanges = [];
        this.contentType = [];
        this.eTag = [];
    }

    init() {
        const promises = [
            this.loadAcceptRanges(),
            this.loadContentType(),
            this.loadETag()
        ];
        return Promise.all(promises);
    }

    loadAcceptRanges() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/headers/acceptRanges.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.acceptRanges = data;
                resolve();
            });
        });
    }

    loadContentType() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/headers/contentType.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.contentType = data;
                resolve();
            });
        });
    }

    loadETag() {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL('data/headers/eTag.json');
            fetch(url).then((res) => {
                return res.json();
            }).then(data => {
                this.eTag = data;
                resolve();
            });
        });
    }

    run(headers) {
        this.analyze(headers, "accept-ranges", this.acceptRanges);
        this.analyze(headers, "content-type", this.contentType);
        this.analyze(headers, "etag", this.eTag);
        this.update();
    }

    update() {
        this.application.fingerPrints.forEach(f => {
            this.db.put("fingerprints", f, f.key);
        });
    }

    analyze(headers, headerName, values) {

        // Identify applications linked to header
        let result = this.analyzeHeaderValue(headers, headerName, values);
        const applications = result.map(r => { return r.application + ":" + r.version; });

        // Create a fingerprint
        const fingerPrint = new FingerPrint();
        fingerPrint.key = headerName;
        fingerPrint.applications = applications;
        this.application.addFingerPrint(fingerPrint);
    }

    analyzeHeaderValue(headers, headerName, values) {
        const header = headers.find(h => { return h.name.toLowerCase() == headerName; });
        if (header) {
            return values.filter(v => {
                const regex = new RegExp(v.value);
                return regex.exec(header.value) !== undefined;
            });
        } else {
            return values.filter(v => { v.value === null });
        }
    }
}