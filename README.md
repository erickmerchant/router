# @erickmerchant/router

A module to do routing inside your components. Meant to be used with [@erickmerchant/framework](https://github.com/erickmerchant/framework). It does not provide history api listening and dispatching. For that you'll have to use something like [history](https://npmjs.com/package/history), illustrated in the example below. It simply is a tool to use in your components to route based on a prop in your state.

``` javascript
/* an example */

const framework = require('@erickmerchant/framework')
const {route, link} = require('@erickmerchant/router')()
const html = require('yo-yo')
const store = require('./store.js')
const diff = html.update
const target = document.querySelector('main')
const createHistory = require('history').createBrowserHistory
const history = createHistory()

framework({target, store, component, diff})(({dispatch}) {
  history.listen(function (location) {
    dispatch('location', location.pathname)
  })

  dispatch('location', history.location.pathname)
})

function component () {
  return html`
  <body>
    ${route(state.location, (on) => {
      on('page/a', () => html`<h1><a href="${link('page/:id', {id: 'a'})}">Page A</a></h1>`)

      on('page/b', () => html`<h1><a href="${link('page/:id', {id: 'b'})}">Page B</a></h1>`)

      on('page/:id', (params) => html`<h1><a href="${link('page/:id', {id: params.id})}">Page ${params.id}</a></h1>`)

      on(() => html`<h1>Page Not Found</h1>`)
    })}
  </body>`
}
```

## API Reference

### main

_main()_

The function exported by this module. Call it to get a new router.

Returns {route, link}. See [route](#route) and [link](#link)

### route

_route(argument, (on) => { ... })_

- argument: A string. What to try to match paths against.
- [on](#on)

Returns the returned value of calling the component for the matching path.

### on

_on(path, component)_

- [path](#path)
- [component](#component)

### link

_link(path, object)_

- [path](#path)
- object: Props in the object are matched up to the colon prefixed segments in the path.

Returns a string to be used as say the href on an anchor.

### path

_path_

A string. It can contain multiple segments separated by slashes. Slashes and the beginning and end are trimmed off. Segments can begin with a colon. Those are replaced by props for the object in the case of [link](#link) or populate params in the case of [component](#component).

### component

_component((params) { ... })_

- params: An object populated from colon prefixed segments in the route.

It should return html.
