/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayTransformUtils
 * @format
 */

'use strict';

import type {LinkedField} from '../graphql-compiler/GraphQLCompilerPublic';

function hasUnaliasedSelection(field: LinkedField, fieldName: string): boolean {
  return field.selections.some(
    selection =>
      selection.kind === 'ScalarField' &&
      selection.alias == null &&
      selection.name === fieldName,
  );
}

module.exports = {hasUnaliasedSelection};
