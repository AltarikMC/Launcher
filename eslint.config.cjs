const js = require('@eslint/js')
const globals = require('globals')
const neostandard = require('neostandard')

module.exports = [
  js.configs.recommended,
  ...neostandard(),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },
  {
    files: ['eslint.config.{js,cjs}'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.node,
      },
    },
  },
]
