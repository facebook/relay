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
      },
      {
        owner: 'RelayReaderRelayErrorHandlingTest4Query',
        fieldPath: '',
        kind: 'missing_expected_data.throw',
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

    expect(data).toEqual({
      me: {
        ok: false,
        errors: [
          {message: 'There was an error!', path: ['me', 'lastName']},
          {
            message:
              'Relay: Missing data for one or more fields in RelayReaderRelayErrorHandlingTest3Query',
          },
        ],
      },
    });

    // null because we empty the error response fields of errors that were caught
    expect(errorResponseFields).toEqual([
      {
        error: {message: 'There was an error!', path: ['me', 'lastName']},
        fieldPath: 'me.lastName',
        kind: 'relay_field_payload.error',
        owner: 'RelayReaderRelayErrorHandlingTest3Query',
        shouldThrow: false,
      },
      {
        fieldPath: '',
        kind: 'missing_expected_data.log',
        owner: 'RelayReaderRelayErrorHandlingTest3Query',
      },
    ]);
  });
});
