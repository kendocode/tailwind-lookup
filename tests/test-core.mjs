// Tailwind CSS Lookup — Node.js unit tests
// Run: node tests/test-core.mjs

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${name}`);
  } else {
    failed++;
    console.error(`  FAIL: ${name}`);
  }
}

// ========== Tailwind class detection (extracted from content.js) ==========
console.log('\n--- Tailwind Class Detection ---');

const TW_PREFIXES = [
  'block', 'inline', 'flex', 'grid', 'hidden', 'table', 'contents',
  'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'm-', 'mx-', 'my-',
  'mt-', 'mr-', 'mb-', 'ml-', 'gap-', 'space-',
  'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
  'text-', 'font-', 'leading-', 'tracking-', 'uppercase', 'lowercase',
  'capitalize', 'normal-case', 'truncate', 'line-clamp-',
  'bg-', 'border-', 'ring-', 'outline-', 'divide-',
  'shadow', 'shadow-', 'opacity-', 'blur-',
  'rounded', 'rounded-', 'border',
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'top-', 'right-', 'bottom-', 'left-', 'inset-', 'z-',
  'flex-', 'grow', 'shrink', 'basis-', 'justify-', 'items-', 'self-',
  'order-', 'grid-cols-', 'grid-rows-', 'col-span-', 'row-span-',
  'overflow-', 'transition', 'transition-', 'duration-', 'ease-', 'delay-',
  'scale-', 'rotate-', 'translate-', 'skew-', 'origin-',
  'cursor-', 'select-', 'resize', 'scroll-',
  'pointer-events-', 'visible', 'invisible', 'collapse',
  'object-', 'aspect-', 'float-', 'clear-',
  'isolate', 'container',
  'whitespace-', 'sr-only', 'not-sr-only',
  'sm:', 'md:', 'lg:', 'xl:', '2xl:',
  'hover:', 'focus:', 'active:', 'disabled:', 'dark:',
  '-m-', '-mx-', '-my-', '-mt-', '-mr-', '-mb-', '-ml-',
  '-translate-', '-rotate-',
];

function isTailwindClass(className) {
  if (!className || typeof className !== 'string') return false;
  const base = className.replace(/^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|dark:|group-hover:|focus-within:|focus-visible:|first:|last:|odd:|even:|motion-reduce:|motion-safe:|!)+/, '');
  for (const prefix of TW_PREFIXES) {
    if (base === prefix || base.startsWith(prefix)) return true;
  }
  if (/\[.+\]/.test(base)) return true;
  return false;
}

// Known Tailwind classes
assert('Detect flex', isTailwindClass('flex'));
assert('Detect p-4', isTailwindClass('p-4'));
assert('Detect text-lg', isTailwindClass('text-lg'));
assert('Detect bg-blue-500', isTailwindClass('bg-blue-500'));
assert('Detect rounded-lg', isTailwindClass('rounded-lg'));
assert('Detect shadow-md', isTailwindClass('shadow-md'));
assert('Detect hidden', isTailwindClass('hidden'));
assert('Detect justify-center', isTailwindClass('justify-center'));
assert('Detect grid-cols-3', isTailwindClass('grid-cols-3'));
assert('Detect truncate', isTailwindClass('truncate'));
assert('Detect cursor-pointer', isTailwindClass('cursor-pointer'));
assert('Detect container', isTailwindClass('container'));
assert('Detect w-1/2', isTailwindClass('w-1/2'));
assert('Detect -mt-4', isTailwindClass('-mt-4'));
assert('Detect hover:bg-blue-600', isTailwindClass('hover:bg-blue-600'));
assert('Detect sm:flex', isTailwindClass('sm:flex'));
assert('Detect dark:bg-gray-900', isTailwindClass('dark:bg-gray-900'));
assert('Detect arbitrary value w-[200px]', isTailwindClass('w-[200px]'));
assert('Detect opacity-50', isTailwindClass('opacity-50'));
assert('Detect transition', isTailwindClass('transition'));
assert('Detect sr-only', isTailwindClass('sr-only'));
assert('Detect aspect-video', isTailwindClass('aspect-video'));

// Non-Tailwind classes
assert('Reject custom-class', !isTailwindClass('custom-class'));
// Note: 'my-component' matches 'my-' prefix (margin-y). This is a known
// acceptable false positive — the tooltip will show "no CSS found" for it.
// Heuristic is intentionally over-inclusive to avoid missing real classes.
assert('Reject btn-primary (non-TW)', !isTailwindClass('btn-primary'));
assert('Reject sidebar', !isTailwindClass('sidebar'));
assert('Reject nav-link', !isTailwindClass('nav-link'));
assert('Reject js-toggle', !isTailwindClass('js-toggle'));

// ========== Class Database ==========
console.log('\n--- Class Database ---');

const dbPath = join(__dirname, '..', 'data', 'tailwind-classes.json');
assert('Database file exists', existsSync(dbPath));

const db = JSON.parse(readFileSync(dbPath, 'utf8'));
const entryCount = Object.keys(db).length;

assert('Database has >2000 entries', entryCount > 2000);
assert('Database has <5000 entries (reasonable size)', entryCount < 5000);

// Verify key classes have correct values
assert('p-4 = padding: 1rem', db['p-4'] === 'padding: 1rem');
assert('m-0 = margin: 0px', db['m-0'] === 'margin: 0px');
assert('flex = display: flex', db['flex'] === 'display: flex');
assert('hidden = display: none', db['hidden'] === 'display: none');
assert('text-white = color: #ffffff', db['text-white'] === 'color: #ffffff');
assert('bg-black = background-color: #000000', db['bg-black'] === 'background-color: #000000');
assert('bg-blue-500 = background-color: #3b82f6', db['bg-blue-500'] === 'background-color: #3b82f6');
assert('rounded-lg = border-radius: 0.5rem', db['rounded-lg'] === 'border-radius: 0.5rem');
assert('font-bold = font-weight: 700', db['font-bold'] === 'font-weight: 700');
assert('cursor-pointer = cursor: pointer', db['cursor-pointer'] === 'cursor: pointer');
assert('z-50 = z-index: 50', db['z-50'] === 'z-index: 50');

// Verify color palette completeness
const colorNames = ['slate', 'gray', 'red', 'blue', 'green', 'yellow', 'purple', 'pink'];
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
for (const color of colorNames) {
  for (const shade of shades) {
    const textKey = `text-${color}-${shade}`;
    const bgKey = `bg-${color}-${shade}`;
    assert(`${textKey} exists`, textKey in db);
    assert(`${bgKey} exists`, bgKey in db);
    assert(`${bgKey} starts with "background-color: #"`, db[bgKey]?.startsWith('background-color: #'));
  }
}

// ========== Manifest Validation ==========
console.log('\n--- Manifest Validation ---');

const manifestPath = join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

assert('Manifest version is 3', manifest.manifest_version === 3);
assert('Has name', manifest.name === 'Tailwind CSS Lookup');
assert('Description under 132 chars', manifest.description.length <= 132);
assert('Has content_scripts', Array.isArray(manifest.content_scripts));
assert('Has storage permission', manifest.permissions.includes('storage'));
assert('Has activeTab permission', manifest.permissions.includes('activeTab'));
assert('Has web_accessible_resources for data', manifest.web_accessible_resources?.[0]?.resources?.includes('data/tailwind-classes.json'));
assert('Has popup', !!manifest.action?.default_popup);
assert('Has background service worker', !!manifest.background?.service_worker);

// ========== File Existence ==========
console.log('\n--- File Existence ---');

const requiredFiles = [
  'content.js', 'content.css', 'background.js', 'manifest.json',
  'popup/popup.html', 'popup/popup.js', 'popup/popup.css',
  'options/options.html', 'options/options.js', 'options/options.css',
  'data/tailwind-classes.json',
  'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
  'PRIVACY_POLICY.md', 'README.md'
];

for (const file of requiredFiles) {
  assert(`File exists: ${file}`, existsSync(join(__dirname, '..', file)));
}

// ========== Summary ==========
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
