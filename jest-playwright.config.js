module.exports = {
  launchBrowserApp: {
    headless: !!process.env.CI,
  },
  server: {
    command: "npx parcel ./src/test/utils/integrationTest.html --port 1235",
    host: "localhost",
    port: 1235,
  },
  exitOnPageError: false,
};
