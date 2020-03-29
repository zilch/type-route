module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/new2/*.spec.ts"],
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  }
};
