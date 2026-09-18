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
        // Explicit rather than auto-globbed: an unfinished week cannot appear
        // in the nav just because its file exists.
        items: [
          {
            text: 'Week 3 — Mongo, Integration Testing',
            items: [
              { text: 'Prep: install MongoDB',
                link: '/weeks/week03-mongo-integration/prep' },
            ],
          },
        ],
      },
    ],
    outline: [2, 3],
    search: { provider: 'local' },
  },
});
