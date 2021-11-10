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

import type {ActorChangeWithStreamTestFragment$key} from './__generated__/ActorChangeWithStreamTestFragment.graphql';
import type {ActorChangeWithStreamTestQuery} from './__generated__/ActorChangeWithStreamTestQuery.graphql';
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

const query = graphql`
  query ActorChangeWithStreamTestQuery {
    viewer {
      newsFeed {
        edges {
          node @fb_actor_change {
            ...ActorChangeWithStreamTestFragment
          }
        }
      }
    }
  }
`;

function MainComponent() {
  const data = useLazyLoadQuery<ActorChangeWithStreamTestQuery>(query, {});

  return (
    <div>
      {data.viewer?.newsFeed?.edges?.map((edge, index) => {
        const node = edge?.node;
        if (node == null) {
          throw new Error('expected to have node.');
        }
        return (
          <ActorChange key={index} actorChangePoint={node}>
            {fragmentRef => {
              return <ActorChangeComponent fragmentRef={fragmentRef} />;
            }}
          </ActorChange>
        );
      })}
    </div>
  );
}

function ActorChangeComponent(
  props: $ReadOnly<{
    fragmentRef: ActorChangeWithStreamTestFragment$key,
  }>,
) {
  const data = useFragment(
    graphql`
      fragment ActorChangeWithStreamTestFragment on FeedUnit {
        id
        message {
          text
        }
        feedback {
          id
          actors @stream(initial_count: 1) {
            name
          }
        }
      }
    `,
    props.fragmentRef,
  );

  return (
    <div className="actor" data-test-id={`actor-${data.id}`}>
      <span className="message">{data.message?.text}</span>
      <div data-test-id={`feedback-${data.id}`}>
        {data.feedback?.actors?.map((actor, index) => {
          return <div key={`actor-${index}`}>{actor?.name}</div>;
        })}
      </div>
    </div>
  );
}

disallowWarnings();

describe('ActorChange with @stream', () => {
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
                  actor_key: 'actor:4321',
                  id: 'node-1',
                  __typename: 'FeedUnit',
                  message: {
                    text: 'Scene 1',
                  },
                  feedback: {
                    id: 'feedback-123',
                    actors: [
                      {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Antonio Banderas',
                      },
                    ],
                  },
                },
              },
              {
                node: {
                  actor_key: 'actor:5678',
                  id: 'node-2',
                  __typename: 'FeedUnit',
                  message: {
                    text: 'Scene 2',
                  },
                  feedback: {
                    id: 'feedback-456',
                    actors: [
                      {
                        id: 'actor-2',
                        __typename: 'User',
                        name: 'Silvester Stallone',
                      },
                    ],
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
      'Should render two blocks (scenes) with lists. Each scene has one actor: Antonio as Silvester.',
    );

    ReactTestRenderer.act(() => {
      dataSource.next({
        data: {
          id: 'actor-3',
          __typename: 'User',
          name: 'Julianne Moore',
        },
        label: 'ActorChangeWithStreamTestFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          1,
        ],
      });
    });
    expect(testRenderer.toJSON()).toMatchSnapshot(
      'Julianne should join Antonio in the first list.',
    );

    ReactTestRenderer.act(() => {
      dataSource.next({
        data: {
          id: 'actor-4',
          __typename: 'User',
          name: 'Anatoli Davydov',
        },
        label: 'ActorChangeWithStreamTestFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          1,
          'node',
          'feedback',
          'actors',
          1,
        ],
      });
    });
    expect(testRenderer.toJSON()).toMatchSnapshot(
      'Finally, Anatoli is joining the second scene.',
    );
  });
});
