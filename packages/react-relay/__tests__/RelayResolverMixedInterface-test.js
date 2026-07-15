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

import type {RelayResolverMixedInterfaceTestWheelsFragment$key} from './__generated__/RelayResolverMixedInterfaceTestWheelsFragment.graphql';
import type {DataID} from 'relay-runtime';

const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment,
  useLazyLoadQuery,
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

// --- Relay Model Resolver: Car implements IVehicle ---
type CarModel = {
  __id: DataID,
};
/**
 * @RelayResolver Car implements IVehicle
 */
export function Car(id: DataID): CarModel {
  return {
    __id: id,
  };
}
/**
 * @RelayResolver Car.wheels: Int
 */
export function wheels(car: CarModel): number {
  return 4;
}
/**
 * @RelayResolver Query.car: Car
 */
export function car(): {id: DataID} {
  return {id: 'car-1'};
}

/**
 * Returns a Car or Bicycle depending on the `isCar` argument.
 *
 * @RelayResolver Query.vehicle(isCar: Boolean!): IVehicle
 */
export function vehicle(args: {isCar: boolean}): {
  __typename: 'Car' | 'Bicycle',
  id: DataID,
} {
  if (args.isCar) {
    return {__typename: 'Car', id: 'car-1'};
  }
  return {__typename: 'Bicycle', id: 'bicycle-1'};
}

/**
 * Returns a list containing both a Car (model resolver type) and a Bicycle (server type).
 *
 * @RelayResolver Query.vehicles: [IVehicle]
 */
export function vehicles(): Array<{__typename: 'Car' | 'Bicycle', id: DataID}> {
  return [
    {__typename: 'Car', id: 'car-1'},
    {__typename: 'Bicycle', id: 'bicycle-1'},
  ];
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
    // Pre-populate the store with a Bicycle record (server-schema type).
    new RecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        bicycle: {__ref: 'bicycle-1'},
      },
      'bicycle-1': {
        __id: 'bicycle-1',
        __typename: 'Bicycle',
        wheels: 2,
      },
    }),
    {},
  );
  environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });
});

function VehicleWheelsComponent(props: {
  vehicle: ?RelayResolverMixedInterfaceTestWheelsFragment$key,
}) {
  const vehicle = useFragment(
    graphql`
      fragment RelayResolverMixedInterfaceTestWheelsFragment on IVehicle {
        wheels
      }
    `,
    props.vehicle,
  );
  return vehicle?.wheels;
}

test('should read wheels of a Bicycle (server-schema type) through interface fragment', () => {
  function BicycleWheelsRootComponent() {
    // bicycle is a server-schema field, so the query is a regular Query (not
    // ClientQuery). Use useLazyLoadQuery with store-only policy since the
    // data is pre-populated in the store.
    const data = useLazyLoadQuery(
      graphql`
        query RelayResolverMixedInterfaceTestBicycleQuery {
          bicycle {
            ...RelayResolverMixedInterfaceTestWheelsFragment
          }
        }
      `,
      {},
      {fetchPolicy: 'store-only'},
    );

    return <VehicleWheelsComponent vehicle={data.bicycle} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <BicycleWheelsRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // Bicycle's wheels value comes from the pre-populated store record.
  expect(renderer?.toJSON()).toEqual('2');
});

test('should read wheels of a Car (relay model resolver) through interface fragment', () => {
  function CarWheelsRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedInterfaceTestCarQuery {
          car {
            ...RelayResolverMixedInterfaceTestWheelsFragment
          }
        }
      `,
      {},
    );

    return <VehicleWheelsComponent vehicle={data.car} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <CarWheelsRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // Car's wheels value comes from the Car resolver defined above.
  expect(renderer?.toJSON()).toEqual('4');
});

test('should read wheels through IVehicle when resolver returns Car variant', () => {
  function VehicleRootComponent(props: {isCar: boolean}) {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedInterfaceTestVehicleCarQuery($isCar: Boolean!) {
          vehicle(isCar: $isCar) @waterfall {
            ...RelayResolverMixedInterfaceTestWheelsFragment
          }
        }
      `,
      {isCar: props.isCar},
    );

    return <VehicleWheelsComponent vehicle={data.vehicle} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <VehicleRootComponent isCar={true} />
      </EnvironmentWrapper>,
    );
  });
  // The resolver returns {__typename: 'Car', id: 'car-1'}, so the Car model
  // resolver provides wheels = 4.
  expect(renderer?.toJSON()).toEqual('4');
});

test('server-schema type not in store suspends and triggers a fetch', () => {
  // Create an environment with NO Bicycle record in the store.
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

  function VehicleRootComponent(props: {isCar: boolean}) {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedInterfaceTestVehicleBicycleQuery(
          $isCar: Boolean!
        ) {
          vehicle(isCar: $isCar) @waterfall {
            ...RelayResolverMixedInterfaceTestWheelsFragment
          }
        }
      `,
      {isCar: props.isCar},
    );

    return <VehicleWheelsComponent vehicle={data.vehicle} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={emptyEnvironment}>
        <VehicleRootComponent isCar={false} />
      </EnvironmentWrapper>,
    );
  });
  // The resolver returns Bicycle (a server type), but no Bicycle record
  // exists in the store. The runtime should trigger a fetch for the
  // missing data via the serverObjectOperation refetch query.
  expect(renderer?.toJSON()).toEqual('Loading...');
  expect(fetchFn).toHaveBeenCalled();
});

test('returning a server-schema type from a resolver typed as IVehicle succeeds', () => {
  function VehicleRootComponent(props: {isCar: boolean}) {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery(
          $isCar: Boolean!
        ) {
          vehicle(isCar: $isCar) @waterfall {
            ...RelayResolverMixedInterfaceTestWheelsFragment
          }
        }
      `,
      {isCar: props.isCar},
    );

    return <VehicleWheelsComponent vehicle={data.vehicle} />;
  }

  // When a resolver returns an interface, server/CSE types are not in the
  // generated `modelResolvers` map. The runtime should use the original store
  // ID directly for these types instead of throwing.
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <VehicleRootComponent isCar={false} />
      </EnvironmentWrapper>,
    );
  });
  // Bicycle's wheels value comes from the pre-populated store record.
  expect(renderer?.toJSON()).toEqual('2');
});

test('plural resolver returning mixed Car and Bicycle reads both correctly via the plural code path', () => {
  function VehiclesRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverMixedInterfaceTestVehiclesQuery {
          vehicles @waterfall {
            ...RelayResolverMixedInterfaceTestWheelsFragment
          }
        }
      `,
      {},
    );

    if (data.vehicles == null) {
      return null;
    }
    // Render each item in the list. The plural code path in RelayReader is
    // exercised here — it maps over the array returned by the resolver and
    // handles each concrete type (model resolver vs server type) separately.
    return data.vehicles.map((vehicle, i) => (
      <VehicleWheelsComponent key={i} vehicle={vehicle} />
    ));
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <VehiclesRootComponent />
      </EnvironmentWrapper>,
    );
  });
  // Car (index 0) has wheels = 4 from the Car model resolver.
  // Bicycle (index 1) has wheels = 2 from the pre-populated store record.
  expect(renderer?.toJSON()).toEqual(['4', '2']);
});
