const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;

browser.storage.sync.get('settings').then((data) => {
  const settings = (data.settings as { enabled: boolean }) || { enabled: true };
  enabledCheckbox.checked = settings.enabled;
});

document.getElementById('save')!.addEventListener('click', () => {
  browser.storage.sync.set({
    settings: { enabled: enabledCheckbox.checked },
  }).then(() => {
    const status = document.getElementById('status')!;
    status.textContent = 'Saved!';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
});
