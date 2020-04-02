module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/*.spec.ts"],
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  }
};
