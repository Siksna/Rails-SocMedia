const { environment } = require('@rails/webpacker')
const path = require('path')

environment.config.merge({
  resolve: {
    alias: {
      controllers: path.resolve(__dirname, '../../app/javascript/controllers')
    }
  }
})

module.exports = environment
