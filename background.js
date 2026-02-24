// Tailwind CSS Lookup — Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      settings: {
        enabled: true,
        inspectMode: false,
        showOnHover: true,
        theme: 'auto',
      },
    });
  }
});

// Toggle inspect mode from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_INSPECT') {
    // Forward to content script in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_INSPECT',
          enabled: message.enabled,
        });
      }
    });
    sendResponse({ ok: true });
  }
  return false;
});
