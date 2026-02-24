// Tailwind CSS Lookup — Content Script
// Provides hover inspection of Tailwind classes on any page element.

(function () {
  'use strict';

  let inspectActive = false;
  let classDb = null; // Loaded on demand
  let overlay = null;
  let highlight = null;
  let tooltip = null;
  let badge = null;
  let currentTarget = null;

  // ====== Tailwind class detection ======

  // Common Tailwind class prefixes for detection
  const TW_PREFIXES = [
    // Layout
    'block', 'inline', 'flex', 'grid', 'hidden', 'table', 'contents',
    // Spacing
    'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'm-', 'mx-', 'my-',
    'mt-', 'mr-', 'mb-', 'ml-', 'gap-', 'space-',
    // Sizing
    'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-', 'size-',
    // Typography
    'text-', 'font-', 'leading-', 'tracking-', 'uppercase', 'lowercase',
    'capitalize', 'normal-case', 'truncate', 'line-clamp-',
    // Colors & backgrounds
    'bg-', 'border-', 'ring-', 'outline-', 'divide-', 'accent-',
    'fill-', 'stroke-', 'decoration-', 'caret-', 'placeholder-',
    // Effects
    'shadow', 'shadow-', 'opacity-', 'blur-', 'brightness-', 'contrast-',
    'drop-shadow-', 'grayscale', 'invert', 'sepia', 'saturate-', 'hue-rotate-',
    // Borders
    'rounded', 'rounded-', 'border',
    // Positioning
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    'top-', 'right-', 'bottom-', 'left-', 'inset-', 'z-',
    // Flex/Grid
    'flex-', 'grow', 'shrink', 'basis-', 'justify-', 'items-', 'self-',
    'order-', 'grid-cols-', 'grid-rows-', 'col-span-', 'row-span-',
    'auto-cols-', 'auto-rows-', 'place-',
    // Overflow
    'overflow-', 'overscroll-',
    // Transitions
    'transition', 'transition-', 'duration-', 'ease-', 'delay-',
    // Transforms
    'scale-', 'rotate-', 'translate-', 'skew-', 'origin-',
    // Interactivity
    'cursor-', 'select-', 'resize', 'scroll-', 'snap-', 'touch-',
    'pointer-events-', 'appearance-', 'will-change-',
    // Visibility
    'visible', 'invisible', 'collapse',
    // Object
    'object-',
    // Aspect ratio
    'aspect-',
    // Columns
    'columns-',
    // Break
    'break-',
    // Float/Clear
    'float-', 'clear-',
    // Isolation
    'isolate', 'isolation-',
    // Container
    'container',
    // Whitespace
    'whitespace-',
    // Word/Hyphens
    'hyphens-',
    // Content
    'content-',
    // Width/Height shortcuts
    'full', 'screen',
    // SVG
    'stroke-',
    // Responsive prefixes
    'sm:', 'md:', 'lg:', 'xl:', '2xl:',
    // State prefixes
    'hover:', 'focus:', 'active:', 'disabled:', 'first:', 'last:',
    'odd:', 'even:', 'group-hover:', 'focus-within:', 'focus-visible:',
    'dark:', 'motion-reduce:', 'motion-safe:',
    // Negative values
    '-m-', '-mx-', '-my-', '-mt-', '-mr-', '-mb-', '-ml-',
    '-p-', '-top-', '-right-', '-bottom-', '-left-', '-inset-',
    '-translate-', '-rotate-', '-skew-', '-order-', '-z-',
    '-tracking-', '-indent-', '-scroll-',
  ];

  function isTailwindClass(className) {
    // Check if a single class name looks like a Tailwind utility
    if (!className || typeof className !== 'string') return false;

    // Strip responsive/state prefixes for detection
    const base = className.replace(/^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|dark:|group-hover:|focus-within:|focus-visible:|first:|last:|odd:|even:|motion-reduce:|motion-safe:|!)+/, '');

    // Check against known prefixes
    for (const prefix of TW_PREFIXES) {
      if (base === prefix || base.startsWith(prefix)) return true;
    }

    // Check arbitrary value syntax: [value]
    if (/\[.+\]/.test(base)) return true;

    return false;
  }

  function getTailwindClasses(element) {
    if (!element || !element.classList) return [];
    return Array.from(element.classList).filter(isTailwindClass);
  }

  function getNonTailwindClasses(element) {
    if (!element || !element.classList) return [];
    return Array.from(element.classList).filter((c) => !isTailwindClass(c));
  }

  // ====== Class database lookup ======

  async function loadClassDb() {
    if (classDb) return classDb;
    try {
      const url = chrome.runtime.getURL('data/tailwind-classes.json');
      const resp = await fetch(url);
      classDb = await resp.json();
      return classDb;
    } catch (e) {
      console.warn('Tailwind Lookup: Could not load class database', e);
      return {};
    }
  }

  function lookupClass(name) {
    if (!classDb) return null;
    // Strip responsive/state prefix for lookup
    const base = name.replace(/^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|dark:|group-hover:|focus-within:|focus-visible:|first:|last:|odd:|even:|motion-reduce:|motion-safe:|!)+/, '');
    return classDb[base] || null;
  }

  // ====== UI: Overlay & Tooltip ======

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
    overlay.classList.add('twl-active');
    badge.classList.add('twl-active');
    loadClassDb();

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onInspectClick, true);
    document.addEventListener('keydown', onKeyDown, true);
  }

  function deactivateInspect() {
    inspectActive = false;
    if (overlay) overlay.classList.remove('twl-active');
    if (badge) badge.classList.remove('twl-active');
    if (highlight) {
      highlight.style.display = 'none';
    }
    if (tooltip) {
      tooltip.style.display = 'none';
    }
    currentTarget = null;

    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onInspectClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
  }

  function onMouseMove(e) {
    if (!inspectActive) return;

    // Get element under cursor (ignore our overlay elements)
    overlay.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';

    if (!target || target === overlay || target === highlight ||
        target === tooltip || target === badge) {
      return;
    }

    if (target === currentTarget) return;
    currentTarget = target;

    // Position highlight
    const rect = target.getBoundingClientRect();
    highlight.style.display = 'block';
    highlight.style.top = `${rect.top + window.scrollY}px`;
    highlight.style.left = `${rect.left + window.scrollX}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;

    // Build tooltip content
    updateTooltip(target, e.clientX, e.clientY);
  }

  function updateTooltip(element, mouseX, mouseY) {
    const twClasses = getTailwindClasses(element);
    const otherClasses = getNonTailwindClasses(element);

    tooltip.innerHTML = '';
    tooltip.style.display = 'block';

    // Tag name
    const tagEl = document.createElement('div');
    tagEl.className = 'twl-tooltip-tag';
    tagEl.textContent = `<${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}>`;
    tooltip.appendChild(tagEl);

    if (twClasses.length === 0) {
      const noTw = document.createElement('div');
      noTw.className = 'twl-no-tailwind';
      noTw.textContent = 'No Tailwind classes detected';
      tooltip.appendChild(noTw);

      if (otherClasses.length > 0) {
        const otherLabel = document.createElement('div');
        otherLabel.className = 'twl-tooltip-header';
        otherLabel.textContent = 'Classes';
        tooltip.appendChild(otherLabel);
        const chips = document.createElement('div');
        chips.className = 'twl-tooltip-classes';
        otherClasses.forEach((cls) => {
          const chip = document.createElement('span');
          chip.className = 'twl-class-chip';
          chip.style.color = '#94a3b8';
          chip.textContent = cls;
          chips.appendChild(chip);
        });
        tooltip.appendChild(chips);
      }
    } else {
      // Tailwind classes header
      const header = document.createElement('div');
      header.className = 'twl-tooltip-header';
      header.textContent = `Tailwind Classes (${twClasses.length})`;
      tooltip.appendChild(header);

      // Class chips
      const chipsContainer = document.createElement('div');
      chipsContainer.className = 'twl-tooltip-classes';
      twClasses.forEach((cls) => {
        const chip = document.createElement('span');
        chip.className = 'twl-class-chip';
        chip.textContent = cls;
        chipsContainer.appendChild(chip);
      });
      tooltip.appendChild(chipsContainer);

      // CSS output
      if (classDb) {
        const cssOut = document.createElement('div');
        cssOut.className = 'twl-css-output';

        twClasses.forEach((cls) => {
          const css = lookupClass(cls);
          if (css) {
            const line = document.createElement('div');
            line.className = 'twl-css-line';

            const prop = document.createElement('span');
            prop.className = 'twl-css-prop';
            const val = document.createElement('span');
            val.className = 'twl-css-value';

            // Split "property: value" format
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
          tooltip.appendChild(cssOut);
        }
      }
    }

    // Position tooltip near the mouse, but keep it on screen
    const tw = tooltip.offsetWidth || 300;
    const th = tooltip.offsetHeight || 200;
    let tx = mouseX + 16;
    let ty = mouseY + 16;

    if (tx + tw > window.innerWidth - 10) {
      tx = mouseX - tw - 16;
    }
    if (ty + th > window.innerHeight - 10) {
      ty = mouseY - th - 16;
    }
    if (tx < 10) tx = 10;
    if (ty < 10) ty = 10;

    tooltip.style.left = `${tx}px`;
    tooltip.style.top = `${ty}px`;
  }

  function onInspectClick(e) {
    if (!inspectActive) return;
    e.preventDefault();
    e.stopPropagation();

    // Copy Tailwind classes to clipboard
    if (currentTarget) {
      const twClasses = getTailwindClasses(currentTarget);
      if (twClasses.length > 0) {
        navigator.clipboard.writeText(twClasses.join(' ')).then(() => {
          const savedText = badge.textContent;
          badge.textContent = 'Classes copied!';
          setTimeout(() => {
            badge.textContent = savedText;
          }, 1500);
        });
      }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      deactivateInspect();
    }
  }

  // ====== Message handler ======

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      // Scan the page for all Tailwind classes
      const allClasses = new Set();
      document.querySelectorAll('[class]').forEach((el) => {
        getTailwindClasses(el).forEach((c) => allClasses.add(c));
      });
      sendResponse({ classes: Array.from(allClasses).sort() });
    }

    return false;
  });

  // ====== Init ======
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || { enabled: true };
    if (!settings.enabled) return;
    // Pre-load database in the background
    loadClassDb();
  });
})();
