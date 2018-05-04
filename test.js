const test = require('tape')

test('test main - link', function (t) {
  t.plan(6)

  const { link } = require('./main')()

  t.equals(link('tests/:test', { test: 123 }), 'tests/123')

  t.equals(link('/tests/:test', { test: 123 }), '/tests/123')

  t.equals(link('tests/:test/', { test: 123 }), 'tests/123/')

  t.equals(link('/tests/:test/', { test: 123 }), '/tests/123/')

  t.equals(link('tests/:foo/:bar*', { foo: 123, bar: ['a', 'b', 'c'] }), 'tests/123/a/b/c')

  t.equals(link('tests/:foo?/:bar+', { foo: 123, bar: ['a', 'b', 'c'] }), 'tests/123/a/b/c')
})

test('test main - link throws', function (t) {
  t.plan(4)

  const { link } = require('./main')()

  t.throws(() => link('tests/:test', { abc: 123 }), /test is null or undefined/)

  t.throws(() => link('tests/:test*', { test: 123 }), /test is not an array/)

  t.throws(() => link('tests/:test', { test: [1, 2, 3] }), /test is an array/)

  t.throws(() => link('tests/:test+', { test: [] }), /test is an empty array/)
})

test('test main - route', function (t) {
  t.plan(6)

  const { route } = require('./main')()

  const config = function (on) {
    on('/test1/:foo/:bar*', component)

    on('/test2/:foo?/:bar+', component)

    on('/test3/:foo', component)

    on(() => 'not found')
  }

  t.deepEquals(route('/test1/123', config), { foo: '123', bar: [] })

  t.deepEquals(route('/test1/123/a/b/c', config), { foo: '123', bar: ['a', 'b', 'c'] })

  t.deepEquals(route('/test2/123/a', config), { foo: '123', bar: ['a'] })

  t.deepEquals(route('/test2/123/a/b/c', config), { foo: '123', bar: ['a', 'b', 'c'] })

  t.equals(route('/test3/x/y', config), 'not found')

  t.equals(route('/test3', config), 'not found')
})

test('test main - route throws', function (t) {
  t.plan(1)

  const { route } = require('./main')()

  const config = function (on) {
    on('/abc', () => {})
  }

  t.throws(() => route('/test', config), /no component found/)
})

test('test main - link to route', function (t) {
  t.plan(20)

  const { link, route } = require('./main')()

  const config = function (on) {
    on('test1/:foo/:bar*', component)

    on('test2/:foo/:bar+', component)

    on('test3/:foo/:bar?', component)

    on('test4/:foo*/:bar', component)

    on('test5/:foo*/:bar+', component)

    on('test6/:foo*/:bar?', component)

    on('test7/:foo+/:bar', component)

    on('test8/:foo+/:bar*', component)

    on('test9/:foo+/:bar?', component)

    on('test10/:foo?/:bar', component)

    on('test11/:foo?/:bar*', component)

    on('test12/:foo?/:bar+', component)
  }

  t.deepEquals(route(link('test1/:foo/:bar*', { foo: '123', bar: ['a', 'b', 'c'] }), config), { foo: '123', bar: ['a', 'b', 'c'] })

  t.deepEquals(route(link('test1/:foo/:bar*', { foo: '123', bar: [] }), config), { foo: '123', bar: [] })

  t.deepEquals(route(link('test2/:foo/:bar+', { foo: '123', bar: ['a', 'b', 'c'] }), config), { foo: '123', bar: ['a', 'b', 'c'] })

  t.deepEquals(route(link('test3/:foo/:bar?', { foo: '123', bar: 'abc' }), config), { foo: '123', bar: 'abc' })

  t.deepEquals(route(link('test3/:foo/:bar?', { foo: '123', bar: undefined }), config), { foo: '123', bar: undefined })

  t.deepEquals(route(link('test4/:foo*/:bar', { foo: ['1', '2', '3'], bar: 'abc' }), config), { foo: ['1', '2', '3'], bar: 'abc' })

  t.deepEquals(route(link('test4/:foo*/:bar', { foo: [], bar: 'abc' }), config), { foo: [], bar: 'abc' })

  t.deepEquals(route(link('test5/:foo*/:bar+', { foo: ['1', '2', '3'], bar: ['a'] }), config), { foo: ['1', '2', '3'], bar: ['a'] })

  t.deepEquals(route(link('test5/:foo*/:bar+', { foo: [], bar: ['a'] }), config), { foo: [], bar: ['a'] })

  t.deepEquals(route(link('test6/:foo*/:bar?', { foo: ['1', '2', '3'], bar: undefined }), config), { foo: ['1', '2', '3'], bar: undefined })

  t.deepEquals(route(link('test6/:foo*/:bar?', { foo: [], bar: undefined }), config), { foo: [], bar: undefined })

  t.deepEquals(route(link('test7/:foo+/:bar', { foo: ['1', '2', '3'], bar: 'abc' }), config), { foo: ['1', '2', '3'], bar: 'abc' })

  t.deepEquals(route(link('test8/:foo+/:bar*', { foo: ['1', '2', '3'], bar: [] }), config), { foo: ['1', '2', '3'], bar: [] })

  t.deepEquals(route(link('test9/:foo+/:bar?', { foo: ['1', '2', '3'], bar: undefined }), config), { foo: ['1', '2', '3'], bar: undefined })

  t.deepEquals(route(link('test10/:foo?/:bar', { foo: '123', bar: 'abc' }), config), { foo: '123', bar: 'abc' })

  t.deepEquals(route(link('test10/:foo?/:bar', { foo: undefined, bar: 'abc' }), config), { foo: undefined, bar: 'abc' })

  t.deepEquals(route(link('test11/:foo?/:bar*', { foo: '123', bar: ['a'] }), config), { foo: '123', bar: ['a'] })

  t.deepEquals(route(link('test11/:foo?/:bar*', { foo: undefined, bar: [] }), config), { foo: undefined, bar: [] })

  t.deepEquals(route(link('test12/:foo?/:bar+', { foo: '123', bar: ['a', 'b', 'c'] }), config), { foo: '123', bar: ['a', 'b', 'c'] })

  t.deepEquals(route(link('test12/:foo?/:bar+', { foo: undefined, bar: ['a'] }), config), { foo: undefined, bar: ['a'] })
})

function component (params) {
  return params
}
