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
  t.plan(3)

  const { link } = require('./main')()

  t.throws(() => link('tests/:test', { abc: 123 }), /test is null or undefined/)

  t.throws(() => link('tests/:test*', { test: 123 }), /test is not an array/)

  t.throws(() => link('tests/:test', { test: [1, 2, 3] }), /test is an array/)
})

test('test main - route', function (t) {
  t.plan(6)

  const { route } = require('./main')()

  const config = function (on) {
    on('/test1/:foo/:bar*', function (params) {
      return params
    })

    on('/test2/:foo?/:bar+', function (params) {
      return params
    })

    on('/test3/:foo', function (params) {
      return params
    })

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
