const compile = (path) => {
  const parts = path.split('/').map((part) => {
    if (part.startsWith(':')) {
      switch (true) {
        case part.endsWith('*'):
          return {
            required: false,
            multiple: true,
            key: part.substring(1, part.length - 1)
          }

        case part.endsWith('+'):
          return {
            required: true,
            multiple: true,
            key: part.substring(1, part.length - 1)
          }

        case part.endsWith('?'):
          return {
            required: false,
            multiple: false,
            key: part.substring(1, part.length - 1)
          }

        default:
          return {
            required: true,
            multiple: false,
            key: part.substring(1)
          }
      }
    }

    return {
      value: part
    }
  })

  const match = (path) => {
    path = path.split('/')

    const params = {}

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.value == null) {
        if (path[0] == null && part.required) return null

        const remainder = parts.reduce((acc, p, j) => {
          if (j > i) {
            if (p.value != null || p.required) {
              return acc + 1
            }
          }

          return acc
        }, 0)

        let deleteCount = path.length - remainder

        if (!deleteCount && part.required) {
          deleteCount = 1
        }

        if (deleteCount > 1 && !part.multiple) {
          deleteCount = 1
        }

        params[part.key] = path.splice(0, deleteCount)

        if (!part.multiple) {
          params[part.key] = params[part.key][0]
        }
      } else if (part.value === path[0]) {
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

      if (part.value != null) {
        path.push(part.value)

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
          paths = typeof paths === 'string' ? [paths] : paths

          for (let i = 0; i < paths.length; i++) {
            const path = paths[i]
            let params

            if (path === subj) {
              params = {}
            } else {
              params = get(path).match(subj)
            }

            if (params) {
              result = component(params)

              break
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

  const link = (path, params) => {
    if (!path.startsWith(':') && !path.includes('/:')) {
      return path
    }

    return get(path).reverse(params)
  }

  const get = (path) => {
    if (cache[path] == null) {
      cache[path] = compile(path)
    }

    return cache[path]
  }

  return {route, link}
}
