// Common Tailwind class prefixes for detection
const TW_PREFIXES = [
  'block', 'inline', 'flex', 'grid', 'hidden', 'table', 'contents',
  'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'm-', 'mx-', 'my-',
  'mt-', 'mr-', 'mb-', 'ml-', 'gap-', 'space-',
  'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-', 'size-',
  'text-', 'font-', 'leading-', 'tracking-', 'uppercase', 'lowercase',
  'capitalize', 'normal-case', 'truncate', 'line-clamp-',
  'bg-', 'border-', 'ring-', 'outline-', 'divide-', 'accent-',
  'fill-', 'stroke-', 'decoration-', 'caret-', 'placeholder-',
  'shadow', 'shadow-', 'opacity-', 'blur-', 'brightness-', 'contrast-',
  'drop-shadow-', 'grayscale', 'invert', 'sepia', 'saturate-', 'hue-rotate-',
  'rounded', 'rounded-', 'border',
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'top-', 'right-', 'bottom-', 'left-', 'inset-', 'z-',
  'flex-', 'grow', 'shrink', 'basis-', 'justify-', 'items-', 'self-',
  'order-', 'grid-cols-', 'grid-rows-', 'col-span-', 'row-span-',
  'auto-cols-', 'auto-rows-', 'place-',
  'overflow-', 'overscroll-',
  'transition', 'transition-', 'duration-', 'ease-', 'delay-',
  'scale-', 'rotate-', 'translate-', 'skew-', 'origin-',
  'cursor-', 'select-', 'resize', 'scroll-', 'snap-', 'touch-',
  'pointer-events-', 'appearance-', 'will-change-',
  'visible', 'invisible', 'collapse',
  'object-', 'aspect-', 'columns-', 'break-',
  'float-', 'clear-', 'isolate', 'isolation-', 'container',
  'whitespace-', 'hyphens-', 'content-', 'full', 'screen', 'stroke-',
  'sm:', 'md:', 'lg:', 'xl:', '2xl:',
  'hover:', 'focus:', 'active:', 'disabled:', 'first:', 'last:',
  'odd:', 'even:', 'group-hover:', 'focus-within:', 'focus-visible:',
  'dark:', 'motion-reduce:', 'motion-safe:',
  '-m-', '-mx-', '-my-', '-mt-', '-mr-', '-mb-', '-ml-',
  '-p-', '-top-', '-right-', '-bottom-', '-left-', '-inset-',
  '-translate-', '-rotate-', '-skew-', '-order-', '-z-',
  '-tracking-', '-indent-', '-scroll-',
];

const STATE_PREFIX_RE = /^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|dark:|group-hover:|focus-within:|focus-visible:|first:|last:|odd:|even:|motion-reduce:|motion-safe:|!)+/;

export function isTailwindClass(className: string): boolean {
  if (!className) return false;
  const base = className.replace(STATE_PREFIX_RE, '');
  for (const prefix of TW_PREFIXES) {
    if (base === prefix || base.startsWith(prefix)) return true;
  }
  if (/\[.+\]/.test(base)) return true;
  return false;
}

export function getTailwindClasses(element: Element): string[] {
  if (!element?.classList) return [];
  return Array.from(element.classList).filter(isTailwindClass);
}

export function getNonTailwindClasses(element: Element): string[] {
  if (!element?.classList) return [];
  return Array.from(element.classList).filter((c) => !isTailwindClass(c));
}

export function stripStatePrefix(className: string): string {
  return className.replace(STATE_PREFIX_RE, '');
}

export function lookupClass(className: string, db: Record<string, string>): string | null {
  const base = stripStatePrefix(className);
  return db[base] || null;
}

export function searchClasses(
  query: string,
  db: Record<string, string>,
  limit = 30,
): Array<{ name: string; css: string; exact: boolean }> {
  const matches: Array<{ name: string; css: string; exact: boolean }> = [];
  const exactMatch = db[query];

  if (exactMatch) {
    matches.push({ name: query, css: exactMatch, exact: true });
  }

  for (const [className, css] of Object.entries(db)) {
    if (className === query) continue;
    if (className.includes(query)) {
      matches.push({ name: className, css, exact: false });
    }
    if (matches.length >= limit) break;
  }

  matches.sort((a, b) => {
    if (a.exact && !b.exact) return -1;
    if (!a.exact && b.exact) return 1;
    return a.name.length - b.name.length;
  });

  return matches;
}
