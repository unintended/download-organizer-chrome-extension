// Migration script for localStorage to chrome.storage.local
chrome.runtime.onMessage.addListener(
  (
    message: string,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (message === 'getRulesetsFromLS') {
      const oldRS = localStorage.getItem('rulesets');
      sendResponse(oldRS);
    } else if (message === 'removeRulesetsFromLS') {
      localStorage.removeItem('rulesets');
      localStorage.removeItem('version');
      localStorage.removeItem('showChangelog');
      sendResponse(true);
    }
  }
);