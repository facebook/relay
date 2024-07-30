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

import type {ModuleAutoBindTestFragment_user$key} from './__generated__/ModuleAutoBindTestFragment_user.graphql';
import type {OperationLoader} from 'relay-runtime/store/RelayStoreTypes';
import type {NormalizationRootNode} from 'relay-runtime/util/NormalizationNode';
import type {RelayMockEnvironment} from 'relay-test-utils/RelayModernMockEnvironment';

import ModuleAutoBindTestFragment_user$normalization from './__generated__/ModuleAutoBindTestFragment_user$normalization.graphql';

const MatchContainer = require('../relay-hooks/MatchContainer');
const useLazyLoadQuery = require('../relay-hooks/useLazyLoadQuery');
const React = require('react');
const {RelayEnvironmentProvider, useFragment} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {createOperationDescriptor} = require('relay-runtime');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {createMockEnvironment} = require('relay-test-utils-internal');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

function EnvironmentWrapper({
  children,
  environment,
}: {
  children: React.Node,
  environment: RelayMockEnvironment,
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">{children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

describe('AutoBind', () => {
  let environment;
  const operationLoader: OperationLoader = {
    get(reference: mixed): ?NormalizationRootNode {
      switch (reference) {
        case 'ModuleAutoBindTestFragment_user$normalization.graphql':
          return ModuleAutoBindTestFragment_user$normalization;
        default:
          throw new Error(`Loader not configured for reference: ${reference}`);
      }
    },
    async load(reference: mixed): Promise<?NormalizationRootNode> {
      throw new Error('OperationLoader.load not implemented');
    },
  };
  const loader = moduleReference => {
    return UserNameComponent;
  };
  beforeEach(() => {
    const store = new RelayModernStore(new RelayRecordSource({}), {
      operationLoader,
    });
    environment = createMockEnvironment({
      operationLoader,
      store,
    });
  });

  function UserNameComponent(props: {
    user: ModuleAutoBindTestFragment_user$key,
  }) {
    const data = useFragment(
      graphql`
        fragment ModuleAutoBindTestFragment_user on User {
          name
        }
      `,
      props.user,
    );

    return data.name;
  }

  const QUERY = graphql`
    query ModuleAutoBindTestQuery {
      me {
        ...ModuleAutoBindTestFragment_user
          @module(name: "ModuleAutoBindTestFragment")
      }
    }
  `;

  function TodoRootComponent() {
    const data = useLazyLoadQuery(QUERY, {});
    if (data.me == null) {
      return null;
    }

    return (
      <MatchContainer
        fallback={<h1>FALLBACK</h1>}
        loader={loader}
        match={data.me}
      />
    );
  }

  test('should read title of the model', () => {
    const query = createOperationDescriptor(QUERY, {});
    environment.commitPayload(query, {
      me: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        __module_operation_ModuleAutoBindTestQuery:
          'ModuleAutoBindTestFragment_user$normalization.graphql',
        __module_component_ModuleAutoBindTestQuery:
          'ModuleAutoBindTestFragment',
      },
    });
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <EnvironmentWrapper environment={environment}>
          <TodoRootComponent />
        </EnvironmentWrapper>,
      );
    });
    expect(renderer.toJSON()).toEqual('Alice');
  });
});
