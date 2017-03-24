/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelaySkipClientFieldTransform
 */

'use strict';

const GraphQLIntrospection = require('graphql/type/introspection');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');

const invariant = require('invariant');

const {
  assertTypeWithFields,
  canHaveSelections,
  getRawType,
} = require('RelaySchemaUtils');

import type {
  Field,
  Fragment,
  FragmentSpread,
  InlineFragment,
  Root,
} from 'RelayIR';
import type {GraphQLSchema, GraphQLType} from 'graphql';

const {
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
} = GraphQLIntrospection;

type State = {
  schema: GraphQLSchema,
  parentType: GraphQLType,
};

/**
 * A transform that removes any selections that are not valid relative to the
 * given schema. The primary use case is for fields added via client
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
function transform(
  context: RelayCompilerContext,
  schema: GraphQLSchema
): RelayCompilerContext {
  return RelayIRTransformer.transform(
    context,
    {
      FragmentSpread: visitFragmentSpread,
      InlineFragment: visitInlineFragment,
      LinkedField: visitField,
      ScalarField: visitField,
    },
    buildState.bind(null, schema)
  );
}

/**
 * @internal
 *
 * Build the initial state, returning null for fragments whose type is not
 * defined in the original schema.
 */
function buildState(schema: GraphQLSchema, node: Fragment | Root): ?State {
  let parentType;
  if (node.kind === 'Fragment') {
    parentType = schema.getType(node.type.name);
  } else {
    switch (node.operation) {
      case 'query':
        parentType = schema.getQueryType();
        break;
      case 'mutation':
        parentType = schema.getMutationType();
        break;
      case 'subscription':
        parentType = schema.getSubscriptionType();
        break;
    }
  }
  if (parentType) {
    return {
      schema,
      parentType,
    };
  } else {
    return null;
  }
}

/**
 * @internal
 *
 * Skip fields that were added via `extend type ...`.
 */
function visitField<F: Field>(field: F, state: State): ?F {
  if (
    // Field is defined in the original parent type definition:
    (canHaveSelections(state.parentType) &&
     assertTypeWithFields(state.parentType).getFields()[field.name]) ||
    // Allow metadata fields and fields defined on classic "fat" interfaces
    field.name === SchemaMetaFieldDef.name ||
    field.name === TypeMetaFieldDef.name ||
    field.name === TypeNameMetaFieldDef.name ||
    field.directives.some(({name}) => name === 'fixme_fat_interface')
  ) {
    const rawType = getRawType(field.type);
    const type = state.schema.getType(rawType.name);
    invariant(
      type,
      'RelaySkipClientFieldTransform: Expected type `%s` to be defined in ' +
      'the original schema.',
      rawType.name
    );
    return this.traverse(field, {
      ...state,
      parentType: type,
    });
  }
  return null;
}

/**
 * @internal
 *
 * Skip fragment spreads where the referenced fragment is not defined in the
 * original schema.
 */
function visitFragmentSpread(spread: FragmentSpread, state: State): ?FragmentSpread {
  const context = this.getContext();
  const fragment = context.get(spread.name);
  invariant(
    fragment && fragment.kind === 'Fragment',
    'RelaySkipClientFieldTransform: Expected a fragment named `%s` to be defined.',
    spread.name
  );
  if (state.schema.getType(fragment.type.name)) {
    return this.traverse(spread, state);
  }
  return null;
}

/**
 * @internal
 *
 * Skip inline fragments where the type is not in the schema.
 */
function visitInlineFragment(fragment: InlineFragment, state: State): ?InlineFragment {
  const type = state.schema.getType(fragment.typeCondition.name);
  if (type) {
    return this.traverse(fragment, {
      ...state,
      parentType: type,
    });
  }
  return null;
}


module.exports = {transform};
