module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  }
};
