const Checker = require('password-checker')
const mellt = require('./src/mellt.js')

const IpexPasswordChecker = function() {
  const self = this

  this.lowerLetters = 'abcdefghijklmnopqrstuvwxyz'
  this.upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  this.specialSymbolsUser = ',.!#@*'
  this.specialSymbolsSip = '-.*()%'
  this.penetration = '.*'
  this.checker = new Checker()
  this.mellt = mellt
  this.min_time_to_crack = 0
  this.checker.allowed_symbols = '_-!"?$%^&*()+={}[]:;@\'~#|<>,.?\\/ '
  this.checker.min_length = 0
  this.checker.max_length = 0
  this.upper = 0
}

// ----------------------------------------------------------
// Settings for checker
// ----------------------------------------------------------

/**
 * Set minimal password length
 * @param {number} length
 */
IpexPasswordChecker.prototype.setMinLength = function(length) {
  this.checker.min_length = length
}

/**
 * Set maximal password length
 * @param {number} length
 */
IpexPasswordChecker.prototype.setMaxLength = function(length) {
  this.checker.max_length = length
}

/**
 * Set allowed letters password can contain
 * @param {string} letters
 */
IpexPasswordChecker.prototype.setAllowedLetters = function(
  upperLetters,
  lowerLetters
) {
  this.lowerLetters = lowerLetters || ''
  this.upperLetters = upperLetters || ''
  this.checker.allowed_letters = this.upperLetters + this.lowerLetters
}

/**
 * Set allowed numbers password can contain
 * @param {string} numbers
 */
IpexPasswordChecker.prototype.setAllowedNumbers = function(numbers) {
  this.checker.allowed_numbers = numbers
}

/**
 * Set allowed symbols password can contain
 * @param {string} symbols
 */
IpexPasswordChecker.prototype.setAllowedSpecialSymbols = function(symbols) {
  this.checker.allowed_symbols = symbols
}

/**
 * Should check that the password only has letters from allowed_letters in it
 * @param  {boolean} active true|false
 */
IpexPasswordChecker.prototype.checkLetters = function(active) {
  this.checker.checkLetters(active)
}

/**
 * Should check that the password has letter in it
 * @param  {boolean} active true|false
 */
IpexPasswordChecker.prototype.requireLetters = function(active) {
  this.checker.requireLetters(active)
}

/**
 * Should check that the password only has numbers from allowed_numbers in it
 * @param  {boolean} active true|false
 */
IpexPasswordChecker.prototype.checkNumbers = function(active) {
  this.checker.checkNumbers(active)
}

/**
 * Should check that the password has numbers in it
 * @param  {boolean} active true|false
 */
IpexPasswordChecker.prototype.requireNumbers = function(active) {
  this.checker.requireNumbers(active)
}

/**
 * Should check that the password only has symbols from allowed_letters in it
 * @param  {boolean} active true|false
 */
IpexPasswordChecker.prototype.checkSymbols = function(active) {
  this.checker.checkSymbols(active)
}

/**
 * Should check that the password has symbols in it
 * @param  {boolean} active true|false
 */
IpexPasswordChecker.prototype.requireSymbols = function(active) {
  this.checker.requireSymbols(active)
}

IpexPasswordChecker.prototype.requireSymbols = function(active) {
  this.checker.requireSymbols(active)
}

/**
 * Minimal number of day days password to be cracked
 * @param  {number} days
 */
IpexPasswordChecker.prototype.setMinTimeToCrack = function(days) {
  this.min_time_to_crack = days
}

/**
 * Minimal number of upper letters
 * @param  {number} length
 */
IpexPasswordChecker.prototype.setUpper = function(length) {
  this.upper = length
}

/**
 * Which default policy to set
 * @param  {string} policy user | sip
 */
IpexPasswordChecker.prototype.setDefaultPolicy = function(policy) {
  this.checker.requireLetters(true)
  this.checker.requireNumbers(false)
  this.checker.requireSymbols(false)
  this.checker.checkLetters(true)
  this.checker.checkNumbers(true)
  this.checker.checkSymbols(true)
  this.upper = 1

  if (policy === 'user') {
    this.min_time_to_crack = 14
    this.checker.min_length = 10
    this.upper = 1
    this.checker.allowed_symbols = this.specialSymbolsUser
  } else if (policy === 'sip') {
    this.checker.min_length = 8
    this.checker.allowed_symbols = this.specialSymbolsSip
  } else {
    throw new Error(`Policy ${policy} is not allowed`)
  }
}

IpexPasswordChecker.prototype.check = function(password, cb) {
  this.errors = []
  this.password = password

  for (var i in this.rules) {
    var err = this.rules[i].method()
    if (err) {
      this.errors.push(err)
      this.rules[i].failed = true
      this.rules[i].error_message = err.message
    } else {
      this.rules[i].failed = false
    }
  }
  if (this.upper) {
    const size = this.upperLetters
      .split('')
      .filter(letter => password.indexOf(letter) !== -1)
    if (this.upper > size) {
      this.errors.push(
        new Error(
          `Password does not contain required number of upper letters (${
            this.upper
          })`
        )
      )
    }
  }
  if (this.min_time_to_crack) {
    if (this.mellt.CheckPassword(password) < this.min_time_to_crack) {
      this.errors.push(
        new Error(
          `Password can be cracked sooner than ${this.min_time_to_crack}`
        )
      )
    }
  }

  if (cb) {
    cb(this.errors.length ? this.errors : null)
  }
  return !this.errors.length
}

module.exports = IpexPasswordChecker
