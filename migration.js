chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message === 'getRulesetsFromLS') {
            var oldRS = localStorage.getItem('rulesets');
            sendResponse(oldRS);
        } else if (message === 'removeRulesetsFromLS') {
            localStorage.removeItem('rulesets');
            localStorage.removeItem('version');
            localStorage.removeItem('showChangelog');
            sendResponse(true);
        }
    }
);
