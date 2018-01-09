/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails
 * @flow
 * @format
 */

'use strict';

const GraphQLParser = require('GraphQLParser');
const RelayTestSchema = require('RelayTestSchema');

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
  expect(() => GraphQLParser.parse(RelayTestSchema, text)).not.toThrowError();

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
  expect(() => GraphQLParser.parse(RelayTestSchema, text)).not.toThrowError();
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
  expect(() => GraphQLParser.parse(RelayTestSchema, text)).not.toThrowError();

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
  expect(() => GraphQLParser.parse(RelayTestSchema, text)).not.toThrowError();
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
  expect(() => GraphQLParser.parse(RelayTestSchema, text)).not.toThrowError();
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
  expect(() => GraphQLParser.parse(RelayTestSchema, text)).not.toThrowError(
    /Variable `\\$id` was used in locations expecting the conflicting types `ID` and `Int`/,
  );
});
