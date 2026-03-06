import { getTailwindClasses, getNonTailwindClasses, lookupClass } from '@/utils/tailwind';
import '@/assets/inspect-overlay.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    let inspectActive = false;
    let classDb: Record<string, string> | null = null;
    let overlay: HTMLDivElement | null = null;
    let highlight: HTMLDivElement | null = null;
    let tooltip: HTMLDivElement | null = null;
    let badge: HTMLDivElement | null = null;
    let currentTarget: Element | null = null;

    async function loadClassDb(): Promise<Record<string, string>> {
      if (classDb) return classDb;
      try {
        const url = browser.runtime.getURL('/data/tailwind-classes.json');
        const resp = await fetch(url);
        classDb = await resp.json();
        return classDb!;
      } catch (e) {
        console.warn('Tailwind Lookup: Could not load class database', e);
        classDb = {};
        return classDb;
      }
    }

    function createOverlay() {
      overlay = document.createElement('div');
      overlay.className = 'twl-overlay';

      highlight = document.createElement('div');
      highlight.className = 'twl-highlight';

      tooltip = document.createElement('div');
      tooltip.className = 'twl-tooltip';

      badge = document.createElement('div');
      badge.className = 'twl-badge';
      badge.textContent = 'Tailwind Inspect (Esc to exit)';
      badge.addEventListener('click', () => deactivateInspect());

      document.body.appendChild(overlay);
      document.body.appendChild(highlight);
      document.body.appendChild(tooltip);
      document.body.appendChild(badge);
    }

    function activateInspect() {
      if (!overlay) createOverlay();
      inspectActive = true;
      overlay!.classList.add('twl-active');
      badge!.classList.add('twl-active');
      loadClassDb();

      document.addEventListener('mousemove', onMouseMove, true);
      document.addEventListener('click', onInspectClick, true);
      document.addEventListener('keydown', onKeyDown, true);
    }

    function deactivateInspect() {
      inspectActive = false;
      overlay?.classList.remove('twl-active');
      badge?.classList.remove('twl-active');
      if (highlight) highlight.style.display = 'none';
      if (tooltip) tooltip.style.display = 'none';
      currentTarget = null;

      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onInspectClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
    }

    function onMouseMove(e: MouseEvent) {
      if (!inspectActive) return;

      overlay!.style.pointerEvents = 'none';
      const target = document.elementFromPoint(e.clientX, e.clientY);
      overlay!.style.pointerEvents = 'auto';

      if (!target || target === overlay || target === highlight ||
          target === tooltip || target === badge) {
        return;
      }
      if (target === currentTarget) return;
      currentTarget = target;

      const rect = target.getBoundingClientRect();
      highlight!.style.display = 'block';
      highlight!.style.top = `${rect.top + window.scrollY}px`;
      highlight!.style.left = `${rect.left + window.scrollX}px`;
      highlight!.style.width = `${rect.width}px`;
      highlight!.style.height = `${rect.height}px`;

      updateTooltip(target, e.clientX, e.clientY);
    }

    function updateTooltip(element: Element, mouseX: number, mouseY: number) {
      const twClasses = getTailwindClasses(element);
      const otherClasses = getNonTailwindClasses(element);

      tooltip!.innerHTML = '';
      tooltip!.style.display = 'block';

      const tagEl = document.createElement('div');
      tagEl.className = 'twl-tooltip-tag';
      tagEl.textContent = `<${element.tagName.toLowerCase()}${(element as HTMLElement).id ? '#' + (element as HTMLElement).id : ''}>`;
      tooltip!.appendChild(tagEl);

      if (twClasses.length === 0) {
        const noTw = document.createElement('div');
        noTw.className = 'twl-no-tailwind';
        noTw.textContent = 'No Tailwind classes detected';
        tooltip!.appendChild(noTw);

        if (otherClasses.length > 0) {
          const otherLabel = document.createElement('div');
          otherLabel.className = 'twl-tooltip-header';
          otherLabel.textContent = 'Classes';
          tooltip!.appendChild(otherLabel);
          const chips = document.createElement('div');
          chips.className = 'twl-tooltip-classes';
          otherClasses.forEach((cls) => {
            const chip = document.createElement('span');
            chip.className = 'twl-class-chip';
            chip.style.color = '#94a3b8';
            chip.textContent = cls;
            chips.appendChild(chip);
          });
          tooltip!.appendChild(chips);
        }
      } else {
        const header = document.createElement('div');
        header.className = 'twl-tooltip-header';
        header.textContent = `Tailwind Classes (${twClasses.length})`;
        tooltip!.appendChild(header);

        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'twl-tooltip-classes';
        twClasses.forEach((cls) => {
          const chip = document.createElement('span');
          chip.className = 'twl-class-chip';
          chip.textContent = cls;
          chipsContainer.appendChild(chip);
        });
        tooltip!.appendChild(chipsContainer);

        if (classDb) {
          const cssOut = document.createElement('div');
          cssOut.className = 'twl-css-output';

          twClasses.forEach((cls) => {
            const css = lookupClass(cls, classDb!);
            if (css) {
              const line = document.createElement('div');
              line.className = 'twl-css-line';
              const prop = document.createElement('span');
              prop.className = 'twl-css-prop';
              const val = document.createElement('span');
              val.className = 'twl-css-value';

              const parts = css.split(':');
              if (parts.length >= 2) {
                prop.textContent = parts[0].trim() + ': ';
                val.textContent = parts.slice(1).join(':').trim();
              } else {
                val.textContent = css;
              }

              line.appendChild(prop);
              line.appendChild(val);
              cssOut.appendChild(line);
            }
          });

          if (cssOut.children.length > 0) {
            tooltip!.appendChild(cssOut);
          }
        }
      }

      const tw = tooltip!.offsetWidth || 300;
      const th = tooltip!.offsetHeight || 200;
      let tx = mouseX + 16;
      let ty = mouseY + 16;
      if (tx + tw > window.innerWidth - 10) tx = mouseX - tw - 16;
      if (ty + th > window.innerHeight - 10) ty = mouseY - th - 16;
      if (tx < 10) tx = 10;
      if (ty < 10) ty = 10;
      tooltip!.style.left = `${tx}px`;
      tooltip!.style.top = `${ty}px`;
    }

    function onInspectClick(e: MouseEvent) {
      if (!inspectActive) return;
      e.preventDefault();
      e.stopPropagation();

      if (currentTarget) {
        const twClasses = getTailwindClasses(currentTarget);
        if (twClasses.length > 0) {
          navigator.clipboard.writeText(twClasses.join(' ')).then(() => {
            const savedText = badge!.textContent;
            badge!.textContent = 'Classes copied!';
            setTimeout(() => { badge!.textContent = savedText; }, 1500);
          });
        }
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') deactivateInspect();
    }

    // Message handler
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'TOGGLE_INSPECT') {
        if (message.enabled) {
          activateInspect();
        } else {
          deactivateInspect();
        }
        sendResponse({ ok: true, active: inspectActive });
      }

      if (message.type === 'LOOKUP_CLASS') {
        loadClassDb().then((db) => {
          const css = db[message.className] || null;
          sendResponse({ className: message.className, css });
        });
        return true; // async response
      }

      if (message.type === 'GET_PAGE_CLASSES') {
        const allClasses = new Set<string>();
        document.querySelectorAll('[class]').forEach((el) => {
          getTailwindClasses(el).forEach((c) => allClasses.add(c));
        });
        sendResponse({ classes: Array.from(allClasses).sort() });
      }

      return false;
    });

    // Init: pre-load database
    browser.storage.sync.get('settings').then((data) => {
      const settings = (data.settings as { enabled: boolean }) || { enabled: true };
      if (!settings.enabled) return;
      loadClassDb();
    });
  },
});
