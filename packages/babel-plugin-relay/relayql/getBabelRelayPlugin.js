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

const createTransformError = require('./createTransformError');
const getClassicTransformer = require('./getClassicTransformer');
const invariant = require('./invariant');

import type {Validator} from './RelayQLTransformer';

const PROVIDES_MODULE = 'providesModule';
const RELAY_QL_GENERATED = 'RelayQL_GENERATED';

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

  const transformer = getClassicTransformer(schemaProvider, options);

  return function(babel) {
    const t = babel.types;
    return {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */
        Program({parent}, state) {
          if (state.file.opts.documentName) {
            return;
          }
          let documentName;
          if (parent.comments && parent.comments.length) {
            const docblock = parent.comments[0].value || '';
            const propertyRegex = /@(\S+) *(\S*)/g;
            let captures;
            while ((captures = propertyRegex.exec(docblock))) {
              const property = captures[1];
              const value = captures[2];
              if (property === PROVIDES_MODULE) {
                documentName = value.replace(/[\.-:]/g, '_');
                break;
              }
            }
          }
          const basename = state.file.opts.basename;
          if (basename && !documentName) {
            const captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
            if (captures) {
              documentName = captures[0];
            }
          }
          state.file.opts.documentName = documentName || 'UnknownFile';
        },

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

          const {documentName} = state.file.opts;
          invariant(documentName, 'Expected `documentName` to have been set.');

          let p = path;
          let propName = null;
          while (!propName && (p = p.parentPath)) {
            if (p.isProperty()) {
              propName = p.node.key.name;
            }
          }

          let result;
          try {
            result =
              transformer.transform(
                t,
                node.quasi,
                {
                  documentName,
                  enableValidation: tagName !== RELAY_QL_GENERATED,
                  tagName,
                  propName,
                }
              );
          } catch (error) {
            result = createTransformError(t, error, node.quasi, state, options);
          }
          path.replaceWith(result);
        },
      },
    };
  };
}

module.exports = getBabelRelayPlugin;
