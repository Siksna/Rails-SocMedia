const { environment } = require('@rails/webpacker')
const path = require('path')

environment.loaders.append('css', {
  test: /\.css$/i,
  use: ['style-loader', 'css-loader']
})


environment.config.merge({
  resolve: {
    alias: {
      controllers: path.resolve(__dirname, '../../app/javascript/controllers')
    }
  }
})

module.exports = environment
