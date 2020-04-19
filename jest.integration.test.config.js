module.exports = {
  preset: "jest-playwright-preset",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/*.integration.test.ts?(x)"],
  testTimeout: 60000,
};
