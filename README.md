# "money" AngularJs Directive

This directive validates monetary inputs in "42.53" format (some additional work is needed for "32,00" Europoean formats). Note that this is _not_ designed to work with currency symbols. It largely behaves like Angular's implementation of `type="number"`.

It does just a few things:

- Prevents entering non-numeric characters
- Prevents entering the minus sign when `min >= 0`
- On `blur`, the input field is auto-formatted. Say if you enter `42`, it will be formatted to `42.00`


## Usage:
``` html
<input type="text" money min="1" max="100">
```

`min` defaults to `0`; set `min=-Infinity` to allow negative values.
