const compile = (path) => {
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

  const match = (path) => {
    path = path.split('/')

    const params = {}

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.variable === true) {
        if (path[0] == null && part.required) return null

        const remainder = parts.slice(i + 1).filter((p) => !p.variable || p.required).length

        let deleteCount = path.length - remainder

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

  const reverse = (params) => {
    const path = []
    let multiple = false

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.variable !== true) {
        path.push(part.match)

        continue
      }

      if (params[part.key] != null) {
        if (part.multiple) {
          if (multiple && part.required) {
            if (params[part.key].length > 0) {
              path.push(String(params[part.key][0]))
            }
          } else if (!multiple && params[part.key].length) {
            path.push(params[part.key].map((val) => String(val)).join('/'))
          }

          multiple = true
        } else if (part.required || !multiple) {
          if (!Array.isArray(params[part.key])) {
            path.push(String(params[part.key]))
          }
        }
      }
    }

    return path.join('/')
  }

  return {match, reverse}
}

export default () => {
  const cache = {}

  const route = (subj, config) => {
    let defaultComponent
    let result

    config((paths, component) => {
      if (!result) {
        if (component != null) {
          paths = [].concat(paths)

          for (let i = 0; i < paths.length; i++) {
            const path = paths[i]
            const params = get(path).match(subj)

            if (params) {
              result = component(params)
            }
          }
        } else {
          defaultComponent = paths
        }
      }
    })

    if (result) {
      return result
    }

    if (defaultComponent != null) {
      return defaultComponent()
    }
  }

  const link = (path, params) => get(path).reverse(params)

  const get = (path) => {
    let compiled

    if (cache[path] != null) {
      compiled = cache[path]
    } else {
      compiled = compile(path)

      cache[path] = compiled
    }

    return compiled
  }

  return {route, link}
}
