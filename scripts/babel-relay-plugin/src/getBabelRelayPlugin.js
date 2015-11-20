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
    substituteVariables?: ?boolean;
  }
): Function {
  const options = pluginOptions || {};
  const warning = options.suppressWarnings ?
    function() {} :
    console.warn.bind(console);

  const schema = getSchema(schemaProvider);
  const transformer = new RelayQLTransformer(schema, {
    substituteVariables: !!options.substituteVariables,
  });

  return function(_ref) {
    let t = _ref.types;

    return {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */
        Program(_path, state) {
          let node = _path.node;
          let parent = _path.parent;
          if (state.file.opts.basename) {
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
          const filename = state.file.opts.filename;
          if (filename && !documentName) {
            const basename = state.file.opts.basename;
            const captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
            if (captures) {
              documentName = captures[0];
            }
          }
          state.file.opts.basename = documentName || 'UnknownFile';
        },

        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression(_path, state) {
          let node = _path.node;
          let parent = _path.parent;
          let tag = _path.get('tag');
          const tagName =
            tag.matchesPattern('Relay.QL') ? 'Relay.QL' :
            tag.isIdentifier({name: 'RelayQL'}) ? 'RelayQL' :
            null;
          if (!tagName) {
            return;
          }

          const documentName = state.file.opts.basename;
          invariant(documentName, 'Expected `documentName` to have been set.');

          let result;
          try {
            result = transformer.transform(node.quasi, documentName, tagName);
          } catch (error) {
            // Print a console warning and replace the code with a function
            // that will immediately throw an error in the browser.
            var {sourceText, validationErrors} = error;
            var filename = state.file.opts.filename || 'UnknownFile';
            var errorMessages = [];
            if (validationErrors && sourceText) {
              var sourceLines = sourceText.split('\n');
              validationErrors.forEach(({message, locations}) => {
                errorMessages.push(message);
                warning(
                  '\n-- GraphQL Validation Error -- %s --\n',
                  state.file.opts.basename
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
                state.file.opts.basename
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
                      [t.valueToNode(runtimeMessage)]
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
          _path.replaceWith(result);
        }
      }
    };
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
