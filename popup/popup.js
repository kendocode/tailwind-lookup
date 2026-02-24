// Tailwind CSS Lookup — Popup Script

let classDb = null;
let inspectActive = false;

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search');
  const resultsDiv = document.getElementById('results');
  const inspectBtn = document.getElementById('inspect-btn');
  const pageSummary = document.getElementById('page-summary');

  // Load class database
  try {
    const resp = await fetch(chrome.runtime.getURL('data/tailwind-classes.json'));
    classDb = await resp.json();
  } catch (e) {
    console.warn('Could not load class database');
    classDb = {};
  }

  // Search handler
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      resultsDiv.innerHTML = '';
      return;
    }
    renderResults(query, resultsDiv);
  });

  // Inspect button
  inspectBtn.addEventListener('click', () => {
    inspectActive = !inspectActive;
    inspectBtn.classList.toggle('active', inspectActive);
    inspectBtn.textContent = inspectActive
      ? 'Stop Inspecting'
      : 'Inspect Element';

    chrome.runtime.sendMessage({
      type: 'TOGGLE_INSPECT',
      enabled: inspectActive,
    });

    // Close popup after activating inspect (so user can interact with page)
    if (inspectActive) {
      setTimeout(() => window.close(), 200);
    }
  });

  // Page class summary
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_PAGE_CLASSES' },
        (response) => {
          if (chrome.runtime.lastError || !response) {
            pageSummary.innerHTML =
              '<em>Reload page to enable inspection</em>';
            return;
          }
          const classes = response.classes || [];
          if (classes.length > 0) {
            pageSummary.innerHTML = `<span class="page-summary-count">${classes.length}</span> unique Tailwind classes on this page`;
          } else {
            pageSummary.innerHTML = 'No Tailwind classes detected on this page';
          }
        }
      );
    }
  } catch {
    // Can't communicate with content script
  }

  // Options link
  document.getElementById('options-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});

function renderResults(query, container) {
  container.innerHTML = '';

  if (!classDb) {
    container.innerHTML =
      '<div class="result-no-match">Loading class database...</div>';
    return;
  }

  // Search: match class names that contain the query
  const matches = [];
  const exactMatch = classDb[query];

  if (exactMatch) {
    matches.push({ name: query, css: exactMatch, exact: true });
  }

  for (const [className, css] of Object.entries(classDb)) {
    if (className === query) continue; // already added as exact
    if (className.includes(query)) {
      matches.push({ name: className, css, exact: false });
    }
    if (matches.length >= 30) break; // Limit results
  }

  if (matches.length === 0) {
    container.innerHTML =
      '<div class="result-no-match">No matching classes found</div>';
    return;
  }

  // Sort: exact first, then by name length (shorter = more relevant)
  matches.sort((a, b) => {
    if (a.exact && !b.exact) return -1;
    if (!a.exact && b.exact) return 1;
    return a.name.length - b.name.length;
  });

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
    container.appendChild(item);
  }
}
