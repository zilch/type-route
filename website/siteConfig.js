const siteConfig = {
  title: "Type Route", // Title for your website.
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
    { doc: "introduction/getting-started", label: "Docs" },
    { href: "https://github.com/type-route/type-route", label: "GitHub" },
    {
      href: "https://github.com/type-route/type-route/issues/new",
      label: "Feedback"
    },
    {
      search: true
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
  copyright: `Copyright © ${new Date().getFullYear()} the Type Route documentation authors.`,

  usePrism: ["tsx", "typescript", "bash"],

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ["/js/codesandbox.js", "/js/site.js"],

  scrollToTop: true,
  scrollToTopOptions: {
    backgroundColor: "#383751"
  },

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  // No .html extensions for paths.
  cleanUrl: true,

  algolia: {
    apiKey: "4a2bd93ab352acbdeac847eb2563ac5e",
    indexName: "type-route"
  }
};

module.exports = siteConfig;
