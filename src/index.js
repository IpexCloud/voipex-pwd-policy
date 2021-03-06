const R = require('ramda')

const trees = require('./trees.mod.js')
const words = require('./norvig-10000.mod.js')
const names = require('./all-names.mod.js')
const passwords = require('./passwords-10000.mod.js')
const mellt = require('./mellt.js')

RegExp.escape = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

class PasswordPolicy {
  constructor() {
    const self = this
    this.symbols = '_-!"?$%^&*()+={}[]:;@\'~#|<>,.?\\/ '
    this.letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.digits = '0123456789'
    this.words = words
    this.names = names
    this.passwords = passwords
    this.wordsTree = trees.arrayToTree(this.words, true, 3)
    this.namesTree = trees.arrayToTree(this.names, true, 3)
    this.passwordsTree = trees.arrayToTree(this.passwords, true, 3)
    // Holds errors from the last check
    this._errors = []
    this.password = null
    this.validators = new Map()
    // Defaults
    this._allowedLowerLetters = 'abcdefghijklmnopqrstuvwxyz'
    this._allowedUpperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.allowedLetters = this._allowedLowerLetters + this._allowedUpperLetters
    this._allowedNumbers = '0123456789'
    this._allowedSymbols = '_-!"?$%^&*()+={}[]:;@\'~#|<>,.?\\/ '

    this._minimumLength = 0
    this._maximumLength = 0

    this.specialSymbolsUser = ',.!#@*'
    this.specialSymbolsSip = '-.*()%'
    this.specialSymbolsPenetration = '.*'
    this._minimumTimeToCrack = 0
    this._minimumNumberOfUpperLetters = 0
  }

  set minimumLength(minimumLength) {
    if (typeof minimumLength !== 'number') {
      throw new Error('Parameter has to be integer')
    }
    this._minimumLength = Math.floor(minimumLength)
    this._minimumLength !== 0
      ? this.validators.set('minimalLength', this.validateMinimalLength)
      : this.validators.delete('minimalLength')
  }

  set maximumLength(maximumLength) {
    if (typeof maximumLength !== 'number') {
      throw new Error('Parameter has to be integer')
    }
    this._maximumLength = Math.floor(maximumLength)
    this._maximumLength !== 0
      ? this.validators.set('maximalLength', this.validateMaximalLength)
      : this.valiadors.delete('maximalLength')
  }

  set allowedUpperLetter(upperLetters) {
    if (typeof upperLetters !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this._allowedUpperLetters = upperLetters.toUpperCase()
    this.allowedLetters = this._allowedLowerLetters + this._allowedUpperLetters
  }

  set allowedLowerLetter(lowerLetters) {
    if (typeof lowerLetters !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this._allowedLowerLetters = lowerLetters.toLowerCase()
    this.allowedLetters = this._allowedLowerLetters + this._allowedUpperLetters
  }

  set allowedNumbers(numbers) {
    if (typeof numbers !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this._allowedNumbers = numbers
  }

  set allowedSymbols(symbols) {
    if (typeof symbols !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this._allowedSymbols = symbols
  }

  set minimumTimeToCrack(days) {
    if (typeof days !== 'number') {
      throw new Error('Parameter has to be number')
    }
    this._minimumTimeToCrack = Math.floor(days)
    this._minimumTimeToCrack !== 0
      ? this.validators.set(
        'minimalTimeToCrack',
        this.validateMinimalTimeToCrack
      )
      : this.validators.delete('minimalTimeToCrack')
  }

  set minimumNumberOfUpperLetters(numberOfUpperLetters) {
    if (typeof numberOfUpperLetters !== 'number') {
      throw new Error('Parameter has to be number')
    }
    this._minimumNumberOfUpperLetters = Math.floor(numberOfUpperLetters)
    this._minimumNumberOfUpperLetters !== 0
      ? this.validators.set(
        'minimalNumberOfUpperLetters',
        this.validateMinimalNumberOfUpperLetters
      )
      : this.validators.delete('minimalNumberOfUpperLetters')
  }

  set minimumNumberOfDigits(numberOfDigits) {
    if (typeof numberOfDigits !== 'number') {
      throw new Error('Parameter has to be number')
    }
    this._minimumNumberOfDigits = Math.floor(numberOfDigits)
    this._minimumNumberOfDigits !== 0
      ? this.validators.set(
        'minimumNumberOfDigits',
        this.validateMinimalNumberOfDigits
      )
      : this.validators.delete('minimumNumberOfDigits')
  }

  set defaultPolicy(policy) {
    this.checkLetters(true)
    this.checkNumbers(true)
    this.checkSymbols(true)

    switch (policy) {
      case 'user':
        this.minimumNumberOfUpperLetters = 1
        this.minimumTimeToCrack = 14
        this.minimumLength = 10
        this.allowedSymbols = this.specialSymbolsUser
        this.minimumNumberOfDigits = 1
        break
      case 'sip':
        this.minimumNumberOfUpperLetters = 1
        this.minimumLength = 8
        this.allowedSymbols = this.specialSymbolsSip
        break
      default:
        throw new Error(`Policy ${policy} is not allowed`)
    }
  }

  get errors() {
    return this._errors
  }

  checkSymbols(active) {
    if (typeof active !== 'boolean') {
      throw new Error('Parameter has to be boolean')
    }
    active
      ? this.validators.set('allowedSymbols', this.validateSymbols)
      : this.validators.delete('allowedSymbols')
  }

  checkLetters(active) {
    if (typeof active !== 'boolean') {
      throw new Error('Parameter has to be boolean')
    }
    active
      ? this.validators.set('allowedLetters', this.validateLetters)
      : this.valiadors.delete('allowedLetters')
  }

  checkNumbers(active) {
    if (typeof active !== 'boolean') {
      throw new Error('Parameter has to be boolean')
    }
    active
      ? this.validators.set('allowedNumbers', this.validateNumbers)
      : this.valiadors.delete('allowedNumbers')
  }

  validate(password = '') {
    this._errors = []
    this.password = password
    this.validators.forEach(validate => validate(this))

    return !this._errors.length
  }

  validateMinimalLength(self) {
    if (self.password.length < self._minimumLength) {
      self._errors.push({
        validator: 'MinimalLength',
        expected: self._minimumLength,
        actual: self.password.length
      })
    }
  }

  validateMaximalLength(self) {
    if (self.password.length > self._maximumLength) {
      self._errors.push({
        validator: 'MaximalLength',
        expected: self._maximumLength,
        actual: self.password.length
      })
    }
  }

  validateMinimalNumberOfUpperLetters(self) {
    const size = R.intersection(self._allowedUpperLetters, self.password).length
    if (size < self._minimumNumberOfUpperLetters) {
      self._errors.push({
        validator: 'minimumNumberOfUpperLetters',
        expected: self._minimumNumberOfUpperLetters,
        actual: size
      })
    }
  }

  validateMinimalNumberOfDigits(self) {
    const size = R.intersection(self._allowedNumbers, self.password).length
    if (size < self._minimumNumberOfDigits) {
      self._errors.push({
        validator: 'minimumNumberOfDigits',
        expected: self._minimumNumberOfDigits,
        actual: size
      })
    }
  }

  validateMinimalTimeToCrack(self) {
    const days = mellt.CheckPassword(self.password)
    if (days < self._minimumTimeToCrack) {
      self._errors.push({
        validator: 'MinimumTimeToCrack',
        expected: self._minimumTimeToCrack,
        actual: days
      })
    }
  }

  validateSymbols(self) {
    let string = R.replace(
      new RegExp('[' + self.letters + ']', 'g'),
      '',
      self.password
    )
    string = R.replace(new RegExp('[' + self.digits + ']', 'g'), '', string)
    const size = string
      .split('')
      .filter(letter => !self._allowedSymbols.includes(letter)).length
    if (size) {
      self._errors.push({
        validator: 'Symbols',
        expected: 0,
        actual: size
      })
    }
  }

  validateNumbers(self) {
    let string = R.replace(
      new RegExp('[' + self.letters + ']', 'g'),
      '',
      self.password
    )
    string = R.replace(
      new RegExp('[' + RegExp.escape(self.symbols) + ']', 'g'),
      '',
      string
    )
    const size = string
      .split('')
      .filter(digit => !self._allowedNumbers.includes(digit)).length
    if (size) {
      self._errors.push({
        validator: 'Digits',
        expected: 0,
        actual: size
      })
    }
  }

  validateLetters(self) {
    let string = R.replace(
      new RegExp('[' + self.digits + ']', 'g'),
      '',
      self.password
    )
    string = R.replace(
      new RegExp('[' + RegExp.escape(self.symbols) + ']', 'g'),
      '',
      string
    )
    const size = string
      .split('')
      .filter(letter => !self.allowedLetters.includes(letter)).length
    if (size) {
      self._errors.push({
        validator: 'Letters',
        expected: 0,
        actual: size
      })
    }
  }
}

module.exports = PasswordPolicy
