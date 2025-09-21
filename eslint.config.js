export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/logs/**',
      '**/dist/**',
      'frontend/dist/**',
      '**/uploads/**',
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: { jest: true, NodeJS: true },
    },
    plugins: {},
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
