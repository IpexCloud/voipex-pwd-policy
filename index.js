const Checker = require('password-checker')
const defaultMellt = require('./src/mellt.js')

class PasswordPolicy {
  constructor(checker = new Checker(), mellt = defaultMellt) {
    this.lowerLetters = 'abcdefghijklmnopqrstuvwxyz'
    this.upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.specialSymbolsUser = ',.!#@*'
    this.specialSymbolsSip = '-.*()%'
    this.penetration = '.*'
    this.checker = checker
    this.mellt = mellt
    this.minTimeToCrack = 0
    this.checker.allowed_symbols = '_-!"?$%^&*()+={}[]:;@\'~#|<>,.?\\/ '
    this.checker.min_length = 0
    this.checker.max_length = 0
    this.upper = 0
  }

  /**
   * Set minimal password length
   * @param {number} length
   */
  setMinLength(length) {
    this.checker.min_length = length
  }

  /**
   * Set maximal password length
   * @param {number} length
   */
  setMaxLength(length) {
    this.checker.max_length = length
  }

  /**
   * Set allowed letters password can contain
   * @param {string} letters
   */
  setAllowedLetters(upperLetters = '', lowerLetters = '') {
    this.lowerLetters = lowerLetters
    this.upperLetters = upperLetters
    this.checker.allowed_letters = this.upperLetters + this.lowerLetters
  }

  /**
   * Set allowed numbers password can contain
   * @param {string} numbers
   */
  setAllowedNumbers(numbers) {
    this.checker.allowed_numbers = numbers
  }

  /**
   * Set allowed symbols password can contain
   * @param {string} symbols
   */
  setAllowedSpecialSymbols(symbols) {
    this.checker.allowed_symbols = symbols
  }

  /**
   * Should check that the password only has letters from allowed_letters in it
   * @param  {boolean} active true|false
   */
  checkLetters(active) {
    this.checker.checkLetters(active)
  }

  /**
   * Should check that the password has letter in it
   * @param  {boolean} active true|false
   */
  requireLetters(active) {
    this.checker.requireLetters(active)
  }

  /**
   * Should check that the password only has numbers from allowed_numbers in it
   * @param  {boolean} active true|false
   */
  checkNumbers(active) {
    this.checker.checkNumbers(active)
  }

  /**
   * Should check that the password has numbers in it
   * @param  {boolean} active true|false
   */
  requireNumbers(active) {
    this.checker.requireNumbers(active)
  }

  /**
   * Should check that the password only has symbols from allowed_letters in it
   * @param  {boolean} active true|false
   */
  checkSymbols(active) {
    this.checker.checkSymbols(active)
  }

  /**
   * Should check that the password has symbols in it
   * @param  {boolean} active true|false
   */
  requireSymbols(active) {
    this.checker.requireSymbols(active)
  }
  /**
   * Minimal number of day days password to be cracked
   * @param  {number} days
   */
  setMinTimeToCrack(days) {
    this.minTimeToCrack = days
  }

  /**
   * Minimal number of upper letters
   * @param  {number} length
   */
  setUpper(length) {
    this.upper = length
  }

  /**
   * Which default policy to set
   * @param  {string} policy user | sip
   */
  setDefaultPolicy(policy) {
    this.checker.requireLetters(true)
    this.checker.requireNumbers(false)
    this.checker.requireSymbols(false)
    this.checker.checkLetters(true)
    this.checker.checkNumbers(true)
    this.checker.checkSymbols(true)
    this.upper = 1

    switch (policy) {
      case 'user':
        this.upper = 1
        this.minTimeToCrack = 14
        this.checker.min_length = 10
        this.checker.allowed_symbols = this.specialSymbolsUser
        break
      case 'sip':
        this.checker.min_length = 8
        this.checker.allowed_symbols = this.specialSymbolsSip
        break
      default:
        throw new Error(`Policy ${policy} is not allowed`)
    }
  }

  check(password, cb) {
    this.errors = []
    this.password = password

    for (const i in this.rules) {
      const err = this.rules[i].method()
      const isError = err !== null

      this.rules[i].failed = isError

      if (isError) {
        this.errors.push(err)
        this.rules[i].error_message = err.message
      }
    }

    if (this.upper) {
      const size = this.upperLetters
        .split('')
        .filter(letter => password.includes(letter))
      if (this.upper >= size) {
        this.errors.push(
          new Error(
            `Password does not contain required number of upper letters (${
              this.upper
            })`
          )
        )
      }
    }

    if (
      this.minTimeToCrack &&
      this.mellt.CheckPassword(password) < this.minTimeToCrack
    ) {
      this.errors.push(
        new Error(`Password can be cracked sooner than ${this.minTimeToCrack}`)
      )
    }

    if (cb) {
      cb(this.errors.length ? this.errors : null)
    }
    return !this.errors.length
  }
}

module.exports = PasswordPolicy
