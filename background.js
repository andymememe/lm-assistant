browser.action.onClicked.addListener(() => {
    browser.sidebarAction.open();
});

browser.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.action === "getHightlighted") {
        let highlighted = browser.tabs.query({ currentWindow: true, active: true })
            .then(tabs => {
                return browser.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        return window.getSelection().toString();
                    }
                }).then(res => {
                    if (res && res.length > 0 && res[0]) {
                        return res[0].result.trim();
                    }
                    return "";
                }, console.error);
            }, console.error);
        highlighted.then(text => {
            sendResponse({ highlighted: text });
        }, _ => {
            sendResponse({ highlighted: "" });
        })
    }
    return true;
});