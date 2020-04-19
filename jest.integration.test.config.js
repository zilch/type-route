const MAX_32_BIT_SIGNED_INTEGER = 2147483647;

console.log(Object.keys(process.env));

module.exports = {
  preset: "jest-playwright-preset",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/*.integration.test.ts?(x)"],
  testTimeout: process.env.CI ? 60000 : 60000, //MAX_32_BIT_SIGNED_INTEGER,
};
