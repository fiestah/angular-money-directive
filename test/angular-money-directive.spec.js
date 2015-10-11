'use strict';

describe('angular-money-directive', function () {
  var $compile, scope, inputEl, form;

  function setValue(val) {
    inputEl.val(val);
    inputEl.triggerHandler('input');
    scope.$digest();
  }

  function setupDirective(attrs) {
    attrs = attrs || '';

    var formEl = angular.element(
      '<form name="form">' +
      '  <input name="price" ng-model="model.price" money ' + attrs + '>' +
      '</form>');
    $compile(formEl)(scope);

    scope.$digest();

    form = scope.form;
    inputEl = formEl.find('input');
  }


  beforeEach(module('fiestah.money'));
  beforeEach(inject(function (_$compile_, $rootScope) {
    $compile = _$compile_;
    scope = $rootScope.$new();
    scope.model = {};
  }));

  describe('when ngModel is undefined', function () {
    beforeEach(function () {
      setupDirective();
      setValue(undefined);
    });

    it('displays an empty string', function () {
      expect(inputEl.val()).to.equal('');
      expect(form.price.$valid).to.be.true;
    });
  });

  describe('when ngModel is set', function () {
    beforeEach(function () {
      scope.model.price = 0.01;
      setupDirective();
    });

    it('displays the value', function () {
      expect(inputEl.val()).to.equal('0.01');
      expect(form.price.$valid).to.be.true;
    });
  });


  describe('defaults with no optional attributes set', function () {
    beforeEach(function () {
      setupDirective();
    });
    it('does not become $dirty', function () {
      expect(form.price.$dirty).to.be.false;
    });
    it('displays an empty string in the view', function () {
      expect(inputEl.val()).to.equal('');
    })
    it('accepts in-range values', function () {
      setValue('50.4');
      expect(scope.model.price).to.equal(50.4);
      expect(form.price.$valid).to.be.true;
    });
    it('accepts decimals without a leading zero', function () {
      setValue('.5');
      expect(scope.model.price).to.equal(0.5);
      expect(form.price.$valid).to.be.true;
    });
    it('rounds off to two decimal points', function () {
      setValue('41.999');
      expect(scope.model.price).to.equal(42);
    });
    it('disallows negative values', function () {
      setValue('-5');
      expect(scope.model.price).to.not.be.ok;
      expect(inputEl.val()).to.equal('');
      expect(form.price.$valid).to.be.true;
    });
    it('strips out invalid chars', function () {
      setValue('a');
      expect(scope.model.price).to.not.be.ok;
      expect(inputEl.val()).to.equal('');
    });
    it('reverts to the last valid value on invalid char', function () {
      // A valid value is first entered
      setValue('50.4');

      // Then "a" is entered next
      setValue('50.4a');

      expect(scope.model.price).to.equal(50.4);
      expect(inputEl.val()).to.equal('50.4');
      expect(form.price.$valid).to.be.true;
    });
  });

  describe('on blur', function () {
    beforeEach(function () {
      setupDirective();
      setValue('12.345');
      inputEl.triggerHandler('blur');
    })
    it('formats decimals', function () {
      expect(inputEl.val()).to.equal('12.35');
    });

    describe('on invalid input', function () {
      it('reverts to the last rounded number', function () {
        setValue('12.345x');
        expect(inputEl.val()).to.equal('12.35');
      });
    });
  });

  describe('min', function () {
    describe('when min < 0', function () {
      beforeEach(function () {
        setupDirective('min="-10"');
      });
      it('allows the negative sign', function () {
        setValue('-');
        expect(scope.model.price).to.not.be.ok;
        expect(form.price.$valid).to.be.true;
      });
      it('allows negative values', function () {
        setValue('-5.4');
        expect(scope.model.price).to.equal(-5.4);
        expect(form.price.$valid).to.be.true;
      });
    });

    describe('when min="{{min}}"', function () {
      beforeEach(function () {
        setupDirective('min="{{min}}"');
      });
      it('defaults min to 0', function () {
        setValue('1');
        expect(form.price.$valid).to.be.true;
      });
      it('reflects changes to min', function () {
        // Initial min value
        scope.min = 2;
        setValue('1');
        expect(form.price.$invalid).to.be.true;

        // Modified max value
        scope.min = 0;
        scope.$digest();
        expect(form.price.$valid).to.be.true;
      });
    });
  });

  describe('max', function () {
    describe('when value > max', function () {
      it('marks it as invalid', function () {
        setupDirective('max="100"');
        setValue('100.5');
        expect(form.price.$invalid).to.be.true;
      });
    });

    describe('when max="{{max}}"', function () {
      beforeEach(function () {
        setupDirective('max="{{max}}"');
      });
      it('defaults max to Infinity', function () {
        setValue('1000000000');
        expect(form.price.$valid).to.be.true;
      });
      it('reflects changes to max', function () {
        // Initial max value
        scope.max = 1;
        setValue('2');
        expect(form.price.$invalid).to.be.true;

        // Modified max value
        scope.max = 3;
        scope.$digest();
        expect(form.price.$valid).to.be.true;
      });
    });
  });

  describe('precision', function () {
    describe('when precision = 0', function () {
      it('should round to int', function () {
        setupDirective('precision="0"');
        setValue('42.01');
        expect(scope.model.price).to.equal(42);
      });
    });

    describe('when precision = -1', function () {
      it('should disable rounding', function () {
        setupDirective('precision="-1"');
        setValue('41.999');
        expect(scope.model.price).to.equal(41.999);
      });
    });

    describe('when precision="{{precision}}"', function () {
      beforeEach(function () {
        setupDirective('precision="{{precision}}"');
      });

      it('does not become $dirty', function () {
        expect(form.price.$dirty).to.be.false;
      });

      describe('when precision is undefined', function () {
        it('does not round', function () {
          setValue('2.555');
          expect(scope.model.price).to.equal(2.555);
        });
      });

      describe('when precision is invalid', function () {
        it('does not round', function () {
          scope.precision = 'a';
          scope.$digest();
          setValue('2.555');
          expect(scope.model.price).to.equal(2.555);
        });
      });

      it('reflects changes to precision', function () {
        // Initial precision
        scope.precision = 3;
        scope.$digest();
        setValue('2.55555');
        expect(scope.model.price).to.equal(2.556);

        // Decrease precision
        scope.precision = 1;
        scope.$digest();
        expect(scope.model.price).to.equal(2.6);
        expect($(inputEl)).to.have.value('2.6');

        // Revert precision (this loses the original fractions)
        scope.precision = 3;
        scope.$digest();
        expect($(inputEl)).to.have.value('2.600');

        // Disable rounding
        scope.precision = -1;
        scope.$digest();

        setValue('3.33333');
        inputEl[0].blur();
        expect($(inputEl)).to.have.value('3.33333');
      });
    });
  });

});
