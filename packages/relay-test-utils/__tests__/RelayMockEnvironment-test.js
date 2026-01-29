/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {MockResolvers} from '../RelayMockPayloadGenerator';
import type {RelayMockEnvironment} from '../RelayModernMockEnvironment';
import type {RelayMockEnvironmentTestQuery$data} from './__generated__/RelayMockEnvironmentTestQuery.graphql';
import type {RelayMockEnvironmentTestWithDeferFragment_user$key} from './__generated__/RelayMockEnvironmentTestWithDeferFragment_user.graphql';
import type {PreloadedQuery} from 'react-relay/relay-hooks/EntryPointTypes.flow';

const preloadQuery = require('../../react-relay/relay-hooks/preloadQuery_DEPRECATED');
const RelayEnvironmentProvider = require('../../react-relay/relay-hooks/RelayEnvironmentProvider');
const useFragment = require('../../react-relay/relay-hooks/useFragment');
const useLazyLoadQuery = require('../../react-relay/relay-hooks/useLazyLoadQuery');
const usePreloadedQuery = require('../../react-relay/relay-hooks/usePreloadedQuery');
const invariant = require('invariant');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {act} = require('react-test-renderer');
const {graphql} = require('relay-runtime');
const {
  MockPayloadGenerator,
  createMockEnvironment,
} = require('relay-test-utils');
const {
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();

describe('when using queuePendingOperation, queueOperationResolver and preloadQuery in tests', () => {
  const query = graphql`
    query RelayMockEnvironmentTestQuery($id: ID!) {
      node(id: $id) {
        id
        ... on User {
          name
        }
      }
    }
  `;
  let prefetched;
  let mockEnvironment;

  const variables = {id: 4};

  beforeEach(() => {
    mockEnvironment = createMockEnvironment();
    prefetched = undefined;
  });

  const callPreloadQuery = () => {
    // $FlowFixMe[incompatible-type]
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
      return data.node?.name;
    }
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={mockEnvironment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
        // $FlowFixMe[incompatible-type]
        {
          unstable_isConcurrent: true,
        },
      );
    });
    invariant(renderer != null, 'should have been rendered');

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

describe('persistent resolvers', () => {
  // Use the same query definition as the other tests to avoid needing new generated files
  const query = graphql`
    query RelayMockEnvironmentTestQuery($id: ID!) {
      node(id: $id) {
        id
        ... on User {
          name
        }
      }
    }
  `;

  // Helper to render and get the displayed name
  const renderQuery = (
    environment: RelayMockEnvironment,
    variables: {id: string},
  ): {renderer: typeof TestRenderer, getData: () => ?RelayMockEnvironmentTestQuery$data} => {
    let data: ?RelayMockEnvironmentTestQuery$data;
    function Component(props: {prefetched: PreloadedQuery<empty>}) {
      data = usePreloadedQuery(query, props.prefetched);
      return data.node?.name ?? 'null';
    }
    environment.mock.queuePendingOperation(query, variables);
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const prefetched = preloadQuery(environment, query, variables);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
        // $FlowFixMe[incompatible-call]
        {unstable_isConcurrent: true},
      );
    });
    invariant(renderer != null, 'should have been rendered');
    return {renderer, getData: () => data};
  };

  it('should return different data based on variables with persistent resolver', () => {
    const environment = createMockEnvironment();

    // Resolver returns name based on the id variable
    environment.mock.queueOperationResolver({
      resolver: operation => {
        const id = operation.request.variables.id;
        return {
          data: {
            node: {__typename: 'User', id, name: `Name for ${id}`},
          },
        };
      },
      persistent: true,
    });

    // Query for alice - should render "Name for alice"
    const {renderer: renderer1} = renderQuery(environment, {id: 'alice'});
    expect(renderer1.toJSON()).toEqual('Name for alice');

    // Query for bob - same resolver returns different data based on variables
    const {renderer: renderer2} = renderQuery(environment, {id: 'bob'});
    expect(renderer2.toJSON()).toEqual('Name for bob');

    // Query for charlie - resolver is still available
    const {renderer: renderer3} = renderQuery(environment, {id: 'charlie'});
    expect(renderer3.toJSON()).toEqual('Name for charlie');

    // Go back to alice - resolver still works and returns correct data
    const {renderer: renderer4} = renderQuery(environment, {id: 'alice'});
    expect(renderer4.toJSON()).toEqual('Name for alice');
  });

  it('should remove non-persistent resolver after first use', () => {
    const environment = createMockEnvironment();

    // Non-persistent resolver (default behavior)
    environment.mock.queueOperationResolver(operation => {
      const id = operation.request.variables.id;
      return {
        data: {
          node: {__typename: 'User', id, name: `Name for ${id}`},
        },
      };
    });

    // First query succeeds with correct variable-based data
    const {renderer: renderer1} = renderQuery(environment, {id: 'alice'});
    expect(renderer1.toJSON()).toEqual('Name for alice');

    // Second query suspends because resolver was consumed
    const {renderer: renderer2, getData} = renderQuery(environment, {id: 'bob'});
    expect(renderer2.toJSON()).toEqual('Fallback');
    expect(getData()).toBeUndefined();
  });

  it('should make function resolvers persistent when defaultPersistentResolvers is true', () => {
    const environment = createMockEnvironment({
      mockConfig: {defaultPersistentResolvers: true},
    });

    // Plain function resolver (no wrapper) - becomes persistent due to config
    environment.mock.queueOperationResolver(operation => {
      const id = operation.request.variables.id;
      return {
        data: {
          node: {__typename: 'User', id, name: `Name for ${id}`},
        },
      };
    });

    // All queries work and return data based on their specific variables
    const {renderer: renderer1} = renderQuery(environment, {id: 'user-1'});
    expect(renderer1.toJSON()).toEqual('Name for user-1');

    const {renderer: renderer2} = renderQuery(environment, {id: 'user-2'});
    expect(renderer2.toJSON()).toEqual('Name for user-2');

    const {renderer: renderer3} = renderQuery(environment, {id: 'user-3'});
    expect(renderer3.toJSON()).toEqual('Name for user-3');
  });

  it('should clear all resolvers with clearOperationResolvers', () => {
    const environment = createMockEnvironment();

    environment.mock.queueOperationResolver({
      resolver: operation => {
        const id = operation.request.variables.id;
        return {
          data: {
            node: {__typename: 'User', id, name: `Name for ${id}`},
          },
        };
      },
      persistent: true,
    });

    // Clear resolvers before any query
    environment.mock.clearOperationResolvers();

    // Query suspends because resolver was cleared
    const {renderer, getData} = renderQuery(environment, {id: 'test'});
    expect(renderer.toJSON()).toEqual('Fallback');
    expect(getData()).toBeUndefined();
  });

  it('should clear resolver queue when mockClear is called', () => {
    const environment = createMockEnvironment();

    environment.mock.queueOperationResolver({
      resolver: operation => {
        const id = operation.request.variables.id;
        return {
          data: {
            node: {__typename: 'User', id, name: `Name for ${id}`},
          },
        };
      },
      persistent: true,
    });

    environment.mockClear();

    // Query suspends because mockClear cleared the resolver
    const {renderer, getData} = renderQuery(environment, {id: 'test'});
    expect(renderer.toJSON()).toEqual('Fallback');
    expect(getData()).toBeUndefined();
  });
});

describe('when generating multiple payloads for deferred data', () => {
  const query = graphql`
    query RelayMockEnvironmentTestWithDeferQuery($id: ID!) {
      node(id: $id) {
        id
        ... on User {
          ...RelayMockEnvironmentTestWithDeferFragment_user
            @dangerously_unaliased_fixme
            @defer
        }
      }
    }
  `;

  const fragment = graphql`
    fragment RelayMockEnvironmentTestWithDeferFragment_user on User {
      name
    }
  `;

  const render = () => {
    const mockEnvironment = createMockEnvironment();
    const variables = {id: '4'};

    function Component(props: {}) {
      const data = useLazyLoadQuery(query, variables);
      return (
        <>
          {data.node?.id}
          {data.node && <DeferredComponent user={data.node} />}
        </>
      );
    }
    function DeferredComponent(props: {
      user: RelayMockEnvironmentTestWithDeferFragment_user$key,
    }) {
      const data = useFragment(fragment, props.user);
      return data?.name;
    }
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={mockEnvironment}>
          <React.Suspense fallback="Fallback">
            <Component />
          </React.Suspense>
        </RelayEnvironmentProvider>,
        // $FlowFixMe[incompatible-type]
        {
          unstable_isConcurrent: true,
        },
      );
    });
    invariant(renderer != null, 'should have been rendered');

    /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
     * roll out. See https://fburl.com/workplace/4oq3zi07. */
    const isSuspended = () => renderer.toJSON() === 'Fallback';

    const generateData = (resolvers: MockResolvers) => {
      const operation = mockEnvironment.mock.getMostRecentOperation();
      const mockData = MockPayloadGenerator.generateWithDefer(
        operation,
        resolvers,
        {generateDeferredPayload: true},
      );
      mockEnvironment.mock.resolve(operation, mockData);

      act(() => jest.runAllTimers());
    };

    return {
      generateData,
      renderer,
      isSuspended,
    };
  };

  it('renders the initial and deferred payloads', () => {
    const {renderer, isSuspended, generateData} = render();

    expect(isSuspended()).toEqual(true);

    generateData({
      ID() {
        return '4';
      },
      String() {
        return 'Zuck';
      },
    });

    expect(isSuspended()).toEqual(false);
    expect(renderer.toJSON()).toEqual(['4', 'Zuck']);
  });
});
