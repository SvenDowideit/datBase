var levelRest = require('level-rest-parser')
var extend = require('extend')
var datPing = require('dat-ping')
var debug = require('debug')('api/metadat')

var schema = require('./metadat.json')

module.exports = function (db, opts) {
  if (!opts) opts = {}
  if (!opts.schema) opts.schema = schema

  var model = levelRest(db, opts)

  var metadat = {}
  extend(metadat, model) // inheritance

  metadat.authorize = function (opts, userData, cb) {
    var params = opts.params
    // if it doesnt have an id we dont need to do custom authorization
    if (!params.id) return cb(null, userData)

    // only allow users to edit their own data
    model.get({id: params.id}, function (err, meta) {
      // if not exists then skip authorization
      if (err) return cb(null, userData)
      // ensure only owner can edit
      if (meta.owner_id !== userData.user.handle) return cb(new Error('Action not allowed.'))
      else cb(null, userData)
    })
  }

  metadat.put = function (data, opts, cb) {
    // we dont allow users to PUT through the API, only manually refresh for now
    if (data.refresh) {
      model.get({id: data.id}, function (err, data) {
        if (err) return cb(err)
        refresh(data, opts, function (metadat) {
          model.put(metadat, opts, cb)
        })
      })
    }
    else cb(new Error('Action not allowed.'))
  }

  metadat.post = function (data, opts, cb) {
    var self = this
    self.indexes['url'].find(data.url, function (err, rows) {
      if (err) return cb(err)
      if (rows.length > 0) return cb(new Error('Someone has already published a dat with that url'))

      metadat.indexes['owner_id'].find(data.owner_id, function (err, rows) {
        if (err) return cb(err)
        if (rows.length > 0) {
          for (var i in rows) {
            var row = rows[i]
            if (row.name === data.name) {
              return cb(new Error('You have already published a dat with that name'))
            }
          }
        }
        refresh(data, opts, function (metadat) {
          if (metadat.error) return cb(new Error(metadat.error))
          model.post(metadat, opts, cb)
        })
      })
    })
  }

  function refresh (metadat, opts, cb) {
    datPing(metadat.url, function (err, status) {
      metadat.last_updated = new Date().toISOString()
      metadat.error = err && err.message || undefined
      if (err) {
        debug('refresh error:', err, metadat)
        return cb(metadat)
      }
      metadat.status = status
      metadat.name = metadat.status.dat.name || metadat.url
      metadat.description = metadat.status.dat.description || ''
      debug('new metadat:', metadat)
      return cb(metadat)
    })
  }

  return metadat
}
