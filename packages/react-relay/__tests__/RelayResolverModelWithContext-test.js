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

import type {RelayResolverModelWithContextTestFragment$key} from './__generated__/RelayResolverModelWithContextTestFragment.graphql';
import type {TestResolverContextType} from 'relay-runtime/mutations/__tests__/TestResolverContextType';

const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment,
} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {Observable} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  addTodo,
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayModernStore = require('relay-runtime/store/RelayModernStore.js');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();
disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  resetStore(() => {});
});

function EnvironmentWrapper({
  children,
  environment,
}: {
  children: React.Node,
  environment: RelayModernEnvironment,
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">{children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

const RelayResolverModelWithContextTestFragment = graphql`
  fragment RelayResolverModelWithContextTestFragment on TodoModel {
    id
    description
    another_value_from_context
  }
`;

const RelayResolverModelWithContextTestQuery = graphql`
  query RelayResolverModelWithContextTestQuery($id: ID!) {
    todo_model(todoID: $id) {
      ...RelayResolverModelWithContextTestFragment
    }
  }
`;

describe('RelayResolverModelWithContext', () => {
  function TodoComponent(props: {
    fragmentKey: ?RelayResolverModelWithContextTestFragment$key,
  }) {
    const data = useFragment(
      RelayResolverModelWithContextTestFragment,
      props.fragmentKey,
    );
    if (data == null) {
      return null;
    }

    return data.another_value_from_context;
  }

  function TodoRootComponent(props: {todoID: string}) {
    const data = useClientQuery(RelayResolverModelWithContextTestQuery, {
      id: props.todoID,
    });
    if (data?.todo_model == null) {
      return null;
    }

    return <TodoComponent fragmentKey={data?.todo_model} />;
  }

  test('returns a value from context when resolverDataInjector is used', () => {
    const resolverContext: TestResolverContextType = {
      greeting: {
        myHello: 'This is a value from context',
      },
      counter: Observable.create<number>(observer => {
        observer.next(10);
      }),
    };

    const store = new RelayModernStore(RelayRecordSource.create(), {
      resolverContext,
    });
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });

    addTodo('Test todo');

    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <EnvironmentWrapper environment={environment}>
          <TodoRootComponent todoID="todo-1" />
        </EnvironmentWrapper>,
      );
    });
    expect(renderer?.toJSON()).toEqual('This is a value from context');
  });
});
