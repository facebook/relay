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

const {getRequest} = require('../../query/RelayModernGraphQLTag');
const {createReaderSelector} = require('../RelayModernSelector');
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
      variables: operation.request.variables,
    };
  };
  return operation;
}

describe('lookup()', () => {
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
            ...ChildFragment
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

  it('returns the results of executing a query', () => {
    const snapshot = environment.lookup(
      createReaderSelector(
        ParentQuery.fragment,
        ROOT_ID,
        {},
        operation.request,
      ),
    );
    expect(snapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {ChildFragment: {}},
        __fragmentOwner: operation.request,
      },
    });
  });

  it('includes fragment owner in result when owner is provided', () => {
    const queryNode = getRequest(ParentQuery);
    const owner = createOperationDescriptor(queryNode, {});
    const snapshot = environment.lookup(
      createReaderSelector(ParentQuery.fragment, ROOT_ID, {}, owner.request),
    );
    expect(snapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {ChildFragment: {}},
        __fragmentOwner: owner.request,
      },
    });
    // $FlowFixMe
    expect(snapshot.data?.me?.__fragmentOwner).toBe(owner.request);
  });
});
