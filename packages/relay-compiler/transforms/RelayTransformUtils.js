/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {Fragment, LinkedField} from 'graphql-compiler';

function hasUnaliasedSelection(
  node: Fragment | LinkedField,
  fieldName: string,
): boolean {
  return node.selections.some(
    selection =>
      selection.kind === 'ScalarField' &&
      selection.alias == null &&
      selection.name === fieldName,
  );
}

function hasSelection(
  node: Fragment | LinkedField,
  selectionName: string,
): boolean {
  return node.selections.some(
    selection =>
      selection.kind === 'ScalarField' &&
      (selection.alias === selectionName || selection.name === selectionName),
  );
}

module.exports = {hasSelection, hasUnaliasedSelection};
