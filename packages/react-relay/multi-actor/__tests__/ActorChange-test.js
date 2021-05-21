/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

'use strict';

const ActorChange = require('../ActorChange');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../../relay-hooks/RelayEnvironmentProvider');

const useFragment = require('../../relay-hooks/useFragment');
const useLazyLoadQuery = require('../../relay-hooks/useLazyLoadQuery');
const useMutation = require('../../relay-hooks/useMutation');

const {Network, graphql, Observable} = require('relay-runtime');
const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('relay-runtime/multi-actor-environment');

import type {ActorChangePoint} from '../ActorChange';
import type {
  ActorChangeTestFeedUnitFragment$key,
  ActorChangeTestFeedUnitFragment$ref,
} from './__generated__/ActorChangeTestFeedUnitFragment.graphql';
import type {ActorChangeTestQueryVariables} from './__generated__/ActorChangeTestQuery.graphql';
import type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from 'relay-runtime/multi-actor-environment';

// TODO: T89695920 Remove manual flow-types when the compiler changes are completed
type ActorChangeTestQueryResponse = {|
  +viewer: ?{|
    +newsFeed: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
        |},
        +actor_node: ?ActorChangePoint<{|
          +$fragmentRefs: ActorChangeTestFeedUnitFragment$ref,
        |}>,
      |}>,
    |},
  |},
|};

type ActorChangeTestQuery = {|
  variables: ActorChangeTestQueryVariables,
  response: ActorChangeTestQueryResponse,
|};

function ComponentWrapper(
  props: $ReadOnly<{
    children: React.Node,
    environment: IActorEnvironment,
    multiActorEnvironment: IMultiActorEnvironment,
  }>,
) {
  return (
    <RelayEnvironmentProvider
      environment={props.environment}
      getEnvironmentForActor={actorIdentifier =>
        props.multiActorEnvironment.forActor(actorIdentifier)
      }>
      <React.Suspense fallback="Loading...">{props.children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

const fragment = graphql`
  fragment ActorChangeTestFeedUnitFragment on FeedUnit {
    id
    actor {
      name
    }
  }
`;

const query = graphql`
  query ActorChangeTestQuery {
    viewer {
      newsFeed {
        edges {
          actor_node: node @EXPERIMENTAL__as_actor {
            ...ActorChangeTestFeedUnitFragment
          }
        }
      }
    }
  }
`;

const mutation = graphql`
  mutation ActorChangeTestMutation($input: CommentCreateInput) {
    commentCreate(input: $input) {
      __typename
    }
  }
`;

function MainComponent() {
  const data = useLazyLoadQuery<ActorChangeTestQuery>(query, {});

  return (
    <div>
      {data.viewer?.newsFeed?.edges?.map((edge, index) => {
        const actorNode = edge?.actor_node;
        if (actorNode == null) {
          return null;
        }
        return (
          <ActorChange key={index} actorChangePoint={actorNode}>
            {fragmentRef => {
              return <ActorMessage myFragment={fragmentRef} />;
            }}
          </ActorChange>
        );
      })}
    </div>
  );
}

type Props = $ReadOnly<{
  myFragment: ActorChangeTestFeedUnitFragment$key,
}>;

function ActorMessage(props: Props) {
  const data = useFragment(fragment, props.myFragment);
  const [commit] = useMutation(mutation);

  return (
    <div className="actor">
      <div data-test-id={`name-${data.id}`}>{data.actor?.name}</div>
      <button
        data-test-id={`button-${data.id}`}
        onClick={() =>
          commit({
            variables: {
              feedbackID: 'feedback:1234',
            },
          })
        }
      />
    </div>
  );
}

describe('ActorChange', () => {
  let environment;
  let multiActorEnvironment;
  let fetchFnForActor;

  beforeEach(() => {
    multiActorEnvironment = new MultiActorEnvironment({
      createNetworkForActor: actorIdentifier =>
        Network.create((...args) => fetchFnForActor(actorIdentifier, ...args)),
      logFn: jest.fn(),
      requiredFieldLogger: jest.fn(),
    });
    environment = multiActorEnvironment.forActor(
      getActorIdentifier('actor:1234'),
    );
  });

  it('should render a fragment for actor', () => {
    fetchFnForActor = jest.fn(actorId =>
      Observable.from(
        Promise.resolve({
          data: {
            viewer: {
              newsFeed: {
                edges: [
                  {
                    actor_node: {
                      __viewer: 'actor:4321',
                      id: 'node-1',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Antonio Banderas',
                      },
                    },
                  },
                  {
                    actor_node: {
                      __viewer: 'actor:5678',
                      id: 'node-2',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-2',
                        __typename: 'User',
                        name: 'Sylvester Stallone',
                      },
                    },
                  },
                ],
              },
            },
          },
        }),
      ),
    );

    const testRenderer = ReactTestRenderer.create(
      <ComponentWrapper
        environment={environment}
        multiActorEnvironment={multiActorEnvironment}>
        <MainComponent />
      </ComponentWrapper>,
    );
    expect(testRenderer.toJSON()).toEqual('Loading...');

    ReactTestRenderer.act(jest.runAllTimers);

    const testInstance = testRenderer.root;
    const actorCards = testInstance.findAllByProps({
      className: 'actor',
    });
    expect(actorCards.length).toEqual(2);
    expect(
      testInstance.findByProps({
        'data-test-id': 'name-node-1',
      }).children,
    ).toEqual(['Antonio Banderas']);
    expect(
      testInstance.findByProps({
        'data-test-id': 'name-node-2',
      }).children,
    ).toEqual(['Sylvester Stallone']);
  });

  it('should send a query and mutations with correct actor id, from the correct environment', () => {
    fetchFnForActor = jest.fn(actorId =>
      Observable.from(
        Promise.resolve({
          data: {
            viewer: {
              newsFeed: {
                edges: [
                  {
                    actor_node: {
                      __viewer: 'actor:4321',
                      id: 'node-1',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Antonio Banderas',
                      },
                    },
                  },
                  {
                    actor_node: {
                      __viewer: 'actor:5678',
                      id: 'node-2',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-2',
                        __typename: 'User',
                        name: 'Sylvester Stallone',
                      },
                    },
                  },
                ],
              },
            },
          },
        }),
      ),
    );
    expect(fetchFnForActor).not.toBeCalled();
    const testRenderer = ReactTestRenderer.create(
      <ComponentWrapper
        environment={environment}
        multiActorEnvironment={multiActorEnvironment}>
        <MainComponent />
      </ComponentWrapper>,
    );
    ReactTestRenderer.act(jest.runAllTimers);
    // Loading data should be for default actor
    expect(fetchFnForActor).toBeCalledTimes(1);
    expect(fetchFnForActor.mock.calls[0][0]).toBe('actor:1234');
    fetchFnForActor.mockClear();

    const testInstance = testRenderer.root;

    const buttonNode1 = testInstance.findByProps({
      'data-test-id': 'button-node-1',
    });

    ReactTestRenderer.act(() => {
      buttonNode1.props.onClick();
    });
    expect(fetchFnForActor).toBeCalledTimes(1);
    expect(fetchFnForActor.mock.calls[0][0]).toBe('actor:4321');

    fetchFnForActor.mockClear();

    const buttonNode2 = testInstance.findByProps({
      'data-test-id': 'button-node-2',
    });

    ReactTestRenderer.act(() => {
      buttonNode2.props.onClick();
    });
    expect(fetchFnForActor).toBeCalledTimes(1);
    expect(fetchFnForActor.mock.calls[0][0]).toBe('actor:5678');
    fetchFnForActor.mockClear();
  });
});
