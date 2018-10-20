const assert = require('assert')

module.exports = () => {
  const cache = {}

  return { route, link }

  function route (subj, config) {
    let defaultComponent
    let result

    config((path, component) => {
      if (!result) {
        if (component != null) {
          const params = get(path).match(subj)

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
  const parts = path.split('/').map((part) => {
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

  return { match, reverse }

  function match (path) {
    path = path.split('/')

    const params = {}

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.variable === true) {
        if (path[0] == null && part.required) return null

        const remainder = parts.slice(i + 1).filter((p) => !p.variable || p.required).length

        let deleteCount = (path.length - remainder)

        if (!deleteCount && part.required) {
          deleteCount = 1
        }

        if (deleteCount > 1 && !part.multiple) {
          deleteCount = 1
        }

        params[part.key] = path.splice(0, deleteCount)

        if (!part.multiple) {
          params[part.key] = params[part.key][0] || undefined
        }
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
    const path = []
    let multiple = false

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.variable !== true) {
        path.push(part.match)

        continue
      }

      assert.ok(obj[part.key] != null || !part.required, part.key + ' is null or undefined and required')

      if (obj[part.key] != null) {
        if (part.multiple) {
          assert.ok(Array.isArray(obj[part.key]), part.key + ' is not an array')

          if (part.required) {
            assert.ok(obj[part.key].length > 0, part.key + ' is an empty array')
          }

          if (multiple && part.required) {
            path.push(String(obj[part.key][0]))
          } else if (!multiple && obj[part.key].length) {
            path.push(obj[part.key].map((val) => String(val)).join('/'))
          }

          multiple = true
        } else if (part.required || !multiple) {
          assert.ok(!Array.isArray(obj[part.key]), part.key + ' is an array')

          path.push(String(obj[part.key]))
        }
      }
    }

    return path.join('/')
  }
}
