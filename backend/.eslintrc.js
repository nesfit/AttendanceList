module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "arrow-parens": "off",
    "keyword-spacing": "off",
    "import/prefer-default-export": "off",
    "no-console": "off",
    "no-confusing-arrow": "off",
    "spaced-comment": "off",
    "camelcase": "off",
  },
};
