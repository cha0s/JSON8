'use strict'

import assert from 'assert'
import {serialize} from '..'

const valid = [
  ['true', true],
  ['false', false],
  ['null', null],
  ['"foo"', 'foo'],
  ['{}', {}],
  ['[]', []],
  ['42', 42],
  ['-0', -0],
  ['-42', -42],
]

if (global.Set)
  valid.push(['[]', new Set()])

if (global.Map)
  valid.push(['{}', new Map()])

const invalid = [
  ['Infinity', Infinity],
  ['-Infinity', -Infinity],
  ['function', function() {}],
  ['undefined', undefined],
  ['NaN', NaN],
]

if (global.Symbol && typeof Symbol() === 'symbol') invalid.push(['symbol', Symbol()])

const forEach = function(obj, fn) {
  obj.forEach(function(item) {
    fn(item[0], item[1])
  })
}

describe('serialize', () => {

  forEach(valid, (k, v) => {
    it('returns ' + k + ' for ' + k, () => {
      assert.deepEqual(serialize(v), k)
    })
  })

  forEach(invalid, (k, v) => {
    it('throws a TypeError for ' + k, () => {
      assert.throws(() => {
        serialize(v)
      }, TypeError)
    })
  })

  if (global.Map) {
    describe('map', () => {
      it('throws an error for non string keys', () => {
        const map = new Map()
        map.set(null, 'hello')
        assert.throws(() => {
          serialize(map)
        }, TypeError)
      })
    })
  }

  describe('toJSON', () => {

    it('uses toJSON if options are not provided', () => {
      const obj = {}
      obj.toJSON = function() {
        return 'lol'
      }
      assert.strictEqual(serialize(obj), '"lol"')
    })

    it('uses toJSON toJSON option is not provided', () => {
      const obj = {}
      obj.toJSON = function() {
        return 'lol'
      }
      assert.strictEqual(serialize(obj, {}), '"lol"')
    })

    it('uses toJSON toJSON option is set to true', () => {
      const obj = {}
      obj.toJSON = function() {
        return 'lol'
      }
      assert.strictEqual(serialize(obj, {toJSON: true}), '"lol"')
    })

    it('does not use and serialize toJSON if toJSON option is set to false', () => {
      const obj = {}
      obj.toJSON = function() {
        return 'lol'
      }
      assert.strictEqual(serialize(obj, {toJSON: false}), '{}')
    })

    it('serializes toJSON if it is not a function', () => {
      const obj = {toJSON: true}
      const expect = '{"toJSON":true}'
      assert.strictEqual(serialize(obj), expect)
      assert.strictEqual(serialize(obj, {}), expect)
      assert.strictEqual(serialize(obj, {toJSON: false}), expect)
      assert.strictEqual(serialize(obj, {toJSON: true}), expect)
    })

  })

  it('serializes equal to JSON.stringify', () => {
    const arr = [1, 'foo', [], {}]
    arr.toJSON = 'hello'

    const obj = {
      array: arr,
      boolean: true,
      toJSON: 123,
      string: 'foobar',
      "Déjà vu": "Déjà vu",
      /* eslint-disable */
      bar: {
        toJSON: function() {
          return {"foo": "bar"}
        },
      },
      /* eslint-enable */
    }
    assert.strictEqual(serialize(obj), JSON.stringify(obj))
  })

})
