/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const preloadQuery = require('../../react-relay/relay-hooks/preloadQuery_DEPRECATED');
const RelayEnvironmentProvider = require('../../react-relay/relay-hooks/RelayEnvironmentProvider');
const usePreloadedQuery = require('../../react-relay/relay-hooks/usePreloadedQuery');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {getRequest, graphql} = require('relay-runtime');
const {
  MockPayloadGenerator,
  createMockEnvironment,
} = require('relay-test-utils');

const query = getRequest(graphql`
  query RelayMockEnvironmentTestQuery($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
    }
  }
`);

describe('when using queuePendingOperation, queueOperationResolver and preloadQuery in tests', () => {
  let prefetched;
  let mockEnvironment;

  const variables = {id: 4};

  beforeEach(() => {
    mockEnvironment = createMockEnvironment();
    prefetched = undefined;
  });

  const callPreloadQuery = () => {
    prefetched = preloadQuery(mockEnvironment, query, variables);
  };
  const callQueueOperationResolver = () =>
    mockEnvironment.mock.queueOperationResolver(operation => {
      return MockPayloadGenerator.generate(operation, {
        String() {
          return 'Zuck';
        },
      });
    });
  const callRegisterOperation = () =>
    mockEnvironment.mock.queuePendingOperation(query, variables);

  const SUSPENDED = false;
  const RENDERED = true;
  type ConditionToAssert = true | false;

  const renderAndAssert = (condition: ConditionToAssert) => {
    let data;
    function Component(props: $FlowFixMe) {
      data = usePreloadedQuery(query, props.prefetched);
      return data.node.name;
    }
    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={mockEnvironment}>
        <React.Suspense fallback="Fallback">
          <Component prefetched={prefetched} />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    if (condition === SUSPENDED) {
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBeUndefined();
    } else if (condition === RENDERED) {
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data?.node?.name).toEqual('Zuck');
    }
  };

  // Test various combinations of calling queueOperationResolvers, queuePendingOperation
  // and preloadQuery, in various orders.
  it('renders synchronously if queueOperationResolver, queuePendingOperation and preloadQuery have been called', () => {
    callQueueOperationResolver();
    callRegisterOperation();
    callPreloadQuery();
    renderAndAssert(RENDERED);
  });

  it('suspends if only queuePendingOperation and preloadQuery have been called', () => {
    callRegisterOperation();
    callPreloadQuery();
    renderAndAssert(SUSPENDED);
  });

  it('suspends if only queueOperationResolver and preloadQuery have been called', () => {
    callQueueOperationResolver();
    callPreloadQuery();
    renderAndAssert(SUSPENDED);
  });

  it('suspends if only preloadQuery have been called', () => {
    callPreloadQuery();
    renderAndAssert(SUSPENDED);
  });

  describe('if preloadQuery has been called first', () => {
    it('suspends if queueOperationResolver and queuePendingOperation are called', () => {
      callPreloadQuery();
      callQueueOperationResolver();
      callRegisterOperation();
      renderAndAssert(SUSPENDED);
    });
    it('suspends if queueOperationResolver is called', () => {
      callPreloadQuery();
      callQueueOperationResolver();
      renderAndAssert(SUSPENDED);
    });
    it('suspends if queuePendingOperation is called', () => {
      callPreloadQuery();
      callRegisterOperation();
      renderAndAssert(SUSPENDED);
    });
  });
});
