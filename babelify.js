require('babel-register')({
  ignore: /node_modules(?!\/commuter-connections)/,
  plugins: ['add-module-exports'],
  presets: ['es2015', 'stage-0']
})
