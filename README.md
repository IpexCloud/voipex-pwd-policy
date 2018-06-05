# voipex-pwd-policy

Voipex passwpord policy is library consist from another libraries which were put to getter to make one complex library handeling password policies.

# Documentation

## Setters

### setDefaultPolicy (string)

Set default policy used by IPEX a.s.

#### Parameters

- policy
  - default value: not set
  - allowed value - ['sip', 'users']

### setMinimumLength (int)

Minimal length of password to be valid. If value is 0 validator is not applied

#### Parameters

- minimumLength
  - default value: 0
  - when value is 0 validator is not used

### setMaximumLength (int)

Maximal length of password to be valid. Default = 0 validotor is not used

#### Parameters

- maximumLength
  - default value: 0
  - when value is 0 validator is not used

### setAllowedUpperLetter (string)

Set of uppers letters which password can only contain.

#### Parameters

- upperLetters
  - default value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

### setAllowedLowerLetter (string)

Set of lower letters which password can only contain

#### Parameters

- lowerLetters
  - default value: 'abcdefghijklmnopqrstuvwxyz'

### setAlloweNumbers (string)

Set of digits which password can only contain.

#### Parameters

- numbers
  - default value: '0123456789'

### setAlloweSymbols (string)

Set of symbols which password can only contain

#### Parameters

- symbols -
  - default value: '\_-!"?$%^&\*()+={}[]:;@\'~#|<>,.?\\/ '

### setMinimumTimeToCrack (int)

Minimal time for which password could't be cracked

#### Parameters

- days
  - default value: 0
  - when value is 0 validator is not used

### setMinimumNumberOfUpperLetters (int)

minimal count of upper letters in password to be valid

#### Parameters

- numberOfUpperLetters
  - default value: 0
  - when value is 0 validator is not used

## Getters

### getErrors: array

- return list of errors in validators

## Validators

### checkSymbols (boolean)

Check if password contains only allowed symbols

- active
  - default value: false

### checkLetters (boolean)

Check if password contains only allowed letters

- active
  - default value: false

### checkNumbers (boolean)

Check if password contains only allowed digits

- active
  - default value: false

### validate (string)

Validate given password on setted rules

- password

## Example

```
const PasswordPolicy = require('voipex-password-policy')

const policy = new PasswordPolicy()
policy.setDefaultPolicy('user')
policy.check('password')
```
