const MAX_32_BIT_SIGNED_INTEGER = 2147483647;

console.log("process.env.CI", process.env.CI);

module.exports = {
  preset: "jest-playwright-preset",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/*.integration.test.ts?(x)"],
  testTimeout: Object.keys(process.env).includes("CI")
    ? 60000
    : MAX_32_BIT_SIGNED_INTEGER,
};
