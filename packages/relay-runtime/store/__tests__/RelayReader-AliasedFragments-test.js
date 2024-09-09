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
const {readInlineData} = require('relay-runtime');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

describe('Fragment Spreads', () => {
  it('Reads an aliased fragment as its own type', () => {
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

  it('Reads an aliased fragment with @defer', () => {
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

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestDeferredQuery {
        me {
          ...RelayReaderAliasedFragmentsTest_user
            @alias(as: "aliased_fragment")
            @defer
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

  it('Reads an aliased fragment with @module that does not match type', () => {
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

    graphql`
      fragment RelayReaderAliasedFragmentsTestModule_user on User {
        name
      }
    `;

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestModuleQuery($id: ID!) {
        node(id: $id) {
          ...RelayReaderAliasedFragmentsTestModule_user
            @alias(as: "aliased_fragment")
            @module(name: "SomeModuleName")
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

  it('Reads an aliased fragment with @module that matches type', () => {
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
        __module_component_RelayReaderAliasedFragmentsTestModuleMatchesQuery_aliased_fragment:
          'PlainUserNameRenderer.react',
        __module_operation_RelayReaderAliasedFragmentsTestModuleMatchesQuery_aliased_fragment:
          'RelayReaderAliasedFragmentsTestModuleMatches_user$normalization.graphql',
        __typename: 'User',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    graphql`
      fragment RelayReaderAliasedFragmentsTestModuleMatches_user on User {
        name
      }
    `;

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestModuleMatchesQuery($id: ID!) {
        node(id: $id) {
          ...RelayReaderAliasedFragmentsTestModuleMatches_user
            @alias(as: "aliased_fragment")
            @module(name: "PlainUserNameRenderer.react")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: {
          __id: '1',
          __fragments: {
            RelayReaderAliasedFragmentsTestModuleMatches_user: {},
          },
          __fragmentOwner: operation.request,
          __fragmentPropName: 'user',
          __module_component: 'PlainUserNameRenderer.react',
        },
      },
    });
  });

  it('Reads an aliased fragment with @relay(mask: false)', () => {
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
        name: 'Elizabeth',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    graphql`
      fragment RelayReaderAliasedFragmentsTestMaskFalse_user on User
      @relay(mask: false) {
        name
      }
    `;

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestMaskFalseQuery {
        me {
          ...RelayReaderAliasedFragmentsTestMaskFalse_user
            @relay(mask: false)
            @alias(as: "aliased_fragment")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      me: {
        aliased_fragment: {
          name: 'Elizabeth',
        },
      },
    });
  });

  it('Reads an aliased fragment with @inline', () => {
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
        name: 'Elizabeth',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestInlineQuery {
        me {
          ...RelayReaderAliasedFragmentsTestInline_user
            @alias(as: "aliased_fragment")
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      me: {
        aliased_fragment: {
          __fragments: {
            RelayReaderAliasedFragmentsTestInline_user: {
              name: 'Elizabeth',
            },
          },
          __id: '1',
        },
      },
    });
    const me = readInlineData(
      graphql`
        fragment RelayReaderAliasedFragmentsTestInline_user on User @inline {
          name
        }
      `,
      data.me.aliased_fragment,
    );

    expect(me).toEqual({
      name: 'Elizabeth',
    });
  });

  it('Reads an aliased fragment with @inline that does not match type condition', () => {
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

    graphql`
      fragment RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user on User
      @inline {
        name
      }
    `;

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery($id: ID!) {
        node(id: $id) {
          ...RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user
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

  it('Reads an conditional aliased fragment as its own field (alias then skip)', () => {
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
      fragment RelayReaderAliasedFragmentsTestConditionalFragment on User {
        name
      }
    `;
    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestConditionalQuery(
        $someCondition: Boolean!
      ) {
        me {
          ...RelayReaderAliasedFragmentsTestConditionalFragment
            @alias(as: "aliased_fragment")
            @skip(if: $someCondition)
        }
      }
    `;
    const operationSkipped = createOperationDescriptor(FooQuery, {
      someCondition: true,
    });
    const {data: dataSkipped, isMissingData: isMissingDataSkipped} = read(
      source,
      operationSkipped.fragment,
    );
    expect(isMissingDataSkipped).toBe(false);
    expect(dataSkipped).toEqual({
      me: {
        // aliased_fragment is not added here
      },
    });

    const operationNotSkipped = createOperationDescriptor(FooQuery, {
      someCondition: false,
    });
    const {data, isMissingData} = read(source, operationNotSkipped.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      me: {
        aliased_fragment: {
          __id: '1',
          __fragments: {
            RelayReaderAliasedFragmentsTestConditionalFragment: {},
          },
          __fragmentOwner: operationNotSkipped.request,
        },
      },
    });
  });

  it('Reads an conditional aliased fragment as its own field (skip then alias)', () => {
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
      fragment RelayReaderAliasedFragmentsTestConditional2Fragment on User {
        name
      }
    `;
    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestConditional2Query(
        $someCondition: Boolean!
      ) {
        me {
          ...RelayReaderAliasedFragmentsTestConditionalFragment
            @skip(if: $someCondition)
            @alias(as: "aliased_fragment")
        }
      }
    `;
    const operationSkipped = createOperationDescriptor(FooQuery, {
      someCondition: true,
    });
    const {data: dataSkipped, isMissingData: isMissingDataSkipped} = read(
      source,
      operationSkipped.fragment,
    );
    expect(isMissingDataSkipped).toBe(false);
    expect(dataSkipped).toEqual({
      me: {
        // aliased_fragment is not added here
      },
    });

    const operationNotSkipped = createOperationDescriptor(FooQuery, {
      someCondition: false,
    });
    const {data, isMissingData} = read(source, operationNotSkipped.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      me: {
        aliased_fragment: {
          __id: '1',
          __fragments: {
            RelayReaderAliasedFragmentsTestConditionalFragment: {},
          },
          __fragmentOwner: operationNotSkipped.request,
        },
      },
    });
  });

  it('Reads unconditional fragment on Query.', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
      },
    });

    graphql`
      fragment RelayReaderAliasedFragmentsTest_query on Query {
        me {
          name
        }
      }
    `;

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestFragmentOnQueryQuery {
        ...RelayReaderAliasedFragmentsTest_query @alias
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      RelayReaderAliasedFragmentsTest_query: {
        __id: 'client:root',
        __fragments: {
          RelayReaderAliasedFragmentsTest_query: {},
        },
        __fragmentOwner: operation.request,
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

  it('Reads an aliased inline fragment on Query', () => {
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
      query RelayReaderAliasedFragmentsTestInlineOnQueryQuery {
        ... on Query @alias(as: "aliased_fragment") {
          me {
            name @required(action: NONE)
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      aliased_fragment: {
        me: {
          name: 'Chelsea',
        },
      },
    });
  });

  it('Reads an aliased inline fragment without a type condition as its own field', () => {
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
      query RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery {
        me {
          ... @alias(as: "aliased_fragment") {
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
        aliased_fragment: null,
      },
    });
  });

  it('Does not throw on missing @required fields within inline fragment on abstract type that does not match', () => {
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
      query RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery(
        $id: ID!
      ) {
        node(id: $id) {
          # Story implements both Node and MaybeNodeInterface
          # so technically we are allowed to spread this here,
          # but our store says this ID points to a Comment,
          # so it should not match.
          ... on MaybeNodeInterface @alias(as: "aliased_fragment") {
            name @required(action: THROW)
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const snapshot = read(source, operation.fragment);
    const {data, isMissingData, missingRequiredFields} = snapshot;
    expect(missingRequiredFields).toBe(null);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });

  it("Reads undefined and marks data as missing if the fragment is on an abstract type and we don't know if it conforms to the parent selection's abstract type.", () => {
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
        aliased_fragment: undefined,
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

  it('@required bubbles up to an aliased inline fragment on abstract type that matches', () => {
    const storyTypeID = generateTypeID('Story');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Story',
        // name is missing
      },
      [storyTypeID]: {
        __id: storyTypeID,
        __typename: TYPE_SCHEMA_TYPE,
        __isMaybeNodeInterface: true,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on MaybeNodeInterface @alias(as: "aliased_fragment") {
            name @required(action: LOG)
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData, missingRequiredFields} = read(
      source,
      operation.fragment,
    );
    expect(missingRequiredFields).toEqual({
      action: 'LOG',
      fields: [
        {
          owner:
            'RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery',
          path: 'node.aliased_fragment.name',
        },
      ],
    });
    expect(isMissingData).toBe(true);
    expect(data).toEqual({
      node: {
        aliased_fragment: null,
      },
    });
  });

  it("@required bubbles up to an aliased inline fragment on abstract type but we are missing type info so we don't know if it matches", () => {
    const storyTypeID = generateTypeID('Story');
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'Story',
        name: null,
      },
      [storyTypeID]: {
        __id: storyTypeID,
        __typename: TYPE_SCHEMA_TYPE,
        // Oops! We don't know if Story implements MaybeNodeInterface
        // __isMaybeNodeInterface: true,
      },
    });

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on MaybeNodeInterface @alias(as: "aliased_fragment") {
            name @required(action: LOG)
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, isMissingData, missingRequiredFields} = read(
      source,
      operation.fragment,
    );
    expect(missingRequiredFields).toEqual({
      action: 'LOG',
      fields: [
        {
          owner:
            'RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery',
          path: 'node.aliased_fragment.name',
        },
      ],
    });
    expect(isMissingData).toBe(true);
    expect(data).toEqual({
      node: {
        // Undefined here indicates we were missing data
        aliased_fragment: undefined,
      },
    });
  });

  describe('Multiple aliased fragments with @module on the same type', () => {
    graphql`
      fragment RelayReaderAliasedFragmentsTestModuleA_user on User {
        name
      }
    `;
    graphql`
      fragment RelayReaderAliasedFragmentsTestModuleB_user on User {
        name
      }
    `;
    function aliasA(operation) {
      return {
        __id: '1',
        __fragments: {
          RelayReaderAliasedFragmentsTestModuleA_user: {},
        },
        __fragmentOwner: operation.request,
        __fragmentPropName: 'user',
        __module_component: 'PlainUserNameRenderer.react',
      };
    }

    function aliasB(operation) {
      return {
        __id: '1',
        __fragments: {
          RelayReaderAliasedFragmentsTestModuleB_user: {},
        },
        __fragmentOwner: operation.request,
        __fragmentPropName: 'user',
        __module_component: 'PlainUserNameRenderer.react',
      };
    }
    it('@alias on the fragment spread', () => {
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
          __module_component_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_a:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_a:
            'RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql',
          __module_component_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_b:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_b:
            'RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql',
          __typename: 'User',
        },
        [userTypeID]: {
          __id: userTypeID,
          __typename: TYPE_SCHEMA_TYPE,
        },
      });

      const FooQuery = graphql`
        query RelayReaderAliasedFragmentsTestMultipleModulesQuery(
          $id: ID!
          $conditionA: Boolean!
          $conditionB: Boolean!
        ) {
          node(id: $id) {
            ...RelayReaderAliasedFragmentsTestModuleA_user
              @alias(as: "alias_a")
              @module(name: "PlainUserNameRenderer.react")
              @include(if: $conditionA)
            ...RelayReaderAliasedFragmentsTestModuleB_user
              @alias(as: "alias_b")
              @module(name: "PlainUserNameRenderer.react")
              @include(if: $conditionB)
          }
        }
      `;

      // Both
      const both = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: true,
        conditionB: true,
      });
      expect(read(source, both.fragment).data).toEqual({
        node: {alias_a: aliasA(both), alias_b: aliasB(both)},
      });

      // Only A
      const onlyA = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: true,
        conditionB: false,
      });
      expect(read(source, onlyA.fragment).data).toEqual({
        node: {alias_a: aliasA(onlyA), alias_b: undefined},
      });

      // Only B
      const onlyB = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: false,
        conditionB: true,
      });
      expect(read(source, onlyB.fragment).data).toEqual({
        node: {
          alias_a: undefined,
          alias_b: aliasB(onlyB),
        },
      });

      // Neither A nor B
      const neither = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: false,
        conditionB: false,
      });
      expect(read(source, neither.fragment).data).toEqual({
        node: {alias_a: undefined, alias_b: undefined},
      });
    });

    it('@alias on inline fragments', () => {
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
          __module_component_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_a:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_a:
            'RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql',
          __module_component_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_b:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_b:
            'RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql',
          __typename: 'User',
        },
        [userTypeID]: {
          __id: userTypeID,
          __typename: TYPE_SCHEMA_TYPE,
        },
      });

      const FooQuery = graphql`
        query RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery(
          $id: ID!
          $conditionA: Boolean!
          $conditionB: Boolean!
        ) {
          node(id: $id) {
            ... @alias(as: "alias_a") @include(if: $conditionA) {
              ...RelayReaderAliasedFragmentsTestModuleA_user
                @module(name: "PlainUserNameRenderer.react")
            }
            ... @alias(as: "alias_b") @include(if: $conditionB) {
              ...RelayReaderAliasedFragmentsTestModuleB_user
                @module(name: "PlainUserNameRenderer.react")
            }
          }
        }
      `;

      // Both
      const both = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: true,
        conditionB: true,
      });
      expect(read(source, both.fragment).data).toEqual({
        node: {alias_a: aliasA(both), alias_b: aliasB(both)},
      });

      // Only A
      const onlyA = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: true,
        conditionB: false,
      });
      expect(read(source, onlyA.fragment).data).toEqual({
        node: {alias_a: aliasA(onlyA), alias_b: undefined},
      });

      // Only B
      const onlyB = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: false,
        conditionB: true,
      });
      expect(read(source, onlyB.fragment).data).toEqual({
        node: {
          alias_a: undefined,
          alias_b: aliasB(onlyB),
        },
      });

      // Neither A nor B
      const neither = createOperationDescriptor(FooQuery, {
        id: '1',
        conditionA: false,
        conditionB: false,
      });
      expect(read(source, neither.fragment).data).toEqual({
        node: {alias_a: undefined, alias_b: undefined},
      });
    });

    it('@module fragments in the same selection with the same @alias disambiguated by inline fragment with @alias', () => {
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
          __module_component_RelayReaderAliasedFragmentsTestModuelAliasNamespacingQuery_a_common_alias:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReaderAliasedFragmentsTestModuelAliasNamespacingQuery_a_common_alias:
            'RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql',
          __module_component_RelayReaderAliasedFragmentsTestModuelAliasNamespacingQuery_a_namespace_alias_that_prevents_collisions_a_common_alias:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReaderAliasedFragmentsTestModuelAliasNamespacingQuery_a_namespace_alias_that_prevents_collisions_a_common_alias:
            'RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql',
          __typename: 'User',
        },
        [userTypeID]: {
          __id: userTypeID,
          __typename: TYPE_SCHEMA_TYPE,
        },
      });

      // Both fragments use the alias `a_common_alias`. Here we confirm that our codegen still generates a unique
      // key for both due to the namespacing provided by the aliased inline fragment.
      const FooQuery = graphql`
        query RelayReaderAliasedFragmentsTestModuelAliasNamespacingQuery(
          $id: ID!
        ) {
          node(id: $id) {
            ...RelayReaderAliasedFragmentsTestModuleA_user
              @module(name: "PlainUserNameRenderer.react")
              @alias(as: "a_common_alias")
            ... @alias(as: "a_namespace_alias_that_prevents_collisions") {
              ...RelayReaderAliasedFragmentsTestModuleB_user
                @module(name: "PlainUserNameRenderer.react")
                @alias(as: "a_common_alias")
            }
          }
        }
      `;

      const operation = createOperationDescriptor(FooQuery, {
        id: '1',
      });
      const data = read(source, operation.fragment).data;
      expect(data).toEqual({
        node: {
          a_common_alias: aliasA(operation),
          a_namespace_alias_that_prevents_collisions: {
            a_common_alias: aliasB(operation),
          },
        },
      });
    });
  });

  it('Kitchen sink (compose all the directives!)', () => {
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
        __module_component_RelayReaderAliasedFragmentsTestKitchenSinkQuery_aliased_fragment:
          'PlainUserNameRenderer.react',
        __module_operation_RelayReaderAliasedFragmentsTestKitchenSinkQuery_aliased_fragment:
          'RelayReaderAliasedFragmentsTestKitchenSink_user$normalization.graphql',
        __typename: 'User',
      },
      [userTypeID]: {
        __id: userTypeID,
        __typename: TYPE_SCHEMA_TYPE,
      },
    });

    graphql`
      fragment RelayReaderAliasedFragmentsTestKitchenSink_user on User {
        name
      }
    `;

    const FooQuery = graphql`
      query RelayReaderAliasedFragmentsTestKitchenSinkQuery(
        $id: ID!
        $shouldSkip: Boolean!
        $shouldDefer: Boolean!
      ) {
        node(id: $id) {
          ...RelayReaderAliasedFragmentsTestKitchenSink_user
            @alias(as: "aliased_fragment")
            @module(name: "PlainUserNameRenderer.react")
            @skip(if: $shouldSkip)
            @defer(if: $shouldDefer)
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {
      id: '1',
      shouldSkip: false,
      shouldDefer: true,
    });
    const {data, isMissingData} = read(source, operation.fragment);
    expect(isMissingData).toBe(false);
    expect(data).toEqual({
      node: {
        aliased_fragment: {
          __id: '1',
          __fragments: {
            RelayReaderAliasedFragmentsTestKitchenSink_user: {},
          },
          __fragmentOwner: operation.request,
          __fragmentPropName: 'user',
          __module_component: 'PlainUserNameRenderer.react',
        },
      },
    });
  });
});
