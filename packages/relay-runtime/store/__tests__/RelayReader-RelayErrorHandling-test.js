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
        fieldPath: '',
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
            path: [''],
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
        fieldPath: '',
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
});
