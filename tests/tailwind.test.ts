import { describe, it, expect } from 'vitest';
import { isTailwindClass, stripStatePrefix, searchClasses } from '../utils/tailwind';

describe('isTailwindClass', () => {
  // Layout
  it('detects flex', () => expect(isTailwindClass('flex')).toBe(true));
  it('detects grid', () => expect(isTailwindClass('grid')).toBe(true));
  it('detects block', () => expect(isTailwindClass('block')).toBe(true));
  it('detects hidden', () => expect(isTailwindClass('hidden')).toBe(true));
  it('detects inline', () => expect(isTailwindClass('inline')).toBe(true));

  // Spacing
  it('detects p-4', () => expect(isTailwindClass('p-4')).toBe(true));
  it('detects px-2', () => expect(isTailwindClass('px-2')).toBe(true));
  it('detects m-auto', () => expect(isTailwindClass('m-auto')).toBe(true));
  it('detects mt-8', () => expect(isTailwindClass('mt-8')).toBe(true));
  it('detects gap-4', () => expect(isTailwindClass('gap-4')).toBe(true));
  it('detects space-x-2', () => expect(isTailwindClass('space-x-2')).toBe(true));

  // Sizing
  it('detects w-full', () => expect(isTailwindClass('w-full')).toBe(true));
  it('detects h-screen', () => expect(isTailwindClass('h-screen')).toBe(true));
  it('detects max-w-lg', () => expect(isTailwindClass('max-w-lg')).toBe(true));
  it('detects min-h-0', () => expect(isTailwindClass('min-h-0')).toBe(true));

  // Typography
  it('detects text-lg', () => expect(isTailwindClass('text-lg')).toBe(true));
  it('detects font-bold', () => expect(isTailwindClass('font-bold')).toBe(true));
  it('detects uppercase', () => expect(isTailwindClass('uppercase')).toBe(true));
  it('detects truncate', () => expect(isTailwindClass('truncate')).toBe(true));
  it('detects leading-tight', () => expect(isTailwindClass('leading-tight')).toBe(true));

  // Colors
  it('detects bg-red-500', () => expect(isTailwindClass('bg-red-500')).toBe(true));
  it('detects text-blue-600', () => expect(isTailwindClass('text-blue-600')).toBe(true));
  it('detects border-gray-200', () => expect(isTailwindClass('border-gray-200')).toBe(true));

  // Effects
  it('detects shadow', () => expect(isTailwindClass('shadow')).toBe(true));
  it('detects shadow-lg', () => expect(isTailwindClass('shadow-lg')).toBe(true));
  it('detects opacity-50', () => expect(isTailwindClass('opacity-50')).toBe(true));
  it('detects rounded', () => expect(isTailwindClass('rounded')).toBe(true));
  it('detects rounded-lg', () => expect(isTailwindClass('rounded-lg')).toBe(true));

  // Positioning
  it('detects absolute', () => expect(isTailwindClass('absolute')).toBe(true));
  it('detects relative', () => expect(isTailwindClass('relative')).toBe(true));
  it('detects sticky', () => expect(isTailwindClass('sticky')).toBe(true));
  it('detects z-10', () => expect(isTailwindClass('z-10')).toBe(true));
  it('detects top-0', () => expect(isTailwindClass('top-0')).toBe(true));

  // Flex/Grid
  it('detects justify-center', () => expect(isTailwindClass('justify-center')).toBe(true));
  it('detects items-center', () => expect(isTailwindClass('items-center')).toBe(true));
  it('detects flex-col', () => expect(isTailwindClass('flex-col')).toBe(true));
  it('detects grid-cols-3', () => expect(isTailwindClass('grid-cols-3')).toBe(true));
  it('detects col-span-2', () => expect(isTailwindClass('col-span-2')).toBe(true));

  // Transitions
  it('detects transition', () => expect(isTailwindClass('transition')).toBe(true));
  it('detects duration-300', () => expect(isTailwindClass('duration-300')).toBe(true));

  // Interactivity
  it('detects cursor-pointer', () => expect(isTailwindClass('cursor-pointer')).toBe(true));

  // Responsive prefixes
  it('detects md:flex', () => expect(isTailwindClass('md:flex')).toBe(true));
  it('detects lg:grid-cols-3', () => expect(isTailwindClass('lg:grid-cols-3')).toBe(true));
  it('detects sm:p-4', () => expect(isTailwindClass('sm:p-4')).toBe(true));

  // State prefixes
  it('detects hover:bg-blue-600', () => expect(isTailwindClass('hover:bg-blue-600')).toBe(true));
  it('detects focus:ring-2', () => expect(isTailwindClass('focus:ring-2')).toBe(true));
  it('detects dark:bg-gray-800', () => expect(isTailwindClass('dark:bg-gray-800')).toBe(true));

  // Arbitrary values
  it('detects w-[200px]', () => expect(isTailwindClass('w-[200px]')).toBe(true));
  it('detects bg-[#ff0000]', () => expect(isTailwindClass('bg-[#ff0000]')).toBe(true));

  // Negative values
  it('detects -mt-4', () => expect(isTailwindClass('-mt-4')).toBe(true));
  it('detects -translate-x-1/2', () => expect(isTailwindClass('-translate-x-1/2')).toBe(true));

  // Non-Tailwind classes
  it('rejects custom-component', () => expect(isTailwindClass('custom-component')).toBe(false));
  it('treats my-class as Tailwind (matches my- prefix)', () => expect(isTailwindClass('my-class')).toBe(true));
  it('rejects btn-primary', () => expect(isTailwindClass('btn-primary')).toBe(false));
  it('rejects header', () => expect(isTailwindClass('header')).toBe(false));
  it('rejects empty string', () => expect(isTailwindClass('')).toBe(false));

  // Visibility
  it('detects visible', () => expect(isTailwindClass('visible')).toBe(true));
  it('detects invisible', () => expect(isTailwindClass('invisible')).toBe(true));

  // Container
  it('detects container', () => expect(isTailwindClass('container')).toBe(true));
});

describe('stripStatePrefix', () => {
  it('strips hover prefix', () => expect(stripStatePrefix('hover:bg-blue-500')).toBe('bg-blue-500'));
  it('strips responsive prefix', () => expect(stripStatePrefix('md:flex')).toBe('flex'));
  it('strips chained prefixes', () => expect(stripStatePrefix('dark:hover:bg-gray-800')).toBe('bg-gray-800'));
  it('strips important prefix', () => expect(stripStatePrefix('!p-4')).toBe('p-4'));
  it('leaves plain class alone', () => expect(stripStatePrefix('flex')).toBe('flex'));
});

describe('searchClasses', () => {
  const db: Record<string, string> = {
    'p-1': 'padding: 0.25rem',
    'p-2': 'padding: 0.5rem',
    'p-4': 'padding: 1rem',
    'px-2': 'padding-left: 0.5rem; padding-right: 0.5rem',
    'py-2': 'padding-top: 0.5rem; padding-bottom: 0.5rem',
    'pt-4': 'padding-top: 1rem',
    'flex': 'display: flex',
  };

  it('finds exact match first', () => {
    const results = searchClasses('p-4', db);
    expect(results[0].name).toBe('p-4');
    expect(results[0].exact).toBe(true);
  });

  it('finds partial matches', () => {
    const results = searchClasses('p-', db);
    expect(results.length).toBeGreaterThan(1);
  });

  it('returns empty for no matches', () => {
    const results = searchClasses('zzz', db);
    expect(results).toHaveLength(0);
  });

  it('respects limit', () => {
    const results = searchClasses('p', db, 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('sorts shorter names first', () => {
    const results = searchClasses('p-', db);
    const partials = results.filter(r => !r.exact);
    for (let i = 1; i < partials.length; i++) {
      expect(partials[i].name.length).toBeGreaterThanOrEqual(partials[i - 1].name.length);
    }
  });
});
