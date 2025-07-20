import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'func-style': ['error', 'declaration'],
    'prefer-function-declarations-over-expressions': 'off'
  }
}) 