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

const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const {createUserError} = require('../core/RelayCompilerError');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {ScalarField, LinkedField} from '../core/GraphQLIR';

function visitField<T: ScalarField | LinkedField>(field: T): T {
  if (field.alias === 'id' && field.name !== 'id') {
    throw createUserError(
      'Relay does not allow aliasing fields to `id`. ' +
        'This name is reserved for the globally unique `id` field on ' +
        '`Node`.',
      [field.loc],
    );
  }
  return field;
}

/**
 * This is not an actual transform (but more a validation)
 * Relay does not allow aliasing fields to `id`.
 */
function disallowIdAsAlias(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(context, {
    ScalarField: visitField,
    LinkedField: visitField,
  });
}

module.exports = {
  transform: disallowIdAsAlias,
};
