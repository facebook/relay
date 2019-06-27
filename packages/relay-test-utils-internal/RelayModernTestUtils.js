/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const getOutputForFixture = require('./getOutputForFixture');
const mapObject = require('mapObject');
const parseGraphQLText = require('./parseGraphQLText');

const {CodeMarker} = require('relay-compiler');

import type {GraphQLSchema} from 'graphql';
import type {RelayCompilerTransforms, IRTransform} from 'relay-compiler';
import type {GeneratedNode} from 'relay-runtime';

/* global expect,test */

/**
 * Extend Jest with a custom snapshot serializer to provide additional context
 * and reduce the amount of escaping that occurs.
 */
const FIXTURE_TAG = Symbol.for('FIXTURE_TAG');
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

const matchers = {
  toBeDeeplyFrozen(actual) {
    function check(value) {
      expect(Object.isFrozen(value)).toBe(true);
      if (Array.isArray(value)) {
        value.forEach(item => check(item));
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
};

/**
 * Parses GraphQL text, applies the selected transforms only (or none if
 * transforms is not specified), and returns a mapping of definition name to
 * its basic generated representation.
 */
function generateWithTransforms(
  text: string,
  transforms?: ?Array<IRTransform>,
): {[key: string]: GeneratedNode} {
  const RelayTestSchema = require('./RelayTestSchema');
  return generate(
    text,
    RelayTestSchema,
    {
      commonTransforms: transforms || [],
      fragmentTransforms: [],
      queryTransforms: [],
      codegenTransforms: [],
      printTransforms: [],
    },
    null,
  );
}

/**
 * Compiles the given GraphQL text using the standard set of transforms (as
 * defined in RelayCompiler) and returns a mapping of definition name to
 * its full runtime representation.
 */
function generateAndCompile(
  text: string,
  schema?: ?GraphQLSchema,
  moduleMap?: ?{[string]: mixed},
): {[key: string]: GeneratedNode} {
  const {IRTransforms} = require('relay-compiler');
  const RelayTestSchema = require('./RelayTestSchema');
  return generate(
    text,
    schema || RelayTestSchema,
    IRTransforms,
    moduleMap ?? null,
  );
}

/**
 * Generates a set of jest snapshot tests that compare the output of the
 * provided `operation` to each of the matching files in the `fixturesPath`.
 * The fixture should have '# expected-to-throw' on its first line
 * if it is expected to fail
 */
function generateTestsFromFixtures(
  fixturesPath: string,
  operation: (input: string) => string | Promise<string>,
): void {
  const fs = require('fs');
  const path = require('path');

  const fixtures = fs.readdirSync(fixturesPath);

  test(`has fixtures in ${fixturesPath}`, () => {
    expect(fixtures.length > 0).toBe(true);
  });

  test.each(fixtures)('matches expected output: %s', async file => {
    const input = fs.readFileSync(path.join(fixturesPath, file), 'utf8');
    const output = await getOutputForFixture(input, operation, file);
    expect({
      [FIXTURE_TAG]: true,
      input,
      output,
    }).toMatchSnapshot();
  });
}

function generate(
  text: string,
  schema: GraphQLSchema,
  transforms: RelayCompilerTransforms,
  moduleMap: ?{[string]: mixed},
): {[key: string]: GeneratedNode} {
  const {
    compileRelayArtifacts,
    GraphQLCompilerContext,
    IRTransforms,
    transformASTSchema,
  } = require('relay-compiler');

  const relaySchema = transformASTSchema(schema, IRTransforms.schemaExtensions);
  const compilerContext = new GraphQLCompilerContext(
    schema,
    relaySchema,
  ).addAll(parseGraphQLText(relaySchema, text).definitions);
  const documentMap = {};
  compileRelayArtifacts(compilerContext, transforms).forEach(
    ([_definition, node]) => {
      const transformedNode =
        moduleMap != null ? CodeMarker.transform(node, moduleMap) : node;
      documentMap[
        node.kind === 'Request' ? node.params.name : node.name
      ] = transformedNode;
    },
  );
  return documentMap;
}

/**
 * A helper to create a deep clone of a value, plain Object, or array of such.
 *
 * Does not support RegExp, Date, other classes, or self-referential values.
 */
function simpleClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(simpleClone);
  } else if (value != null && typeof value === 'object') {
    return ((mapObject(value, simpleClone): any): T);
  } else {
    return value;
  }
}

module.exports = {
  generateAndCompile,
  generateTestsFromFixtures,
  generateWithTransforms,
  matchers,
  simpleClone,
  FIXTURE_TAG,
};
