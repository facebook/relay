/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var RelayQLTransformer = require('./RelayQLTransformer');
var buildClientSchema =
  require('graphql/utilities/buildClientSchema').buildClientSchema;

var assert = require('assert');
var path = require('path');

var PROVIDES_MODULE = 'providesModule';

/**
 * Extract text from a template string.
 */
function extractTemplate(node) {
  var text = '';
  var substitutions = [];
  var templateElements = node.quasi.quasis;
  for (var ii = 0; ii < templateElements.length; ii++) {
    var template = templateElements[ii];
    text += template.value.cooked.trim();
    if (!template.tail) {
      var sub = 'sub_' + ii;
      substitutions.push(sub);
      text += '...' + sub;

      var nextTemplate = templateElements[ii + 1];
      if (nextTemplate && !/^\s*[,\}]/.test(nextTemplate)) {
        text += ',';
      }
    }
  }
  return {text: text, substitutions: substitutions};
}

/**
 * Returns a new Babel Transformer that uses the supplied schema to transform
 * template strings tagged with `Relay.QL` into an internal representation of
 * GraphQL queries.
 */
function getBabelRelayPlugin(
  schemaProvider, /*: Object | Function */
  options /*: ?Object */
) /*: Object */ {
  return function(babel) {
    var Plugin = babel.Plugin;
    var t = babel.types;

    options = options || {};

    var warning = options.suppressWarnings ?
      function() {} :
      console.warn.bind(console);

    return new Plugin('relay-query', {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */
        Program: function(node, parent, scope, state) {
          if (state.opts.extra.documentName) {
            return;
          }
          var documentName;
          if (parent.comments && parent.comments.length) {
            var docblock = parent.comments[0].value || '';
            var propertyRegex = /@(\S+) *(\S*)/g;
            var match;
            while ((match = propertyRegex.exec(docblock))) {
              var property = match[1];
              var value = match[2];
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
          if (documentName) {
            state.opts.extra.documentName = documentName;
          }
        },

        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression: function(node, parent, scope, state) {
          if (!this.get('tag').matchesPattern('Relay.QL')) {
            return;
          }

          var documentTransformer = state.opts.extra.documentTransformer;
          if (!documentTransformer) {
            var schema = getSchema(schemaProvider);
            documentTransformer = new RelayQLTransformer(schema);
            state.opts.extra.documentTransformer = documentTransformer;
          }
          assert(
            documentTransformer instanceof RelayQLTransformer,
            'getBabelRelayPlugin(): Expected a document transformer to be ' +
            'configured for this instance of the plugin.'
          );

          var extractedTemplate = extractTemplate(node);
          var documentName = state.opts.extra.documentName || 'UnknownFile';
          var code;
          try {
            code = documentTransformer.transformQuery(
              extractedTemplate,
              documentName,
              'Relay.QL'
            );
          } catch (error) {
            // Print a console warning and replace the code with a function
            // that will immediately throw an error in the browser.
            var filename = state.opts.filename || 'UnknownFile';
            var sourceText = error.sourceText;
            var validationErrors = error.validationErrors;
            var errorMessages;
            if (validationErrors && sourceText) {
              var sourceLines = sourceText.split('\n');
              validationErrors.forEach(function(validationError) {
                errorMessages = errorMessages || [];
                errorMessages.push(validationError.message);
                warning(
                  '\n-- GraphQL Validation Error -- %s --\n',
                  path.basename(filename)
                );
                warning(
                  'Error: ' + validationError.message + '\n' +
                  'File:  ' + filename + '\n' +
                  'Source:'
                );
                validationError.locations.forEach(function(location) {
                  var preview = sourceLines[location.line - 1];
                  var prefix = '> ';
                  var highlight = repeat(' ', location.column - 1) + '^^^';
                  if (preview) {
                    warning(prefix);
                    warning(prefix + preview);
                    warning(prefix + highlight);
                  }
                });
              });
            } else {
              errorMessages = [error.message];
              warning(
                '\n-- Relay Transform Error -- %s --\n',
                path.basename(filename)
              );
              warning(
                'Error: ' + error.message + '\n' +
                'File:  ' + filename + '\n'
              );
            }

            var message = (
              'GraphQL validation/transform error ``' +
              errorMessages.join(' ') +
              '`` in file `' +
              filename +
              '`.'
            );
            code = t.functionExpression(
              null,
              [],
              t.blockStatement([
                t.throwStatement(
                  t.newExpression(
                    t.identifier('Error'),
                    [t.literal(message)]
                  )
                )
              ])
            );

            if (options.debug) {
              console.log(error.message);
              console.log(error.stack);
            }
            if (options.abortOnError) {
              throw new Error(
                'Aborting due to GraphQL validation/transform error(s).'
              );
            }
          }

          // Immediately invoke the function with substitutions as arguments.
          var substitutions = node.quasi.expressions;
          var funcCall = t.callExpression(code, substitutions);
          this.replaceWith(funcCall);
        }
      }
    });
  }
}

function repeat(char, count) {
  var str = '';
  while (str.length < count) {
    str += char;
  }
  return str;
}

function getSchema(
  schemaProvider /*: Object | Function */
) /*: GraphQLSchema */ {
  var schemaData = typeof schemaProvider === 'function' ?
    schemaProvider() :
    schemaProvider;
  assert(
    typeof schemaData === 'object' &&
    schemaData !== null &&
    typeof schemaData.__schema === 'object' &&
    schemaData.__schema !== null,
    'getBabelRelayPlugin(): Expected schema to be an object with a ' +
    '`__schema` property.'
  );
  return buildClientSchema(schemaData);
}

module.exports = getBabelRelayPlugin;
