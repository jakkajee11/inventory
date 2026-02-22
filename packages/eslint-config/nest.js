const baseConfig = require('./base');

module.exports = {
  ...baseConfig,
  parserOptions: {
    ...baseConfig.parserOptions,
    project: './tsconfig.json',
  },
  rules: {
    ...baseConfig.rules,
    // NestJS specific rules
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
