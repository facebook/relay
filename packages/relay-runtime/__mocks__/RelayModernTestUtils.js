/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

import type {
  ConcreteFragment,
  ConcreteBatch,
  ConcreteRoot,
} from 'RelayConcreteNode';

/**
 * Utilities (custom matchers etc) for Relay "static" tests.
 */
const RelayModernTestUtils = {
  matchers: {
    toBeDeeplyFrozen() {
      return {
        compare(actual) {
          const {isCollection, forEach} = require('iterall');
          const forEachObject = require('forEachObject');

          function check(value) {
            expect(Object.isFrozen(value)).toBe(true);
            if (isCollection(value)) {
              forEach(value, check);
            } else if (typeof value === 'object' && value !== null) {
              forEachObject(value, check);
            }
          }
          check(actual);
          return {
            pass: true,
          };
        },
      };
    },

    toFailInvariant() {
      return {
        compare(actual, expected) {
          expect(actual).toThrowError(expected);
          return {
            pass: true,
          };
        },
      };
    },

    toWarn() {
      function compare(negative) {
        function formatItem(item) {
          return item instanceof RegExp ?
            item.toString() :
            JSON.stringify(item);
        }

        function formatArray(array) {
          return '[' + array.map(formatItem).join(', ') + ']';
        }

        function formatExpected(args) {
          return formatArray([!!negative].concat(args));
        }

        function formatActual(calls) {
          if (calls.length) {
            return calls.map(args => {
              return formatArray([!!args[0]].concat(args.slice(1)));
            }).join(', ');
          } else {
            return '[]';
          }
        }

        return function(actual, expected) {
          const warning = require('warning');
          if (!warning.mock) {
            throw new Error(
              'toWarn(): Requires `jest.mock(\'warning\')`.'
            );
          }

          const callsCount = warning.mock.calls.length;
          actual();
          const calls = warning.mock.calls.slice(callsCount);

          // Simple case: no explicit expectation.
          if (!expected) {
            const warned = calls.filter(args => !args[0]).length;
            return {
              pass: !(negative ? warned : !warned),
              message: (
                `Expected ${negative ? 'not ' : ''}to warn but ` +
                '`warning` received the following calls: ' +
                `${formatActual(calls)}.`
              ),
            };
          }

          // Custom case: explicit expectation.
          if (!Array.isArray(expected)) {
            expected = [expected];
          }
          const call = calls.find(args => {
            return (
              args.length === expected.length + 1 &&
              args.every((arg, index) => {
                if (!index) {
                  return !arg;
                }
                const other = expected[index - 1];
                return (
                  other instanceof RegExp ?
                  other.test(arg) :
                  arg === other
                );
              })
            );
          });

          return {
            pass: !(negative ? call : !call),
            message: (
              `Expected ${negative ? 'not ' : ''}to warn: ` +
              `${formatExpected(expected)} but ` +
              '`warning` received the following calls: ' +
              `${formatActual(calls)}.`
            ),
          };
        };
      }

      return {
        compare: compare(),
        negativeCompare: compare(true),
      };
    },

    toThrowTypeError() {
      return {
        compare(fn) {
          let pass = false;
          try {
            fn();
          } catch (e) {
            pass = e instanceof TypeError;
          }
          return {
            pass,
            message: 'Expected function to throw a TypeError.',
          };
        },
      };
    },
  },

  /**
   * Parses GraphQL text, applies the selected transforms only (or none if
   * transforms is not specified), and returns a mapping of definition name to
   * its basic generated representation.
   */
  generateWithTransforms(
    text: string,
    transforms?: ?Array<{
      transform: (context: RelayCompilerContext) => RelayCompilerContext
    }>
  ): {[key: string]: ConcreteRoot | ConcreteFragment} {
    const RelayCodeGenerator = require('RelayCodeGenerator');
    // eslint-disable-next-line no-shadow
    const RelayCompilerContext = require('RelayCompilerContext');
    const RelayParser = require('RelayParser');
    const RelayTestSchema = require('RelayTestSchema');

    const ast = RelayParser.parse(RelayTestSchema, text);
    let context = new RelayCompilerContext(RelayTestSchema);
    context = ast.reduce(
      (ctx, node) => ctx.add(node),
      context
    );
    context = (transforms || []).reduce(
      (ctx, {transform}) => transform(ctx),
      context
    );
    const documentMap = {};
    context.documents().forEach(node => {
      documentMap[node.name] = RelayCodeGenerator.generate(node);
    });
    return documentMap;
  },

  /**
   * Compiles the given GraphQL text using the standard set of transforms (as
   * defined in RelayCompiler) and returns a mapping of definition name to
   * its full runtime representation (roots are wrapped in a ConcreteBatch).
   */
  generateAndCompile(
    text: string,
    schema?: ?GraphQLSchema,
  ): {[key: string]: ConcreteBatch | ConcreteFragment} {
    const {transformASTSchema} = require('ASTConvert');
    const RelayCompiler = require('RelayCompiler');
    const RelayCompilerContext = require('RelayCompilerContext');
    const RelayIRTransforms = require('RelayIRTransforms');
    const RelayTestSchema = require('RelayTestSchema');
    const parseGraphQLText = require('parseGraphQLText');

    schema = schema || RelayTestSchema;
    const relaySchema = transformASTSchema(
      schema,
      RelayIRTransforms.schemaTransforms,
    );
    const compiler = new RelayCompiler(
      schema,
      new RelayCompilerContext(relaySchema),
      RelayIRTransforms,
    );

    compiler.addDefinitions(parseGraphQLText(relaySchema, text).definitions);
    const documentMap = {};
    compiler.compile().forEach(node => {
      documentMap[node.name] = node;
    });
    return documentMap;
  },
};

module.exports = RelayModernTestUtils;
