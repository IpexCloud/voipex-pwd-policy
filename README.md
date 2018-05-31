# voipex-pwd-policy

### Example
Simple example of password policy use.
```
const policy = require('voipex-password-policy')

policy.setDefaultPolicy('user')
policy.check('password')
```

### Documentation

#### setDefaultPolicy
You can set default policy for user or sip.
* options ()