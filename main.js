module.exports = function () {
  const cache = {}

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
  let parts = path.split('/').map((part) => {
    if (part.indexOf(':') === 0) {
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
    path = path.split('/')

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
