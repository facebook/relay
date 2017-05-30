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
            var basename = state.file.opts.basename || 'UnknownFile';
            var filename = state.file.opts.filename || 'UnknownFile';
            var errorMessages = [];

            if (error instanceof RelayTransformError) {
              errorMessages.push(error.message);
              warning(
                '\n-- Relay Transform Error -- %s --\n',
                basename
              );
              const sourceLine = node.quasi.loc && node.quasi.loc.start.line;
              const relativeLocation = error.loc && computeLocation(error.loc);
              if (sourceLine && relativeLocation) {
                warning([
                  'Within RelayQLDocument ' + filename + ':' + sourceLine,
                  '> ',
                  '> line ' + (relativeLocation.line) + ' (approximate)',
                  '> ' + relativeLocation.source,
                  '> ' + ' '.repeat(relativeLocation.column - 1) + '^^^',
                  'Error: ' + error.message,
                  'Stack: ' + error.stack,
                ].join('\n'));
              } else {
                warning(error.message);
              }
            } else {
              // Print a console warning and replace the code with a function
              // that will immediately throw an error in the browser.
              var {sourceText, validationErrors} = error;
              var isValidationError = !!(validationErrors && sourceText);
              if (isValidationError) {
                var sourceLines = sourceText.split('\n');
                validationErrors.forEach(({message, locations}) => {
                  errorMessages.push(message);
                  warning(
                    '\n-- GraphQL Validation Error -- %s --\n',
                    basename
                  );
                  warning([
                    'File:  ' + filename,
                    'Error: ' + message,
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
                  basename
                );
                warning([
                  'File:  ' + filename,
                  'Error: ' + error.stack,
                ].join('\n'));
              }
            }
            var runtimeMessage = util.format(
              '%s error ``%s`` in file `%s`. Try updating your GraphQL ' +
              'schema if an argument/field/type was recently added.',
              isValidationError ? 'GraphQL validation' : 'Relay transform',
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
                  ),
                ])
              ),
              []
            );

            if (state.opts && state.opts.enforceSchema) {
              throw new Error(util.format(
                errorMessages.length ?
                  'Aborting due to a %s error:\n\n%s\n' :
                  'Aborting due to %s errors:\n\n%s\n',
                isValidationError ? 'GraphQL validation' : 'Relay transform',
                errorMessages
                  .map(errorMessage => '  - ' + errorMessage)
                  .join('\n'),
              ));
            } else if (options.debug) {
              console.error(error.stack);
            }
          }
          path.replaceWith(result);
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
