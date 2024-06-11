/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const {graphql} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {read} = require('../RelayReader');
const RelayRecordSource = require('../RelayRecordSource');
const {TYPE_SCHEMA_TYPE, generateTypeID} = require('../TypeID');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

describe('Fragment Spreads', () => {
  it('Reads an aliased fragment as its own field', () => {
    const userTypeID = generateTypeID('User');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    graphql`
      fragment RelayReaderAliasedFragmentsTest_user on User {
        name
      }
    `;
    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest2Query {
        me {
          ...RelayReaderAliasedFragmentsTest_user @alias(as: "aliased_fragment")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      me: {
        aliased_fragment: {
          __id: '1',
          __fragments: {
            RelayReaderAliasedFragmentsTest_user: {},
          },
          __fragmentOwner: operation.request,
        },
      },
    });
  });

  it('Reads null if the fragment is on a concrete type that does not match the abstract parent selection.', () => {
    const userTypeID = generateTypeID('User');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest3Query($id: ID!) {
        node(id: $id) {
          ...RelayReaderAliasedFragmentsTest_user @alias(as: "aliased_fragment")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });

  it('Reads null if the fragment is on an abstract type that does not match the abstract parent selection.', () => {
    const commentTypeID = generateTypeID('Comment');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
      },
      [commentTypeID]: {
        __id: commentTypeID,
        __typename: TYPE_SCHEMA_TYPE,
        __isMaybeNodeInterface: false,
      },
    });

    graphql`
      fragment RelayReaderAliasedFragmentsTest_maybe_node_interface on MaybeNodeInterface {
        name
      }
    `;
    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest4Query($id: ID!) {
        node(id: $id) {
          # Story implements both Node and MaybeNodeInterface
          # so technically we are allowed to spread this here,
          # but our store says this ID points to a Comment,
          # so it should not match.
          ...RelayReaderAliasedFragmentsTest_maybe_node_interface
            @alias(as: "aliased_fragment")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });

  it("Reads null and marks data as missing if the fragment is on an abstract type and we don't know if it conforms to the parent selection's abstract type.", () => {
    const commentTypeID = generateTypeID('Comment');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
      },
      [commentTypeID]: {
        __id: commentTypeID,
        __typename: TYPE_SCHEMA_TYPE,
        // For this test case, we pretend we are missing this
        // `__isMaybeNodeInterface` value. This can happen as a result of an
        // imperative update, or a change to the graph structure.
        // __isMaybeNodeInterface: false,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest5Query($id: ID!) {
        node(id: $id) {
          # Story implements both Node and MaybeNodeInterface
          # so technically we are allowed to spread this here,
          # but our store says this ID points to a Comment,
          # so it should not match.
          ...RelayReaderAliasedFragmentsTest_maybe_node_interface
            @alias(as: "aliased_fragment")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(true);
    expect(data).toEqual({
      node: {
        aliased_fragment: undefined,
      },
    });
  });
});

describe('Inline Fragments', () => {
  it('Reads an aliased inline fragment as its own field', () => {
    const userTypeID = generateTypeID('User');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Chelsea',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest6Query {
        me {
          ... on User @alias(as: "aliased_fragment") {
            name @required(action: NONE)
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      me: {
        aliased_fragment: {
          name: 'Chelsea',
        },
      },
    });
  });

  it('Reads null if the fragment is on a concrete type that does not match the abstract parent selection.', () => {
    const userTypeID = generateTypeID('User');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest7Query($id: ID!) {
        node(id: $id) {
          ... on User @alias(as: "aliased_fragment") {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });
  it('Reads null if the fragment is on an abstract type that does not match the abstract parent selection.', () => {
    const commentTypeID = generateTypeID('Comment');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
      },
      [commentTypeID]: {
        __id: commentTypeID,
        __typename: TYPE_SCHEMA_TYPE,
        __isMaybeNodeInterface: false,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest8Query($id: ID!) {
        node(id: $id) {
          # Story implements both Node and MaybeNodeInterface
          # so technically we are allowed to spread this here,
          # but our store says this ID points to a Comment,
          # so it should not match.
          ... on MaybeNodeInterface @alias(as: "aliased_fragment") {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: undefined,
      },
    });
  });

  it("Reads null and marks data as missing if the fragment is on an abstract type and we don't know if it conforms to the parent selection's abstract type.", () => {
    const commentTypeID = generateTypeID('Comment');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
      },
      [commentTypeID]: {
        __id: commentTypeID,
        __typename: TYPE_SCHEMA_TYPE,
        // For this test case, we pretend we are missing this
        // `__isMaybeNodeInterface` value. This can happen as a result of an
        // imperative update, or a change to the graph structure.
        // __isMaybeNodeInterface: false,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest9Query($id: ID!) {
        node(id: $id) {
          # Story implements both Node and MaybeNodeInterface
          # so technically we are allowed to spread this here,
          # but our store says this ID points to a Comment,
          # so it should not match.
          ... on MaybeNodeInterface @alias(as: "aliased_fragment") {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(true);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });

  it('@required bubbles up to an aliased inline fragment', () => {
    const commentTypeID = generateTypeID('Comment');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Comment',
        tracking: null,
      },
      [commentTypeID]: {
        __id: commentTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTest10Query($id: ID!) {
        node(id: $id) {
          ... on Comment @alias(as: "aliased_fragment") {
            id
            tracking @required(action: NONE)
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });
});
