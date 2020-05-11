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

const generateAbstractTypeRefinementKey = require('../util/generateAbstractTypeRefinementKey');

const {hasUnaliasedSelection} = require('./TransformUtils');

import type CompilerContext from '../core/CompilerContext';
import type {
  Fragment,
  InlineFragment,
  LinkedField,
  ScalarField,
} from '../core/IR';
import type {Schema} from '../core/Schema';

const TYPENAME_KEY = '__typename';

export type TransformOptions = {|+isForCodegen?: boolean|};
type State = {|
  +isForCodegen: boolean,
  +typenameField: ScalarField,
|};

let cache = new Map();

/**
 * A transform that adds `__typename` field on any `LinkedField` of a union or
 * interface type where there is no unaliased `__typename` selection.
 */
function generateTypeNameTransform(
  context: CompilerContext,
  options: TransformOptions,
): CompilerContext {
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
    type: schema.assertScalarFieldType(
      schema.getNonNullType(schema.expectStringType()),
    ),
  };
  return IRTransformer.transform(
    context,
    {
      Fragment: visitFragment,
      LinkedField: visitLinkedField,
      InlineFragment: visitInlineFragment,
    },
    node => ({
      isForCodegen: options?.isForCodegen === true,
      typenameField,
    }),
  );
}

function visitFragment(fragment: Fragment, state: State): Fragment {
  const schema: Schema = this.getContext().getSchema();
  const rawType = schema.getRawType(fragment.type);
  let transformedNode = (this.traverse(fragment, state): Fragment);
  if (!state.isForCodegen && schema.isAbstractType(rawType)) {
    transformedNode = {
      ...transformedNode,
      selections: [
        {
          kind: 'ScalarField',
          alias: generateAbstractTypeRefinementKey(schema, rawType),
          args: [],
          directives: [],
          handles: null,
          loc: {kind: 'Generated'},
          metadata: null,
          name: TYPENAME_KEY,
          type: schema.assertScalarFieldType(
            schema.getNonNullType(schema.expectStringType()),
          ),
        },
        ...transformedNode.selections,
      ],
    };
  }
  return transformedNode;
}

function visitInlineFragment(
  fragment: InlineFragment,
  state: State,
): InlineFragment {
  const schema: Schema = this.getContext().getSchema();
  let transformedNode = cache.get(fragment);
  if (transformedNode != null && transformedNode.kind === 'InlineFragment') {
    return transformedNode;
  }
  const rawType = schema.getRawType(fragment.typeCondition);
  transformedNode = (this.traverse(fragment, state): InlineFragment);
  if (!state.isForCodegen && schema.isAbstractType(rawType)) {
    transformedNode = {
      ...transformedNode,
      selections: [
        {
          kind: 'ScalarField',
          alias: generateAbstractTypeRefinementKey(schema, rawType),
          args: [],
          directives: [],
          handles: null,
          loc: {kind: 'Generated'},
          metadata: null,
          name: TYPENAME_KEY,
          type: schema.assertScalarFieldType(
            schema.getNonNullType(schema.expectStringType()),
          ),
        },
        ...transformedNode.selections,
      ],
    };
  }
  cache.set(fragment, transformedNode);
  return transformedNode;
}

function visitLinkedField(field: LinkedField, state: State): LinkedField {
  const schema: Schema = this.getContext().getSchema();
  let transformedNode = cache.get(field);
  if (transformedNode != null && transformedNode.kind === 'LinkedField') {
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

function transformWithOptions(
  options: TransformOptions,
): (context: CompilerContext) => CompilerContext {
  return function flattenTransform(context: CompilerContext): CompilerContext {
    return generateTypeNameTransform(context, options);
  };
}

module.exports = {
  transformWithOptions,
};
