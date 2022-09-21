// ==UserScript==
// @name         Google Images All Sizes
// @version      1.8.0
// @description  Adds 'All Sizes' and 'Full Size' buttons to google images.
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @license      MIT
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @match        *://www.google.com/search*tbm=isch*
// @match        *://www.google.com.eg/search*tbm=isch*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Nourz1234/google-images-all-sizes/master/dist/google-images-all-sizes.js
// @downloadURL  https://raw.githubusercontent.com/Nourz1234/google-images-all-sizes/master/dist/google-images-all-sizes.js
// @supportURL   https://github.com/Nourz1234/google-images-all-sizes/issues
// @grant        none
// ==/UserScript==

// extensions.ts
Array.prototype._first = function () {
    return this[0];
};
Array.prototype._firstOr = function (defaultValue) {
    return this.length ? this[0] : defaultValue;
};
Array.prototype._last = function () {
    return this[this.length - 1];
};
Array.prototype._lastOr = function (defaultValue) {
    return this.length ? this[this.length - 1] : defaultValue;
};
Array.prototype._removeAt = function (index) {
    return this.splice(index, 1)[0];
};
Array.prototype._insertAt = function (index, ...items) {
    this.splice(index, 0, ...items);
};
Array.prototype._remove = function (item) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
    }
};
// 'Object.prototype' seems to be special.
// can only add non-enumerable properties using 'Object.defineProperty'
// otherwise pages that use jQuery break. ¯\_(ツ)_/¯
Object.defineProperty(Object.prototype, "_entries", {
    enumerable: false, configurable: true,
    value: function () {
        return Object.entries(this);
    }
});
Object.defineProperty(Object.prototype, "_update", {
    enumerable: false, configurable: true,
    value: function (...sources) {
        return Object.assign(this, ...sources);
    }
});
String.prototype._removePrefix = function (prefix) {
    let str = this;
    while (str.startsWith(prefix))
        str = str.substring(prefix.length);
    return str;
};
String.prototype._removeSuffix = function (suffix) {
    let str = this;
    while (str.endsWith(suffix))
        str = str.substring(0, str.length - suffix.length);
    return str;
};
String.prototype._padd = function (char, length) {
    return (char.repeat(length) + this).slice(-Math.max(this.length, length));
};
// Utils.ts
// url and url params manipulation
function getQueryParams(url) {
    return Array.from(new URL(url).searchParams.entries());
}
function setQueryParams(url, params) {
    let oUrl = new URL(url);
    let searchParams = new URLSearchParams();
    for (let [name, value] of params) {
        searchParams.append(name, value);
    }
    oUrl.search = searchParams.toString();
    return oUrl.toString();
}
function getQueryParam(url, param, defValue = null) {
    let params = new URL(url).searchParams;
    return params.has(param) ? params.get(param) : defValue;
}
function setQueryParam(url, param, value) {
    let oUrl = new URL(url);
    oUrl.searchParams.set(param, value);
    return oUrl.toString();
}
function getCurrentQueryParams() {
    return getQueryParams(window.location.href);
}
// DOM stuff
function isTopFrame(win = window) {
    return win === win.parent;
}
function isElementVisible(elem) {
    return elem.offsetParent !== null;
}
function getElementOwnText(elem) {
    let text = '';
    for (let node of elem.childNodes) {
        if (node.nodeName === '#text') {
            text += node.nodeValue;
        }
    }
    return text;
}
function createElementFromHTML(html) {
    let temp = document.createElement("div");
    temp.innerHTML = html;
    let elem = temp.firstElementChild;
    if (elem)
        temp.removeChild(elem);
    return elem;
}
// react helper
class ReactHelper {
    static setInputValue(input, value) {
        let proto = Object.getPrototypeOf(input);
        let valuePD = Object.getOwnPropertyDescriptor(proto, 'value');
        valuePD?.set?.call(input, value);
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
// time
function dateSubDays(date, days) {
    let newDate = new Date();
    newDate.setTime(date.getTime() - (days * (24 * 60 * 60 * 1000)));
    return newDate;
}
// async stuff
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
async function waitUntil(condition, timeoutMs = 0, intervalMs = 100) {
    let startTime = new Date();
    while (!condition()) {
        if (timeoutMs > 0) {
            let elapsed = Date.now() - startTime.getTime();
            if (elapsed > timeoutMs)
                return false;
        }
        await sleep(intervalMs);
    }
    return true;
}
async function poll(getter, condition, timeoutMs = 0, intervalMs = 100) {
    let startTime = new Date();
    let value;
    while (!condition(value = getter())) {
        if (timeoutMs > 0) {
            let elapsed = Date.now() - startTime.getTime();
            if (elapsed > timeoutMs)
                return null;
        }
        await sleep(intervalMs);
    }
    return value;
}
// csv
function csvEscape(string, always_quote = false) {
    const escape_chars = [',', '"', '\r', '\n'];
    let wrap_in_quotes = always_quote ? true : escape_chars.some(x => string.includes(x));
    string = string.replace('"', '""'); // escape double qoutes
    return wrap_in_quotes ? `"${string}"` : string;
}
function csvFromArray(array, eol = '\r\n', always_quote = false) {
    return array.map(row => row.map(cell => csvEscape(cell, always_quote)).join(",")).join(eol);
}
function csvToArray(string, eol = '\r\n') {
    let escape = (string) => string.replaceAll(',', '<COMMA>')
        .replaceAll('\r', '<CR>')
        .replaceAll('\n', '<LF>');
    let unescape = (string) => string.replaceAll('<COMMA>', ',')
        .replaceAll('<CR>', '\r')
        .replaceAll('<LF>', '\n');
    string = string.replaceAll(/"((?:[^"]|"")*)(?:"|$)/gs, (_match, group1) => group1 !== undefined ? escape(group1) : '').replaceAll('""', '"'); // unescape double qoutes
    return string.split(eol).map(row => row.split(',').map(unescape));
}
// misc
function hasKey(obj, key) {
    return key in obj;
}
function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// an alternative to the deprecated "unescape()" function
// apparently it can be dropped anytime
function _unescape(string) {
    return string.replace(/(?<=%)[0-9a-f]{2}/gi, (match) => {
        return String.fromCharCode(parseInt(match, 16));
    });
}
function base64Encode(string) {
    return window.btoa(_unescape(encodeURIComponent(string)));
}
function downloadFile(filename, textContent, mimeType) {
    let elem = document.createElement('a');
    elem.href = `data:${mimeType};base64;,` + base64Encode(textContent);
    elem.download = filename;
    elem.style.display = 'none';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

let FILES = {};

(() => {
    const LocalizedStrings = {
        'en': {
            allSizes: 'All sizes',
            btnAllSizes: 'All Sizes',
            btnFullSize: 'Full Size'
        },
        'ar': {
            allSizes: '\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u062D\u062C\u0627\u0645'
        }
    };
    const DefaultStrings = LocalizedStrings.en;
    let strings;
    let fail = false;
    let error = (...data) => {
        console.error("Google Images All Sizes:", ...data);
        fail = true;
        alert("Google Images All Sizes:\nan error occurred. try refreshing, if this doesn't work then all you can do is wait for an update to fix this. (which might not happen so soon xD)");
    };
    function getPreviewImageUrl() {
        for (let img of document.querySelectorAll("img[jsname='HiaYvf']")) {
            if (isElementVisible(img)) {
                return img.src;
            }
        }
        return null;
    }
    function openImageInFullSize() {
        let imgUrl = getPreviewImageUrl();
        if (imgUrl !== null)
            window.open(imgUrl, '_blank');
        throw new Error("testter");
    }
    async function viewAllSizes() {
        let btnViewAllSizes = this;
        let timerID = setInterval(() => {
            if (btnViewAllSizes.textContent?.endsWith('...')) {
                btnViewAllSizes.textContent = btnViewAllSizes.textContent.slice(0, -3);
            }
            else {
                btnViewAllSizes.textContent += '.';
            }
        }, 300);
        let imageUrl = getPreviewImageUrl();
        if (imageUrl === null)
            return;
        let responseHTML;
        if (imageUrl.startsWith("data:")) {
            let url = "/searchbyimage/upload";
            let imgBlob = await fetch(imageUrl).then(x => x.blob());
            let formData = new FormData();
            formData.append("image_url", "");
            formData.append("encoded_image", imgBlob);
            formData.append("image_content", "");
            formData.append("filename", "");
            responseHTML = await fetch(url, {
                method: "POST",
                body: formData
            }).then(x => x.text());
        }
        else {
            let url = new URL('/searchbyimage', window.location.href);
            url.searchParams.append("image_url", imageUrl);
            url.searchParams.append("encoded_image", "");
            url.searchParams.append("image_content", "");
            url.searchParams.append("filename", "");
            responseHTML = await fetch(url.href).then(x => x.text());
        }
        let doc = document.implementation.createHTMLDocument();
        doc.open();
        doc.write(responseHTML);
        doc.close();
        let allSizes = strings.allSizes || DefaultStrings.allSizes;
        let allSizesLink = Array.from(doc.getElementsByTagName('a'))
            .find(x => x.textContent == allSizes)?.href;
        if (allSizesLink)
            window.open(allSizesLink, '_blank');
        clearInterval(timerID);
        while (btnViewAllSizes.textContent?.endsWith('.')) {
            btnViewAllSizes.textContent = btnViewAllSizes.textContent.slice(0, -1);
        }
    }
    // because google likes to be an ass we need to catch errors occurring inside event handlers
    // and log them manually otherwise the errors go poof!
    // that is the whole purpose of this function
    function evtHandler(func) {
        return function (...args) {
            try {
                func.bind(this)(...args);
            }
            catch (e) {
                error(e);
            }
        };
    }
    function addButtons() {
        if (fail)
            return;
        if (!strings) {
            let lang = WIZ_global_data?.GWsdKe;
            if (!lang) {
                error("couldn't identify the language.");
                return;
            }
            if (!hasKey(LocalizedStrings, lang)) {
                fail = true;
                alert("Google Images All Sizes:\nlanguage not supported.");
                return;
            }
            strings = LocalizedStrings[lang];
        }
        let btnBars = document.querySelectorAll('div[jsname="ZE6Ufb"]:not(:empty)');
        for (let btnBar of btnBars) {
            let btnOpenImageInFullSize = btnBar.querySelector('#MyCustomLink_OpenImageInFullSize');
            let btnViewAllSizes = btnBar.querySelector('#MyCustomLink_ViewAllSizes');
            if (btnOpenImageInFullSize !== null || btnViewAllSizes !== null)
                return;
            // create a button template
            let btnTemplate = document.createElement('a');
            // mimic google's button style
            btnTemplate.className = 'CqeZic ZAxeoe';
            btnTemplate.style.textDecoration = 'none';
            btnTemplate.style.color = 'white';
            btnTemplate.style.width = 'auto';
            btnTemplate.style.maxHeight = '36px';
            btnTemplate.style.margin = '6px';
            btnTemplate.style.padding = '0 8px';
            btnOpenImageInFullSize = btnTemplate.cloneNode(true);
            btnViewAllSizes = btnTemplate.cloneNode(true);
            btnOpenImageInFullSize.id = 'MyCustomLink_OpenImageInFullSize';
            btnOpenImageInFullSize.textContent = strings.btnFullSize || DefaultStrings.btnFullSize;
            btnViewAllSizes.id = 'MyCustomLink_ViewAllSizes';
            btnViewAllSizes.textContent = strings.btnAllSizes || DefaultStrings.btnAllSizes;
            btnOpenImageInFullSize.addEventListener("click", evtHandler(openImageInFullSize));
            btnViewAllSizes.addEventListener("click", evtHandler(viewAllSizes));
            btnBar.insertAdjacentElement('afterbegin', btnOpenImageInFullSize);
            btnOpenImageInFullSize.insertAdjacentElement('afterend', btnViewAllSizes);
        }
    }
    addButtons();
    let observer;
    observer = new MutationObserver(addButtons);
    observer.observe(document.body, { attributes: true, subtree: true });
})();
