
(() => {
    const { hasKey, isElementVisible } = NourzUtils;

    type Strings = {
        allSizes?: string,
        btnAllSizes?: string,
        btnFullSize?: string
    }
    const LocalizedStrings = {
        'en': <Strings>{
            allSizes: 'All sizes',
            btnAllSizes: 'All Sizes',
            btnFullSize: 'Full Size'
        },
        'ar': <Strings>{
            allSizes: '\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u062D\u062C\u0627\u0645'
        }
    };
    const DefaultStrings = LocalizedStrings.en;
    let strings: Strings;
    
    let fail = false;

    type ErrorType = typeof console.error;
    let error: ErrorType = (...data: any[]) => {
        console.error("Google Images All Sizes:", ...data);
        fail = true;
        alert("Google Images All Sizes:\nan error occurred. try refreshing, if this doesn't work then all you can do is wait for an update to fix this. (which might not happen so soon xD)");
    }

    function getPreviewImageUrl() {
        for (let img of document.querySelectorAll<HTMLImageElement>("img[jsname='HiaYvf']"))
        {
            if (isElementVisible(img))
            {
                return img.src;
            }
        }
        return null;
    }
    
    function openImageInFullSize() {
        let imgUrl = getPreviewImageUrl();
        if (imgUrl !== null)
            window.open(imgUrl, '_blank');
    }
    
    async function viewAllSizes() {
        let btnViewAllSizes: HTMLAnchorElement = this;
        let timerID = setInterval(() => {
            if (btnViewAllSizes.textContent?.endsWith('...'))
            {
                btnViewAllSizes.textContent = btnViewAllSizes.textContent.slice(0, -3);
            }
            else
            {
                btnViewAllSizes.textContent += '.';
            }
        }, 300);
    
        let imageUrl = getPreviewImageUrl();
        if (imageUrl === null) return;
    
        let responseHTML;
        if (imageUrl.startsWith("data:"))
        {
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
        else
        {
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

        let allSizes = strings.allSizes || DefaultStrings.allSizes as string;
        let allSizesLink = Array.from(doc.getElementsByTagName('a'))
            .find(x => x.textContent == allSizes)?.href

        if (allSizesLink)
            window.open(allSizesLink, '_blank');
    
        clearInterval(timerID);
        while (btnViewAllSizes.textContent?.endsWith('.'))
        {
            btnViewAllSizes.textContent = btnViewAllSizes.textContent.slice(0, -1);
        }
    }
    
    // because google likes to be an ass we need to catch errors occurring inside event handlers
    // and log them manually otherwise the errors go poof!
    // that is the whole purpose of this function
    function evtHandler(func: CallableFunction) {
        return function (...args: any[])
        {
            try { func.bind(this)(...args); }
            catch (e) { error(e); }
        };
    }
    
    function addButtons () {
        if (fail) return;

        if (!strings)
        {
            let lang = WIZ_global_data?.GWsdKe;
            if (!lang)
            {
                error("couldn't identify the language.");
                return;
            }
            if (!hasKey(LocalizedStrings, lang))
            {
                fail = true;
                alert("Google Images All Sizes:\nlanguage not supported.");
                return;
            }
            strings = LocalizedStrings[lang];
        }

        let btnBars = document.querySelectorAll<HTMLElement>('div[jsname="ZE6Ufb"]:not(:empty)');
        for (let btnBar of btnBars)
        {
            let btnOpenImageInFullSize = btnBar.querySelector<HTMLAnchorElement>('#MyCustomLink_OpenImageInFullSize');
            let btnViewAllSizes = btnBar.querySelector<HTMLAnchorElement>('#MyCustomLink_ViewAllSizes');
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

            btnOpenImageInFullSize = btnTemplate.cloneNode(true) as HTMLAnchorElement;
            btnViewAllSizes = btnTemplate.cloneNode(true) as HTMLAnchorElement;

            btnOpenImageInFullSize.id = 'MyCustomLink_OpenImageInFullSize';
            btnOpenImageInFullSize.textContent = strings.btnFullSize || DefaultStrings.btnFullSize as string;
            btnViewAllSizes.id = 'MyCustomLink_ViewAllSizes';
            btnViewAllSizes.textContent = strings.btnAllSizes || DefaultStrings.btnAllSizes as string;

            btnOpenImageInFullSize.addEventListener("click", evtHandler(openImageInFullSize));
            btnViewAllSizes.addEventListener("click", evtHandler(viewAllSizes));
    
            btnBar.insertAdjacentElement('afterbegin', btnOpenImageInFullSize);
            btnOpenImageInFullSize.insertAdjacentElement('afterend', btnViewAllSizes);
        }
    }


    addButtons();
    
    let observer;
    observer = new MutationObserver(addButtons);
    observer.observe(document.body, {attributes: true, subtree: true});
})();



