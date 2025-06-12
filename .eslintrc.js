module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    indent: ['off', 2],
    'space-before-function-paren': 0,
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'arrow-parens': 0,    
    // allow async-await    
    'generator-star-spacing': 0,    
    // allow debugger during development    
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,    
    'no-tabs': 0,   
    'no-mixed-spaces-and-tabs': 0,    
    'no-unused-vars': 0,    
    'no-trailing-spaces': 0,    
    eqeqeq: 0,
    'no-console': 'off',
    'no-irregular-whitespace': 'off'
  }
}
