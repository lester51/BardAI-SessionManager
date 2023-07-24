let stringToBlob = function (str, mimetype) {
    let raw = str;
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    let bb = new Blob([uInt8Array.buffer], {
        type: mimetype
    });
    return bb;
};

function bardCookies(){
    function toastNotification(message) {
        let x = document.getElementById("snackbar");
	    x.addEventListener("click", function() {
			x.className = x.className.replace("show", "");
		});
        x.innerHTML = message;
        x.className = "show";
        setTimeout(function () {
		    x.className = x.className.replace("show", "");
        }, 3000);
    }
    chrome.tabs.executeScript({
        code: 'performance.getEntriesByType("resource").map(e => e.name)',
    }, data => {
        if (chrome.runtime.lastError || !data || !data[0]) return;
        let urls = data[0].map(url => url.split(/[#?]/)[0]);
        let uniqueUrls = [...new Set(urls).values()].filter(Boolean);
        Promise.all(uniqueUrls.map(url =>new Promise(resolve => {
            chrome.cookies.getAll({url}, resolve);
        }))).then(results => {
                let session = [
                    ...new Map([].concat(...results).map(c => [JSON.stringify(c), c])).values()
                ];
                session = session.filter(e=>e.name==='__Secure-1PSID')
                let cookies = JSON.stringify(session,null,4);
                cooki = document.getElementById("cookies");
                cooki.value = cookies;
                let btnCopy = document.getElementById("btnCopy");
                let btnDownload = document.getElementById("btnDownload");
                btnCopy.onclick = function () {
                    cooki.select();
                    document.execCommand("copy");
                    toastNotification('Success! The BardAI Session was copied to your clipboard!');
                };
                btnDownload.onclick = function () {
                    let blob = stringToBlob(cookies, "application/json");
                    let url = window.webkitURL || window.URL || window.mozURL || window.msURL;
                    let a = document.createElement('a');
                    a.download = 'bardSession.json';
                    a.href = url.createObjectURL(blob);
                    a.textContent = '';
                    a.dataset.downloadurl = ['json', a.download, a.href].join(':');
                    a.click();
                    toastNotification('Success! The BardAI Session was downloaded ' + a.download);
                    a.remove();
                };
         });
    });
}
window.onload=bardCookies;