// Tailwind CSS Lookup — Options page script

document.addEventListener('DOMContentLoaded', () => {
  const enabledCheckbox = document.getElementById('enabled');

  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || { enabled: true };
    enabledCheckbox.checked = settings.enabled;
  });

  document.getElementById('save').addEventListener('click', () => {
    chrome.storage.sync.set(
      {
        settings: {
          enabled: enabledCheckbox.checked,
        },
      },
      () => {
        const status = document.getElementById('status');
        status.textContent = 'Saved!';
        setTimeout(() => {
          status.textContent = '';
        }, 2000);
      }
    );
  });
});
