import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Tailwind CSS Lookup',
    permissions: ['storage', 'activeTab'],
    web_accessible_resources: [
      {
        resources: ['/data/tailwind-classes.json'],
        matches: ['<all_urls>'],
      },
    ],
  },
});
