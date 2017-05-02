module.exports = function () {
  const cache = new Map()

  return {route, link}

  function route (subj, config) {
    const pathes = []
    let defaultComponent

    config((path, component) => {
      if (component != null) {
        pathes.push([get(path), component])
      } else {
        defaultComponent = path
      }
    })

    for (let i = 0; i < pathes.length; i++) {
      let [compiled, component] = pathes[i]

      const params = compiled.match(subj)

      if (params) {
        return component(params)
      }
    }

    if (defaultComponent != null) {
      return defaultComponent()
    }

    throw new Error('no component found')
  }

  function link (path, obj) {
    return '/' + get(path).reverse(obj)
  }

  function get (path) {
    path = trim(path)

    let compiled

    if (cache.has(path)) {
      compiled = cache.get(path)
    } else {
      compiled = compile(path)

      cache.set(path, compiled)
    }

    return compiled
  }
}

function compile (path) {
  let parts = path.split('/').map((part) => {
    if (part.startsWith(':')) {
      return {
        match: '*',
        key: part.substr(1)
      }
    }

    return {
      match: part
    }
  })

  return {match, reverse}

  function match (path) {
    path = trim(path).split('/')

    if (path.length !== parts.length) {
      return null
    }

    let params = {}

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]

      if (part.match === '*') {
        params[part.key] = path[i]
      } else if (part.match !== path[i]) {
        return null
      }
    }

    return params
  }

  function reverse (obj) {
    let path = []

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]

      if (part.match === '*') {
        if (obj[part.key] == null) {
          throw new Error(part.key + ' is null or undefined')
        }

        path.push(String(obj[part.key]))
      } else {
        path.push(part.match)
      }
    }

    return path.join('/')
  }
}

function trim (str = '') {
  if (str.startsWith('/')) {
    str = str.substring(1)
  }

  if (str.endsWith('/')) {
    str = str.substring(0, str.length - 1)
  }

  return str
}
