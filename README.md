# @erickmerchant/router

A module to do routing inside your components. Meant to be used with [@erickmerchant/framework](https://github.com/erickmerchant/framework). Does not do anything with the history API for you.

## Example

``` javascript
/* component.js */

import {router} from '@erickmerchant/router'
import {html} from '@erickmerchant/framework'

const {route, link} = router()

export const component = (state) => html`<body>${
    route(state.location, (on) => {
      on('page/:categories+/:id?', (params) => html`<h1><a href=${link('page/:categories+/:id?', params)}>${`Page ${params.id}`}</a></h1>`)

      on(() => html`<h1>Page Not Found</h1>`)
    })
  }</body>`
```

## Parameters

A route can contain multiple segments separated by slashes. Segments can begin with a colon. Those are replaced by props from the object in the case of `link` or populate params in the case of `on`. Colon prefixed segments can have a \*, \+, or ? modifier at the end, which change whether it is required and whether it consumes multiple segments.

|          | required | multiple
|---       |---       |---
|:example  | true     | false
|:example* | false    | true
|:example+ | true     | true
|:example? | false    | false

## Light Version

`widlcard.mjs` provides a more minimal variation.

``` javascript
/* component.js */

import {route, link} from '@erickmerchant/router/wildcard.mjs'
import {html} from '@erickmerchant/framework'

export const component = (state) => html`<body>${
    route(state.location, (on) => {
      on('page/**/*', (categories, id) => html`<h1><a href=${link`page/${categories}/${id}`)}>${`Page ${id}`}</a></h1>`)

      on(() => html`<h1>Page Not Found</h1>`)
    })
  }</body>`
```
