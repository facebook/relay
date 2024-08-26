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
        path: 'me.lastName',
        error: {
          message: 'There was an error!',
          path: ['me', 'lastName'],
        },
      },
    ]);
  });
});
