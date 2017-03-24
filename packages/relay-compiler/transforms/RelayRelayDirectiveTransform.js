/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRelayDirectiveTransform
 * @flow
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');
const RelaySchemaUtils = require('RelaySchemaUtils');

const getRelayLiteralArgumentValues = require('getRelayLiteralArgumentValues');
const invariant = require('invariant');

const {visit} = require('RelayIRVisitor');

import type {Fragment} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

const RELAY = 'relay';
const PLURAL = 'plural';

function transformSchema(schema: GraphQLSchema): GraphQLSchema {
  if (schema.getDirectives().find(directive => directive.name === RELAY)) {
    return schema;
  }
  const exportSchema = RelaySchemaUtils.parseSchema(`
    # TODO: replace this when extendSchema supports directives
    schema {
      query: QueryType
      mutation: MutationType
    }
    type QueryType {
      id: ID
    }
    type MutationType {
      id: ID
    }
    # The actual directive to add
    directive @relay(plural: Boolean) on FRAGMENT
  `);
  return RelaySchemaUtils.schemaWithDirectives(
    schema,
    exportSchema.getDirectives().filter(directive => directive.name === RELAY)
  );
}

/**
 * A transform that extracts `@relay(plural: Boolean)` directives and converts
 * them to metadata that can be accessed at runtime.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  return context.documents().reduce((ctx, node) => {
    return ctx.add(visit(node, {
      Fragment: visitFragment,
    }));
  }, new RelayCompilerContext(context.schema));
}

function visitFragment(fragment: Fragment): Fragment {
  const relayDirective = fragment.directives.find(({name}) => name === RELAY);
  if (!relayDirective) {
    return fragment;
  }
  const {plural} = getRelayLiteralArgumentValues(relayDirective.args);
  invariant(
    plural === undefined || typeof plural === 'boolean',
    'RelayRelayDirectiveTransform: Expected the %s argument to @%s to be ' +
    'a boolean literal or not specified.',
    PLURAL,
    RELAY,
  );
  return {
    ...fragment,
    directives: fragment.directives.filter(directive => directive !== relayDirective),
    metadata: {
      ...(fragment.metadata || {}),
      plural,
    },
  };
}

module.exports = {
  transform,
  transformSchema,
};
