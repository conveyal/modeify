"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

exports.BinaryExpression = BinaryExpression;
exports.Property = Property;
exports.Literal = Literal;
exports.__esModule = true;

var t = _interopRequireWildcard(require("../../../types"));

var util = _interopRequireWildcard(require("../../../util"));

var metadata = {
  optional: true
};

exports.metadata = metadata;

function BinaryExpression(node) {
  if (node.operator === "in") {
    return util.template("ludicrous-in", {
      LEFT: node.left,
      RIGHT: node.right
    });
  }
}

function Property(node) {
  var key = node.key;
  if (t.isLiteral(key) && typeof key.value === "number") {
    key.value = "" + key.value;
  }
}

function Literal(node) {
  if (node.regex) {
    node.regex.pattern = "foobar";
    node.regex.flags = "";
  }
}