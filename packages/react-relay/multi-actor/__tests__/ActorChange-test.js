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

import type {ActorChangeTestFeedUnitFragment$key} from './__generated__/ActorChangeTestFeedUnitFragment.graphql';
import type {ActorChangeTestQuery} from './__generated__/ActorChangeTestQuery.graphql';
import type {
  ActorIdentifier,
  IActorEnvironment,
  IMultiActorEnvironment,
} from 'relay-runtime/multi-actor-environment';

const useRelayActorEnvironment = require('../../multi-actor/useRelayActorEnvironment');
const RelayEnvironmentProvider = require('../../relay-hooks/RelayEnvironmentProvider');
const useFragment = require('../../relay-hooks/useFragment');
const useLazyLoadQuery = require('../../relay-hooks/useLazyLoadQuery');
const useMutation = require('../../relay-hooks/useMutation');
const ActorChange = require('../ActorChange');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {Network, Observable, graphql} = require('relay-runtime');
const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('relay-runtime/multi-actor-environment');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

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
    message {
      text
    }
  }
`;

const query = graphql`
  query ActorChangeTestQuery {
    viewer {
      newsFeed {
        edges {
          node {
            actor {
              name
            }
          }
          actor_node: node @fb_actor_change {
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
          <div key={index}>
            <span
              className="default-store-actors"
              data-test-id={`default-store-${
                edge?.node?.actor?.name ?? 'not an actor'
              }`}
            />
            <ActorChange key={index} actorChangePoint={actorNode}>
              {(fragmentRef, actorIdentifier) => {
                return (
                  <ActorMessage
                    myFragment={fragmentRef}
                    actorIdentifier={actorIdentifier}
                  />
                );
              }}
            </ActorChange>
          </div>
        );
      })}
    </div>
  );
}

type Props = $ReadOnly<{
  myFragment: ActorChangeTestFeedUnitFragment$key,
  actorIdentifier: ActorIdentifier,
}>;

function ActorMessage(props: Props) {
  const data = useFragment(fragment, props.myFragment);
  const [commit] = useMutation(mutation);

  // We're calling this hook only to verify that it won't throw.
  // `useRelayActorEnvironment` should be able to have access to `getEnvironmentForActor` function
  // from the RelayEnvironmentProvider.
  useRelayActorEnvironment(props.actorIdentifier);

  return (
    <div className="actor-messages">
      <div data-test-id={`message-${data.id}`}>{data.message?.text}</div>
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

disallowWarnings();

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
                    node: {
                      id: 'node-1',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Antonio Banderas',
                      },
                    },
                    actor_node: {
                      actor_key: 'actor:4321',
                      id: 'node-1',
                      __typename: 'FeedUnit',
                      message: {
                        __typename: 'Text',
                        text: 'Antonio Text',
                      },
                    },
                  },
                  {
                    node: {
                      id: 'node-2',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-2',
                        __typename: 'User',
                        name: 'Sylvester Stallone',
                      },
                    },
                    actor_node: {
                      actor_key: 'actor:5678',
                      id: 'node-2',
                      __typename: 'FeedUnit',
                      message: {
                        __typename: 'Text',
                        text: 'Sylvester Text',
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

    ReactTestRenderer.act(jest.runAllImmediates);

    const testInstance = testRenderer.root;
    // Default Viewer data
    expect(
      testInstance.findAllByProps({
        className: 'default-store-actors',
      }).length,
    ).toBe(2);
    // And we should be able to find this data
    testInstance.findByProps({
      'data-test-id': 'default-store-Antonio Banderas',
    });
    testInstance.findByProps({
      'data-test-id': 'default-store-Sylvester Stallone',
    });

    // Actor Specific Items
    const actorCards = testInstance.findAllByProps({
      className: 'actor-messages',
    });
    expect(actorCards.length).toEqual(2);
    expect(
      testInstance.findByProps({
        'data-test-id': 'message-node-1',
      }).children,
    ).toEqual(['Antonio Text']);
    expect(
      testInstance.findByProps({
        'data-test-id': 'message-node-2',
      }).children,
    ).toEqual(['Sylvester Text']);
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
                    node: {
                      id: 'node-1',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Antonio Banderas',
                      },
                    },
                    actor_node: {
                      actor_key: 'actor:4321',
                      id: 'node-1',
                      __typename: 'FeedUnit',
                      message: {
                        __typename: 'Text',
                        text: 'Antonio Text',
                      },
                    },
                  },
                  {
                    node: {
                      id: 'node-2',
                      __typename: 'FeedUnit',
                      actor: {
                        id: 'actor-2',
                        __typename: 'User',
                        name: 'Sylvester Stallone',
                      },
                    },
                    actor_node: {
                      actor_key: 'actor:5678',
                      id: 'node-2',
                      __typename: 'FeedUnit',
                      message: {
                        __typename: 'Text',
                        text: 'Sylvester Text',
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
    jest.runAllTimers();
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
