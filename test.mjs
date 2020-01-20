import test from 'tape'
import {router} from '.'
import {route, link} from './wildcard.mjs'

test('test router - link', (t) => {
  t.plan(6)

  const {link} = router()

  t.equals(link('tests/:test', {test: 123}), 'tests/123')

  t.equals(link('/tests/:test', {test: 123}), '/tests/123')

  t.equals(link('tests/:test/', {test: 123}), 'tests/123/')

  t.equals(link('/tests/:test/', {test: 123}), '/tests/123/')

  t.equals(link('tests/:foo/:bar*', {foo: 123, bar: ['a', 'b', 'c']}), 'tests/123/a/b/c')

  t.equals(link('tests/:foo?/:bar+', {foo: 123, bar: ['a', 'b', 'c']}), 'tests/123/a/b/c')
})

const component = (params) => params

test('test router - route', (t) => {
  t.plan(10)

  const {route} = router()

  const config = (on) => {
    on('/test1/:foo/:bar*', component)

    on('/test2/:foo?/:bar+', component)

    on(['/test3/baz', '/test3/qux'], () => 'baz or qux')

    on('/test3/:foo', component)

    on('/test4/:foo', ({foo}) => {
      foo = Number(foo)

      if (!Number.isNaN(foo)) return foo
    })

    on('/test4/:foo', ({foo}) => foo)

    on(() => 'not found')
  }

  t.deepEquals(route('/test1/123', config), {foo: '123', bar: []})

  t.deepEquals(route('/test1/123/a/b/c', config), {foo: '123', bar: ['a', 'b', 'c']})

  t.deepEquals(route('/test2/123/a', config), {foo: '123', bar: ['a']})

  t.deepEquals(route('/test2/123/a/b/c', config), {foo: '123', bar: ['a', 'b', 'c']})

  t.equals(route('/test3/baz', config), 'baz or qux')

  t.equals(route('/test3/qux', config), 'baz or qux')

  t.equals(route('/test3/x/y', config), 'not found')

  t.equals(route('/test3', config), 'not found')

  t.equals(route('/test4/123', config), 123)

  t.equals(route('/test4/abc', config), 'abc')
})

test('test router - link to route', (t) => {
  t.plan(26)

  const {link, route} = router()

  const config = (on) => {
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

    on('test13/:foo/baz', component)

    on('test14/:foo?/baz', component)

    on('test15/:foo*/baz', component)

    on('test16/:foo+/baz', component)
  }

  t.deepEquals(route(link('test1/:foo/:bar*', {foo: '123', bar: ['a', 'b', 'c']}), config), {foo: '123', bar: ['a', 'b', 'c']})

  t.deepEquals(route(link('test1/:foo/:bar*', {foo: '123', bar: []}), config), {foo: '123', bar: []})

  t.deepEquals(route(link('test2/:foo/:bar+', {foo: '123', bar: ['a', 'b', 'c']}), config), {foo: '123', bar: ['a', 'b', 'c']})

  t.deepEquals(route(link('test3/:foo/:bar?', {foo: '123', bar: 'abc'}), config), {foo: '123', bar: 'abc'})

  t.deepEquals(route(link('test3/:foo/:bar?', {foo: '123', bar: undefined}), config), {foo: '123', bar: undefined})

  t.deepEquals(route(link('test4/:foo*/:bar', {foo: ['1', '2', '3'], bar: 'abc'}), config), {foo: ['1', '2', '3'], bar: 'abc'})

  t.deepEquals(route(link('test4/:foo*/:bar', {foo: [], bar: 'abc'}), config), {foo: [], bar: 'abc'})

  t.deepEquals(route(link('test5/:foo*/:bar+', {foo: ['1', '2', '3'], bar: ['a']}), config), {foo: ['1', '2', '3'], bar: ['a']})

  t.deepEquals(route(link('test5/:foo*/:bar+', {foo: [], bar: ['a']}), config), {foo: [], bar: ['a']})

  t.deepEquals(route(link('test6/:foo*/:bar?', {foo: ['1', '2', '3'], bar: undefined}), config), {foo: ['1', '2', '3'], bar: undefined})

  t.deepEquals(route(link('test6/:foo*/:bar?', {foo: [], bar: undefined}), config), {foo: [], bar: undefined})

  t.deepEquals(route(link('test7/:foo+/:bar', {foo: ['1', '2', '3'], bar: 'abc'}), config), {foo: ['1', '2', '3'], bar: 'abc'})

  t.deepEquals(route(link('test8/:foo+/:bar*', {foo: ['1', '2', '3'], bar: []}), config), {foo: ['1', '2', '3'], bar: []})

  t.deepEquals(route(link('test9/:foo+/:bar?', {foo: ['1', '2', '3'], bar: undefined}), config), {foo: ['1', '2', '3'], bar: undefined})

  t.deepEquals(route(link('test10/:foo?/:bar', {foo: '123', bar: 'abc'}), config), {foo: '123', bar: 'abc'})

  t.deepEquals(route(link('test10/:foo?/:bar', {foo: undefined, bar: 'abc'}), config), {foo: undefined, bar: 'abc'})

  t.deepEquals(route(link('test11/:foo?/:bar*', {foo: '123', bar: ['a']}), config), {foo: '123', bar: ['a']})

  t.deepEquals(route(link('test11/:foo?/:bar*', {foo: undefined, bar: []}), config), {foo: undefined, bar: []})

  t.deepEquals(route(link('test12/:foo?/:bar+', {foo: '123', bar: ['a', 'b', 'c']}), config), {foo: '123', bar: ['a', 'b', 'c']})

  t.deepEquals(route(link('test12/:foo?/:bar+', {foo: undefined, bar: ['a']}), config), {foo: undefined, bar: ['a']})

  t.deepEquals(route(link('test13/:foo/baz', {foo: '123'}), config), {foo: '123'})

  t.deepEquals(route(link('test14/:foo?/baz', {foo: undefined}), config), {foo: undefined})

  t.deepEquals(route(link('test14/:foo?/baz', {foo: '123'}), config), {foo: '123'})

  t.deepEquals(route(link('test15/:foo*/baz', {foo: ['a', 'b', 'c']}), config), {foo: ['a', 'b', 'c']})

  t.deepEquals(route(link('test15/:foo*/baz', {foo: []}), config), {foo: []})

  t.deepEquals(route(link('test16/:foo+/baz', {foo: ['a', 'b', 'c']}), config), {foo: ['a', 'b', 'c']})
})

test('test wildcard - route and link', (t) => {
  t.plan(8)

  const config = (on) => {
    on('/test1/*', component)

    on('/test2/**', component)

    on('/test3/*/foo', component)

    on('/test4/**/foo', component)

    on(() => 'not found')
  }

  t.deepEquals(route('/test1/123', config), ['123'])

  t.deepEquals(route('/test2/1/2/3', config), [['1', '2', '3']])

  t.deepEquals(route('/test3/123/foo', config), ['123'])

  t.deepEquals(route('/test4/1/2/3/foo', config), [['1', '2', '3']])

  t.deepEquals(link`/test1/${'123'}`, '/test1/123')

  t.deepEquals(link`/test2/${['1', '2', '3']}`, '/test2/1/2/3')

  t.deepEquals(link`/test3/${'123'}/foo`, '/test3/123/foo')

  t.deepEquals(link`/test4/${['1', '2', '3']}/foo`, '/test4/1/2/3/foo')
})
