/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const RelayQLTransformer = require('./RelayQLTransformer');
const RelayTransformError = require('./RelayTransformError');

const computeLocation = require('./computeLocation');
const invariant = require('./invariant');

const util = require('./util');

const {
  buildASTSchema,
  buildClientSchema,
} = require('graphql');

import type {Validator} from './RelayQLTransformer';

const PROVIDES_MODULE = 'providesModule';
const RELAY_QL_GENERATED = 'RelayQL_GENERATED';

type GraphQLSchema = Object;
type GraphQLSchemaProvider = (Object | () => Object);

/**
 * Returns a new Babel Transformer that uses the supplied schema to transform
 * template strings tagged with `Relay.QL` into an internal representation of
 * GraphQL queries.
 */
function getBabelRelayPlugin(
  schemaProvider: GraphQLSchemaProvider,
  pluginOptions?: ?{
    debug?: ?boolean,
    inputArgumentName?: ?string,
    snakeCase?: ?boolean,
    suppressWarnings?: ?boolean,
    substituteVariables?: ?boolean,
    validator?: ?Validator<any>,
  }
): Function {
  const options = pluginOptions || {};
  const warning = options.suppressWarnings ?
    function() {} :
    console.warn.bind(console);

  const schema = getSchema(schemaProvider);
  const transformer = new RelayQLTransformer(schema, {
    inputArgumentName: options.inputArgumentName,
    snakeCase: !!options.snakeCase,
    substituteVariables: !!options.substituteVariables,
    validator: options.validator,
  });

  return function(babel) {
    const t = babel.types;
    return {
      visitor: {


        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression(path, state) {
          const {node} = path;

          const tag = path.get('tag');
          const tagName =
            tag.matchesPattern('Relay.QL') ? 'Relay.QL' :
            tag.isIdentifier({name: 'RelayQL'}) ? 'RelayQL' :
            tag.isIdentifier({name: RELAY_QL_GENERATED}) ? RELAY_QL_GENERATED :
            null;
          if (!tagName) {
            return;
          }


        },
      },
    };
  };
}

function getSchema(schemaProvider: GraphQLSchemaProvider): GraphQLSchema {
  const introspection = typeof schemaProvider === 'function' ?
    schemaProvider() :
    schemaProvider;
  if (typeof introspection.__schema === 'object' && introspection.__schema) {
    return buildClientSchema(introspection);
  } else if (introspection.kind && introspection.kind === 'Document') {
    return buildASTSchema(introspection);
  }

  throw new Error(
    'Invalid introspection data supplied to `getBabelRelayPlugin()`. The ' +
    'resulting schema is not an object with a `__schema` property or ' +
    'a schema IDL language.'
  );
}

module.exports = getBabelRelayPlugin;
