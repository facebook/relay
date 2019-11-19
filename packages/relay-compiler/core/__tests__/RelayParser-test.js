/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const MatchTransform = require('../../transforms/MatchTransform');
const RelayParser = require('../RelayParser');

const {
  TestSchema,
  printAST,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('RelayParser', () => {
  const schema = TestSchema.extend([MatchTransform.SCHEMA_EXTENSION]);
  /**
   * Regression tests for T24258497
   */
  it("should correctly parse query when input is a non-null type and it's passed to calls expecting both null and non-null types, regardless of order", () => {
    let text;
    // Should work with the call requiring an ID! placed first in the query
    text = `query TestQuery(
    $id: ID!
  ) {
    node_id_required(id: $id) {
      id
    }
    node(id: $id) {
      id
    }
  }`;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();

    // Should also work when call that requires an ID! comes after a call that takes an ID
    text = `query TestQuery(
    $id: ID!
  ) {
    node(id: $id) {
      id
    }
    node_id_required(id: $id) {
      id
    }
  }`;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();
  });

  it('should parse fragment spread arguments with variable values', () => {
    const text = `
    fragment TestFragment on Query {
      ...TestChild @arguments(foo: $foo)
    }
    fragment TestChild on Query @argumentDefinitions(foo: {type: "Int"}) {
      viewer { actor { id } }
    }
  `;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();
  });

  it('should parse fragment spread arguments with literal values', () => {
    const text = `
    fragment TestFragment on Query {
      ...TestChild @arguments(foo: 42)
    }
    fragment TestChild on Query @argumentDefinitions(foo: {type: "Int"}) {
      viewer { actor { id } }
    }
  `;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();
  });

  it('should error on fragment spread arguments with literal out of bounds values', () => {
    const text = `
      fragment TestFragment on Query {
        # Number.MAX_SAFE_INTEGER is 9007199254740991
        ...TestChild @arguments(foo: 10000000000000000)
      }
      fragment TestChild on Query @argumentDefinitions(foo: {type: "Int"}) {
        viewer { actor { id } }
      }
    `;
    expect(() => {
      try {
        RelayParser.parse(schema, text);
      } catch (e) {
        throw new Error(String(e));
      }
    }).toThrowErrorMatchingSnapshot();
  });

  it("should correctly parse fragment when input is a non-null type and it's passed to calls expecting both null and non-null types, regardless of order", () => {
    let text;
    // Should work with the call requiring an ID! placed first in the query
    text = `fragment TestFragment on Query @argumentDefinitions(
    id: {type: "ID!"}
  ) {
    node_id_required(id: $id) {
      id
    }
    node(id: $id) {
      id
    }
  }`;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();

    // Should also work when call that requires an ID! comes after a call that takes an ID
    text = `fragment TestFragment on Query @argumentDefinitions(
    id: {type: "ID!"}
  ) {
    node(id: $id) {
      id
    }
    node_id_required(id: $id) {
      id
    }
  }`;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();
  });

  it('should not error when parsing a fragment that references undeclared variables without type errors', () => {
    const text = `fragment TestFragment on Query {
    node(id: $id) {
      id
    }
    task(number: $taskNumber) {
      title
    }
  }`;
    expect(() => RelayParser.parse(schema, text)).not.toThrowError();
  });

  it('should error when parsing fragment that references undeclared variables are used with differing types', () => {
    const text = `fragment TestFragment on Query {
    node(id: $id) {
      id
    }
    task(number: $id) {
      title
    }
  }`;
    expect(() => {
      try {
        RelayParser.parse(schema, text);
      } catch (e) {
        throw new Error(String(e));
      }
    }).toThrowErrorMatchingSnapshot();
  });

  generateTestsFromFixtures(`${__dirname}/fixtures/parser`, text => {
    const ir = RelayParser.parse(schema, text);
    return printAST(ir);
  });
});
