const assert = require('assert')

module.exports = function () {
  const cache = {}

  return {route, link}

  function route (subj, config) {
    let defaultComponent
    let result

    config(function (path, component) {
      if (!result) {
        if (component != null) {
          let params = get(path).match(subj)

          if (params) {
            result = component(params)
          }
        } else {
          defaultComponent = path
        }
      }
    })

    if (result) {
      return result
    }

    if (defaultComponent != null) {
      return defaultComponent()
    }

    assert.ok(false, 'no component found')
  }

  function link (path, obj) {
    return get(path).reverse(obj)
  }

  function get (path) {
    let compiled

    if (cache[path] != null) {
      compiled = cache[path]
    } else {
      compiled = compile(path)

      cache[path] = compiled
    }

    return compiled
  }
}

function compile (path) {
  let parts = path.split('/').map(function (part) {
    if (part.indexOf(':') === 0) {
      switch (part.substr(-1)) {
        case '*':
          return {
            variable: true,
            required: false,
            multiple: true,
            key: part.substring(1, part.length - 1)
          }

        case '+':
          return {
            variable: true,
            required: true,
            multiple: true,
            key: part.substring(1, part.length - 1)
          }

        case '?':
          return {
            variable: true,
            required: false,
            multiple: false,
            key: part.substring(1, part.length - 1)
          }

        default:
          return {
            variable: true,
            required: true,
            multiple: false,
            key: part.substr(1)
          }
      }
    }

    return {
      variable: false,
      match: part
    }
  })

  return {match, reverse}

  function match (path) {
    path = path.split('/')

    let params = {}

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]

      if (part.variable === true) {
        if (path[0] == null && part.required) return null

        const remainder = parts.length - i - 1

        params[part.key] = part.multiple ? path.splice(0, path.length - remainder) : path.shift()
      } else if (part.match === path[0]) {
        path.shift()
      } else {
        return null
      }
    }

    if (path.length) {
      return null
    }

    return params
  }

  function reverse (obj) {
    let path = []

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]

      if (part.variable === true) {
        assert.ok(obj[part.key] != null || !part.required, part.key + ' is null or undefined and required')

        if (obj[part.key] != null) {
          if (part.multiple) {
            assert.ok(Array.isArray(obj[part.key]), part.key + ' is not an array')

            path.push(obj[part.key].map((val) => String(val)).join('/'))
          } else {
            assert.ok(!Array.isArray(obj[part.key]), part.key + ' is an array')

            path.push(String(obj[part.key]))
          }
        }
      } else {
        path.push(part.match)
      }
    }

    return path.join('/')
  }
}
