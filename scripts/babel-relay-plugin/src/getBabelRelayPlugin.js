/**
 * Copyright 2013-2015, Facebook, Inc.
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
const {buildClientSchema} = require('graphql/utilities/buildClientSchema');
const invariant = require('./invariant');
const path = require('path');
const util = require('util');

const PROVIDES_MODULE = 'providesModule';

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
    abortOnError?: ?boolean;
    debug?: ?boolean;
    suppressWarnings?: ?boolean;
  }
): Function {
  const schema = getSchema(schemaProvider);
  const transformer = new RelayQLTransformer(schema);

  const options = pluginOptions || {};
  const warning = options.suppressWarnings ?
    function() {} :
    console.warn.bind(console);

  return function({Plugin, types: t}) {
    return new Plugin('relay-query', {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */
        Program(node, parent, scope, state) {
          if (state.opts.extra.documentName) {
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
          const filename = state.opts.filename;
          if (filename && !documentName) {
            const basename = path.basename(filename);
            const captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
            if (captures) {
              documentName = captures[0];
            }
          }
          state.opts.extra.documentName = documentName || 'UnknownFile';
        },

        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression(node, parent, scope, state) {
          const tag = this.get('tag');
          const tagName =
            tag.matchesPattern('Relay.QL') ? 'Relay.QL' :
            tag.matchesPattern('Relay.Query') ? 'Relay.Query' :
            tag.isIdentifier({name: 'RelayQL'}) ? 'RelayQL' :
            null;
          if (!tagName) {
            return;
          }

          const {documentName} = state.opts.extra;
          invariant(documentName, 'Expected `documentName` to have been set.');

          let result;
          try {
            result = transformer.transform(node.quasi, documentName, tagName);
          } catch (error) {
            // Print a console warning and replace the code with a function
            // that will immediately throw an error in the browser.
            var {sourceText, validationErrors} = error;
            var filename = state.opts.filename || 'UnknownFile';
            var errorMessages = [];
            if (validationErrors && sourceText) {
              var sourceLines = sourceText.split('\n');
              validationErrors.forEach(({message, locations}) => {
                errorMessages.push(message);
                warning(
                  '\n-- GraphQL Validation Error -- %s --\n',
                  path.basename(filename)
                );
                warning([
                  'Error: ' + message,
                  'File:  ' + filename,
                  'Source:',
                ].join('\n'));
                locations.forEach(location => {
                  var preview = sourceLines[location.line - 1];
                  if (preview) {
                    warning([
                      '> ',
                      '> ' + preview,
                      '> ' + ' '.repeat(location.column - 1) + '^^^',
                    ].join('\n'));
                  }
                });
              });
            } else {
              errorMessages.push(error.message);
              warning(
                '\n-- Relay Transform Error -- %s --\n',
                path.basename(filename)
              );
              warning([
                'Error: ' + error.message,
                'File:  ' + filename,
              ].join('\n'));
            }
            var runtimeMessage = util.format(
              'GraphQL validation/transform error ``%s`` in file `%s`.',
              errorMessages.join(' '),
              filename
            );
            result = t.callExpression(
              t.functionExpression(
                null,
                [],
                t.blockStatement([
                  t.throwStatement(
                    t.newExpression(
                      t.identifier('Error'),
                      [t.literal(runtimeMessage)]
                    )
                  )
                ])
              ),
              []
            );

            if (options.debug) {
              console.error(error.stack);
            }
            if (options.abortOnError) {
              throw new Error(
                'Aborting due to GraphQL validation/transform error(s).'
              );
            }
          }
          this.replaceWith(result);
        }
      }
    });
  };
}

function getSchema(schemaProvider: GraphQLSchemaProvider): GraphQLSchema {
  const introspection = typeof schemaProvider === 'function' ?
    schemaProvider() :
    schemaProvider;
  invariant(
    typeof introspection === 'object' && introspection &&
    typeof introspection.__schema === 'object' && introspection.__schema,
    'Invalid introspection data supplied to `getBabelRelayPlugin()`. The ' +
    'resulting schema is not an object with a `__schema` property.'
  );
  return buildClientSchema(introspection);
}

module.exports = getBabelRelayPlugin;
