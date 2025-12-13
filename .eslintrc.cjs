module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'next/core-web-vitals'],
  settings: {
    next: {
      rootDir: ['apps/web'],
    },
  },
  ignorePatterns: ['dist', '.next', 'node_modules'],
};
