// @generated
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @fullSyntaxTransform
 */

'use strict';

var _require = require('./GraphQL');

var buildClientSchema = _require.utilities_buildClientSchema.buildClientSchema;

var RelayQLTransformer = require('./RelayQLTransformer');
var babelAdapter = require('./babelAdapter');
var invariant = require('./invariant');
var util = require('util');

var PROVIDES_MODULE = 'providesModule';

/**
 * Returns a new Babel Transformer that uses the supplied schema to transform
 * template strings tagged with `Relay.QL` into an internal representation of
 * GraphQL queries.
 */
function getBabelRelayPlugin(schemaProvider, pluginOptions) {
  var options = pluginOptions || {};
  var warning = options.suppressWarnings ? function () {} : console.warn.bind(console);

  var schema = getSchema(schemaProvider);
  var transformer = new RelayQLTransformer(schema, {
    inputArgumentName: options.inputArgumentName,
    snakeCase: !!options.snakeCase,
    substituteVariables: !!options.substituteVariables,
    validator: options.validator
  });

  return function (_ref) {
    var Plugin = _ref.Plugin;
    var types = _ref.types;

    return babelAdapter(Plugin, types, 'relay-query', function (t) {
      return {
        visitor: {
          /**
           * Extract the module name from `@providesModule`.
           */
          Program: function Program(_ref2, state) {
            var parent = _ref2.parent;

            if (state.file.opts.documentName) {
              return;
            }
            var documentName = undefined;
            if (parent.comments && parent.comments.length) {
              var docblock = parent.comments[0].value || '';
              var propertyRegex = /@(\S+) *(\S*)/g;
              var captures = undefined;
              while (captures = propertyRegex.exec(docblock)) {
                var property = captures[1];
                var value = captures[2];
                if (property === PROVIDES_MODULE) {
                  documentName = value.replace(/[\.-:]/g, '_');
                  break;
                }
              }
            }
            var basename = state.file.opts.basename;
            if (basename && !documentName) {
              var captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
              if (captures) {
                documentName = captures[0];
              }
            }
            state.file.opts.documentName = documentName || 'UnknownFile';
          },

          /**
           * Transform Relay.QL`...`.
           */
          TaggedTemplateExpression: function TaggedTemplateExpression(path, state) {
            var node = path.node;

            var tag = path.get('tag');
            var tagName = tag.matchesPattern('Relay.QL') ? 'Relay.QL' : tag.isIdentifier({ name: 'RelayQL' }) ? 'RelayQL' : null;
            if (!tagName) {
              return;
            }

            var documentName = state.file.opts.documentName;

            invariant(documentName, 'Expected `documentName` to have been set.');

            var result = undefined;
            try {
              result = transformer.transform(t, node.quasi, documentName, tagName);
            } catch (error) {
              // Print a console warning and replace the code with a function
              // that will immediately throw an error in the browser.
              var sourceText = error.sourceText;
              var validationErrors = error.validationErrors;

              var basename = state.file.opts.basename || 'UnknownFile';
              var filename = state.file.opts.filename || 'UnknownFile';
              var errorMessages = [];
              if (validationErrors && sourceText) {
                var sourceLines = sourceText.split('\n');
                validationErrors.forEach(function (_ref3) {
                  var message = _ref3.message;
                  var locations = _ref3.locations;

                  errorMessages.push(message);
                  warning('\n-- GraphQL Validation Error -- %s --\n', basename);
                  warning(['File:  ' + filename, 'Error: ' + message, 'Source:'].join('\n'));
                  locations.forEach(function (location) {
                    var preview = sourceLines[location.line - 1];
                    if (preview) {
                      warning(['> ', '> ' + preview, '> ' + ' '.repeat(location.column - 1) + '^^^'].join('\n'));
                    }
                  });
                });
              } else {
                errorMessages.push(error.message);
                warning('\n-- Relay Transform Error -- %s --\n', basename);
                warning(['File:  ' + filename, 'Error: ' + error.stack].join('\n'));
              }
              var runtimeMessage = util.format('GraphQL validation/transform error ``%s`` in file `%s`.', errorMessages.join(' '), filename);
              result = t.callExpression(t.functionExpression(null, [], t.blockStatement([t.throwStatement(t.newExpression(t.identifier('Error'), [t.valueToNode(runtimeMessage)]))])), []);

              if (options.debug) {
                console.error(error.stack);
              }
              if (options.abortOnError) {
                throw new Error('Aborting due to GraphQL validation/transform error(s).');
              }
            }
            // For babel 5 compatibility
            if (state.isLegacyState) {
              return result; // eslint-disable-line consistent-return
            } else {
                path.replaceWith(result);
              }
          }
        }
      };
    });
  };
}

function getSchema(schemaProvider) {
  var introspection = typeof schemaProvider === 'function' ? schemaProvider() : schemaProvider;
  invariant(typeof introspection === 'object' && introspection && typeof introspection.__schema === 'object' && introspection.__schema, 'Invalid introspection data supplied to `getBabelRelayPlugin()`. The ' + 'resulting schema is not an object with a `__schema` property.');
  return buildClientSchema(introspection);
}

module.exports = getBabelRelayPlugin;