# @erickmerchant/router

A module to do routing inside your components. Meant to be used with [@erickmerchant/framework](https://github.com/erickmerchant/framework). It does not provide history api listening and dispatching.

## Example

``` javascript
/* component.js */

import router from '@erickmerchant/router'
import {html} from '@erickmerchant/framework'

const {body, h1, a} = html
const {route, link} = router()

module.exports = () => {
  return body(
    route(state.location, (on) => {
      on('page/a', () => h1(a({href: link('page/:id', {id: 'a'})}, 'Page A')))

      on('page/b', () => h1(a({href: link('page/:id', {id: 'b'})}, 'Page B')))

      on('page/:id', (params) => h1(a({href: link('page/:id', {id: params.id})}, `Page ${params.id}`)))

      on(() => h1('Page Not Found'))
    })
  )
}
```

A route can contain multiple segments separated by slashes. Segments can begin with a colon. Those are replaced by props for the object in the case of [link](#link) or populate params in the case of [component](#component). Colon prefixed segments can have a \*, \+, or ? modifier at the end, which change whether it is required and whether it consumes multiple segments.

|          | required | multiple
|---       |---       |---
|:example  | true     | false
|:example* | false    | true
|:example+ | true     | true
|:example? | false    | false
