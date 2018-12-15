/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {LinkedField, MatchField} from 'graphql-compiler';

function hasUnaliasedSelection(
  field: LinkedField | MatchField,
  fieldName: string,
): boolean {
  return field.selections.some(
    selection =>
      selection.kind === 'ScalarField' &&
      selection.alias == null &&
      selection.name === fieldName,
  );
}

module.exports = {hasUnaliasedSelection};
