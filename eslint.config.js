const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'ios/**',
      'android/**',
      'coverage/**',
      '.claude/**',
      '.claude-flow/**',
      '.swarm/**',
      '*.config.js',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
