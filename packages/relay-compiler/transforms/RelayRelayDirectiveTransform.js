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

const GraphQL = require('graphql');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');

const getRelayLiteralArgumentValues = require('getRelayLiteralArgumentValues');
const invariant = require('invariant');

import type {Fragment} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

const RELAY = 'relay';
const PLURAL = 'plural';

function transformSchema(schema: GraphQLSchema): GraphQLSchema {
  if (schema.getDirectives().find(directive => directive.name === RELAY)) {
    return schema;
  }
  return GraphQL.extendSchema(
    schema,
    GraphQL.parse('directive @relay(plural: Boolean) on FRAGMENT'),
  );
}

/**
 * A transform that extracts `@relay(plural: Boolean)` directives and converts
 * them to metadata that can be accessed at runtime.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  return RelayIRTransformer.transform(
    context,
    {
      Fragment: visitFragment,
    },
    () => ({}), // empty state
  );
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
    directives: fragment.directives.filter(
      directive => directive !== relayDirective,
    ),
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
