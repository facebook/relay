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
    actor {
      name
    }
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
          actor_node: node @EXPERIMENTAL__as_actor {
            ...ActorChangeTestFeedUnitFragment
          }
        }
      }
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
  return (
    <>
      <div>Name: {data.actor?.name}</div>
      <div>Message: {data.message?.text}</div>
    </>
  );
}

describe('ActorChange', () => {
  let environment;
  let multiActorEnvironment;

  beforeEach(() => {
    multiActorEnvironment = new MultiActorEnvironment({
      createNetworkForActor: () =>
        Network.create(
          jest.fn(() =>
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
                            message: {
                              text: 'So good!',
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
                            message: {
                              text: 'Assassins',
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              }),
            ),
          ),
        ),
      logFn: jest.fn(),
      requiredFieldLogger: jest.fn(),
    });
    environment = multiActorEnvironment.forActor(
      getActorIdentifier('actor:1234'),
    );
  });

  it('should render a fragment for actor', () => {
    const component = (
      <ComponentWrapper
        environment={environment}
        multiActorEnvironment={multiActorEnvironment}>
        <MainComponent />
      </ComponentWrapper>
    );

    const renderer = ReactTestRenderer.create(component);

    expect(renderer.toJSON()).toEqual('Loading...');

    ReactTestRenderer.act(jest.runAllTimers);

    expect(renderer.toJSON()).toEqual({
      type: 'div',
      props: {},
      children: [
        {
          type: 'div',
          props: {},
          children: ['Name: ', 'Antonio Banderas'],
        },
        {
          type: 'div',
          props: {},
          children: ['Message: ', 'So good!'],
        },
        {
          type: 'div',
          props: {},
          children: ['Name: ', 'Sylvester Stallone'],
        },
        {
          type: 'div',
          props: {},
          children: ['Message: ', 'Assassins'],
        },
      ],
    });
  });
});
