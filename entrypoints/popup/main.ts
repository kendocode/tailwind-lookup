import { searchClasses } from '@/utils/tailwind';

let classDb: Record<string, string> | null = null;
let inspectActive = false;

const searchInput = document.getElementById('search') as HTMLInputElement;
const resultsDiv = document.getElementById('results')!;
const inspectBtn = document.getElementById('inspect-btn')!;
const pageSummary = document.getElementById('page-summary')!;

// Load class database
fetch(browser.runtime.getURL('/data/tailwind-classes.json'))
  .then((resp) => resp.json())
  .then((db) => { classDb = db; })
  .catch(() => { classDb = {}; });

// Search handler
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    resultsDiv.innerHTML = '';
    return;
  }
  renderResults(query);
});

// Inspect button
inspectBtn.addEventListener('click', () => {
  inspectActive = !inspectActive;
  inspectBtn.classList.toggle('active', inspectActive);
  inspectBtn.textContent = inspectActive ? 'Stop Inspecting' : 'Inspect Element';

  browser.runtime.sendMessage({
    type: 'TOGGLE_INSPECT',
    enabled: inspectActive,
  });

  if (inspectActive) {
    setTimeout(() => window.close(), 200);
  }
});

// Page class summary
browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  if (tab?.id) {
    browser.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CLASSES' }).then((response) => {
      const classes = response?.classes || [];
      if (classes.length > 0) {
        pageSummary.innerHTML = `<span class="page-summary-count">${classes.length}</span> unique Tailwind classes on this page`;
      } else {
        pageSummary.innerHTML = 'No Tailwind classes detected on this page';
      }
    }).catch(() => {
      pageSummary.innerHTML = '<em>Reload page to enable inspection</em>';
    });
  }
});

// Options link
document.getElementById('options-link')!.addEventListener('click', (e) => {
  e.preventDefault();
  browser.runtime.openOptionsPage();
});

function renderResults(query: string) {
  resultsDiv.innerHTML = '';

  if (!classDb) {
    resultsDiv.innerHTML = '<div class="result-no-match">Loading class database...</div>';
    return;
  }

  const matches = searchClasses(query, classDb);

  if (matches.length === 0) {
    resultsDiv.innerHTML = '<div class="result-no-match">No matching classes found</div>';
    return;
  }

  for (const match of matches) {
    const item = document.createElement('div');
    item.className = 'result-item';

    const nameEl = document.createElement('div');
    nameEl.className = 'result-class';
    nameEl.textContent = match.name;
    item.appendChild(nameEl);

    const cssEl = document.createElement('div');
    cssEl.className = 'result-css';

    const parts = match.css.split(':');
    if (parts.length >= 2) {
      const prop = document.createElement('span');
      prop.className = 'result-css-prop';
      prop.textContent = parts[0].trim() + ': ';

      const val = document.createElement('span');
      val.className = 'result-css-value';
      val.textContent = parts.slice(1).join(':').trim();

      cssEl.appendChild(prop);
      cssEl.appendChild(val);
    } else {
      cssEl.textContent = match.css;
    }

    item.appendChild(cssEl);
    resultsDiv.appendChild(item);
  }
}
