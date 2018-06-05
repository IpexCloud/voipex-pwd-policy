const R = require('ramda')

const trees = require('./src/trees.mod.js')
const words = require('./src/norvig-10000.mod.js')
const names = require('./src/all-names.mod.js')
const passwords = require('./src/passwords-10000.mod.js')
const mellt = require('./src/mellt.js')

RegExp.escape = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

class PasswordPolicy {
  constructor() {
    // Holds errors from the last check
    this.errors = []
    this.password = null
    this.validators = {}
    // Defaults
    this.allowedLowerLetters = 'abcdefghijklmnopqrstuvwxyz'
    this.allowedUpperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.allowedLetters = this.allowedLowerLetters + this.allowedUpperLetters
    this.allowedNumbers = '0123456789'
    this.allowedSymbols = '_-!"?$%^&*()+={}[]:;@\'~#|<>,.?\\/ '
    this.symbols = '_-!"?$%^&*()+={}[]:;@\'~#|<>,.?\\/ '
    this.letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.digits = '0123456789'
    this.words = words
    this.names = names
    this.passwords = passwords
    this.wordsTree = trees.arrayToTree(this.words, true, 3)
    this.namesTree = trees.arrayToTree(this.names, true, 3)
    this.passwordsTree = trees.arrayToTree(this.passwords, true, 3)
    this.minimumLength = 0
    this.maximumLength = 0

    this.specialSymbolsUser = ',.!#@*'
    this.specialSymbolsSip = '-.*()%'
    this.specialSymbolsPenetration = '.*'
    this.minimumTimeToCrack = 0
    this.minimumNumberOfUpperLetters = 0
  }

  addValidator(name, validator) {
    this.validators[name] = {
      validate: validator
    }
  }

  set minimumLength(minimumLength) {
    if (typeof minimumLength !== 'number') {
      throw new Error('Parameter has to be integer')
    }
    this.minimumLength = Math.floor(minimumLength)
    if (this.minimumLength === 0) {
      if (this.validators.minimumLength) {
        delete this.validators.minimumLength
      }
    } else {
      this.addValidator('minimalLength', this.validateMinimalLength)
    }
  }

  set maximumLength(maximumLength) {
    if (typeof minimumLength !== 'number') {
      throw new Error('Parameter has to be integer')
    }
    this.maximumLength = Math.floor(maximumLength)
    if (maximumLength === 0) {
      if (this.valiadors.maximumLength) {
        delete this.valiadors.maximumLength
      }
    } else {
      this.addValidator('maximalLength', this.validateMaximalLength)
    }
  }

  set allowedUpperLetter(upperLetters) {
    if (typeof upperLetters !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this.allowedUpperLetters = upperLetters.toUpperCase()
    this.allowedLetters = this.allowedLowerLetters + this.allowedUpperLetters
  }

  set allowedLowerLetter(lowerLetters) {
    if (typeof lowerLetters !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this.allowedLowerLetters = lowerLetters.toLowerCase()
    this.allowedLetters = this.allowedLowerLetters + this.allowedUpperLetters
  }

  set allowedNumbers(numbers) {
    if (typeof numbers !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this.allowedNumbers = numbers
  }

  set allowedSymbols(symbols) {
    if (typeof symbols !== 'string') {
      throw new Error('Parameter has to be string')
    }

    this.allowedSymbols = symbols
  }

  set minimumTimeToCrack(days) {
    if (typeof days !== 'number') {
      throw new Error('Parameter has to be number')
    }
    this.minimumTimeToCrack = Math.floor(days)
    if (this.minimumTimeToCrack === 0) {
      if (this.validators.minimumTimeToCrack) {
        delete this.validators.minimumTimeToCrack
      }
    } else {
      this.addValidator('minimalTimeToCrack', this.validateMinimalTimeToCrack)
    }
  }

  set minimumNumberOfUpperLetters(numberOfUpperLetters) {
    if (typeof numberOfUpperLetters !== 'number') {
      throw new Error('Parameter has to be number')
    }
    this.minimumNumberOfUpperLetters = Math.floor(numberOfUpperLetters)
    if (this.minimumNumberOfUpperLetters === 0) {
      if (this.validators.minimumNumberOfUpperLetters) {
        delete this.validators.minimumNumberOfUpperLetters
      }
    } else {
      this.addValidator(
        'minimalNumberOfUpperLetters',
        this.validateMinimalNumberOfUpperLetters
      )
    }
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
        break
      case 'sip':
        this.minimumLength = 8
        this.allowedSymbols = this.specialSymbolsSip
        break
      default:
        throw new Error(`Policy ${policy} is not allowed`)
    }
  }

  checkSymbols(active) {
    if (typeof active !== 'boolean') {
      throw new Error('Parameter has to be boolean')
    }
    if (active) {
      this.addValidator('allowedSymbols', this.validateSymbols)
    } else {
      if (this.valiadors.validateSymbols) {
        delete this.valiadors.validateSymbols
      }
    }
  }

  checkLetters(active) {
    if (typeof active !== 'boolean') {
      throw new Error('Parameter has to be boolean')
    }
    if (active) {
      this.addValidator('allowedLetters', this.validateLetters)
    } else {
      if (this.valiadors.validateLetters) {
        delete this.valiadors.validateLetters
      }
    }
  }

  checkNumbers(active) {
    if (typeof active !== 'boolean') {
      throw new Error('Parameter has to be boolean')
    }
    if (active) {
      this.addValidator('allowedNumbers', this.validateNumbers)
    } else {
      if (this.valiadors.validateNumbers) {
        delete this.valiadors.validateNumbers
      }
    }
  }

  validate(password) {
    this.password = password || ''
    this.errors = Object.keys(this.validators).reduce((errors, validator) => {
      const error = this.validators[validator].validate(this)
      if (error !== null) {
        errors.push(error)
      }
      return errors
    }, [])

    return !this.errors.length
  }

  validateMinimalLength(self) {
    if (self.password.length < self.minimumLength) {
      return {
        validator: 'MinimalLength',
        expected: self.minimumLength,
        actual: self.password.length
      }
    }
    return null
  }

  validateMaximalLength(self) {
    if (self.password.length > self.maximumLength) {
      return {
        validator: 'MaximalLength',
        expected: self.maximumLength,
        actual: self.password.length
      }
    }
  }

  validateMinimalNumberOfUpperLetters(self) {
    const size = self.allowedUpperLetters
      .split('')
      .filter(letter => self.password.includes(letter))
    if (size.length < self.minimumNumberOfUpperLetters) {
      return {
        validator: 'minimumNumberOfUpperLetters',
        expected: self.minimumNumberOfUpperLetters,
        actual: size
      }
    }
  }

  validateMinimalTimeToCrack(self) {
    const days = mellt.CheckPassword(self.password)
    if (days < self.minimumTimeToCrack) {
      return {
        validator: 'MinimumTimeToCrac',
        expected: self.minimumTimeToCrack,
        actual: days
      }
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
      .filter(letter => !self.allowedSymbols.includes(letter)).length
    if (size) {
      return {
        validator: 'Symbols',
        expected: 0,
        actual: size
      }
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
      .filter(digit => !self.allowedNumbers.includes(digit)).length
    if (size) {
      return {
        validator: 'Digits',
        expected: 0,
        actual: size
      }
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
      return {
        validator: 'Letters',
        expected: 0,
        actual: size
      }
    }
  }

  get errors() {
    return this.errors
  }
}

module.exports = PasswordPolicy
