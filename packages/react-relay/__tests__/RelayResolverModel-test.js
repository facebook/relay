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
import type {RelayResolverModelTestFragment$key} from './__generated__/RelayResolverModelTestFragment.graphql';
import type {RelayResolverModelTestInterfaceFragment$key} from './__generated__/RelayResolverModelTestInterfaceFragment.graphql';
import type {RelayResolverModelTestWithPluralFragment$key} from './__generated__/RelayResolverModelTestWithPluralFragment.graphql';

const invariant = require('invariant');
const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment,
} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  addTodo,
  changeDescription,
  completeTodo,
  removeTodo,
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');
const {
  chargeBattery,
  resetModels,
  setIsHuman,
} = require('relay-runtime/store/__tests__/resolvers/MutableModel');
const {
  LiveColorSubscriptions,
} = require('relay-runtime/store/__tests__/resolvers/TodoDescription');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore.js');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

let logEvents: Array<LogEvent> = [];
function logFn(event: LogEvent): void {
  logEvents.push(event);
}

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  logEvents = [];
  resetStore(logFn);
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
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

describe.each([['New', useFragment]])(
  'Hook implementation: %s',
  (_hookName, useFragment) => {
    let environment;
    let store;
    beforeEach(() => {
      store = new LiveResolverStore(RelayRecordSource.create(), {
        log: logFn,
      });
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(jest.fn()),
        store,
        log: logFn,
      });
    });

    function TodoComponent(props: {
      fragmentKey: ?RelayResolverModelTestFragment$key,
    }) {
      const data = useFragment(
        graphql`
          fragment RelayResolverModelTestFragment on TodoModel {
            id
            fancy_description {
              text
              color
            }
          }
        `,
        props.fragmentKey,
      );
      if (data == null) {
        return null;
      }

      // TODO: The `__relay_model_instance` will be hidden from the
      // users and impossible to select.
      return `${data.fancy_description?.text ?? 'unknown'} - ${
        data.fancy_description?.color ?? 'unknown'
      }`;
    }

    function TodoRootComponent(props: {todoID: string}) {
      const data = useClientQuery(
        graphql`
          query RelayResolverModelTestTodoQuery($id: ID!) {
            todo_model(todoID: $id) {
              ...RelayResolverModelTestFragment
            }
          }
        `,
        {id: props.todoID},
      );
      if (data?.todo_model == null) {
        return null;
      }

      return <TodoComponent fragmentKey={data?.todo_model} />;
    }

    test('should read title of the model', () => {
      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoRootComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('Test todo - red');
    });

    test('should render `null` model.', () => {
      function TodoNullComponent() {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestTodoNullQuery {
              todo_model_null {
                id
              }
            }
          `,
          {},
        );
        if (data?.todo_model_null == null) {
          return null;
        }

        return data?.todo_model_null.id;
      }
      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoNullComponent />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual(null);
    });

    test('read plural resolver field', () => {
      function TodoComponentWithPluralResolverComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestTodoWithPluralFieldQuery($id: ID!) {
              todo_model(todoID: $id) {
                ...RelayResolverModelTestWithPluralFragment
              }
            }
          `,
          {id: props.todoID},
        );
        if (data?.todo_model == null) {
          return null;
        }

        return (
          <TodoComponentWithPluralDescription fragmentKey={data.todo_model} />
        );
      }

      function TodoComponentWithPluralDescription(props: {
        fragmentKey: ?RelayResolverModelTestWithPluralFragment$key,
      }) {
        const data = useFragment(
          graphql`
            fragment RelayResolverModelTestWithPluralFragment on TodoModel {
              many_fancy_descriptions {
                text
                color
              }
            }
          `,
          props.fragmentKey,
        );
        if (data == null) {
          return null;
        }

        return data.many_fancy_descriptions
          ?.map(
            item => `${item?.text ?? 'unknown'} - ${item?.color ?? 'unknown'}`,
          )
          .join(',');
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithPluralResolverComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('Test todo - red');
    });

    test('read live @weak resolver field', () => {
      function TodoComponentWithPluralResolverComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestWeakLiveFieldQuery($id: ID!) {
              live_todo_description(todoID: $id) {
                text
                color
              }
            }
          `,
          {id: props.todoID},
        );
        if (data?.live_todo_description == null) {
          return null;
        }

        return `${data.live_todo_description?.text ?? 'unknown'} - ${
          data.live_todo_description?.color ?? 'unknown'
        }`;
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithPluralResolverComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('Test todo - red');

      TestRenderer.act(() => {
        completeTodo('todo-1');
        jest.runAllImmediates();
      });
      expect(renderer.toJSON()).toEqual('Test todo - green');
    });

    test('should correctly invalidate subscriptions on live fields when updating @weak models', () => {
      LiveColorSubscriptions.activeSubscriptions = [];
      function TodoComponentWithPluralResolverComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestWeakLiveColorFieldQuery($id: ID!) {
              live_todo_description(todoID: $id) {
                text
                live_color
              }
            }
          `,
          {id: props.todoID},
        );
        if (data?.live_todo_description == null) {
          return null;
        }

        return `${data.live_todo_description?.text ?? 'unknown'} - ${
          data.live_todo_description?.live_color ?? 'unknown'
        }`;
      }
      addTodo('Test todo');
      expect(LiveColorSubscriptions.activeSubscriptions.length).toBe(0);
      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithPluralResolverComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('Test todo - red');
      expect(LiveColorSubscriptions.activeSubscriptions.length).toBe(1);

      TestRenderer.act(() => {
        completeTodo('todo-1');
        jest.runAllImmediates();
      });
      expect(LiveColorSubscriptions.activeSubscriptions.length).toBe(1);

      expect(renderer.toJSON()).toEqual('Test todo - green');

      TestRenderer.act(() => {
        removeTodo('todo-1');
        jest.runAllImmediates();
      });

      expect(renderer.toJSON()).toEqual(null);
      // Run GC to will remove "orphan" records and unsubscribe if they have live resolver subscriptions
      store.scheduleGC();
      jest.runAllImmediates();

      expect(LiveColorSubscriptions.activeSubscriptions.length).toBe(0);
    });

    test('read a field with arguments', () => {
      function TodoComponentWithFieldWithArgumentsComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestFieldWithArgumentsQuery($id: ID!) {
              todo_model(todoID: $id) {
                fancy_description {
                  text_with_prefix(prefix: "[x]")
                }
              }
            }
          `,
          {id: props.todoID},
        );
        return data?.todo_model?.fancy_description?.text_with_prefix;
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithFieldWithArgumentsComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('[x] Test todo');

      TestRenderer.act(() => {
        changeDescription('todo-1', 'Changed todo description text');
        jest.runAllImmediates();
      });
      expect(renderer.toJSON()).toEqual('[x] Changed todo description text');
    });

    // If a resolver that returns a weak model returns null, that should result in
    // the edge beign null, not just the model field.
    test('@weak model client edge returns null', () => {
      function TodoComponentWithNullWeakClientEdge(props: {todoID: string}) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestNullWeakClientEdgeQuery($id: ID!) {
              todo_model(todoID: $id) {
                fancy_description_null {
                  text_with_prefix(prefix: "[x]")
                }
              }
            }
          `,
          {id: props.todoID},
        );
        invariant(
          data.todo_model != null,
          'Expected todo model to be defiend.',
        );
        return data.todo_model.fancy_description_null == null
          ? 'NULL!'
          : 'NOT NULL!';
      }
      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithNullWeakClientEdge todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('NULL!');
    });

    // Ensure we don't:
    // 1. Wrap a suspense value coming from a @weak model resolver
    // 2. Don't try to normalize a suspense sentinel as a model value
    test('@weak model client edge suspends', () => {
      function TodoComponentWithNullWeakClientEdge(props: {todoID: string}) {
        useClientQuery(
          graphql`
            query RelayResolverModelTestSuspendedWeakClientEdgeQuery($id: ID!) {
              todo_model(todoID: $id) {
                fancy_description_suspends {
                  text_with_prefix(prefix: "[x]")
                }
              }
            }
          `,
          {id: props.todoID},
        );
        invariant(false, 'Expected to suspend.');
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithNullWeakClientEdge todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('Loading...');
    });

    test('null items in list of @weak models', () => {
      function TodoComponentWithNullablePluralResolverComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestTodoWithNullablePluralFieldQuery(
              $id: ID!
            ) {
              todo_model(todoID: $id) {
                many_fancy_descriptions_but_some_are_null {
                  text
                }
              }
            }
          `,
          {id: props.todoID},
        );

        const fancyDescriptions =
          data?.todo_model?.many_fancy_descriptions_but_some_are_null;
        if (fancyDescriptions == null) {
          return null;
        }

        return fancyDescriptions
          .map(item =>
            item == null ? 'ITEM IS NULL' : item.text ?? 'TEXT IS NULL',
          )
          .join(', ');
      }
      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithNullablePluralResolverComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });

      // TODO: T184433715 We currently break with the GraphQL spec and filter out null items in lists.
      expect(renderer?.toJSON()).toEqual('Test todo');
    });

    test('read a field with its own root fragment', () => {
      function TodoComponentWithFieldWithRootFragmentComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestFieldWithRootFragmentQuery($id: ID!) {
              todo_model(todoID: $id) {
                capitalized_id
              }
            }
          `,
          {id: props.todoID},
        );
        return data?.todo_model?.capitalized_id;
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithFieldWithRootFragmentComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('TODO-1');
    });

    test('read a field with its own root fragment defined using legacy non-terse syntax', () => {
      function TodoComponentWithFieldWithRootFragmentComponent(props: {
        todoID: string,
      }) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestFieldWithRootFragmentLegacyQuery(
              $id: ID!
            ) {
              todo_model(todoID: $id) {
                capitalized_id_legacy
              }
            }
          `,
          {id: props.todoID},
        );
        return data?.todo_model?.capitalized_id_legacy;
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithFieldWithRootFragmentComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('TODO-1');
    });

    test('read interface field', () => {
      function TodoComponentWithInterfaceComponent(props: {todoID: string}) {
        const data = useClientQuery(
          graphql`
            query RelayResolverModelTestTodoWithInterfaceQuery($id: ID!) {
              todo_model(todoID: $id) {
                ...RelayResolverModelTestInterfaceFragment
              }
            }
          `,
          {id: props.todoID},
        );
        if (data?.todo_model == null) {
          return null;
        }

        return <TodoComponentWithInterface fragmentKey={data.todo_model} />;
      }

      function TodoComponentWithInterface(props: {
        fragmentKey: ?RelayResolverModelTestInterfaceFragment$key,
      }) {
        const data = useFragment(
          graphql`
            fragment RelayResolverModelTestInterfaceFragment on TodoModel {
              fancy_description {
                some_interface {
                  __typename
                  description
                }
                some_client_type_with_interface {
                  client_interface {
                    __typename
                    description
                  }
                }
              }
            }
          `,
          props.fragmentKey,
        );
        return JSON.stringify(data);
      }

      addTodo('Test todo');

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <TodoComponentWithInterfaceComponent todoID="todo-1" />
          </EnvironmentWrapper>,
        );
      });
      // $FlowFixMe[incompatible-call] Yes, it is compatible...
      const response = JSON.parse(renderer?.toJSON() ?? '{}');
      jest.runAllImmediates();

      // This incorrectly currently reads out just the typename from resolvers which
      // return interface fields
      expect(response.fancy_description?.some_interface).toEqual({
        __typename: 'ClientTypeImplementingClientInterface',
        description: 'It was a magical place',
      });

      // However, for resolvers which return objects that contain interface fields,
      // we correctly read out the data.
      expect(
        response?.fancy_description?.some_client_type_with_interface,
      ).toEqual({
        client_interface: {
          __typename: 'ClientTypeImplementingClientInterface',
          description: 'It was a magical place',
        },
      });
    });

    const getMutableEntityQuery = graphql`
      query RelayResolverModelTestGetMutableEntityQuery {
        mutable_entity
      }
    `;
    test('should not mutate complex resolver values', () => {
      resetModels();
      // Do not deep freeze
      jest.mock('relay-runtime/util/deepFreeze');

      TestRenderer.act(() => {
        setIsHuman(true);
      });

      function GetMutableEntity() {
        const data = useClientQuery(getMutableEntityQuery, {});
        if (data.mutable_entity == null) {
          return null;
        }
        return `${data.mutable_entity.type}:${data.mutable_entity.props.battery}`;
      }
      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <GetMutableEntity />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('human:0');

      TestRenderer.act(() => {
        setIsHuman(false);
        jest.runAllImmediates();
      });
      expect(renderer.toJSON()).toEqual('robot:0');

      TestRenderer.act(() => {
        chargeBattery();
        setIsHuman(true);
        jest.runAllImmediates();
      });
      expect(renderer.toJSON()).toEqual('human:0');

      TestRenderer.act(() => {
        renderer.unmount();
      });
      jest.unmock('relay-runtime/util/deepFreeze');
    });

    test('should not freeze complex resolver values', () => {
      resetModels();
      TestRenderer.act(() => {
        setIsHuman(false);
      });
      function GetMutableEntity() {
        const data = useClientQuery(getMutableEntityQuery, {});
        if (data.mutable_entity == null) {
          return null;
        }
        return `${data.mutable_entity.type}:${data.mutable_entity.props.battery}`;
      }

      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <GetMutableEntity />
          </EnvironmentWrapper>,
        );
      });
      expect(renderer?.toJSON()).toEqual('robot:0');

      expect(() => {
        chargeBattery();
      }).not.toThrow();

      TestRenderer.act(() => {
        renderer.unmount();
      });
    });
  },
);
