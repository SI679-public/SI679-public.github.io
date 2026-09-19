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
    // No sidebar, and no search.
    //
    // site/index.md IS the navigation. It indexes everything in one flat list,
    // including the weeks whose notes live in Confluence — which a filesystem
    // sidebar could never show. A sidebar alongside it would be a second,
    // partial answer to the same question, and would drift from the first.
    //
    // Adding a week or an assignment therefore means editing site/index.md and
    // nothing else. See WORKFLOW.md.
    nav: [],
    outline: [2, 3],
  },
});
