# @erickmerchant/router

A module to do routing inside your components. Meant to be used with [@erickmerchant/framework](https://github.com/erickmerchant/framework). It does not provide history api listening and dispatching.

## Example

``` javascript
/* component.js */

import {router} from '@erickmerchant/router'
import {html} from '@erickmerchant/framework'

const {route, link} = router()

export const component = (state) => html`<body>${
    route(state.location, (on) => {
      on('page/a', () => html`<h1><a href=${link('page/:id', {id: 'a'})}>${'Page A'}</a></h1>`)

      on('page/b', () => html`<h1><a href=${link('page/:id', {id: 'b'})}>${'Page B'}</a></h1>`)

      on('page/:id', (params) => html`<h1><a href=${link('page/:id', {id: params.id})}>${`Page ${params.id}`}</a></h1>`)

      on(() => html`<h1>${'Page Not Found'}</h1>`)
    })
  }</body>`
```

A route can contain multiple segments separated by slashes. Segments can begin with a colon. Those are replaced by props from the object in the case of `link` or populate params in the case of `on`. Colon prefixed segments can have a \*, \+, or ? modifier at the end, which change whether it is required and whether it consumes multiple segments.

|          | required | multiple
|---       |---       |---
|:example  | true     | false
|:example* | false    | true
|:example+ | true     | true
|:example? | false    | false
