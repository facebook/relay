/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const IRTransformer = require('../core/IRTransformer');

const {hasUnaliasedSelection} = require('./TransformUtils');

import type CompilerContext from '../core/CompilerContext';
import type {LinkedField, ScalarField} from '../core/IR';
import type {Schema} from '../core/Schema';

const TYPENAME_KEY = '__typename';

type State = {typenameField: ScalarField, ...};

let cache = new Map();

/**
 * A transform that adds `__typename` field on any `LinkedField` of a union or
 * interface type where there is no unaliased `__typename` selection.
 */
function generateTypeNameTransform(context: CompilerContext): CompilerContext {
  cache = new Map();
  const schema = context.getSchema();
  const typenameField: ScalarField = {
    kind: 'ScalarField',
    alias: TYPENAME_KEY,
    args: [],
    directives: [],
    handles: null,
    loc: {kind: 'Generated'},
    metadata: null,
    name: TYPENAME_KEY,
    type: schema.expectStringType(),
  };
  const state = {
    typenameField,
  };
  return IRTransformer.transform(
    context,
    {
      LinkedField: visitLinkedField,
    },
    () => state,
  );
}

function visitLinkedField(field: LinkedField, state: State): LinkedField {
  const schema: Schema = this.getContext().getSchema();
  let transformedNode = cache.get(field);
  if (transformedNode != null) {
    return transformedNode;
  }
  transformedNode = (this.traverse(field, state): LinkedField);
  if (
    schema.isAbstractType(schema.getRawType(transformedNode.type)) &&
    !hasUnaliasedSelection(transformedNode, TYPENAME_KEY)
  ) {
    transformedNode = {
      ...transformedNode,
      selections: [state.typenameField, ...transformedNode.selections],
    };
  }
  cache.set(field, transformedNode);
  return transformedNode;
}

module.exports = {
  transform: generateTypeNameTransform,
};
