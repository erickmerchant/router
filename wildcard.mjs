const trimSplit = (str) => {
  const arr = str.split('/')

  if (arr[0] === '') arr.shift()
  if (arr[arr.length - 1] === '') arr.pop()

  return arr
}

const match = (route, input) => {
  route = trimSplit(route)
  input = trimSplit(input)

  const params = []

  let i = -1

  while (++i < route.length) {
    const part = route[i]

    if (part === '*' || part === '**') {
      if (input[0] == null) return null

      const deleteCount = part === '*' ? 1 : input.length - route.slice(1).filter((p) => p !== '**').length

      if (deleteCount === 0) return null

      const val = input.splice(0, deleteCount)

      params.push(part === '*' ? val[0] : val)
    } else if (part === input[0]) {
      input.shift()
    } else {
      return null
    }
  }

  if (input.length) {
    return null
  }

  return params
}

export const route = (input, config) => {
  let defaultCb
  let result

  config((routes, cb) => {
    if (result == null) {
      if (cb != null) {
        routes = typeof routes === 'string' ? [routes] : routes

        let i = -1

        while (++i < routes.length) {
          const route = routes[i]
          let params

          if (route === input) {
            params = []
          } else {
            params = match(route, input)
          }

          if (params) {
            result = cb(params)

            break
          }
        }
      } else {
        defaultCb = routes
      }
    }
  })

  if (result) {
    return result
  }

  if (defaultCb != null) {
    return defaultCb()
  }
}

export const link = (strs, ...vars) => {
  let output = ''

  for (let i = 0; i < strs.length; i++) {
    output += strs[i]

    if (i < vars.length) {
      if (Array.isArray(vars[i])) {
        output += vars[i].join('/')
      } else {
        output += vars[i]
      }
    }
  }

  return output
}
