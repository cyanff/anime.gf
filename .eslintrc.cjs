const module = require("module");
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime"
    //"@electron-toolkit/eslint-config-ts/recommended",
    //"@electron-toolkit/eslint-config-prettier"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "react-refresh/only-export-components": "warn",
    "no-unused-expressions": "warn"
  }
};
