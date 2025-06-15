module.exports = {
  root: true,
  env: {
    node: true,
    amd: true
  },
  globals: {
    $: 'readonly',
    define: 'readonly'
  },
  extends: [
    'plugin:vue/essential'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  rules: {
    indent: ['off', 2],
    'space-before-function-paren': 0,
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-tabs': 0,
    'no-mixed-spaces-and-tabs': 0,
    'no-unused-vars': 0,
    'no-trailing-spaces': 0,
    eqeqeq: 0,
    'no-console': 'off',
    'no-irregular-whitespace': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/no-mutating-props': 'off'
  }
}