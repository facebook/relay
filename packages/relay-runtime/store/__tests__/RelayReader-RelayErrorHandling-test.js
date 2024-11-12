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
const RelayModernStore = require('../RelayModernStore');
const {read} = require('../RelayReader');
const RelayRecordSource = require('../RelayRecordSource');

describe('RelayReader error fields', () => {
  it('adds the errors to errorResponseFields', () => {
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
        lastName: null,
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTest1Query {
        me {
          lastName
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, errorResponseFields} = read(source, operation.fragment);
    expect(data).toEqual({me: {lastName: null}});
    expect(errorResponseFields).toEqual([
      {
        owner: 'RelayReaderRelayErrorHandlingTest1Query',
        fieldPath: 'me.lastName',
        error: {
          message: 'There was an error!',
          path: ['me', 'lastName'],
        },
        kind: 'relay_field_payload.error',
        shouldThrow: false,
        handled: false,
      },
    ]);
  });

  it('adds the errors to errorResponseFields including missingData - without @catch', () => {
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
        lastName: null,
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTest4Query($size: [Int])
      @throwOnFieldError {
        me {
          lastName
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {size: 42});
    const {errorResponseFields} = read(source, operation.fragment);

    expect(errorResponseFields).toEqual([
      {
        owner: 'RelayReaderRelayErrorHandlingTest4Query',
        fieldPath: 'me.lastName',
        kind: 'relay_field_payload.error',
        error: {
          message: 'There was an error!',
          path: ['me', 'lastName'],
        },
        shouldThrow: true,
        handled: false,
      },
      {
        owner: 'RelayReaderRelayErrorHandlingTest4Query',
        fieldPath: 'me.profilePicture',
        kind: 'missing_expected_data.throw',
        handled: false,
      },
    ]);
  });

  it('adds the errors to errorResponseFields including missingData within plural fields - without @catch', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        nodes: {__refs: ['1']},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        lastName: null,
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestMissingPluralQuery($size: [Int])
      @throwOnFieldError {
        nodes {
          lastName
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {size: 42});
    const {errorResponseFields} = read(source, operation.fragment);

    expect(errorResponseFields).toEqual([
      {
        owner: 'RelayReaderRelayErrorHandlingTestMissingPluralQuery',
        fieldPath: 'me.lastName',
        kind: 'relay_field_payload.error',
        error: {
          message: 'There was an error!',
          path: ['me', 'lastName'],
        },
        shouldThrow: true,
        handled: false,
      },
      {
        owner: 'RelayReaderRelayErrorHandlingTestMissingPluralQuery',
        fieldPath: 'nodes.0.profilePicture',
        kind: 'missing_expected_data.throw',
        handled: false,
      },
    ]);
  });

  it('adds the errors to errorResponseFields including missingData - with @catch', () => {
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
        lastName: null,
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTest3Query($size: [Int]) {
        me @catch {
          lastName
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {size: 42});
    const {data, errorResponseFields} = read(source, operation.fragment);

    // we have a task out for adding path to missingData. Meantime that array is empty.
    expect(data).toEqual({
      me: {
        ok: false,
        errors: [
          {
            path: ['me', 'lastName'],
          },
          {
            path: ['me', 'profilePicture'],
          },
        ],
      },
    });

    expect(errorResponseFields).toEqual([
      {
        error: {message: 'There was an error!', path: ['me', 'lastName']},
        fieldPath: 'me.lastName',
        handled: true,
        kind: 'relay_field_payload.error',
        owner: 'RelayReaderRelayErrorHandlingTest3Query',
        shouldThrow: false,
      },
      {
        fieldPath: 'me.profilePicture',
        kind: 'missing_expected_data.log',
        owner: 'RelayReaderRelayErrorHandlingTest3Query',
      },
    ]);
  });
  test('@throwOnFieldError on a resolver rootFragment that reads field error will cause that resolver to be treated as a field error by the reader', () => {
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
        lastName: null,
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTest2Query {
        me {
          last_name_throw_on_field_error
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {size: 42});
    const {data, errorResponseFields} = read(source, operation.fragment);

    expect(data).toEqual({
      me: {
        last_name_throw_on_field_error: null,
      },
    });

    expect(errorResponseFields).toEqual([
      {
        error: {message: 'There was an error!', path: ['me', 'lastName']},
        fieldPath: 'me.lastName',
        // handled is true because we handled the error by making
        // last_name_throw_on_field_error null
        handled: true,
        kind: 'relay_field_payload.error',
        owner: 'UserLastNameThrowOnFieldErrorResolver',
        shouldThrow: true,
      },
    ]);
  });

  test('@throwOnFieldError reading a resolver with @throwOnFieldError on its rootFragment that reads field error will cause that resolver to be treated as a field error by the reader', () => {
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
        lastName: null,
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTest5Query @throwOnFieldError {
        me {
          last_name_throw_on_field_error
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {size: 42});
    const {errorResponseFields} = read(source, operation.fragment);

    expect(errorResponseFields).toEqual([
      {
        error: {message: 'There was an error!', path: ['me', 'lastName']},
        fieldPath: 'me.lastName',
        // handled is false because we want this to throw
        // last_name_throw_on_field_error null
        handled: false,
        kind: 'relay_field_payload.error',
        owner: 'UserLastNameThrowOnFieldErrorResolver',
        shouldThrow: true,
      },
    ]);
  });

  test('@throwOnFieldError reading a client edge resolver which points to a record with missing data logs the correct path', () => {
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
        name: 'Proto Mark', // Read by the resolver fragment
      },
      '1337': {
        __id: '1337',
        id: '1337',
        __typename: 'User',
        // firstName is missing
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery
      @throwOnFieldError {
        me {
          client_edge @waterfall {
            firstName
          }
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {size: 42});
    const {errorResponseFields} = read(source, operation.fragment);

    expect(errorResponseFields).toEqual([
      {
        fieldPath: 'me.client_edge.firstName',
        kind: 'missing_expected_data.throw',
        handled: false,
        owner:
          'RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery',
      },
    ]);
  });

  test('@throwOnFieldError reading a client edge to client object resolver which points to a record with missing data logs the correct path', () => {
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
        birthdate: {__ref: '2'},
      },
      '2': {
        __id: '2',
        id: '2',
        __typename: 'Date',
        day: 6,
        month: 1,
        year: 1985,
      },
    });
    const store = new RelayModernStore(source);

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestResolverClientEdgeClientObjectWithMissingDataQuery
      @throwOnFieldError {
        me {
          astrological_sign {
            notes # Not in the store!
          }
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});
    const {errorResponseFields} = store.lookup(operation.fragment);

    expect(errorResponseFields).toEqual([
      {
        fieldPath: 'me.astrological_sign.notes',
        kind: 'missing_expected_data.throw',
        handled: false,
        owner:
          'RelayReaderRelayErrorHandlingTestResolverClientEdgeClientObjectWithMissingDataQuery',
      },
    ]);
  });

  test('@throwOnFieldError reading a client edge to PLURAL client object resolver which points to records with missing data logs the correct paths with index segments', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User', // Read by the all_astrological_signs resolver fragment
      },
    });
    const store = new RelayModernStore(source);
    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery
      @throwOnFieldError {
        all_astrological_signs {
          notes # Not in the store!
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {errorResponseFields} = store.lookup(operation.fragment);
    for (let i = 0; i < errorResponseFields.length; i++) {
      expect(errorResponseFields[i]).toEqual({
        fieldPath: `all_astrological_signs.${i}.notes`,
        kind: 'missing_expected_data.throw',
        handled: false,
        owner:
          'RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery',
      });
    }
  });

  it('does not report missing data within an inline fragment that does not match', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"4")': {__ref: '4'},
      },
      'client:__type:User': {
        __isMaybeNodeInterface: false,
      },
      '4': {
        __id: '4',
        id: '4',
        __typename: 'User',
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestInlineFragmentQuery
      @throwOnFieldError {
        node(id: "4") {
          # GraphQL lets us spread this here as long as there is at least one
          # type that overlaps
          ... on MaybeNodeInterface {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {errorResponseFields, isMissingData} = read(
      source,
      operation.fragment,
    );

    expect(isMissingData).toBe(false);
    expect(errorResponseFields).toEqual(null);
  });

  it('does report missing data within an inline fragment that does match', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"4")': {__ref: '4'},
      },
      'client:__type:User': {
        __isMaybeNodeInterface: true,
      },
      '4': {
        __id: '4',
        id: '4',
        __typename: 'NonNodeNoID',
        // NOTE: `name` is missing
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery
      @throwOnFieldError {
        node(id: "4") {
          # GraphQL lets us spread this here as long as there is at least one
          # type that overlaps
          ... on MaybeNodeInterface {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {errorResponseFields, isMissingData} = read(
      source,
      operation.fragment,
    );

    expect(isMissingData).toBe(true);
    expect(errorResponseFields).toEqual([
      // We are missing the metadata bout the interface
      {
        fieldPath: 'node.<abstract-type-hint>',
        handled: false,
        kind: 'missing_expected_data.throw',
        owner: 'RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery',
      },
      // We don't know if we should traverse into the inline fragment, but we do
      // anyway and find that the field is missing
      {
        fieldPath: 'node.name',
        handled: false,
        kind: 'missing_expected_data.throw',
        owner: 'RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery',
      },
    ]);
  });

  it('Reports missing fields in topological order', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '4'},
      },
      '4': {
        __id: '4',
        id: '4',
        __typename: 'User',
        nearest_neighbor: {__ref: '4'},
        // NOTE: `name` is missing
      },
    });

    const FooQuery = graphql`
      query RelayReaderRelayErrorHandlingTestErrorOrderQuery
      @throwOnFieldError {
        also_me: me {
          name
          nearest_neighbor {
            name
          }
        }
        me {
          name
        }
      }
    `;
    const operation = createOperationDescriptor(FooQuery, {});
    const {errorResponseFields, isMissingData} = read(
      source,
      operation.fragment,
    );

    expect(isMissingData).toBe(true);
    expect(errorResponseFields).toEqual([
      {
        fieldPath: 'also_me.name',
        handled: false,
        kind: 'missing_expected_data.throw',
        owner: 'RelayReaderRelayErrorHandlingTestErrorOrderQuery',
      },
      {
        fieldPath: 'also_me.nearest_neighbor.name',
        handled: false,
        kind: 'missing_expected_data.throw',
        owner: 'RelayReaderRelayErrorHandlingTestErrorOrderQuery',
      },
      {
        fieldPath: 'me.name',
        handled: false,
        kind: 'missing_expected_data.throw',
        owner: 'RelayReaderRelayErrorHandlingTestErrorOrderQuery',
      },
    ]);
  });
});
