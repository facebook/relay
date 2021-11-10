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
import type {ActorIdentifier} from '../../../relay-runtime/multi-actor-environment/ActorIdentifier';

import type {ActorChangeWithMutationTestFragment$key} from './__generated__/ActorChangeWithMutationTestFragment.graphql';
import type {ActorChangeWithMutationTestMutation} from './__generated__/ActorChangeWithMutationTestMutation.graphql';
import type {ActorChangeWithMutationTestQuery} from './__generated__/ActorChangeWithMutationTestQuery.graphql';
import type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from 'relay-runtime/multi-actor-environment';

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
  fragment ActorChangeWithMutationTestFragment on FeedUnit {
    id
    actor {
      id
      name
    }
  }
`;

const query = graphql`
  query ActorChangeWithMutationTestQuery {
    viewer {
      actor {
        id
        name
      }
      newsFeed {
        edges {
          node @fb_actor_change {
            ...ActorChangeWithMutationTestFragment
          }
        }
      }
    }
  }
`;

const mutation = graphql`
  mutation ActorChangeWithMutationTestMutation($input: ActorNameChangeInput) {
    actorNameChange(input: $input) {
      actor {
        id
        name
      }
    }
  }
`;

function MainComponent(props: {
  renderViewerActorName: (actorName: ?string) => void,
  renderActorInTheList: ActorTestRenderFn,
}) {
  const data = useLazyLoadQuery<ActorChangeWithMutationTestQuery>(query, {});
  props.renderViewerActorName(data?.viewer?.actor?.name);

  return (
    <div>
      {data.viewer?.newsFeed?.edges?.map((edge, index) => {
        const node = edge?.node;
        if (node == null) {
          throw new Error('Expected to have a node.');
        }
        return (
          <ActorChange key={index} actorChangePoint={node}>
            {fragmentKey => {
              return (
                <ActorComponent
                  fragmentKey={fragmentKey}
                  render={props.renderActorInTheList}
                />
              );
            }}
          </ActorChange>
        );
      })}
    </div>
  );
}

type ActorTestRenderFn = ({
  id: ?string,
  actorId: ?string,
  actorName: ?string,
  changeNameFn: (actorID: string, newName: string) => void,
}) => void;

type Props = $ReadOnly<{
  fragmentKey: ActorChangeWithMutationTestFragment$key,
  render: ActorTestRenderFn,
}>;

function ActorComponent(props: Props) {
  const data = useFragment(fragment, props.fragmentKey);
  const [commit] = useMutation<ActorChangeWithMutationTestMutation>(mutation);

  props.render({
    id: data.id,
    actorName: data.actor?.name,
    actorId: data.actor?.id,
    changeNameFn: (actorID, newName) => {
      commit({
        variables: {
          input: {
            newName,
          },
        },
        optimisticResponse: {
          actorNameChange: {
            actor: {
              __typename: 'User',
              id: actorID,
              name: newName,
            },
          },
        },
      });
    },
  });
  return null;
}

disallowWarnings();

describe('ActorChange', () => {
  let environment;
  let multiActorEnvironment;
  let fetchFnForActor;
  let dataSource;

  beforeEach(() => {
    fetchFnForActor = (
      ...args: Array<?(
        | ActorIdentifier
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
    const actorRenders = [];
    const renderFn = jest.fn(data => {
      actorRenders.push(data);
    });
    const renderViewerActorName = jest.fn();

    ReactTestRenderer.create(
      <ComponentWrapper
        environment={environment}
        multiActorEnvironment={multiActorEnvironment}>
        <MainComponent
          renderViewerActorName={renderViewerActorName}
          renderActorInTheList={renderFn}
        />
      </ComponentWrapper>,
    );

    dataSource.next({
      data: {
        viewer: {
          actor: {
            id: 'actor-1',
            __typename: 'User',
            name: 'Antonio Banderas',
          },
          newsFeed: {
            edges: [
              {
                node: {
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
            ],
          },
        },
      },
    });
    ReactTestRenderer.act(jest.runAllImmediates);
    // Both, main actor
    expect(renderViewerActorName).toBeCalledWith('Antonio Banderas');
    // and new actor rendering the same object with the same ID
    expect(actorRenders.length).toBe(1);
    expect(actorRenders[0]).toEqual({
      actorId: 'actor-1',
      actorName: 'Antonio Banderas',
      changeNameFn: expect.any(Function),
      id: 'node-1',
    });

    // Now, let's trigger a mutation
    renderViewerActorName.mockClear();

    const changeNameFn = actorRenders[0].changeNameFn;
    ReactTestRenderer.act(() => {
      changeNameFn('actor-1', '(Optimistic) Silvester Stallone');
    });
    // Optimistic update should render the new Actor Name
    expect(actorRenders.length).toBe(2);
    expect(actorRenders[1]).toEqual({
      actorId: 'actor-1',
      actorName: '(Optimistic) Silvester Stallone',
      changeNameFn: expect.any(Function),
      id: 'node-1',
    });

    // and should we also update the parent environment with this optimistic payload?
    // something like, expect(renderViewerActorName).toBeCalledWith('(Optimistic) Silvester Stallone');
    // Because, we currently not re-rendering the name.
    // The mutation is executed only on actor-specific environment
    expect(renderViewerActorName).not.toBeCalled();

    // Resolving mutation response
    ReactTestRenderer.act(() => {
      dataSource.next({
        data: {
          actorNameChange: {
            actor: {
              __typename: 'User',
              id: 'actor-1',
              name: 'Silvester Stallone',
            },
          },
        },
      });
    });

    // Still, parent object should not change
    expect(renderViewerActorName).not.toBeCalled();

    expect(actorRenders.length).toBe(3);
    expect(actorRenders[2]).toEqual({
      actorId: 'actor-1',
      actorName: 'Silvester Stallone',
      changeNameFn: expect.any(Function),
      id: 'node-1',
    });
  });
});
