/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

import type {GeneratedNode} from 'RelayConcreteNode';

/**
 * Utilities (custom matchers etc) for Relay "static" tests.
 */
const RelayModernTestUtils = {
  matchers: {
    toBeDeeplyFrozen(actual) {
      const {isCollection, forEach} = require('iterall');

      function check(value) {
        expect(Object.isFrozen(value)).toBe(true);
        if (isCollection(value)) {
          forEach(value, check);
        } else if (typeof value === 'object' && value !== null) {
          for (const key in value) {
            check(value[key]);
          }
        }
      }
      check(actual);
      return {
        pass: true,
      };
    },

    toFailInvariant(actual, expected) {
      expect(actual).toThrowError(expected);
      return {
        pass: true,
      };
    },

    toWarn(actual, expected) {
      const negative = this.isNot;

      function formatItem(item) {
        return item instanceof RegExp ? item.toString() : JSON.stringify(item);
      }

      function formatArray(array) {
        return '[' + array.map(formatItem).join(', ') + ']';
      }

      function formatExpected(args) {
        return formatArray([false].concat(args));
      }

      function formatActual(calls) {
        if (calls.length) {
          return calls
            .map(args => {
              return formatArray([!!args[0]].concat(args.slice(1)));
            })
            .join(', ');
        } else {
          return '[]';
        }
      }

      const warning = require('warning');
      if (!warning.mock) {
        throw new Error("toWarn(): Requires `jest.mock('warning')`.");
      }

      const callsCount = warning.mock.calls.length;
      actual();
      const calls = warning.mock.calls.slice(callsCount);

      // Simple case: no explicit expectation.
      if (!expected) {
        const warned = calls.filter(args => !args[0]).length;
        return {
          pass: !!warned,
          message: () =>
            `Expected ${negative ? 'not ' : ''}to warn but ` +
            '`warning` received the following calls: ' +
            `${formatActual(calls)}.`,
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
            return other instanceof RegExp ? other.test(arg) : arg === other;
          })
        );
      });

      return {
        pass: !!call,
        message: () =>
          `Expected ${negative ? 'not ' : ''}to warn: ` +
          `${formatExpected(expected)} but ` +
          '`warning` received the following calls: ' +
          `${formatActual(calls)}.`,
      };
    },

    toThrowTypeError(fn) {
      let pass = false;
      try {
        fn();
      } catch (e) {
        pass = e instanceof TypeError;
      }
      return {
        pass,
        message: () => 'Expected function to throw a TypeError.',
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
    transforms?: ?Array<IRTransform>,
  ): {[key: string]: GeneratedNode} {
    const RelayTestSchema = require('RelayTestSchema');
    return generate(text, RelayTestSchema, {
      commonTransforms: transforms || [],
      fragmentTransforms: [],
      queryTransforms: [],
      codegenTransforms: [],
      printTransforms: [],
    });
  },

  /**
   * Compiles the given GraphQL text using the standard set of transforms (as
   * defined in RelayCompiler) and returns a mapping of definition name to
   * its full runtime representation.
   */
  generateAndCompile(
    text: string,
    schema?: ?GraphQLSchema,
  ): {[key: string]: GeneratedNode} {
    const RelayIRTransforms = require('RelayIRTransforms');
    const RelayTestSchema = require('RelayTestSchema');
    return generate(text, schema || RelayTestSchema, RelayIRTransforms);
  },
};

function generate(
  text: string,
  schema: GraphQLSchema,
  transforms: RelayCompilerTransforms,
): {[key: string]: GeneratedNode} {
  const {transformASTSchema} = require('ASTConvert');
  const {compileRelayArtifacts} = require('relay-compiler');
  const GraphQLCompilerContext = require('GraphQLCompilerContext');
  const RelayIRTransforms = require('RelayIRTransforms');
  const parseGraphQLText = require('parseGraphQLText');
  const relaySchema = transformASTSchema(
    schema,
    RelayIRTransforms.schemaExtensions,
  );
  const compilerContext = new GraphQLCompilerContext(
    schema,
    relaySchema,
  ).addAll(parseGraphQLText(relaySchema, text).definitions);
  const documentMap = {};
  compileRelayArtifacts(compilerContext, transforms).forEach(node => {
    documentMap[node.name] = node;
  });
  return documentMap;
}

module.exports = RelayModernTestUtils;
