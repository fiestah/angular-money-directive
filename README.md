# "money" AngularJs Directive

This directive validates monetary inputs in "42.53" format (some additional work is needed for "32,00" Europoean formats). Note that this is _not_ designed to work with currency symbols. It largely behaves like Angular's implementation of `type="number"`.

It does:

- format the input field and enforces 2 decimal places on `blur`
- default to positive numbers. Set `min=-Infinity` to allow negative values
- prevent entering non-numeric characters
- prevent entering the minus sign when `min` >= `0`


## Usage:
``` html
input(
  money
  min=1
  max=100
)
```
