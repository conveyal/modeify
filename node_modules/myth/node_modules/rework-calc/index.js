/**
 * Module dependencies.
 */

var balanced = require('balanced-match');
var visit = require('rework-visit');

/**
 * Constants.
 */

var CALC_FUNC_IDENTIFIER =  'calc';
var EXPRESSION_OPT_VENDOR_PREFIX = '(\\-[a-z]+\\-)?';
var EXPRESSION_METHOD_REGEXP = EXPRESSION_OPT_VENDOR_PREFIX + CALC_FUNC_IDENTIFIER;
var EXPRESSION_REGEXP = '\\b' + EXPRESSION_METHOD_REGEXP + '\\(';

/**
 * Module export.
 */

module.exports = function calc(style) {
  // resolve calculations
  visit(style, function (declarations, node) {
    var decl;
    var resolvedValue;
    var value;

    for (var i = 0; i < declarations.length; i++) {
      decl = declarations[i];
      value = decl.value;

      // skip comments
      if (decl.type !== 'declaration') continue;
      // skip values that don't contain calc() functions
      if (!value || value.indexOf(CALC_FUNC_IDENTIFIER + '(') === -1) continue;

      decl.value = resolveValue(value);
    }
  });
};

/**
 * Parses expressions in a value
 *
 * @param {String} value
 * @returns {Array}
 * @api private
 */

function getExpressions(value) {
  var expressions = [];
  var fnRE = new RegExp(EXPRESSION_METHOD_REGEXP);
  do {
    var searchMatch = fnRE.exec(value);
    var fn = searchMatch[0];
    var calcStartIndex = searchMatch.index;
    var calcRef = balanced('(', ')', value.substring(calcStartIndex));

    if (!calcRef) throw new Error('rework-calc: missing closing ")" in the value "' + value + '"');
    if (calcRef.body === '') throw new Error('rework-calc: calc() must contain a non-whitespace string');

    expressions.push({fn: fn, body: calcRef.body});
    value = calcRef.post;
  }
  while(fnRE.test(value));

  return expressions;
}

/**
 * Walkthrough all expressions, evaluate them and insert them into the declaration
 *
 * @param {Array} expressions
 * @param {Object} declaration
 * @api private
 */

function resolveValue(value) {
  getExpressions(value).forEach(function (expression) {
    var result = evaluateExpression(expression.body);

    value = value.replace(expression.fn + '(' + expression.body + ')', result.resolved ? result.value : expression.fn + '(' + result.value + ')');
  });

  return value;
}

/**
 * Evaluates an expression
 *
 * @param {String} expression
 * @returns {String}
 * @api private
 */

function evaluateExpression (expression) {
  // Remove method names for possible nested expressions:
  expression = expression.replace(new RegExp(EXPRESSION_REGEXP, 'g'), '(');

  var balancedExpr = balanced('(', ')', expression);
  if (balancedExpr && balancedExpr.body !== '') {
    expression = balancedExpr.pre + evaluateExpression(balancedExpr.body).value + balancedExpr.post;
  }

  var units = getUnitsInExpression(expression);

  // If multiple units let the expression be (i.e. browser calc())
  if (units.length > 1) return {resolved: false, value: expression};

  var unit = units[0] || "";

  if (unit === '%') {
    // Convert percentages to numbers, to handle expressions like: 50% * 50% (will become: 25%):
    expression = expression.replace(/\b[0-9\.]+%/g, function (percent) {
      return parseFloat(percent.slice(0, -1)) * 0.01;
    });
  }

  // Remove units in expression:
  var toEvaluate = expression.replace(new RegExp(unit, 'g'), '');
  var result;

  try {
    result = eval(toEvaluate);
  } catch (e) {
    return {resolved: false, value: expression};
  }

  // Transform back to a percentage result:
  if (unit === '%') result *= 100;

  // We don't need units for zero values...
  if (result !== 0) result += unit;

  return {resolved: true, value: result};
}

/**
 * Checks what units are used in an expression
 *
 * @param {String} expression
 * @returns {Array}
 * @api private
 */

function getUnitsInExpression(expression) {
  var uniqueUnits = [];
  var unitRegEx = /[\.0-9]([%a-z]+)/g;
  var matches;

  while (matches = unitRegEx.exec(expression)) {
    if (!matches || !matches[1]) continue;
    if (!~uniqueUnits.indexOf(matches[1])) uniqueUnits.push(matches[1]);
  }

  return uniqueUnits;
}
