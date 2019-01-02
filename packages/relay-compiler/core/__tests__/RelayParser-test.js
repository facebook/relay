/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const RelayMatchTransform = require('../../transforms/RelayMatchTransform');
const ASTConvert = require('../ASTConvert');

describe('RelayParser', () => {
  const schema = ASTConvert.transformASTSchema(RelayTestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
  ]);

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
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();

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
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();
  });

  it('should parse fragment spread arguments with variable values', () => {
    const text = `
    fragment TestFragment on Query {
      ...TestChild @arguments(foo: $foo)
    }
    fragment TestChild on Query {
      viewer { actor { id } }
    }
  `;
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();
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
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();
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
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();

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
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();
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
    expect(() => RelayParser.parse(RelayTestSchema, text)).not.toThrowError();
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
    let error;
    try {
      RelayParser.parse(RelayTestSchema, text);
    } catch (error_) {
      error = error_;
    }
    expect(error).not.toBe(null);
    expect(error?.message).toMatchSnapshot();
  });

  generateTestsFromFixtures(`${__dirname}/fixtures/parser`, text => {
    try {
      const ir = RelayParser.parse(schema, text);
      return JSON.stringify(ir, null, 2);
    } catch (e) {
      return 'ERROR:\n' + e;
    }
  });
});
