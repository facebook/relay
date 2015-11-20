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

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var RelayQLTransformer = require('./RelayQLTransformer');

var _require = require('graphql/utilities/buildClientSchema');

var buildClientSchema = _require.buildClientSchema;

var invariant = require('./invariant');
var path = require('path');
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
    substituteVariables: !!options.substituteVariables
  });

  return function (_ref) {
    var t = _ref.types;

    return {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */

        Program: function Program(_path, state) {
          var node = _path.node;
          var parent = _path.parent;
          if (state.file.opts.basename) {
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
          var filename = state.file.opts.filename;
          if (filename && !documentName) {
            var basename = state.file.opts.basename;
            var captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
            if (captures) {
              documentName = captures[0];
            }
          }
          state.file.opts.basename = documentName || 'UnknownFile';
        },

        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression: function TaggedTemplateExpression(_path, state) {
          var node = _path.node;
          var parent = _path.parent;
          var tag = _path.get('tag');
          var tagName = tag.matchesPattern('Relay.QL') ? 'Relay.QL' : tag.isIdentifier({ name: 'RelayQL' }) ? 'RelayQL' : null;
          if (!tagName) {
            return;
          }

          var documentName = state.file.opts.basename;
          invariant(documentName, 'Expected `documentName` to have been set.');

          var result = undefined;
          try {
            result = transformer.transform(node.quasi, documentName, tagName);
          } catch (error) {
            // Print a console warning and replace the code with a function
            // that will immediately throw an error in the browser.
            var sourceText = error.sourceText;
            var validationErrors = error.validationErrors;

            var filename = state.file.opts.filename || 'UnknownFile';
            var errorMessages = [];
            if (validationErrors && sourceText) {
              var sourceLines = sourceText.split('\n');
              validationErrors.forEach(function (_ref2) {
                var message = _ref2.message;
                var locations = _ref2.locations;

                errorMessages.push(message);
                warning('\n-- GraphQL Validation Error -- %s --\n', state.file.opts.basename);
                warning(['Error: ' + message, 'File:  ' + filename, 'Source:'].join('\n'));
                locations.forEach(function (location) {
                  var preview = sourceLines[location.line - 1];
                  if (preview) {
                    warning(['> ', '> ' + preview, '> ' + ' '.repeat(location.column - 1) + '^^^'].join('\n'));
                  }
                });
              });
            } else {
              errorMessages.push(error.message);
              warning('\n-- Relay Transform Error -- %s --\n', state.file.opts.basename);
              warning(['Error: ' + error.message, 'File:  ' + filename].join('\n'));
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
          _path.replaceWith(result);
        }
      }
    };
  };
}

function getSchema(schemaProvider) {
  var introspection = typeof schemaProvider === 'function' ? schemaProvider() : schemaProvider;
  invariant((typeof introspection === 'undefined' ? 'undefined' : _typeof(introspection)) === 'object' && introspection && _typeof(introspection.__schema) === 'object' && introspection.__schema, 'Invalid introspection data supplied to `getBabelRelayPlugin()`. The ' + 'resulting schema is not an object with a `__schema` property.');
  return buildClientSchema(introspection);
}

module.exports = getBabelRelayPlugin;