import {assert, expect} from 'chai';
import PrimitiveValue from '../src/observation/PrimitiveValue';
import Concept from '../src/Concept';
import General from '../src/utility/General';

describe('getValue', () => {
    describe('when concept datatype is DateTime', () => {
        it('returns Date with time data', () => {
            const date = '2018-11-27T12:34:56.000Z';
            const primitiveValue = new PrimitiveValue(date, Concept.dataType.DateTime);
            expect(primitiveValue.getValue().toISOString()).to.equal(date);
        });
    });

    describe('when concept datatype is Date', () => {
        it('returns Date without time data', () => {
            const date = '2018-11-27T12:34:56.000Z';
            const primitiveValue = new PrimitiveValue(date, Concept.dataType.Date);
            expect('2018-11-27T00:00:00.000Z').to.equal('2018-11-27T00:00:00.000Z');
        });
    });

  describe('when concept datatype is numeric', () => {
    it('should accept string numbers', function () {
      const primitiveValue = new PrimitiveValue("10", Concept.dataType.Numeric);
      expect(primitiveValue.getValue()).to.equal(10);
    });
    it('should accept floating numbers', function () {
      const primitiveValue = new PrimitiveValue("10.25", Concept.dataType.Numeric);
      expect(primitiveValue.getValue()).to.equal(10.25);
    });
    it('should accept floating number without a whole number part', function () {
      const primitiveValue = new PrimitiveValue(".023", Concept.dataType.Numeric);
      expect(primitiveValue.getValue()).to.equal(0.023);
    });
    it('should accept floating number with negative number as the whole number part', function () {
      const primitiveValue = new PrimitiveValue("-560.023", Concept.dataType.Numeric);
      expect(primitiveValue.getValue()).to.equal(-560.023);
    });
    it('should accept floating number without a decimal part', function () {
      const primitiveValue = new PrimitiveValue("123.", Concept.dataType.Numeric);
      expect(primitiveValue.getValue()).to.equal(123);
    });
  });
});

describe('asDisplayDate', () => {
    describe('when concept datatype is DateTime', () => {
        it('returns time info when value date have time data', () => {
            const date = new Date(2018, 1, 1, 1, 1, 0, 0);
            const primitiveValue = new PrimitiveValue(date, Concept.dataType.DateTime);
            assert.equal("Feb 1, 2018 1:01 AM", primitiveValue.asDisplayDate());
        });

        it('does not return time info when value date do not have time data', () => {
            const date = new Date(2018, 1, 1);
            const primitiveValue = new PrimitiveValue(date, Concept.dataType.DateTime);
            assert.equal("Feb 1, 2018", primitiveValue.asDisplayDate());
        });
    });

    describe('when concept datatype is Date', () => {
        it('does not return time info when value date have time data', () => {
            const date = '2018-02-01T12:34:56.000Z';
            const primitiveValue = new PrimitiveValue(date, Concept.dataType.Date);
            assert.equal("Feb 1, 2018", primitiveValue.asDisplayDate());
        });

        it('does not return time info when value date do not have time data', () => {
            const date = '2018-02-01T00:00:00.000Z';
            const primitiveValue = new PrimitiveValue(date, Concept.dataType.Date);
            assert.equal("Feb 1, 2018", primitiveValue.asDisplayDate());
        });
    });
});
