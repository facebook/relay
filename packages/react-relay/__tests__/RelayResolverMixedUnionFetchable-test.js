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

import type {RelayResolverMixedUnionFetchableTestFragment$key} from './__generated__/RelayResolverMixedUnionFetchableTestFragment.graphql';
import type {DataID} from 'relay-runtime';

const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment,
} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RecordSource} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const RelayObservable = require('relay-runtime/network/RelayObservable');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayModernStore = require('relay-runtime/store/RelayModernStore.js');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

// --- Relay Model Resolver: Hovercraft (member of MixedVehicle union) ---
type HovercraftModel = {
  __id: DataID,
};
/**
 * @RelayResolver Hovercraft
 */
export function Hovercraft(id: DataID): HovercraftModel {
  return {
    __id: id,
  };
}
/**
 * @RelayResolver Hovercraft.description: String
 */
export function description(hovercraft: HovercraftModel): string {
  return 'A flying vehicle';
}

/**
 * Returns a Hovercraft or NonNodeStory depending on the `isHovercraft` argument.
 *
 * @RelayResolver Query.mixed_vehicle(isHovercraft: Boolean!): MixedVehicle
 */
export function mixed_vehicle(args: {isHovercraft: boolean}): {
  __typename: 'Hovercraft' | 'NonNodeStory',
  id: DataID,
} {
  if (args.isHovercraft) {
    return {__typename: 'Hovercraft', id: 'hovercraft-1'};
  }
  return {__typename: 'NonNodeStory', id: 'story-1'};
}
// --- Test setup ---

disallowWarnings();
disallowConsoleErrors();

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
  store = new RelayModernStore(
    // Pre-populate the store with a NonNodeStory record (server fetchable type).
    new RecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
      },
      'story-1': {
        __id: 'story-1',
        __typename: 'NonNodeStory',
        fetch_id: 'fetch:story-1',
        tracking: 'test-tracking',
      },
    }),
    {},
  );
  environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });
});

function UnionMemberComponent(props: {
  member: ?RelayResolverMixedUnionFetchableTestFragment$key,
}) {
  const data = useFragment(
    graphql`
      fragment RelayResolverMixedUnionFetchableTestFragment on MixedVehicle {
        __typename
        ... on NonNodeStory {
          tracking
        }
        ... on Hovercraft {
          description
        }
      }
    `,
    props.member,
  );
  if (data == null) {
    return null;
  }
  if (data.__typename === 'NonNodeStory') {
    return data.tracking;
  }
  if (data.__typename === 'Hovercraft') {
    return data.description;
  }
  return null;
}

test('should read tracking of a NonNodeStory (server fetchable type) through union fragment', () => {
  function NonNodeStoryRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedUnionFetchableTestNonNodeStoryQuery(
          $isHovercraft: Boolean!
        ) {
          mixed_vehicle(isHovercraft: $isHovercraft) @waterfall {
            ...RelayResolverMixedUnionFetchableTestFragment
          }
        }
      `,
      {isHovercraft: false},
    );

    return <UnionMemberComponent member={data.mixed_vehicle} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <NonNodeStoryRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // NonNodeStory's tracking value comes from the pre-populated store record.
  expect(renderer?.toJSON()).toEqual('test-tracking');
});

test('should read description of a Hovercraft (relay model resolver) through union fragment', () => {
  function HovercraftRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedUnionFetchableTestHovercraftQuery(
          $isHovercraft: Boolean!
        ) {
          mixed_vehicle(isHovercraft: $isHovercraft) @waterfall {
            ...RelayResolverMixedUnionFetchableTestFragment
          }
        }
      `,
      {isHovercraft: true},
    );

    return <UnionMemberComponent member={data.mixed_vehicle} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <HovercraftRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // Hovercraft's description value comes from the resolver defined above.
  expect(renderer?.toJSON()).toEqual('A flying vehicle');
});

test('server fetchable type not in store suspends and triggers a fetch', () => {
  // Create an environment with NO NonNodeStory record in the store.
  const emptyStore = new RelayModernStore(
    new RecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
      },
    }),
    {},
  );
  const fetchFn = jest.fn();
  fetchFn.mockReturnValue(RelayObservable.create(() => {}));
  const emptyEnvironment = new RelayModernEnvironment({
    network: RelayNetwork.create(fetchFn),
    store: emptyStore,
  });

  function MixedVehicleRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedUnionFetchableTestMissingQuery(
          $isHovercraft: Boolean!
        ) {
          mixed_vehicle(isHovercraft: $isHovercraft) @waterfall {
            ...RelayResolverMixedUnionFetchableTestFragment
          }
        }
      `,
      {isHovercraft: false},
    );

    return <UnionMemberComponent member={data.mixed_vehicle} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={emptyEnvironment}>
        <MixedVehicleRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // The resolver returns NonNodeStory (a server fetchable type), but no
  // NonNodeStory record exists in the store. The runtime should trigger a
  // fetch for the missing data via the fetch__NonNodeStory refetch query.
  expect(renderer?.toJSON()).toEqual('Loading...');
  expect(fetchFn).toHaveBeenCalled();
});

test('resolver returns server fetchable type already in store reads successfully', () => {
  function MixedVehicleRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedUnionFetchableTestInStoreQuery(
          $isHovercraft: Boolean!
        ) {
          mixed_vehicle(isHovercraft: $isHovercraft) @waterfall {
            ...RelayResolverMixedUnionFetchableTestFragment
          }
        }
      `,
      {isHovercraft: false},
    );

    return <UnionMemberComponent member={data.mixed_vehicle} />;
  }

  // When a resolver returns a union member that is a server/fetchable type,
  // the runtime should use the original store ID directly for these types
  // instead of trying to look up a model resolver.
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <MixedVehicleRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // NonNodeStory's tracking value comes from the pre-populated store record.
  expect(renderer?.toJSON()).toEqual('test-tracking');
});
