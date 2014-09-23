describe('to-no-case', function () {

  var assert = require('assert');
  var none = require('to-no-case');

  describe('space', function () {
    it('shouldnt touch space case', function () {
      assert('this is a string' == none('this is a string'));
    });
  });

  describe('camel', function () {
    it('should remove camel case', function () {
      assert('this is a string' == none('thisIsAString'));
    });
  });

  describe('constant', function () {
    it('should remove constant case', function () {
      assert('this is a string' == none('THIS_IS_A_STRING'));
    });
  });

  describe('pascal', function () {
    it('should remove pascal case', function () {
      assert('this is a string' == none('ThisIsAString'));
    });

    it('should handle single letter first words', function () {
      assert('a string is this' == none('AStringIsThis'));
    });

    it('should handle single letter first words with two words', function () {
      assert('a string' == none('AString'));
    });
  });

  describe('slug', function () {
    it('should remove slug case', function () {
      assert('this is a string' == none('this-is-a-string'));
    });
  });

  describe('snake', function () {
    it('should remove snake case', function () {
      assert('this is a string' == none('this_is_a_string'));
    });
  });

  describe('sentence', function () {
    it('should remove sentence case', function () {
      assert('this is a string.' == none('This is a string.'));
    });
  });

  describe('title', function () {
    it('should remove title case', function () {
      assert('this: is a string' == none('This: Is a String'));
    });
  });

});