var fs = require('fs')
var response = require('response')
var st = require('st')

var indexHTML = fs.readFileSync('./index.html')
var API = require('./api')

module.exports = function (overrides, cb) {
  var api = new API(overrides)

  api.router.addRoute('/static/*', st({
    path: __dirname + '/static',
    url: '/static'
  }))

  api.router.addRoute('*', function (req, res) {
    response.html(indexHTML).pipe(res)
  })

  return api
}
