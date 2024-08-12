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
import type {RelayResolverInterfaceTestWeakAnimalColorFragment$key} from './__generated__/RelayResolverInterfaceTestWeakAnimalColorFragment.graphql';

const React = require('react');
const {useFragment} = require('react-relay');
const {RelayEnvironmentProvider, useClientQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RecordSource} = require('relay-runtime');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore.js');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
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
  store = new LiveResolverStore(
    new RecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        chicken: {__ref: 'greeneggsandham'},
      },
      greeneggsandham: {
        __id: 'greeneggsandham',
        __typename: 'Chicken',
        legs: '2',
        greeting: 'Hello, greeneggsandham!',
      },
    }),
    {},
  );
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <CatLegsRootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('4');
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <FishLegsRootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('0');
});

test('should read the legs of a chicken (client schema extension type)', () => {
  function ChickenLegsRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverInterfaceTestChickenLegsQuery {
          chicken {
            ...RelayResolverInterfaceTestAnimalLegsFragment
          }
        }
      `,
      {},
    );

    return <AnimalLegsComponent animal={data.chicken} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <ChickenLegsRootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('2');
});

function WeakAnimalColorFragmentComponent(props: {
  animal: ?RelayResolverInterfaceTestWeakAnimalColorFragment$key,
}) {
  const animal = useFragment(
    graphql`
      fragment RelayResolverInterfaceTestWeakAnimalColorFragment on IWeakAnimal {
        color
      }
    `,
    props.animal,
  );
  return animal?.color;
}

test('should read the color of a red octopus (weak model type)', () => {
  function RedOctopusColorRootComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverInterfaceTestRedOctopusColorQuery {
          red_octopus {
            ...RelayResolverInterfaceTestWeakAnimalColorFragment
          }
        }
      `,
      {},
    );

    return <WeakAnimalColorFragmentComponent animal={data.red_octopus} />;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <RedOctopusColorRootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('red');
});

function AnimalGreetingQueryComponent(props: {
  request: {ofType: string, returnValidID: boolean},
}) {
  const data = useClientQuery(
    graphql`
      query RelayResolverInterfaceTestAnimalGreetingQuery(
        $request: AnimalRequest!
      ) {
        animal(request: $request) {
          greeting
        }
      }
    `,
    {request: props.request},
  );
  if (data.animal == null) {
    return 'NULL';
  }
  return data.animal.greeting;
}

function WeakAnimalGreetingQueryComponent(props: {request: {ofType: string}}) {
  const data = useClientQuery(
    graphql`
      query RelayResolverInterfaceTestWeakAnimalGreetingQuery(
        $request: WeakAnimalRequest!
      ) {
        weak_animal(request: $request) {
          greeting
        }
      }
    `,
    {request: props.request},
  );
  if (data.weak_animal == null) {
    return 'NULL';
  }
  return data.weak_animal.greeting;
}

describe.each([
  {
    inputAnimalType: 'Fish',
    id: '12redblue',
  },
  {
    inputAnimalType: 'Cat',
    id: '1234567890',
  },
])(
  'resolvers can read resolver on an interface where all implementors are strong model types: %s',
  ({inputAnimalType, id}) => {
    test(`should read the greeting of a ${inputAnimalType}`, () => {
      let animalRenderer;
      TestRenderer.act(() => {
        animalRenderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <AnimalGreetingQueryComponent
              request={{ofType: inputAnimalType, returnValidID: true}}
            />
          </EnvironmentWrapper>,
        );
      });
      expect(animalRenderer?.toJSON()).toEqual(`Hello, ${id}!`);
    });

    test(`should return null for nonexistent ${inputAnimalType}`, () => {
      let nullRenderer;
      TestRenderer.act(() => {
        nullRenderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <AnimalGreetingQueryComponent
              request={{ofType: inputAnimalType, returnValidID: false}} // This should trigger a `null` value.
            />
          </EnvironmentWrapper>,
        );
      });
      expect(nullRenderer?.toJSON()).toEqual('NULL');
    });
  },
);

describe.each([
  {
    inputAnimalType: 'RedOctopus',
    name: 'Shiny',
  },
  {
    inputAnimalType: 'PurpleOctopus',
    name: 'Glowing',
  },
])(
  'resolvers can read resolver on an interface where all implementors are weak model types: %s',
  ({inputAnimalType, name}) => {
    test(`should read the greeting of a ${inputAnimalType}`, () => {
      let animalRenderer;
      TestRenderer.act(() => {
        animalRenderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <WeakAnimalGreetingQueryComponent
              request={{ofType: inputAnimalType}}
            />
          </EnvironmentWrapper>,
        );
      });
      expect(animalRenderer?.toJSON()).toEqual(`Hello, ${name}!`);
    });
  },
);

describe.each([
  {
    animalType: 'RedOctopus',
    color: 'red',
  },
  {
    animalType: 'PurpleOctopus',
    color: 'purple',
  },
])(
  'resolvers can return an interface where all implementors are weak model types: %s',
  ({animalType, color}) => {
    function WeakAnimalColorQueryComponent(props: {request: {ofType: string}}) {
      const data = useClientQuery(
        graphql`
          query RelayResolverInterfaceTestWeakAnimalColorQuery(
            $request: WeakAnimalRequest!
          ) {
            weak_animal(request: $request) {
              ...RelayResolverInterfaceTestWeakAnimalColorFragment
            }
          }
        `,
        {request: props.request},
      );
      return <WeakAnimalColorFragmentComponent animal={data.weak_animal} />;
    }

    test(`should read the color of a ${animalType}`, () => {
      let animalRenderer;
      TestRenderer.act(() => {
        animalRenderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <WeakAnimalColorQueryComponent request={{ofType: animalType}} />
          </EnvironmentWrapper>,
        );
      });
      expect(animalRenderer?.toJSON()).toEqual(color);
    });
  },
);

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

  let animalRenderer;
  TestRenderer.act(() => {
    animalRenderer = TestRenderer.create(
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
  });
  expect(animalRenderer?.toJSON()).toEqual(['0', 'NULL', '4', 'NULL']);
});

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

describe.each([
  {
    inputAnimalType: 'Fish',
    expectedLegs: '0',
  },
  {
    inputAnimalType: 'Cat',
    expectedLegs: '4',
  },
])(
  'resolvers can return an interface where all implementors are strong model types: %s',
  ({inputAnimalType, expectedLegs}) => {
    test(`should read the legs of a ${inputAnimalType}`, () => {
      let animalRenderer;
      TestRenderer.act(() => {
        animalRenderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <AnimalLegsQueryComponent
              request={{ofType: inputAnimalType, returnValidID: true}}
            />
          </EnvironmentWrapper>,
        );
      });
      expect(animalRenderer?.toJSON()).toEqual(expectedLegs);
    });

    test(`should return null for nonexistent ${inputAnimalType}`, () => {
      let nullRenderer;
      TestRenderer.act(() => {
        nullRenderer = TestRenderer.create(
          <EnvironmentWrapper environment={environment}>
            <AnimalLegsQueryComponent
              request={{ofType: inputAnimalType, returnValidID: false}} // This should trigger a `null` value.
            />
          </EnvironmentWrapper>,
        );
      });
      expect(nullRenderer?.toJSON()).toEqual('NULL');
    });
  },
);
