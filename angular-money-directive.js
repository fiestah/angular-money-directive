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
    var minVal, maxVal, precision, lastValidValue;
    var isDefined = angular.isDefined;
    var isUndefined = angular.isUndefined;
    var isNumber = angular.isNumber;

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


    ngModelCtrl.$parsers.push(function (value) {
      if (isUndefined(value)) {
        value = '';
      }

      // Handle leading decimal point, like ".5"
      if (value.indexOf('.') === 0) {
        value = '0' + value;
      }

      // Allow "-" inputs only when min < 0
      if (value.indexOf('-') === 0) {
        if (minVal >= 0) {
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
    ngModelCtrl.$validators.min = function (value) {
      return ngModelCtrl.$isEmpty(value) || isUndefined(minVal) || value >= minVal;
    };
    if (isDefined(attrs.min) || attrs.ngMin) {
      attrs.$observe('min', function(val) {
        if (isDefined(val) && !isNumber(val)) {
          val = parseFloat(val, 10);
        }
        minVal = isNumber(val) && !isNaN(val) ? val : undefined;
        ngModelCtrl.$validate();
      });
    } else {
      minVal = 0;
    }


    // Max validation
    if (isDefined(attrs.max) || attrs.ngMax) {
      ngModelCtrl.$validators.max = function(value) {
        return ngModelCtrl.$isEmpty(value) || isUndefined(maxVal) || value <= maxVal;
      };

      attrs.$observe('max', function(val) {
        if (isDefined(val) && !isNumber(val)) {
          val = parseFloat(val, 10);
        }
        maxVal = isNumber(val) && !isNaN(val) ? val : undefined;
        ngModelCtrl.$validate();
      });
    }

    // Round off (disabled by "-1")
    if (isDefined(attrs.precision)) {
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
        return value;
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
