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

import type {ActorChangeTestFeedUnitFragment$key} from './__generated__/ActorChangeTestFeedUnitFragment.graphql';
import type {ActorChangeTestQuery} from './__generated__/ActorChangeTestQuery.graphql';
import type {IActorEnvironment} from 'relay-runtime/multi-actor-environment';

function ComponentWrapper(
  props: $ReadOnly<{
    children: React.Node,
    environment: IActorEnvironment,
  }>,
) {
  return (
    <RelayEnvironmentProvider environment={props.environment}>
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
          node {
            id
          }
          actor_node: node @actor_change_directive {
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
      {data.viewer?.newsFeed?.edges?.map(edge => {
        const node = edge?.node;
        const actorNode = edge?.actor_node;
        if (node == null || actorNode == null) {
          return null;
        }
        <ActorMessage fragmentKey={actorNode} key={node.id} />;
      })}
      />
    </div>
  );
}

function ActorMessage(props: {
  fragmentKey: ActorChangeTestFeedUnitFragment$key,
}) {
  const data = useFragment(fragment, props.fragmentKey);
  return (
    <>
      <div>Name: {data.actor?.name}</div>
      <div>Message: {data.message?.text}</div>
    </>
  );
}

describe('ActorChange', () => {
  let environment;
  let multiActorEnvrionemt;

  beforeEach(() => {
    multiActorEnvrionemt = new MultiActorEnvironment({
      createNetworkForActor: () =>
        Network.create(jest.fn(() => Observable.from(Promise.resolve()))),
      logFn: jest.fn(),
      requiredFieldLogger: jest.fn(),
    });
    environment = multiActorEnvrionemt.forActor(
      getActorIdentifier('actor:1234'),
    );
  });

  it('should render a fragemnt for actor', () => {
    const component = (
      <ComponentWrapper environment={environment}>
        <MainComponent />
      </ComponentWrapper>
    );

    const renderer = ReactTestRenderer.create(component);

    expect(renderer.toJSON()).toMatchInlineSnapshot('"Loading..."');
  });
});
