module.exports = {
  plugins: ["react-refresh", "only-warn"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "@electron-toolkit/eslint-config-ts/recommended",
    "@electron-toolkit/eslint-config-prettier"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "react-refresh/only-export-components": "warn",
    "no-unused-expressions": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "prettier/prettier": 0,
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ]
  }
};
