import { defineConfig } from 'vitepress';

// This config is published from the private course repo, so it is versioned
// alongside the content it renders. The mirror owns only .github/workflows.
//
// base stays '/' because the mirror is an ORGANIZATION site
// (SI679-public.github.io), served from the root. A project site would need
// base: '/<repo>/' and is the usual reason a first deploy renders unstyled.
export default defineConfig({
  title: 'SI 679',
  description: 'Back of the Stack — back-end development for full-stack applications',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [{ text: 'Weeks', link: '/weeks/' }],
    sidebar: [
      {
        text: 'Weeks',
        items: [
          // Added as each week is published. Keeping this explicit rather than
          // auto-globbing means an unfinished week cannot appear by accident.
        ],
      },
    ],
    outline: [2, 3],
    search: { provider: 'local' },
  },
});
