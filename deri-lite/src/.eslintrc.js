module.exports = {
  parser: 'babel-eslint', 
  parserOptions: {
      sourceType: 'module',
      ecmaFeatures: {
          jsx: true 
      }
  },
//   extends: ['eslint:recommended'],
  plugins: [],
  rules: {
      'no-unused-expressions' : 'off',
      'no-unused-vars' : 'off',
      'no-async-promise-executor' : 1,
      'no-case-declarations' : 1,
      'react-hooks/exhaustive-deps' : 'off'
  },
  globals: {
      location: true,
      setTimeout: true
  }
}