var path = require('path')

var config = {
  'DEBUG': true,
  'DAT_REGISTRY_HOSTNAME': 'http://localhost',
  'DAT_REGISTRY_HOST': 'http://localhost:5000',
  'DAT_REGISTRY_DB': path.join(__dirname, '..', 'data'),
  'DAT_SEARCH_DB': path.join(__dirname, '..', 'dat.sqlite'),
  'GITHUB_CLIENT': undefined,
  'GITHUB_SECRET': undefined,
  'PORT': 5000,
  'ADMINS': ['karissa']
}

// override the settings with env vars for multi-deploy scenarios
for (v in config) {
  if (process.env.hasOwnProperty(v)) {
    config[v] = process.env[v]
  }
}

module.exports = config
