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

if (!(process.version && process.version.match(/^v4/))) {
  require('babel/polyfill');
}

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

  return function (babel) {
    var Plugin = babel.Plugin;
    var t = babel.types;

    var warning = options.suppressWarnings ? function () {} : console.warn.bind(console);

    return new Plugin('relay-query', {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */
        Program: function Program(node, parent, scope, state) {
          if (state.opts.extra.documentName) {
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
          var filename = state.opts.filename;
          if (filename && !documentName) {
            var basename = path.basename(filename);
            var captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
            if (captures) {
              documentName = captures[0];
            }
          }
          state.opts.extra.documentName = documentName || 'UnknownFile';
        },

        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression: function TaggedTemplateExpression(node, parent, scope, state) {
          var tag = this.get('tag');
          var tagName = tag.matchesPattern('Relay.QL') ? 'Relay.QL' : tag.isIdentifier({ name: 'RelayQL' }) ? 'RelayQL' : null;
          if (!tagName) {
            return;
          }

          var transformer = state.opts.extra.transformer;
          if (!transformer) {
            var schema = getSchema(schemaProvider);
            transformer = new RelayQLTransformer(schema);
            state.opts.extra.transformer = transformer;
          }
          invariant(transformer instanceof RelayQLTransformer, 'getBabelRelayPlugin(): Expected RQLTransformer to be configured ' + 'for this instance of the plugin.');

          var documentName = state.opts.extra.documentName;

          invariant(documentName, 'Expected `documentName` to have been set.');

          var result = undefined;
          try {
            result = transformer.transform(node.quasi, documentName, tagName);
          } catch (error) {
            // Print a console warning and replace the code with a function
            // that will immediately throw an error in the browser.
            var sourceText = error.sourceText;
            var validationErrors = error.validationErrors;

            var filename = state.opts.filename || 'UnknownFile';
            var errorMessages = [];
            if (validationErrors && sourceText) {
              var sourceLines = sourceText.split('\n');
              validationErrors.forEach(function (_ref) {
                var message = _ref.message;
                var locations = _ref.locations;

                errorMessages.push(message);
                warning('\n-- GraphQL Validation Error -- %s --\n', path.basename(filename));
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
              warning('\n-- Relay Transform Error -- %s --\n', path.basename(filename));
              warning(['Error: ' + error.message, 'File:  ' + filename].join('\n'));
            }
            var runtimeMessage = util.format('GraphQL validation/transform error ``%s`` in file `%s`.', errorMessages.join(' '), filename);
            result = t.callExpression(t.functionExpression(null, [], t.blockStatement([t.throwStatement(t.newExpression(t.identifier('Error'), [t.literal(runtimeMessage)]))])), []);

            if (options.debug) {
              console.error(error.stack);
            }
            if (options.abortOnError) {
              throw new Error('Aborting due to GraphQL validation/transform error(s).');
            }
          }
          this.replaceWith(result);
        }
      }
    });
  };
}

function getSchema(schemaProvider) {
  var schemaData = typeof schemaProvider === 'function' ? schemaProvider() : schemaProvider;
  invariant(typeof schemaData === 'object' && schemaData !== null && typeof schemaData.__schema === 'object' && schemaData.__schema !== null, 'getBabelRelayPlugin(): Expected schema to be an object with a ' + '`__schema` property.');
  return buildClientSchema(schemaData);
}

module.exports = getBabelRelayPlugin;