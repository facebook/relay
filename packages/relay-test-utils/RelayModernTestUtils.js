/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayModernTestUtils
 * @format
 */

'use strict';

const invariant = require('invariant');
const parseGraphQLText = require('./parseGraphQLText');

import type {
  $RelayProps,
  RelayProp,
  RelayPaginationProp,
  RelayRefetchProp,
} from 'ReactRelayTypes';
import type {GeneratedNode} from 'RelayConcreteNode';

const FIXTURE_TAG = Symbol.for('FIXTURE_TAG');

/**
 * Extend Jest with a custom snapshot serializer to provide additional context
 * and reduce the amount of escaping that occurs.
 */
expect.addSnapshotSerializer({
  print(value) {
    return Object.keys(value)
      .map(key => `~~~~~~~~~~ ${key.toUpperCase()} ~~~~~~~~~~\n${value[key]}`)
      .join('\n');
  },
  test(value) {
    return value && value[FIXTURE_TAG] === true;
  },
});

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
    const RelayTestSchema = require('./RelayTestSchema');
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
    const RelayCompilerPublic = require('relay-compiler');
    const {IRTransforms} = RelayCompilerPublic;
    const RelayTestSchema = require('./RelayTestSchema');
    return generate(text, schema || RelayTestSchema, IRTransforms);
  },

  /**
   * Generates a set of jest snapshot tests that compare the output of the
   * provided `operation` to each of the matching files in the `fixturesPath`.
   */
  generateTestsFromFixtures(
    fixturesPath: string,
    operation: (input: string) => string | Promise<string>,
  ): void {
    const fs = require('fs');
    const path = require('path');
    const tests = fs.readdirSync(fixturesPath).map(async file => {
      const input = fs.readFileSync(path.join(fixturesPath, file), 'utf8');
      const output = await getOutputForFixture(input, operation);
      return {
        file,
        input,
        output,
      };
    });
    invariant(
      tests.length > 0,
      'generateTestsFromFixtures: No fixtures found at %s',
      fixturesPath,
    );
    it('matches expected output', async () => {
      const results = await Promise.all(tests);
      results.forEach(test => {
        expect({
          [FIXTURE_TAG]: true,
          input: test.input,
          output: test.output,
        }).toMatchSnapshot(test.file);
      });
    });
  },

  /**
   * Returns original component class wrapped by e.g. createFragmentContainer
   */
  unwrapContainer<Props>(
    ComponentClass: React.ComponentType<
      $RelayProps<Props, RelayProp | RelayPaginationProp | RelayRefetchProp>,
    >,
  ): React.ComponentType<Props> {
    // $FlowExpectedError
    const unwrapped = ComponentClass.__ComponentClass;
    invariant(
      unwrapped != null,
      'Could not find component for %s, is it a Relay container?',
      ComponentClass.displayName || ComponentClass.name,
    );
    return (unwrapped: any);
  },
};

async function getOutputForFixture(
  input: string,
  operation: (input: string) => string | Promise<string>,
): Promise<string> {
  try {
    const output = operation(input);
    return output instanceof Promise ? await output : output;
  } catch (e) {
    return `THROWN EXCEPTION:\n\n${e.toString()}`;
  }
}

function generate(
  text: string,
  schema: GraphQLSchema,
  transforms: RelayCompilerTransforms,
): {[key: string]: GeneratedNode} {
  const RelayCompilerPublic = require('relay-compiler');
  const {
    compileRelayArtifacts,
    GraphQLCompilerContext,
    IRTransforms,
    transformASTSchema,
  } = RelayCompilerPublic;

  const relaySchema = transformASTSchema(schema, IRTransforms.schemaExtensions);
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
