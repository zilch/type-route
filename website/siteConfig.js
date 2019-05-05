const siteConfig = {
  title: "type-route", // Title for your website.
  tagline: "A flexible, type safe routing library.",
  url: "https://type-route.js.org", // Your website URL
  baseUrl: "/", // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: "type-route",
  organizationName: "type-route",

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: "doc1", label: "Docs" },
    { href: "https://github.com/type-route/type-route", label: "GitHub" },
    {
      href: "https://github.com/type-route/type-route/issues/new",
      label: "Feedback"
    }
  ],

  /* path to images for header/footer */
  headerIcon: "img/logo.svg",
  footerIcon: "img/logo.svg",
  favicon: "img/favicon.ico",

  /* Colors for website */
  colors: {
    primaryColor: "#383751",
    secondaryColor: "#383751"
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} the type-route documentation authors.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: "default"
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    "https://unpkg.com/@stackblitz/sdk/bundles/sdk.umd.js",
    "/js/sandbox.js"
  ],

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  // No .html extensions for paths.
  cleanUrl: true
};

module.exports = siteConfig;
