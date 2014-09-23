
/**
 * Module exports.
 */

module.exports = getDocument;

// defined by w3c
var DOCUMENT_NODE = 9;

/**
 * Returns the `document` object associated with the given `node`, which may be
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM
 * object that references the Document in some way, this function will find it.
 *
 * @param {Mixed} node - DOM node, selection, or range in which to find the `document` object
 * @return {Document} the `document` object associated with `node`
 * @public
 */

function getDocument(node) {
  if (node.nodeType === DOCUMENT_NODE) {
    return node;

  } else if (typeof node.ownerDocument != 'undefined' &&
      node.ownerDocument.nodeType === DOCUMENT_NODE) {
    return node.ownerDocument;

  } else if (typeof node.document != 'undefined' &&
      node.document.nodeType === DOCUMENT_NODE) {
    return node.document;

  } else if (node.parentNode) {
    return getDocument(node.parentNode);

  // Range support
  } else if (node.commonAncestorContainer) {
    return getDocument(node.commonAncestorContainer);

  } else if (node.startContainer) {
    return getDocument(node.startContainer);

  // Selection support
  } else if (node.baseNode) {
    return getDocument(node.baseNode);
  }
}
