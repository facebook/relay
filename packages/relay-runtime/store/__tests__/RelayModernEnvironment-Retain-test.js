/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createReaderSelector,
  createNormalizationSelector,
} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateAndCompile} = require('relay-test-utils-internal');

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succint description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

describe('retain()', () => {
  let ParentQuery;
  let environment;
  let operation;

  beforeEach(() => {
    jest.resetModules();
    ({ParentQuery} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
          }
        }
        fragment ChildFragment on User {
          id
          name
        }
      `));
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    operation = createOperationDescriptor(ParentQuery, {});
    environment.commitPayload(operation, {
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
  });

  it('retains data when not disposed', () => {
    environment.retain(
      createNormalizationSelector(ParentQuery.root, ROOT_ID, {}),
    );
    const snapshot = environment.lookup(
      createReaderSelector(ParentQuery.fragment, ROOT_ID, {}),
      operation,
    );
    // data is still in the store
    expect(snapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
  });

  it('releases data when disposed', () => {
    const {dispose} = environment.retain(
      createNormalizationSelector(ParentQuery.root, ROOT_ID, {}),
    );
    const selector = createReaderSelector(ParentQuery.fragment, ROOT_ID, {});
    dispose();
    // GC runs asynchronously; data should still be in the store
    expect(environment.lookup(selector, operation).data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
    jest.runAllTimers();
    // After GC runs data is missing
    expect(environment.lookup(selector, operation).data).toBe(undefined);
  });
});
