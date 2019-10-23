/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

'use strict';

const React = require('react');
const {useMemo, useRef, useState} = React;
const TestRenderer = require('react-test-renderer');

const useFragmentNodesOriginal = require('../useFragmentNodes');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  createOperationDescriptor,
} = require('relay-runtime');

import type {OperationDescriptor} from 'relay-runtime';

function assertYieldsWereCleared(_scheduler) {
  const actualYields = _scheduler.unstable_clearYields();
  if (actualYields.length !== 0) {
    throw new Error(
      'Log of yielded values is not empty. ' +
        'Call expect(Scheduler).toHaveYielded(...) first.',
    );
  }
}

function expectSchedulerToFlushAndYield(expectedYields) {
  TestRenderer.act(() => {
    const Scheduler = require('scheduler');
    assertYieldsWereCleared(Scheduler);
    Scheduler.unstable_flushAllWithoutAsserting();
    const actualYields = Scheduler.unstable_clearYields();
    expect(actualYields).toEqual(expectedYields);
  });
}

function expectSchedulerToFlushAndYieldThrough(expectedYields) {
  TestRenderer.act(() => {
    const Scheduler = require('scheduler');
    assertYieldsWereCleared(Scheduler);
    Scheduler.unstable_flushNumberOfYields(expectedYields.length);
    const actualYields = Scheduler.unstable_clearYields();
    expect(actualYields).toEqual(expectedYields);
  });
}

let environment;
let createMockEnvironment;
let disableStoreUpdates;
let enableStoreUpdates;
let generateAndCompile;
let gqlSingularQuery;
let gqlSingularFragment;
let gqlPluralQuery;
let gqlPluralFragment;
let singularQuery;
let pluralQuery;
let singularVariables;
let pluralVariables;
let setEnvironment;
let setSingularOwner;
let setSingularFooScalar;
let setSingularFooObject;
let renderSingularFragment;
let renderPluralFragment;
let forceSingularUpdate;
let renderSpy;
let SingularRenderer;
let PluralRenderer;

function resetRenderMock() {
  renderSpy.mockClear();
}

function useFragmentNodes(fragmentNodes, fragmentRefs) {
  const result = useFragmentNodesOriginal(
    fragmentNodes,
    fragmentRefs,
    'TestDisplayName',
  );
  const {data, shouldUpdateGeneration} = result;
  disableStoreUpdates = result.disableStoreUpdates;
  enableStoreUpdates = result.enableStoreUpdates;

  const prevShouldUpdateGeneration = useRef(null);
  let shouldUpdate = false;
  if (prevShouldUpdateGeneration.current !== shouldUpdateGeneration) {
    shouldUpdate = true;
    prevShouldUpdateGeneration.current = shouldUpdateGeneration;
  }

  renderSpy(data, shouldUpdate);
  return [data, shouldUpdate];
}

function assertCall(key, expected, idx) {
  const actualData = renderSpy.mock.calls[idx][0];
  const actualShouldUpdate = renderSpy.mock.calls[idx][1];

  expect(actualData[key]).toEqual(expected.data[key]);
  expect(actualShouldUpdate).toEqual(expected.shouldUpdate);
}

function assertFragmentResults(
  key,
  expectedCalls: $ReadOnlyArray<{|data: $FlowFixMe, shouldUpdate: boolean|}>,
) {
  // This ensures that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderSpy).toBeCalledTimes(expectedCalls.length);
  expectedCalls.forEach((expected, idx) => assertCall(key, expected, idx));
  renderSpy.mockClear();
}

function expectSingularFragmentResults(expectedCalls) {
  assertFragmentResults('user', expectedCalls);
}

function expectPluralFragmentResults(expectedCalls) {
  assertFragmentResults('users', expectedCalls);
}

function createFragmentRef(id, owner) {
  return {
    [ID_KEY]: id,
    [FRAGMENTS_KEY]: {
      NestedUserFragment: {},
    },
    [FRAGMENT_OWNER_KEY]: owner.request,
  };
}

beforeEach(() => {
  // Set up mocks
  jest.resetModules();
  jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
  jest.mock('warning');
  jest.mock('scheduler', () => {
    return jest.requireActual('scheduler/unstable_mock');
  });
  jest.mock('fbjs/lib/ExecutionEnvironment', () => ({
    canUseDOM: () => true,
  }));
  renderSpy = jest.fn();

  ({
    createMockEnvironment,
    generateAndCompile,
  } = require('relay-test-utils-internal'));

  // Set up environment and base data
  environment = createMockEnvironment();
  const generated = generateAndCompile(`
    fragment NestedUserFragment on User {
      username
    }

    fragment UserFragment on User  {
      id
      name
      profile_picture(scale: $scale) {
        uri
      }
      ...NestedUserFragment
    }

    fragment UsersFragment on User @relay(plural: true) {
      id
      name
      profile_picture(scale: $scale) {
        uri
      }
      ...NestedUserFragment
    }

    query UsersQuery($ids: [ID!]!, $scale: Int!) {
      nodes(ids: $ids) {
        ...UsersFragment
      }
    }

    query UserQuery($id: ID!, $scale: Int!) {
      node(id: $id) {
        ...UserFragment
      }
    }
  `);
  singularVariables = {id: '1', scale: 16};
  pluralVariables = {ids: ['1', '2'], scale: 16};
  gqlSingularQuery = generated.UserQuery;
  gqlSingularFragment = generated.UserFragment;
  gqlPluralQuery = generated.UsersQuery;
  gqlPluralFragment = generated.UsersFragment;
  singularQuery = createOperationDescriptor(
    gqlSingularQuery,
    singularVariables,
  );
  pluralQuery = createOperationDescriptor(gqlPluralQuery, pluralVariables);
  environment.commitPayload(singularQuery, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice',
      username: 'useralice',
      profile_picture: null,
    },
  });
  environment.commitPayload(pluralQuery, {
    nodes: [
      {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        username: 'useralice',
        profile_picture: null,
      },
      {
        __typename: 'User',
        id: '2',
        name: 'Bob',
        username: 'userbob',
        profile_picture: null,
      },
    ],
  });

  // Set up renderers
  SingularRenderer = props => null;
  PluralRenderer = props => null;

  const SingularContainer = (props: {
    userRef?: {},
    fooScalar?: boolean,
    fooObject?: {},
    owner: OperationDescriptor,
  }) => {
    // We need a render a component to run a Hook
    const [owner, _setOwner] = useState<OperationDescriptor>(props.owner);
    const [, _setCount] = useState(0);
    const [{fooScalar}, _setFooScalar] = useState({
      fooScalar: props.fooScalar,
    });
    const [{fooObject}, _setFooObject] = useState({
      fooObject: props.fooObject,
    });
    const userRef = props.hasOwnProperty('userRef')
      ? props.userRef
      : {
          [ID_KEY]: owner.request.variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
          [FRAGMENT_OWNER_KEY]: owner.request,
        };

    setSingularOwner = _setOwner;
    setSingularFooScalar = _setFooScalar;
    setSingularFooObject = _setFooObject;
    forceSingularUpdate = () => _setCount(count => count + 1);

    let fragmentRefs = {
      user: userRef,
    };

    // Pass extra props resembling component props
    if (fooScalar != null) {
      fragmentRefs = {...fragmentRefs, fooScalar};
    }
    if (fooObject != null) {
      fragmentRefs = {...fragmentRefs, fooObject};
    }
    const [userData] = useFragmentNodes(
      {user: gqlSingularFragment},
      fragmentRefs,
    );
    return <SingularRenderer user={userData.user} />;
  };

  const PluralContainer = (props: {usersRef?: {}, owner: $FlowFixMe}) => {
    // We need a render a component to run a Hook
    const owner = props.owner;
    const usersRef = props.hasOwnProperty('usersRef')
      ? props.usersRef
      : owner.request.variables.ids.map(id => ({
          [ID_KEY]: id,
          [FRAGMENTS_KEY]: {
            UsersFragment: {},
          },
          [FRAGMENT_OWNER_KEY]: owner.request,
        }));

    const [usersData] = useFragmentNodes(
      {users: gqlPluralFragment},
      {users: usersRef},
    );
    return <PluralRenderer users={usersData.users} />;
  };

  const ContextProvider = ({children}) => {
    const [env, _setEnv] = useState(environment);
    const relayContext = useMemo(() => ({environment: env}), [env]);

    setEnvironment = _setEnv;

    return (
      <ReactRelayContext.Provider value={relayContext}>
        {children}
      </ReactRelayContext.Provider>
    );
  };

  renderSingularFragment = (args?: {
    fooScalar?: boolean,
    fooObject?: {},
    isConcurrent?: boolean,
    owner?: $FlowFixMe,
    userRef?: $FlowFixMe,
  }) => {
    const {isConcurrent = false, ...props} = args ?? {};
    return TestRenderer.create(
      <React.Suspense fallback="Singular Fallback">
        <ContextProvider>
          <SingularContainer owner={singularQuery} {...props} />
        </ContextProvider>
      </React.Suspense>,
      {unstable_isConcurrent: isConcurrent},
    );
  };

  renderPluralFragment = (args?: {
    isConcurrent?: boolean,
    owner?: $FlowFixMe,
    usersRef?: $FlowFixMe,
  }) => {
    const {isConcurrent = false, ...props} = args ?? {};
    return TestRenderer.create(
      <React.Suspense fallback="Plural Fallback">
        <ContextProvider>
          <PluralContainer owner={pluralQuery} {...props} />
        </ContextProvider>
      </React.Suspense>,
      {unstable_isConcurrent: isConcurrent},
    );
  };
});

afterEach(() => {
  environment.mockClear();
  renderSpy.mockClear();
});

it('should render singular fragment without error when data is available', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should render singular fragment without error when ref is null', () => {
  renderSingularFragment({userRef: null});
  expectSingularFragmentResults([
    {
      data: {user: null},
      shouldUpdate: true,
    },
  ]);
});

it('should render singular fragment without error when ref is undefined', () => {
  renderSingularFragment({userRef: undefined});
  expectSingularFragmentResults([
    {
      data: {user: null},
      shouldUpdate: true,
    },
  ]);
});

it('should render plural fragment without error when data is available', () => {
  renderPluralFragment();
  expectPluralFragmentResults([
    {
      data: {
        users: [
          {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', pluralQuery),
          },
          {
            id: '2',
            name: 'Bob',
            profile_picture: null,
            ...createFragmentRef('2', pluralQuery),
          },
        ],
      },
      shouldUpdate: true,
    },
  ]);
});

it('should render plural fragment without error when plural field is empty', () => {
  renderPluralFragment({usersRef: []});
  expectPluralFragmentResults([
    {
      data: {users: []},
      shouldUpdate: true,
    },
  ]);
});

it('should update when fragment data changes', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  TestRenderer.act(() => {
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        // Update name
        name: 'Alice in Wonderland',
      },
    });
  });
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          // Assert that name is updated
          name: 'Alice in Wonderland',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should re-read and resubscribe to fragment when environment changes', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  const newEnvironment = createMockEnvironment();
  newEnvironment.commitPayload(singularQuery, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice in a different env',
      profile_picture: null,
    },
  });

  TestRenderer.act(() => {
    setEnvironment(newEnvironment);
  });

  const expectedUser = {
    id: '1',
    name: 'Alice in a different env',
    profile_picture: null,
    ...createFragmentRef('1', singularQuery),
  };
  expectSingularFragmentResults([
    {data: {user: expectedUser}, shouldUpdate: true},
    {data: {user: expectedUser}, shouldUpdate: false},
  ]);

  TestRenderer.act(() => {
    newEnvironment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        // Update name
        name: 'Alice in Wonderland',
      },
    });
  });
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          // Assert that name is updated
          name: 'Alice in Wonderland',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should re-read and resubscribe to fragment when fragment pointers change', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  const newVariables = {...singularVariables, id: '200'};
  const newQuery = createOperationDescriptor(gqlSingularQuery, newVariables);
  environment.commitPayload(newQuery, {
    node: {
      __typename: 'User',
      id: '200',
      name: 'Foo',
      profile_picture: null,
      username: 'userfoo',
    },
  });

  TestRenderer.act(() => {
    setSingularOwner(newQuery);
  });

  const expectedUser = {
    // Assert updated data
    id: '200',
    name: 'Foo',
    profile_picture: null,
    // Assert that ref now points to newQuery owner
    ...createFragmentRef('200', newQuery),
  };
  expectSingularFragmentResults([
    {data: {user: expectedUser}, shouldUpdate: true},
    {data: {user: expectedUser}, shouldUpdate: false},
  ]);

  TestRenderer.act(() => {
    environment.commitPayload(newQuery, {
      node: {
        __typename: 'User',
        id: '200',
        // Update name
        name: 'Foo Updated',
      },
    });
  });
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '200',
          // Assert that name is updated
          name: 'Foo Updated',
          profile_picture: null,
          ...createFragmentRef('200', newQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should render correct data when changing fragment refs multiple times', () => {
  // Render component with data for ID 1
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  // Update fragment refs to render data for ID 200
  const newVariables = {...singularVariables, id: '200'};
  const newQuery = createOperationDescriptor(gqlSingularQuery, newVariables);
  environment.commitPayload(newQuery, {
    node: {
      __typename: 'User',
      id: '200',
      name: 'Foo',
      username: 'userfoo',
      profile_picture: null,
    },
  });

  TestRenderer.act(() => {
    setSingularOwner(newQuery);
  });

  let expectedUser = {
    // Assert updated data
    id: '200',
    name: 'Foo',
    profile_picture: null,
    // Assert that ref now points to newQuery owner
    ...createFragmentRef('200', newQuery),
  };
  expectSingularFragmentResults([
    {data: {user: expectedUser}, shouldUpdate: true},
    {data: {user: expectedUser}, shouldUpdate: false},
  ]);

  // Udpate data for ID 1
  environment.commitPayload(singularQuery, {
    node: {
      __typename: 'User',
      id: '1',
      // Update name
      name: 'Alice in Wonderland',
    },
  });

  // Switch back to rendering data for ID 1
  TestRenderer.act(() => {
    setSingularOwner(singularQuery);
  });

  // We expect to see the latest data
  expectedUser = {
    // Assert updated data
    id: '1',
    name: 'Alice in Wonderland',
    profile_picture: null,
    // Assert that ref points to original singularQuery owner
    ...createFragmentRef('1', singularQuery),
  };
  expectSingularFragmentResults([
    {data: {user: expectedUser}, shouldUpdate: true},
    {data: {user: expectedUser}, shouldUpdate: false},
  ]);

  // Assert it correctly subscribes to new data
  TestRenderer.act(() => {
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        // Update name
        name: 'Alice Updated',
      },
    });
  });
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          // Assert anme is updated
          name: 'Alice Updated',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should ignore updates to initially rendered data when fragment pointers change', () => {
  const Scheduler = require('scheduler');
  const YieldChild = props => {
    // NOTE the unstable_yield method will move to the static renderer.
    // When React sync runs we need to update this.
    Scheduler.unstable_yieldValue(props.children);
    return props.children;
  };
  const YieldyUserComponent = ({user}) => (
    <>
      <YieldChild>Hey user,</YieldChild>
      <YieldChild>{user.name}</YieldChild>
      <YieldChild>with id {user.id}!</YieldChild>
    </>
  );

  // Assert initial render
  SingularRenderer = YieldyUserComponent;
  renderSingularFragment({isConcurrent: true});
  expectSchedulerToFlushAndYield([
    'Hey user,',
    'Alice',
    ['with id ', '1', '!'],
  ]);
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  const newVariables = {...singularVariables, id: '200'};
  const newQuery = createOperationDescriptor(gqlSingularQuery, newVariables);
  TestRenderer.act(() => {
    environment.commitPayload(newQuery, {
      node: {
        __typename: 'User',
        id: '200',
        name: 'Foo',
        username: 'userfoo',
        profile_picture: null,
      },
    });
  });

  TestRenderer.act(() => {
    // Pass new fragment ref that points to new ID 200
    setSingularOwner(newQuery);

    // Flush some of the changes, but don't commit
    expectSchedulerToFlushAndYieldThrough(['Hey user,', 'Foo']);

    // In Concurrent mode component gets rendered even if not committed
    // so we reset our mock here
    resetRenderMock();

    // Trigger an update for initially rendered data while second
    // render is in progress
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice in Wonderland',
      },
    });

    // Assert the component renders the data from newQuery/newVariables,
    // ignoring any updates triggered while render was in progress
    expectSchedulerToFlushAndYield([
      ['with id ', '200', '!'],
      'Hey user,',
      'Foo',
      ['with id ', '200', '!'],
    ]);
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '200',
            name: 'Foo',
            profile_picture: null,
            ...createFragmentRef('200', newQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);

    // Update latest rendered data
    environment.commitPayload(newQuery, {
      node: {
        __typename: 'User',
        id: '200',
        // Update name
        name: 'Foo Updated',
      },
    });
    expectSchedulerToFlushAndYield([
      'Hey user,',
      'Foo Updated',
      ['with id ', '200', '!'],
    ]);
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '200',
            // Assert name is updated
            name: 'Foo Updated',
            profile_picture: null,
            ...createFragmentRef('200', newQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);
  });
});

it('should re-read and resubscribe to fragment when variables change', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  const newVariables = {...singularVariables, id: '1', scale: 32};
  const newQuery = createOperationDescriptor(gqlSingularQuery, newVariables);
  environment.commitPayload(newQuery, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice',
      profile_picture: {
        uri: 'uri32',
      },
      username: 'useralice',
    },
  });

  TestRenderer.act(() => {
    setSingularOwner(newQuery);
  });

  const expectedUser = {
    id: '1',
    name: 'Alice',
    profile_picture: {
      // Asset updated uri
      uri: 'uri32',
    },
    // Assert that ref now points to newQuery owner
    ...createFragmentRef('1', newQuery),
  };
  expectSingularFragmentResults([
    {data: {user: expectedUser}, shouldUpdate: true},
    {data: {user: expectedUser}, shouldUpdate: false},
  ]);

  TestRenderer.act(() => {
    environment.commitPayload(newQuery, {
      node: {
        __typename: 'User',
        id: '1',
        // Update name
        name: 'Alice in Wonderland',
      },
    });
  });
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          // Assert that name is updated
          name: 'Alice in Wonderland',
          profile_picture: {
            uri: 'uri32',
          },
          ...createFragmentRef('1', newQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should ignore updates to initially rendered data when variables change', () => {
  const Scheduler = require('scheduler');
  const YieldChild = props => {
    Scheduler.unstable_yieldValue(props.children);
    return props.children;
  };
  const YieldyUserComponent = ({user}) => (
    <>
      <YieldChild>Hey user,</YieldChild>
      <YieldChild>{user.profile_picture?.uri ?? 'no uri'}</YieldChild>
      <YieldChild>with id {user.id}!</YieldChild>
    </>
  );

  // Assert initial render
  SingularRenderer = YieldyUserComponent;
  renderSingularFragment({isConcurrent: true});
  expectSchedulerToFlushAndYield([
    'Hey user,',
    'no uri',
    ['with id ', '1', '!'],
  ]);
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  const newVariables = {...singularVariables, id: '1', scale: 32};
  const newQuery = createOperationDescriptor(gqlSingularQuery, newVariables);
  TestRenderer.act(() => {
    environment.commitPayload(newQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        username: 'useralice',
        profile_picture: {
          uri: 'uri32',
        },
      },
    });
  });

  TestRenderer.act(() => {
    // Pass new fragment ref which contains newVariables
    setSingularOwner(newQuery);

    // Flush some of the changes, but don't commit
    expectSchedulerToFlushAndYieldThrough(['Hey user,', 'uri32']);

    // In Concurrent mode component gets rendered even if not committed
    // so we reset our mock here
    resetRenderMock();

    // Trigger an update for initially rendered data while second
    // render is in progress
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        // Update name
        name: 'Alice',
        // Update profile_picture value
        profile_picture: {
          uri: 'uri16',
        },
      },
    });

    // Assert the component renders the data from newQuery/newVariables,
    // ignoring any updates triggered while render was in progress
    expectSchedulerToFlushAndYield([
      ['with id ', '1', '!'],
      'Hey user,',
      'uri32',
      ['with id ', '1', '!'],
    ]);
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'uri32',
            },
            ...createFragmentRef('1', newQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);

    // Update latest rendered data
    environment.commitPayload(newQuery, {
      node: {
        __typename: 'User',
        id: '1',
        // Update name
        name: 'Alice latest update',
      },
    });
    expectSchedulerToFlushAndYield([
      'Hey user,',
      'uri32',
      ['with id ', '1', '!'],
    ]);
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            // Assert name is updated
            name: 'Alice latest update',
            profile_picture: {
              uri: 'uri32',
            },
            ...createFragmentRef('1', newQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);
  });
});

it('should NOT update if fragment refs dont change', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  // Force a re-render with the exact same fragment refs
  TestRenderer.act(() => {
    forceSingularUpdate();
  });

  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      // Assert that update to consuming component wont be triggered
      shouldUpdate: false,
    },
  ]);
});

it('should NOT update even if fragment ref changes but doesnt point to a different ID', () => {
  renderSingularFragment();
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  // Setting a new owner with the same query/variables will cause new
  // fragment refs that point to the same IDs to be passed
  const newOwner = createOperationDescriptor(
    gqlSingularQuery,
    singularVariables,
  );
  TestRenderer.act(() => {
    setSingularOwner(newOwner);
  });

  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      // Assert that update to consuming component wont be triggered
      shouldUpdate: false,
    },
  ]);
});

it('should NOT update if scalar props dont change', () => {
  renderSingularFragment({fooScalar: false});
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  // Re-render with same scalar value
  TestRenderer.act(() => {
    setSingularFooScalar({fooScalar: false});
  });

  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      // Assert that update to consuming component wont be triggered
      shouldUpdate: false,
    },
  ]);
});

it('should update if scalar props change', () => {
  renderSingularFragment({fooScalar: false});
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', singularQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  // Re-render with different scalar value
  TestRenderer.act(() => {
    setSingularFooScalar({fooScalar: true});
  });

  const expectedUser = {
    id: '1',
    name: 'Alice',
    profile_picture: null,
    ...createFragmentRef('1', singularQuery),
  };
  expectSingularFragmentResults([
    {
      data: {user: expectedUser},
      // Assert that consuming component knows it needs to update
      shouldUpdate: true,
    },
    {
      data: {user: expectedUser},
      shouldUpdate: false,
    },
  ]);
});

it('should update even if non-scalar props dont change', () => {
  const fooObject = {};
  const expectedUser = {
    id: '1',
    name: 'Alice',
    profile_picture: null,
    ...createFragmentRef('1', singularQuery),
  };
  renderSingularFragment({fooObject});
  expectSingularFragmentResults([
    {
      data: {user: expectedUser},
      shouldUpdate: true,
    },
  ]);

  // Re-render with the exact same non-scalar prop
  TestRenderer.act(() => {
    setSingularFooObject({fooObject});
  });

  expectSingularFragmentResults([
    {
      data: {
        user: expectedUser,
      },
      // Assert that consuming component knows it needs to update
      shouldUpdate: true,
    },
  ]);
});

it('should update if non-scalar props change', () => {
  const expectedUser = {
    id: '1',
    name: 'Alice',
    profile_picture: null,
    ...createFragmentRef('1', singularQuery),
  };
  renderSingularFragment({fooObject: {}});
  expectSingularFragmentResults([
    {
      data: {user: expectedUser},
      shouldUpdate: true,
    },
  ]);

  // Re-render with different non-scalar value
  TestRenderer.act(() => {
    setSingularFooObject({fooObject: {}});
  });

  expectSingularFragmentResults([
    {
      data: {user: expectedUser},
      // Assert that consuming component knows it needs to update
      shouldUpdate: true,
    },
    {
      data: {user: expectedUser},
      shouldUpdate: true,
    },
  ]);
});

it('should throw a promise if if data is missing for fragment and request is in flight', () => {
  // This prevents console.error output in the test, which is expected
  jest.spyOn(console, 'error').mockImplementationOnce(() => {});
  jest
    .spyOn(require('relay-runtime').__internal, 'getPromiseForRequestInFlight')
    .mockImplementationOnce(() => Promise.resolve());

  const missingDataVariables = {...singularVariables, id: '4'};
  const missingDataQuery = createOperationDescriptor(
    gqlSingularQuery,
    missingDataVariables,
  );
  // Commit a payload with name and profile_picture are missing
  environment.commitPayload(missingDataQuery, {
    node: {
      __typename: 'User',
      id: '4',
    },
  });

  const renderer = renderSingularFragment({owner: missingDataQuery});
  expect(renderer.toJSON()).toEqual('Singular Fallback');
});

it('should throw an error if fragment reference is non-null but read-out data is null', () => {
  // Clearing the data in the environment will make it so the fragment ref
  // we pass to useFragmentNodes points to data that does not exist; we expect
  // an error to be thrown in this case.
  (environment.getStore().getSource(): $FlowFixMe).clear();
  const warning = require('warning');
  // $FlowFixMe
  warning.mockClear();

  renderSingularFragment();
  expect(warning).toBeCalledTimes(2);
  // $FlowFixMe
  const [, warningMessage] = warning.mock.calls[1];
  expect(
    warningMessage.startsWith(
      'Relay: Expected to have been able to read non-null data for fragment `%s`',
    ),
  ).toEqual(true);
  // $FlowFixMe
  warning.mockClear();
});

it('should warn if data is missing and there are no pending requests', () => {
  // This prevents console.error output in the test, which is expected
  jest.spyOn(console, 'error').mockImplementationOnce(() => {});
  const warning = require('warning');

  const missingDataVariables = {...singularVariables, id: '4'};
  const missingDataQuery = createOperationDescriptor(
    gqlSingularQuery,
    missingDataVariables,
  );

  // Commit a payload where name is missing.
  environment.commitPayload(missingDataQuery, {
    node: {
      __typename: 'User',
      id: '4',
    },
  });

  // $FlowFixMe
  warning.mockClear();
  TestRenderer.act(() => {
    renderSingularFragment({owner: missingDataQuery});
  });

  // Assert warning message
  expect(warning).toHaveBeenCalledTimes(1);
  // $FlowFixMe
  const [, warningMessage, ...warningArgs] = warning.mock.calls[0];
  expect(
    warningMessage.startsWith(
      'Relay: Tried reading fragment `%s` ' +
        'declared in `%s`, but it has ' +
        'missing data and its parent query `%s` is not being fetched.',
    ),
  ).toEqual(true);
  expect(warningArgs).toEqual([
    'UserFragment',
    'TestDisplayName',
    'UserQuery',
    'UserQuery',
  ]);

  // Assert render output with missing data
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '4',
          name: undefined,
          profile_picture: undefined,
          ...createFragmentRef('4', missingDataQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

it('should subscribe for updates even if there is missing data', () => {
  // This prevents console.error output in the test, which is expected
  jest.spyOn(console, 'error').mockImplementationOnce(() => {});
  const warning = require('warning');

  const missingDataVariables = {...singularVariables, id: '4'};
  const missingDataQuery = createOperationDescriptor(
    gqlSingularQuery,
    missingDataVariables,
  );

  // Commit a payload where name is missing.
  environment.commitPayload(missingDataQuery, {
    node: {
      __typename: 'User',
      id: '4',
    },
  });

  // $FlowFixMe
  warning.mockClear();
  renderSingularFragment({owner: missingDataQuery});

  // Assert render output with missing data
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '4',
          name: undefined,
          profile_picture: undefined,
          ...createFragmentRef('4', missingDataQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);

  // Commit a payload with updated name.
  environment.commitPayload(missingDataQuery, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Mark',
    },
  });

  // Assert render output with updated data
  expectSingularFragmentResults([
    {
      data: {
        user: {
          id: '4',
          name: 'Mark',
          profile_picture: undefined,
          ...createFragmentRef('4', missingDataQuery),
        },
      },
      shouldUpdate: true,
    },
  ]);
});

describe('disableStoreUpdates', () => {
  it('does not listen to store updates after disableStoreUpdates is called', () => {
    renderSingularFragment();
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);

    disableStoreUpdates();

    // Update data in the store
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice updated',
      },
    });

    // Assert that component did not re-render
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(0);
  });

  it('re-renders with latest data after re-enabling updates, if any updates were missed', () => {
    renderSingularFragment();
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);

    disableStoreUpdates();

    // Update data in the store
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice updated',
      },
    });

    // Assert that component did not re-render while updates are disabled
    TestRenderer.act(() => {
      jest.runAllImmediates();
    });
    expect(renderSpy).toBeCalledTimes(0);

    TestRenderer.act(() => {
      enableStoreUpdates();
    });

    // Assert that component re-renders with latest updated data
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            name: 'Alice updated',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);
  });

  it('does not re-render after re-enabling updates, if no updates were missed', () => {
    renderSingularFragment();
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);

    disableStoreUpdates();
    expect(renderSpy).toBeCalledTimes(0);

    enableStoreUpdates();

    // Assert that component did not re-render after enabling updates
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(0);
  });

  it('does not re-render after re-enabling updates, if data did not change', () => {
    renderSingularFragment();
    expectSingularFragmentResults([
      {
        data: {
          user: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
        shouldUpdate: true,
      },
    ]);

    disableStoreUpdates();

    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });

    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(0);

    enableStoreUpdates();

    // Assert that component did not re-render after enabling updates
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(0);
  });
});
