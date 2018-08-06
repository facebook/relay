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

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const invariant = require('invariant');

const {
  assertTypeWithFields,
  canHaveSelections,
  getRawType,
} = require('../core/GraphQLSchemaUtils');
const {
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
} = require('graphql');

import type {
  Field,
  Fragment,
  FragmentSpread,
  InlineFragment,
  Root,
} from '../core/GraphQLIR';
import type {GraphQLType} from 'graphql';

/**
 * A transform that removes any selections that are not valid relative to the
 * server schema. The primary use case is for fields added via client
 * `extend type ...` definitions and for inline fragments / fragment spreads
 * whose types are added with client `type ...` type extensions.
 *
 * Given a base schema:
 *
 * ```
 * # Note: full schema definition elided for clarity
 * interface Viewer {
 *   name: String
 * }
 * type User implements Viewer {
 *   name: String
 * }
 * ```
 *
 * And a fragment:
 *
 * ```
 * fragment on Viewer {
 *   name
 *   ... on User {
 *     clientField # (1)
 *   }
 *   ... on ClientType { # (2)
 *     clientField
 *   }
 * }
 * extend type User {
 *   clientField: String
 * }
 * type ClientType implements Viewer {
 *   name: String
 *   clientField: String
 * }
 * ```
 *
 * This transform will output:
 *
 * ```
 * fragment on Viewer {
 *   name
 * }
 * ```
 *
 * Note that (1) is removed because this field does not exist on the base `User`
 * type, and (2) is removed because the `ClientType` type does not exist in the
 * base schema.
 */
function skipClientFieldTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(
    context,
    {
      FragmentSpread: visitFragmentSpread,
      InlineFragment: visitInlineFragment,
      LinkedField: visitField,
      ScalarField: visitField,
    },
    node => buildState(context, node),
  );
}

/**
 * @internal
 *
 * Build the initial state, returning null for fragments whose type is not
 * defined in the server schema.
 */
function buildState(
  context: GraphQLCompilerContext,
  node: Fragment | Root,
): ?GraphQLType {
  const schema = context.serverSchema;
  if (node.kind === 'Fragment') {
    return schema.getType(node.type.name);
  }
  switch (node.operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      return schema.getMutationType();
    case 'subscription':
      return schema.getSubscriptionType();
  }
  return null;
}

/**
 * @internal
 *
 * Skip fields that were added via `extend type ...`.
 */
function visitField<F: Field>(field: F, parentType: GraphQLType): ?F {
  if (
    // Field is defined in the original parent type definition:
    (canHaveSelections(parentType) &&
      assertTypeWithFields(parentType).getFields()[field.name]) ||
    // Allow metadata fields and fields defined on classic "fat" interfaces
    field.name === SchemaMetaFieldDef.name ||
    field.name === TypeMetaFieldDef.name ||
    field.name === TypeNameMetaFieldDef.name ||
    field.directives.some(({name}) => name === 'fixme_fat_interface')
  ) {
    const rawType = getRawType(field.type);
    const type = this.getContext().serverSchema.getType(rawType.name);
    invariant(
      type,
      'SkipClientFieldTransform: Expected type `%s` to be defined in ' +
        'the server schema.',
      rawType.name,
    );
    return this.traverse(field, type);
  }
  return null;
}

/**
 * @internal
 *
 * Skip fragment spreads where the referenced fragment is not defined in the
 * original schema.
 */
function visitFragmentSpread(
  spread: FragmentSpread,
  parentType: GraphQLType,
): ?FragmentSpread {
  const context = this.getContext();
  const fragment = context.getFragment(spread.name);
  if (context.serverSchema.getType(fragment.type.name)) {
    return this.traverse(spread, parentType);
  }
  return null;
}

/**
 * @internal
 *
 * Skip inline fragments where the type is not in the schema.
 */
function visitInlineFragment(
  fragment: InlineFragment,
  parentType: GraphQLType,
): ?InlineFragment {
  const schema = this.getContext().serverSchema;
  const type = schema.getType(fragment.typeCondition.name);
  if (type) {
    return this.traverse(fragment, type);
  }
  return null;
}

module.exports = {
  transform: skipClientFieldTransform,
};
