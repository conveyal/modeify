/**
 * Support values
 */

var reliableMarginRight;
var boxSizingReliableVal;
var pixelPositionVal;
var clearCloneStyle;

/**
 * Container setup
 */

var docElem = document.documentElement;
var container = document.createElement('div');
var div = document.createElement('div');

/**
 * Clear clone style
 */

div.style.backgroundClip = 'content-box';
div.cloneNode(true).style.backgroundClip = '';
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';

container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
container.appendChild(div);

/**
 * Pixel position
 *
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
 * getComputedStyle returns percent when specified for top/left/bottom/right
 * rather than make the css module depend on the offset module, we just check for it here
 */

exports.pixelPosition = function() {
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
  return pixelPositionVal;
}

/**
 * Reliable box sizing
 */

exports.boxSizingReliable = function() {
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
  return boxSizingReliableVal;
}

/**
 * Reliable margin right
 *
 * Support: Android 2.3
 * Check if div with explicit width and no margin-right incorrectly
 * gets computed margin-right based on width of container. (#3333)
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
 * This support function is only executed once so no memoizing is needed.
 *
 * @return {Boolean}
 */

exports.reliableMarginRight = function() {
  var ret;
  var marginDiv = div.appendChild(document.createElement("div" ));

  marginDiv.style.cssText = div.style.cssText = divReset;
  marginDiv.style.marginRight = marginDiv.style.width = "0";
  div.style.width = "1px";
  docElem.appendChild(container);

  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

  docElem.removeChild(container);

  // Clean up the div for other support tests.
  div.innerHTML = "";

  return ret;
}

/**
 * Executing both pixelPosition & boxSizingReliable tests require only one layout
 * so they're executed at the same time to save the second computation.
 */

function computePixelPositionAndBoxSizingReliable() {
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
    "position:absolute;top:1%";
  docElem.appendChild(container);

  var divStyle = window.getComputedStyle(div, null);
  pixelPositionVal = divStyle.top !== "1%";
  boxSizingReliableVal = divStyle.width === "4px";

  docElem.removeChild(container);
}


