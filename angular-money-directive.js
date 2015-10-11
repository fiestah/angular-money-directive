(function () {
'use strict';

/**
 * Heavily adapted from the `type="number"` directive in Angular's
 * /src/ng/directive/input.js
 */

var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
var DEFAULT_PRECISION = 2;

angular.module('fiestah.money', [])

.directive('money', function ($parse) {
  function link(scope, el, attrs, ngModelCtrl) {
    var min, max, precision, lastValidValue;

    /**
     * Returns a rounded number in the precision setup by the directive
     * @param  {Number} num Number to be rounded
     * @return {Number}     Rounded number
     */
    function round(num) {
      var d = Math.pow(10, precision);
      return Math.round(num * d) / d;
    }

    /**
     * Returns a string that represents the rounded number
     * @param  {Number} value Number to be rounded
     * @return {String}       The string representation
     */
    function formatPrecision(value) {
      return parseFloat(value).toFixed(precision);
    }

    function isPrecisionValid() {
      return !isNaN(precision) && precision > -1;
    }

    function updateValuePrecision() {
      // $modelValue shows up as NaN in 1.2 on init
      var modelValue = ngModelCtrl.$modelValue;

      if (!isNaN(modelValue) && isPrecisionValid()) {
        ngModelCtrl.$modelValue = round(modelValue);
        $parse(attrs.ngModel).assign(scope, ngModelCtrl.$modelValue);

        ngModelCtrl.$viewValue = formatPrecision(modelValue);
        ngModelCtrl.$render();
      }
    }

    function minValidator(value) {
      if (!ngModelCtrl.$isEmpty(value) && value < min) {
        ngModelCtrl.$setValidity('min', false);
        return undefined;
      } else {
        ngModelCtrl.$setValidity('min', true);
        return value;
      }
    }

    function maxValidator(value) {
      if (!ngModelCtrl.$isEmpty(value) && value > max) {
        ngModelCtrl.$setValidity('max', false);
        return undefined;
      } else {
        ngModelCtrl.$setValidity('max', true);
        return value;
      }
    }


    ngModelCtrl.$parsers.push(function (value) {
      if (angular.isUndefined(value)) {
        value = '';
      }

      // Handle leading decimal point, like ".5"
      if (value.indexOf('.') === 0) {
        value = '0' + value;
      }

      // Allow "-" inputs only when min < 0
      if (value.indexOf('-') === 0) {
        if (min >= 0) {
          value = null;
          ngModelCtrl.$viewValue = '';
          ngModelCtrl.$render();
        } else if (value === '-') {
          value = '';
        }
      }

      var empty = ngModelCtrl.$isEmpty(value);
      if (empty || NUMBER_REGEXP.test(value)) {
        lastValidValue = (value === '')
          ? null
          : (empty ? value : parseFloat(value));
      } else {
        // Render the last valid input in the field
        ngModelCtrl.$viewValue = lastValidValue;
        ngModelCtrl.$render();
      }

      ngModelCtrl.$setValidity('number', true);

      return lastValidValue;
    });


    // Min validation
    attrs.$observe('min', function (value) {
      min = parseFloat(value || 0);
      minValidator(ngModelCtrl.$modelValue);
    });

    ngModelCtrl.$parsers.push(minValidator);
    ngModelCtrl.$formatters.push(minValidator);


    // Max validation (optional)
    if (angular.isDefined(attrs.max)) {
      attrs.$observe('max', function (val) {
        max = parseFloat(val);
        maxValidator(ngModelCtrl.$modelValue);
      });

      ngModelCtrl.$parsers.push(maxValidator);
      ngModelCtrl.$formatters.push(maxValidator);
    }


    // Round off (disabled by "-1")
    if (angular.isDefined(attrs.precision)) {
      attrs.$observe('precision', function (value) {
        precision = parseInt(value, 10);

        updateValuePrecision();
      });
    } else {
      precision = DEFAULT_PRECISION;
    }

    ngModelCtrl.$parsers.push(function (value) {
      if (value) {
        // Save with rounded value
        lastValidValue = isPrecisionValid() ? round(value) : value;
        return lastValidValue;
      } else {
        return undefined;
      }
    });

    ngModelCtrl.$formatters.push(function (value) {
      if (value) {
        return isPrecisionValid() ? formatPrecision(value) : value;
      } else {
        return '';
      }
    });

    // Auto-format precision on blur
    el.bind('blur', updateValuePrecision);
  }

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
});

})();
