const test = require('tape')

test('test main - link', function (t) {
  t.plan(4)

  const { link } = require('./main')()

  t.equals(link('tests/:test', { test: 123 }), 'tests/123')

  t.equals(link('/tests/:test', { test: 123 }), '/tests/123')

  t.equals(link('tests/:test/', { test: 123 }), 'tests/123/')

  t.equals(link('/tests/:test/', { test: 123 }), '/tests/123/')
})

test('test main - link throws', function (t) {
  t.plan(1)

  const { link } = require('./main')()

  t.throws(() => link('tests/:test', { abc: 123 }), /test is null or undefined/)
})

test('test main - route', function (t) {
  t.plan(3)

  const { route } = require('./main')()

  const config = function (on) {
    on('/foo/:test', function (params) {
      t.notOk(true)

      return `testing ${params.test}`
    })

    on('/test/:test', function (params) {
      t.ok(true)

      return `testing ${params.test}`
    })

    on(() => 'not found')
  }

  t.equals(route('/test/123', config), 'testing 123')

  t.equals(route('/test', config), 'not found')
})

test('test main - route throws', function (t) {
  t.plan(1)

  const { route } = require('./main')()

  const config = function (on) {
    on('/abc', () => {})
  }

  t.throws(() => route('/test', config), /no component found/)
})
