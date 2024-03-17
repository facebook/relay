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
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment: useFragment_LEGACY,
} = require('react-relay');
const useFragment = require('react-relay/relay-hooks/useFragment');
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

describe.each([
  ['New', useFragment],
  ['Legacy', useFragment_LEGACY],
])('Hook implementation: %s', (_hookName, useFragment) => {
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
    const data = useFragment(
      graphql`
        fragment RelayResolverInterfaceTestAnimalLegsFragment on IAnimal {
          legs
        }
      `,
      props.animal,
    );
    return data.legs;
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
});
