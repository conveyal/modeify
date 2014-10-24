/**
 * Scrollbar size detection.
 */

var div = document.createElement('div');

div.style.width = '50px';
div.style.height = '50px';
div.style.overflow = 'scroll';
div.style.position = 'absolute';
div.style.top = '-9999px';

document.body.appendChild(div);
var size = div.offsetWidth - div.clientWidth;
document.body.removeChild(div);

module.exports = size;