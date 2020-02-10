/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('check()', () => {
  let environment;
  let operationDescriptor;
  let ParentQuery;
  let source;
  let store;

  beforeEach(() => {
    jest.resetModules();
    ({ParentQuery} = generateAndCompile(`
        query ParentQuery($size: [Int]!) {
          me {
            id
            name
            profilePicture(size: $size) {
              uri
            }
          }
        }
      `));

    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    operationDescriptor = createOperationDescriptor(ParentQuery, {size: 32});
  });

  it('returns available if all data exists in the environment', () => {
    environment.commitPayload(operationDescriptor, {
      me: {
        id: '4',
        name: 'Zuck',
        profilePicture: {
          uri: 'https://...',
        },
      },
    });
    expect(environment.check(operationDescriptor)).toEqual({
      status: 'available',
      fetchTime: null,
    });
  });

  it('returns available with fetchTime if all data exists in the environment and the query is retained', () => {
    const fetchTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
    environment.retain(operationDescriptor);
    environment.commitPayload(operationDescriptor, {
      me: {
        id: '4',
        name: 'Zuck',
        profilePicture: {
          uri: 'https://...',
        },
      },
    });
    expect(environment.check(operationDescriptor)).toEqual({
      status: 'available',
      fetchTime,
    });
  });
  it('returns missing if data is missing from the environment', () => {
    environment.commitPayload(operationDescriptor, {
      me: {
        id: '4',
        name: 'Zuck',
        profilePicture: {
          uri: undefined,
        },
      },
    });
    expect(environment.check(operationDescriptor)).toEqual({status: 'missing'});
  });
});
