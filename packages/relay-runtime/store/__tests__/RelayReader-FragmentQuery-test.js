/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {read} = require('../RelayReader');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {TYPE_SCHEMA_TYPE, generateTypeID} = require('../TypeID');

describe('RelayReader', () => {
  let source;

  beforeEach(() => {
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    };

    source = RelayRecordSource.create(data);
  });

  it('reads query data from a fragment', () => {
    const UserQuery = graphql`
      query RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery {
        me {
          ...RelayReaderFragmentQueryTestFragment
        }
      }
    `;

    const BarFragment = graphql`
      fragment RelayReaderFragmentQueryTestFragment on User {
        __query {
          me {
            firstName
          }
        }
      }
    `;
    const owner = createOperationDescriptor(UserQuery, {});
    const {data, seenRecords} = read(
      source,
      createReaderSelector(BarFragment, '1', {}, owner.request),
    );
    expect(data).toEqual({
      __query: {
        me: {
          firstName: 'Alice',
        },
      },
    });
  });
});
