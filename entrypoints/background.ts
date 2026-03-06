export default defineBackground(() => {
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      browser.storage.sync.set({
        settings: {
          enabled: true,
          inspectMode: false,
          showOnHover: true,
          theme: 'auto',
        },
      });
    }
  });

  // Forward inspect toggle from popup to content script in active tab
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_INSPECT') {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]?.id) {
          browser.tabs.sendMessage(tabs[0].id, {
            type: 'TOGGLE_INSPECT',
            enabled: message.enabled,
          });
        }
      });
    }
  });
});
