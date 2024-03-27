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

import type {RelayResolverInterfaceTestAnimalLegsFragment$key} from './__generated__/RelayResolverInterfaceTestAnimalLegsFragment.graphql';

const React = require('react');
const {useFragment} = require('react-relay');
const {RelayEnvironmentProvider, useClientQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore.js');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
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

let environment;
let store;
beforeEach(() => {
  store = new LiveResolverStore(RelayRecordSource.create(), {});
  environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });
});

function AnimalLegsComponent(props: {
  animal: ?RelayResolverInterfaceTestAnimalLegsFragment$key,
}) {
  const animal = useFragment(
    graphql`
      fragment RelayResolverInterfaceTestAnimalLegsFragment on IAnimal {
        legs
      }
    `,
    props.animal,
  );
  return animal?.legs;
}

test('should read the legs of a cat', () => {
  function CatLegsRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverInterfaceTestCatLegsQuery {
          cat {
            ...RelayResolverInterfaceTestAnimalLegsFragment
          }
        }
      `,
      {},
    );

    return <AnimalLegsComponent animal={data.cat} />;
  }

  const renderer = TestRenderer.create(
    <EnvironmentWrapper environment={environment}>
      <CatLegsRootComponent />
    </EnvironmentWrapper>,
  );
  expect(renderer.toJSON()).toEqual('4');
});

test('should read the legs of a fish', () => {
  function FishLegsRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverInterfaceTestFishLegsQuery {
          fish {
            ...RelayResolverInterfaceTestAnimalLegsFragment
          }
        }
      `,
      {},
    );

    return <AnimalLegsComponent animal={data.fish} />;
  }

  const renderer = TestRenderer.create(
    <EnvironmentWrapper environment={environment}>
      <FishLegsRootComponent />
    </EnvironmentWrapper>,
  );
  expect(renderer.toJSON()).toEqual('0');
});

test('resolvers can return an interface where all implementors are strong model types', () => {
  function AnimalLegsQueryComponent(props: {
    request: {ofType: string, returnValidID: boolean},
  }) {
    const data = useClientQuery(
      graphql`
        query RelayResolverInterfaceTestAnimalLegsQuery(
          $request: AnimalRequest!
        ) {
          animal(request: $request) {
            ...RelayResolverInterfaceTestAnimalLegsFragment
          }
        }
      `,
      {request: props.request},
    );

    if (data.animal == null) {
      return 'NULL';
    }

    return <AnimalLegsComponent animal={data.animal} />;
  }

  const fishRenderer = TestRenderer.create(
    <EnvironmentWrapper environment={environment}>
      <AnimalLegsQueryComponent
        request={{ofType: 'Fish', returnValidID: true}}
      />
    </EnvironmentWrapper>,
  );

  expect(fishRenderer.toJSON()).toEqual('0');

  const catRenderer = TestRenderer.create(
    <EnvironmentWrapper environment={environment}>
      <AnimalLegsQueryComponent
        request={{ofType: 'Cat', returnValidID: true}}
      />
    </EnvironmentWrapper>,
  );

  expect(catRenderer.toJSON()).toEqual('4');

  const nullRenderer = TestRenderer.create(
    <EnvironmentWrapper environment={environment}>
      <AnimalLegsQueryComponent
        request={{ofType: 'Cat', returnValidID: false}} // This should trigger a `null` value.
      />
    </EnvironmentWrapper>,
  );
  expect(nullRenderer.toJSON()).toEqual('NULL');
});

test('resolvers can return a list of interfaces where all implementors are strong model types', () => {
  function AnimalsLegsQueryComponent(props: {
    requests: Array<{ofType: string, returnValidID: boolean}>,
  }) {
    const data = useClientQuery(
      graphql`
        query RelayResolverInterfaceTestAnimalsLegsQuery(
          $requests: [AnimalRequest!]!
        ) {
          animals(requests: $requests) {
            id
            ...RelayResolverInterfaceTestAnimalLegsFragment
          }
        }
      `,
      {requests: props.requests},
    );

    return data.animals?.map((animal, index) => {
      if (animal == null) {
        return 'NULL';
      }
      return <AnimalLegsComponent key={animal.id} animal={animal} />;
    });
  }

  const fishRenderer = TestRenderer.create(
    <EnvironmentWrapper environment={environment}>
      <AnimalsLegsQueryComponent
        requests={[
          {ofType: 'Fish', returnValidID: true},
          {ofType: 'Fish', returnValidID: false}, // This should trigger a `null` value.
          {ofType: 'Cat', returnValidID: true},
          {ofType: 'Cat', returnValidID: false}, // This should trigger a `null` value.
        ]}
      />
    </EnvironmentWrapper>,
  );
  expect(fishRenderer.toJSON()).toEqual(['0', 'NULL', '4', 'NULL']);
});
