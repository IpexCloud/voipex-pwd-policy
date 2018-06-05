const assert = require('assert')
const Checker = require('../')
const checker = new Checker()

describe.skip(`Test of policy user`, () => {
  it(`correct password`, () => {
    checker.setDefaultPolicy('user')
    const actual = checker.check('A1aaaaaaaa')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`missing upper letter`, () => {
    checker.setDefaultPolicy('user')
    const actual = checker.check('a1aaaaaaaavbbbbdfdfsfss')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`not allowed symbol`, () => {
    checker.setDefaultPolicy('user')
    const actual = checker.check('A1aaaaaa^a$aaa', error => {
      console.log(error)
    })
    const expected = false
    assert.equal(actual, expected)
  })
})
