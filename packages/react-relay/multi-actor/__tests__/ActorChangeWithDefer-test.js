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
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';
import type {
  UploadableMap,
  LogRequestInfoFunction,
} from 'relay-runtime/network/RelayNetworkTypes';

import type {ActorChangeWithDeferTestDeferFragment$key} from './__generated__/ActorChangeWithDeferTestDeferFragment.graphql';
import type {ActorChangeWithDeferTestFragment$key} from './__generated__/ActorChangeWithDeferTestFragment.graphql';
import type {ActorChangeWithDeferTestQuery} from './__generated__/ActorChangeWithDeferTestQuery.graphql';
import type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from 'relay-runtime/multi-actor-environment';

const RelayEnvironmentProvider = require('../../relay-hooks/RelayEnvironmentProvider');
const useFragment = require('../../relay-hooks/useFragment');
const useLazyLoadQuery = require('../../relay-hooks/useLazyLoadQuery');
const ActorChange = require('../ActorChange');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {Network, Observable, graphql} = require('relay-runtime');
const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('relay-runtime/multi-actor-environment');
const {disallowWarnings} = require('relay-test-utils-internal');

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
  fragment ActorChangeWithDeferTestFragment on FeedUnit {
    id
    actor {
      name
    }
    ...ActorChangeWithDeferTestDeferFragment @defer
  }
`;

const deferFragment = graphql`
  fragment ActorChangeWithDeferTestDeferFragment on FeedUnit {
    message {
      text
    }
  }
`;

const query = graphql`
  query ActorChangeWithDeferTestQuery {
    viewer {
      newsFeed {
        edges {
          node {
            actor {
              name
            }
          }
          actor_node: node @fb_actor_change {
            ...ActorChangeWithDeferTestFragment
          }
        }
      }
    }
  }
`;

function MainComponent() {
  const data = useLazyLoadQuery<ActorChangeWithDeferTestQuery>(query, {});

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
              return <ActorMessage fragmentRef={fragmentRef} />;
            }}
          </ActorChange>
        );
      })}
    </div>
  );
}

function ActorMessage(
  props: $ReadOnly<{
    fragmentRef: ActorChangeWithDeferTestFragment$key,
  }>,
) {
  const data = useFragment(fragment, props.fragmentRef);

  return (
    <div className="actor">
      <div data-test-id={`name-${data.id}`}>{data.actor?.name}</div>
      <DeferMessage fragmentRef={data} />
    </div>
  );
}

function DeferMessage(props: {
  fragmentRef: ActorChangeWithDeferTestDeferFragment$key,
}) {
  const data = useFragment(deferFragment, props.fragmentRef);

  return <div data-test-id="deferred-message">{data.message?.text}</div>;
}

disallowWarnings();

describe('ActorChange with @defer', () => {
  let environment;
  let multiActorEnvironment;
  let fetchFnForActor;
  let dataSource;

  beforeEach(() => {
    multiActorEnvironment = new MultiActorEnvironment({
      createNetworkForActor: actorIdentifier =>
        Network.create((...args) => fetchFnForActor(...args)),
      logFn: jest.fn(),
      requiredFieldLogger: jest.fn(),
    });
    environment = multiActorEnvironment.forActor(
      getActorIdentifier('actor:1234'),
    );
  });

  it('should render a fragment for actor', () => {
    fetchFnForActor = (
      ...args: Array<?(
        | LogRequestInfoFunction
        | UploadableMap
        | RequestParameters
        | Variables
        | CacheConfig
      )>
    ) => {
      return Observable.create(sink => {
        dataSource = sink;
      });
    };

    const testRenderer = ReactTestRenderer.create(
      <ComponentWrapper
        environment={environment}
        multiActorEnvironment={multiActorEnvironment}>
        <MainComponent />
      </ComponentWrapper>,
    );

    dataSource.next({
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
                  actor: {
                    id: 'actor-1',
                    __typename: 'User',
                    name: 'Antonio Banderas',
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
                    name: 'Silvester Stallone',
                  },
                },
                actor_node: {
                  actor_key: 'actor:5678',
                  id: 'node-2',
                  __typename: 'FeedUnit',
                  actor: {
                    id: 'actor-2',
                    __typename: 'User',
                    name: 'Silvester Stallone',
                  },
                },
              },
            ],
          },
        },
      },
    });
    expect(testRenderer.toJSON()).toEqual('Loading...');

    ReactTestRenderer.act(jest.runAllImmediates);

    expect(testRenderer.toJSON()).toMatchSnapshot(
      'should render 2 actor cards, and empty deferred message boxes.',
    );

    ReactTestRenderer.act(() => {
      dataSource.next({
        data: {
          message: {
            text: 'Hello, Antonio!',
          },
        },
        label:
          'ActorChangeWithDeferTestFragment$defer$ActorChangeWithDeferTestDeferFragment',
        path: ['viewer', 'newsFeed', 'edges', 0, 'actor_node'],
      });
    });
    expect(testRenderer.toJSON()).toMatchSnapshot(
      'should render a list of actors with the first message for Antonio',
    );

    ReactTestRenderer.act(() => {
      dataSource.next({
        data: {
          message: {
            text: 'Ciao, Silvester!',
          },
        },
        label:
          'ActorChangeWithDeferTestFragment$defer$ActorChangeWithDeferTestDeferFragment',
        path: ['viewer', 'newsFeed', 'edges', 1, 'actor_node'],
      });
    });

    expect(testRenderer.toJSON()).toMatchSnapshot(
      'should render all messages, for all actors',
    );
  });
});
