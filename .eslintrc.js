module.exports = {
  "extends": [
    "react-app",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": ["warn"],
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": ["warn"]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}