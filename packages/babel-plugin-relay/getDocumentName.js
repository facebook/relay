/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule getDocumentName
 * @flow
 * @format
 */

'use strict';

const PROVIDES_MODULE = 'providesModule';

import type {BabelState} from './BabelPluginRelay';

/**
 * Given a path anywhere in a document, produce the name of that document.
 */
function getDocumentName(path: any, state: BabelState): string {
  let topPath = path;
  while (topPath.parentPath) {
    topPath = topPath.parentPath;
  }
  // Cache the document name onto this top level path.
  let documentName = topPath.documentName;
  if (!documentName) {
    const parent = topPath.parent;
    if (parent.comments && parent.comments.length) {
      const docblock = parent.comments[0].value || '';
      const propertyRegex = /@(\S+) *(\S*)/g;
      let captures;
      while ((captures = propertyRegex.exec(docblock))) {
        const property = captures[1];
        const value = captures[2];
        if (property === PROVIDES_MODULE) {
          documentName = value.replace(/[\.-:]/g, '_');
          break;
        }
      }
    }
    const basename = state.file && state.file.opts.basename;
    if (basename && !documentName) {
      const captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
      if (captures) {
        documentName = captures[0];
      }
    }
    documentName = documentName || 'UnknownFile';
    topPath.documentName = documentName;
  }
  return documentName;
}

module.exports = getDocumentName;
