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
    transforms?: ?Array<{
      transform: (context: GraphQLCompilerContext) => GraphQLCompilerContext,
    }>,
  ): {[key: string]: GeneratedNode} {
    const RelayCodeGenerator = require('RelayCodeGenerator');
    const GraphQLCompilerContext = require('GraphQLCompilerContext');
    const RelayParser = require('RelayParser');
    const RelayTestSchema = require('RelayTestSchema');

    const ast = RelayParser.parse(RelayTestSchema, text);
    let context = new GraphQLCompilerContext(RelayTestSchema).addAll(ast);
    if (transforms) {
      context = context.applyTransforms(transforms);
    }
    const documentMap = {};
    context.forEachDocument(node => {
      if (node.kind === 'Root') {
        documentMap[node.name] = RelayCodeGenerator.generate({
          kind: 'Batch',
          metadata: node.metadata || {},
          name: node.name,
          fragment: buildFragmentForRoot(node),
          requests: [
            {
              kind: 'Request',
              name: node.name,
              id: null,
              text,
              root: node,
              argumentDependencies: [],
            },
          ],
        });
      } else {
        documentMap[node.name] = RelayCodeGenerator.generate(node);
      }
    });
    return documentMap;
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
    const {transformASTSchema} = require('ASTConvert');
    const {generate} = require('RelayCodeGenerator');
    const RelayCompiler = require('RelayCompiler');
    const GraphQLCompilerContext = require('GraphQLCompilerContext');
    const RelayIRTransforms = require('RelayIRTransforms');
    const RelayTestSchema = require('RelayTestSchema');
    const parseGraphQLText = require('parseGraphQLText');

    schema = schema || RelayTestSchema;
    const relaySchema = transformASTSchema(
      schema,
      RelayIRTransforms.schemaExtensions,
    );
    const compiler = new RelayCompiler(
      schema,
      new GraphQLCompilerContext(relaySchema),
      RelayIRTransforms,
      generate,
    );

    compiler.addDefinitions(parseGraphQLText(relaySchema, text).definitions);
    const documentMap = {};
    compiler.compile().forEach(node => {
      documentMap[node.name] = node;
    });
    return documentMap;
  },
};

/**
 * Construct the fragment equivalent of a root node.
 */
function buildFragmentForRoot(root) {
  return {
    argumentDefinitions: (root.argumentDefinitions: $FlowIssue),
    directives: root.directives,
    kind: 'Fragment',
    metadata: null,
    name: root.name,
    selections: root.selections,
    type: root.type,
  };
}

module.exports = RelayModernTestUtils;
