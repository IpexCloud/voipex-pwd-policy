const assert = require('assert')
const PasswordPolicy = require('../index.js')

describe(`Test of validators`, () => {
  it(`minimal length - correct`, () => {
    const policy = new PasswordPolicy()
    policy.minimumLength = 5
    const actual = policy.validate('aaaaa')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`minimal length - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.minimumLength = 5
    const actual = policy.validate('aaaa')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`maximal length - correct`, () => {
    const policy = new PasswordPolicy()
    policy.maximumLength = 5
    const actual = policy.validate('aaaaa')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`maximal length - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.maximumLength = 5
    const actual = policy.validate('aaaaaa')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`minimal number of upper letters - correct`, () => {
    const policy = new PasswordPolicy()
    policy.minimumNumberOfUpperLetters = 3
    const actual = policy.validate('aAaBaC')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`minimal number of upper letters - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.minimumNumberOfUpperLetters = 3
    const actual = policy.validate('aAaBa')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`minimal time to crack - correct`, () => {
    const policy = new PasswordPolicy()
    policy.minimumTimeToCrack = 3
    const actual = policy.validate('aAaBaCadddd')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`minimal time to crack - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.minimumTimeToCrack = 3
    const actual = policy.validate('a')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`validate symbols - correct`, () => {
    const policy = new PasswordPolicy()
    policy.allowedSymbols = '$%-'
    policy.checkSymbols(true)
    const actual = policy.validate('x-X-x')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`validate symbols - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.allowedSymbols = '$%'
    policy.checkSymbols(true)
    const actual = policy.validate('x-X-x')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`validate digits - correct`, () => {
    const policy = new PasswordPolicy()
    policy.allowedNumbers = '0'
    policy.checkNumbers(true)
    const actual = policy.validate('x-0-x')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`validate digits - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.allowedNumbers = ''
    policy.checkNumbers(true)
    const actual = policy.validate('x-0-x')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`validate letters - correct`, () => {
    const policy = new PasswordPolicy()
    policy.allowedLowerLetter = 'x'
    policy.allowedUpperLetter = ''
    policy.checkLetters(true)
    const actual = policy.validate('x-0-x')
    const expected = true
    assert.equal(actual, expected)
  })

  it(`validate letters - incorrect`, () => {
    const policy = new PasswordPolicy()
    policy.allowedLowerLetter = ''
    policy.allowedUpperLetter = ''
    policy.checkLetters(true)
    const actual = policy.validate('x-0-x')
    const expected = false
    assert.equal(actual, expected)
  })

  it(`default user - correct`, () => {
    const policy = new PasswordPolicy()
    policy.defaultPolicy = 'user'
    const actual = policy.validate('AbrakaDabra123')
    const expected = true
    assert.equal(actual, expected)
  })
})
