/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {LogEvent} from '../../relay-runtime/store/RelayStoreTypes';
import type {
  NormalizationRootNode,
  NormalizationSplitOperation,
} from 'relay-runtime/util/NormalizationNode';

import MatchContainer from '../relay-hooks/MatchContainer';
import React from 'react';
import {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment,
} from 'react-relay';
import TestRenderer from 'react-test-renderer';
import {
  ROOT_ID,
  createOperationDescriptor,
  createReaderSelector,
  createRequestDescriptor,
  getSelector,
} from 'relay-runtime';
import RelayNetwork from 'relay-runtime/network/RelayNetwork';
import {graphql} from 'relay-runtime/query/GraphQLTag';
import {resetStore} from 'relay-runtime/store/__tests__/resolvers/ExampleTodoStore';
import RelayModernEnvironment from 'relay-runtime/store/RelayModernEnvironment';
import RelayModernStore from 'relay-runtime/store/RelayModernStore';
import RelayRecordSource from 'relay-runtime/store/RelayRecordSource';
import {
  disallowConsoleErrors,
  disallowWarnings,
} from 'relay-test-utils-internal';

disallowWarnings();
disallowConsoleErrors();

class ErrorBoundary extends React.Component<$FlowFixMe, $FlowFixMe> {
  state: {error: unknown} = {error: null};

  componentDidCatch(error: Error) {
    this.setState({error});
  }

  //$FlowFixMe[unclear-type]
  render(): any {
    const {children, fallback} = this.props;
    const {error} = this.state;
    if (error != null) {
      return fallback;
    } else {
      return children;
    }
  }
}

const CLIENT_3D_TEST_QUERY = graphql`
  query RelayClient3DModuleTestQuery {
    persona {
      ...RelayClient3DModuleTestFragment2BasicUser
    }
  }
`;

const CLIENT_3D_TEST_FRAGMENT = graphql`
  fragment RelayClient3DModuleTestFragment2BasicUser on Persona {
    basicUser {
      ...RelayClient3DModuleTestFragmentClientUser_data
        @module(name: "ClientUser.react")
      ...RelayClient3DModuleTestFragmentSpecialUser_data
        @module(name: "SpecialUser.react")
    }
  }
`;

const CLIENT_USER_FRAGMENT = graphql`
  fragment RelayClient3DModuleTestFragmentClientUser_data on ClientUser {
    data
  }
`;

const SPECIAL_USER_FRAGMENT = graphql`
  fragment RelayClient3DModuleTestFragmentSpecialUser_data on SpecialUser {
    data
  }
`;

function BasicUserRenderer() {
  const queryData = useClientQuery(CLIENT_3D_TEST_QUERY, {});
  const fragmentData = useFragment(CLIENT_3D_TEST_FRAGMENT, queryData.persona);
  const loader = (moduleProvider: unknown) => {
    // $FlowFixMe[not-a-function]
    return moduleProvider().default;
  };
  // $FlowFixMe[underconstrained-implicit-instantiation]
  return <MatchContainer loader={loader} match={fragmentData?.basicUser} />;
}

let logEvents: Array<LogEvent> = [];
function logFn(event: LogEvent): void {
  logEvents.push(event);
}

beforeEach(() => {
  logEvents = [];
  resetStore(logFn);
});

describe('ClientUser', () => {
  let store;
  let environment;
  let operationLoader;

  beforeEach(() => {
    operationLoader = {
      load: jest.fn<[unknown], Promise<NormalizationSplitOperation>>(),
      get: jest.fn<[unknown], ?NormalizationRootNode>(),
    };
    store = new RelayModernStore(RelayRecordSource.create(), {
      log: logFn,
      operationLoader,
    });
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      operationLoader,
      store,
      log: logFn,
    });
    const operation = createOperationDescriptor(CLIENT_3D_TEST_QUERY, {});
    environment.commitPayload(operation, {
      persona: {
        basicUser: {
          __typename: 'ClientUser',
          id: '1',
          data: 'clientUserData',
        },
      },
    });
    jest.runAllImmediates();
  });

  it('execute and normalize 3D data', () => {
    const querySelector = createReaderSelector(
      CLIENT_3D_TEST_QUERY.fragment,
      ROOT_ID,
      {},
      createRequestDescriptor(CLIENT_3D_TEST_QUERY, {}),
    );
    const querySnapshot = environment.lookup(querySelector);

    const fragmentSelector = getSelector(
      CLIENT_3D_TEST_FRAGMENT,
      querySnapshot.data?.persona,
    );
    //$FlowFixMe[incompatible-type]
    const fragmentSnapshot = environment.lookup(fragmentSelector);
    const dataSelector = getSelector(
      CLIENT_USER_FRAGMENT,
      fragmentSnapshot.data?.basicUser,
    );
    //$FlowFixMe[incompatible-type]
    const dataSnapshot = environment.lookup(dataSelector);

    expect(dataSnapshot.data?.data).toBe('clientUserData');
  });

  it('renders client 3D data using MatchContainer', () => {
    let instance;
    TestRenderer.act(() => {
      instance = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <ErrorBoundary fallback="Error Boundary">
            <React.Suspense fallback="Loading...">
              <BasicUserRenderer />
            </React.Suspense>
          </ErrorBoundary>
        </RelayEnvironmentProvider>,
      );
    });
    expect(instance?.toJSON()).toBe('clientUserData');
  });
});

describe('SpecialUser', () => {
  let environment;
  let store;
  let operationLoader;
  beforeEach(() => {
    operationLoader = {
      load: jest.fn<[unknown], Promise<NormalizationSplitOperation>>(),
      get: jest.fn<[unknown], ?NormalizationRootNode>(),
    };
    store = new RelayModernStore(RelayRecordSource.create(), {
      log: logFn,
      operationLoader,
    });
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
      operationLoader,
      log: logFn,
    });
    const operation = createOperationDescriptor(CLIENT_3D_TEST_QUERY, {});
    environment.commitPayload(operation, {
      persona: {
        basicUser: {
          __typename: 'SpecialUser',
          id: '2',
          data: 'specialUserData',
        },
      },
    });
    jest.runAllImmediates();
  });

  it('execute and normalize 3D data', () => {
    const querySelector = createReaderSelector(
      CLIENT_3D_TEST_QUERY.fragment,
      ROOT_ID,
      {},
      createRequestDescriptor(CLIENT_3D_TEST_QUERY, {}),
    );
    const querySnapshot = environment.lookup(querySelector);

    const fragmentSelector = getSelector(
      CLIENT_3D_TEST_FRAGMENT,
      querySnapshot.data?.persona,
    );
    //$FlowFixMe[incompatible-type]
    const fragmentSnapshot = environment.lookup(fragmentSelector);
    const dataSelector = getSelector(
      SPECIAL_USER_FRAGMENT,
      fragmentSnapshot.data?.basicUser,
    );
    //$FlowFixMe[incompatible-type]
    const dataSnapshot = environment.lookup(dataSelector);

    expect(dataSnapshot.data?.data).toBe('specialUserData');
  });

  it('renders client 3D data using MatchContainer', () => {
    let instance;
    TestRenderer.act(() => {
      instance = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <ErrorBoundary fallback="Error Boundary">
            <React.Suspense fallback="Loading...">
              <BasicUserRenderer />
            </React.Suspense>
          </ErrorBoundary>
        </RelayEnvironmentProvider>,
      );
    });
    expect(instance?.toJSON()).toBe('specialUserData');
  });
});
