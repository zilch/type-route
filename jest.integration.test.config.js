const MAX_32_BIT_SIGNED_INTEGER = 2147483647;

module.exports = {
  preset: "jest-playwright-preset",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/*.integration.test.ts?(x)"],
  testTimeout: process.env.CI ? 35000 : MAX_32_BIT_SIGNED_INTEGER,
};
