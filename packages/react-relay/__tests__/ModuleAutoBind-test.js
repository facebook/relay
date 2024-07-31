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

import type {ModuleAutoBindTestQuery$data} from './__generated__/ModuleAutoBindTestQuery.graphql';
import type {OperationLoader} from 'relay-runtime/store/RelayStoreTypes';
import type {NormalizationRootNode} from 'relay-runtime/util/NormalizationNode';
import type {RelayMockEnvironment} from 'relay-test-utils/RelayModernMockEnvironment';

const useLazyLoadQuery = require('../relay-hooks/useLazyLoadQuery');
const UserNameComponentFragment_user$normalization = require('./__generated__/UserNameComponentFragment_user$normalization.graphql');
const UserNameComponent = require('./UserNameComponent').default;
const React = require('react');
const {RelayEnvironmentProvider} = require('react-relay');
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
        case 'UserNameComponentFragment_user$normalization.graphql':
          return UserNameComponentFragment_user$normalization;
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
      loader,
    });
    environment = createMockEnvironment({
      operationLoader,
      store,
    });
  });

  const QUERY = graphql`
    query ModuleAutoBindTestQuery {
      me {
        ...UserNameComponentFragment_user
          # NOTE: I think there's a path toward making the name optional
          @module(name: "UserNameComponent")
          @alias(as: "UserNameComponent")
      }
    }
  `;

  function TodoRootComponent() {
    const data = useLazyLoadQuery<{}, ModuleAutoBindTestQuery$data>(QUERY, {});
    if (data.me == null) {
      return null;
    }

    return <data.me.UserNameComponent greeting="Hello" />;
  }

  test('should read title of the model', () => {
    const query = createOperationDescriptor(QUERY, {});
    environment.commitPayload(query, {
      me: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        __module_operation_ModuleAutoBindTestQuery_UserNameComponent:
          'UserNameComponentFragment_user$normalization.graphql',
        __module_component_ModuleAutoBindTestQuery_UserNameComponent:
          'UserNameComponentFragment_user',
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
    expect(renderer.toJSON()).toEqual('Hello Alice');
  });
});
