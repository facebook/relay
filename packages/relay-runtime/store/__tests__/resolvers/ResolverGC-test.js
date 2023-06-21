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
import type {GraphQLResponse} from '../../../network/RelayNetworkTypes';
import type {ConcreteRequest} from '../../../util/RelayConcreteNode';
import type {
  DataID,
  OperationType,
  VariablesOf,
} from '../../../util/RelayRuntimeTypes';
import type {LogEvent} from '../../RelayStoreTypes';
import type {IEnvironment, Snapshot} from '../../RelayStoreTypes';

const {HOUSE_ORDER} = require('./AstrologicalSignUtils');
const {GLOBAL_STORE} = require('./ExampleExternalStateStore');
const invariant = require('invariant');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleExternalStateStore');
const {
  counter_no_fragment: counterNoFragmentResolver,
} = require('relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment');
const {
  counter: counterResolver,
} = require('relay-runtime/store/__tests__/resolvers/LiveCounterResolver');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore.js');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
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
  resetStore();
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
});

test('Live Resolver without fragment', async () => {
  const initialCallCount = counterNoFragmentResolver.callCount;
  await testResolverGC({
    query: graphql`
      query ResolverGCTestWithoutFragmentQuery {
        counter_no_fragment
      }
    `,
    variables: {},
    payloads: [{data: {}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(counterNoFragmentResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter_no_fragment: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter_no_fragment',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(counterNoFragmentResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter_no_fragment: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter_no_fragment',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(counterNoFragmentResolver.callCount - initialCallCount).toBe(2);
      expect(snapshot.data).toEqual({counter_no_fragment: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter_no_fragment',
      ]);
    },
  });
});

test('Live Resolver _with_ root fragment', async () => {
  const initialCallCount = counterResolver.callCount;
  await testResolverGC({
    query: graphql`
      query ResolverGCTestLiveWithRootFragmentQuery {
        counter
      }
    `,
    variables: {},
    payloads: [{data: {me: {__typename: 'User', id: '1'}}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(counterResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(counterResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(counterResolver.callCount - initialCallCount).toBe(2);
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({counter: undefined});
      expect(recordIdsInStore).toEqual(['client:root', 'client:root:counter']);
    },
  });
});

test('Regular resolver with fragment reads live resovler with fragment', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestRegularReadsLiveQuery {
        counter_plus_one
      }
    `,
    variables: {},
    payloads: [{data: {me: {__typename: 'User', id: '1'}}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({counter_plus_one: 1});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
        'client:root:counter_plus_one',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({counter_plus_one: 1});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
        'client:root:counter_plus_one',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({counter_plus_one: undefined});
      expect(snapshot.missingRequiredFields).toEqual({
        action: 'THROW',
        field: {owner: 'CounterPlusOneResolver', path: 'counter'},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter',
        'client:root:counter_plus_one',
      ]);
    },
  });
});

test('Non-live Resolver with fragment', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestNonLiveWithFragmentQuery {
        me {
          greeting
        }
      }
    `,
    variables: {},
    payloads: [{data: {me: {__typename: 'User', id: '1', name: 'Elizabeth'}}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({me: {greeting: 'Hello, Elizabeth!'}});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:greeting',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({me: {greeting: 'Hello, Elizabeth!'}});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:greeting',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

test('Non-live Resolver with no fragment and static arguments', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestNoFragmentStaticArgsQuery {
        hello(world: "Planet")
      }
    `,
    variables: {},
    payloads: [{data: {}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
  });
});

test('Non-live Resolver with no fragment and dynamic arguments', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestNoFragmentDynamicArgsQuery($world: String!) {
        hello(world: $world)
      }
    `,
    variables: {world: 'Planet'},
    payloads: [{data: {}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
  });
});

test('Resolver reading a client-edge to a server type', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToServerQuery {
        me {
          name
          client_edge @waterfall {
            id
            name
            nearest_neighbor {
              id
              name
            }
          }
        }
      }
    `,
    variables: {},
    payloads: [
      {data: {me: {__typename: 'User', id: '1', name: 'Elizabeth'}}},
      {
        data: {
          node: {
            __typename: 'User',
            id: '1337',
            name: 'Chelsea',
            nearest_neighbor: {
              id: '1234',
              name: 'Cathy',
            },
          },
        },
      },
    ],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {
          name: 'Elizabeth',
          client_edge: {
            id: '1337',
            name: 'Chelsea',
            nearest_neighbor: {id: '1234', name: 'Cathy'},
          },
        },
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:client_edge',
        '1337',
        '1234',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {
          name: 'Elizabeth',
          client_edge: {
            id: '1337',
            name: 'Chelsea',
            nearest_neighbor: {id: '1234', name: 'Cathy'},
          },
        },
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:client_edge',
        '1337',
        '1234',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

test('Resolver reading a client-edge to a server type (recursive)', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToServerRecursiveQuery {
        me {
          name
          client_edge @waterfall {
            id
            name
            another_client_edge @waterfall {
              id
              name
            }
          }
        }
      }
    `,
    variables: {},
    payloads: [
      {data: {me: {__typename: 'User', id: '1', name: 'Elizabeth'}}},
      {
        data: {
          node: {
            __typename: 'User',
            id: '1337',
            name: 'Chelsea',
          },
        },
      },
      {
        data: {
          node: {
            __typename: 'User',
            id: '1338',
            name: 'Jordan',
          },
        },
      },
    ],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {
          name: 'Elizabeth',
          client_edge: {
            id: '1337',
            name: 'Chelsea',
            another_client_edge: {id: '1338', name: 'Jordan'},
          },
        },
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:client_edge',
        '1337',
        'client:1337:another_client_edge',
        '1338',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {
          name: 'Elizabeth',
          client_edge: {
            id: '1337',
            name: 'Chelsea',
            another_client_edge: {id: '1338', name: 'Jordan'},
          },
        },
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:client_edge',
        '1337',
        'client:1337:another_client_edge',
        '1338',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

test('Resolver reading a client-edge to a client type', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToClientQuery {
        me {
          astrological_sign {
            name
          }
        }
      }
    `,
    variables: {},
    payloads: [
      {
        data: {
          me: {__typename: 'User', id: '1', birthdate: {month: 3, day: 11}},
        },
      },
    ],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
      ]);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {astrological_sign: {name: 'Pisces'}},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
        'client:1:astrological_sign',
        'client:AstrologicalSign:Pisces',
        'client:AstrologicalSign:Pisces:self',
        'client:AstrologicalSign:Pisces:name',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {astrological_sign: {name: 'Pisces'}},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
        'client:1:astrological_sign',
        'client:AstrologicalSign:Pisces',
        'client:AstrologicalSign:Pisces:self',
        'client:AstrologicalSign:Pisces:name',
      ]);
    },

    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

test('Resolver reading a client-edge to a client type (resolver marked dirty)', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToClientDirtyQuery {
        me {
          astrological_sign {
            name
          }
        }
      }
    `,
    variables: {},
    payloads: [
      {
        data: {
          me: {__typename: 'User', id: '1', birthdate: {month: 3, day: 11}},
        },
      },
    ],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
      ]);
    },
    afterLookup: (snapshot, recordIdsInStore, environment) => {
      expect(snapshot.data).toEqual({
        me: {astrological_sign: {name: 'Pisces'}},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
        'client:1:astrological_sign',
        'client:AstrologicalSign:Pisces',
        'client:AstrologicalSign:Pisces:self',
        'client:AstrologicalSign:Pisces:name',
      ]);

      /* Here we update the user to invalidate the astrological_sign resolver */
      environment.commitUpdate(store => {
        const user = store.get('1');
        invariant(user != null, 'Expected to find a user');
        user.setValue('some_value', 'some_field');
      });
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {astrological_sign: {name: 'Pisces'}},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
        'client:1:astrological_sign',
        'client:AstrologicalSign:Pisces',
        'client:AstrologicalSign:Pisces:self',
        'client:AstrologicalSign:Pisces:name',
      ]);
    },

    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

test('Resolver reading a client-edge to a client type (suspended)', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToClientSuspendedQuery {
        virgo_suspends_when_counter_is_odd {
          name
        }
        # Dummy server data
        me {
          __typename
        }
      }
    `,
    variables: {},
    payloads: [{data: {me: {__typename: 'User', id: '1'}}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
      /* Here we update the exteral state to cause `virgo_susepends_when_counter_is_odd` to suspend */
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.missingLiveResolverFields?.length).toBe(1);
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:virgo_suspends_when_counter_is_odd',
        // We don't have any of the Virgo records because they were not created.
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.missingLiveResolverFields?.length).toBe(1);
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:virgo_suspends_when_counter_is_odd',
        // We don't have any of the Virgo records because they were not created.
      ]);
    },

    afterFreedGC: recordIdsInStore => {
      // No assertions
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // No assertions
    },
  });
});

test('Resolver reading a plural client-edge to a client type', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToPluralClientQuery {
        all_astrological_signs {
          __id
        }
      }
    `,
    variables: {},
    payloads: [{data: {me: {id: '1', __typename: 'User'}}}],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root', '1']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        all_astrological_signs: HOUSE_ORDER.map(name => ({
          __id: `client:AstrologicalSign:${name}`,
        })),
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:all_astrological_signs',
        ...HOUSE_ORDER.map(name => `client:AstrologicalSign:${name}`),
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        all_astrological_signs: HOUSE_ORDER.map(name => ({
          __id: `client:AstrologicalSign:${name}`,
        })),
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:all_astrological_signs',
        ...HOUSE_ORDER.map(name => `client:AstrologicalSign:${name}`),
      ]);
    },

    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:all_astrological_signs',
      ]);
    },
  });
});

test('Resolver reading a client-edge to a client type (recursive)', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestResolverClientEdgeToClientRecursiveQuery {
        me {
          astrological_sign {
            name
            opposite {
              name
            }
          }
        }
      }
    `,
    variables: {},
    payloads: [
      {
        data: {
          me: {__typename: 'User', id: '1', birthdate: {month: 3, day: 11}},
        },
      },
    ],
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
      ]);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {astrological_sign: {name: 'Pisces', opposite: {name: 'Virgo'}}},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
        'client:1:astrological_sign',
        'client:AstrologicalSign:Pisces',
        'client:AstrologicalSign:Pisces:self',
        'client:AstrologicalSign:Pisces:name',
        'client:AstrologicalSign:Pisces:opposite',
        'client:AstrologicalSign:Virgo',
        'client:AstrologicalSign:Virgo:self',
        'client:AstrologicalSign:Virgo:name',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({
        me: {astrological_sign: {name: 'Pisces', opposite: {name: 'Virgo'}}},
      });

      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:birthdate',
        'client:1:astrological_sign',
        'client:AstrologicalSign:Pisces',
        'client:AstrologicalSign:Pisces:self',
        'client:AstrologicalSign:Pisces:name',
        'client:AstrologicalSign:Pisces:opposite',
        'client:AstrologicalSign:Virgo',
        'client:AstrologicalSign:Virgo:self',
        'client:AstrologicalSign:Virgo:name',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

type TestProps<T: OperationType> = {
  query: ConcreteRequest,
  variables: VariablesOf<T>,
  payloads: Array<GraphQLResponse>,
  beforeLookup: (recordIdsInStore: Array<DataID>) => void,
  afterLookup: (
    snapshot: Snapshot,
    recordIdsInStore: Array<DataID>,
    environment: IEnvironment,
  ) => void,
  afterRetainedGC: (
    snapshot: Snapshot,
    recordIdsInStore: Array<DataID>,
  ) => void,
  afterFreedGC: (recordIdsInStore: Array<DataID>) => void,
  afterLookupAfterFreedGC: (
    snapshot: Snapshot,
    recordIdsInStore: Array<DataID>,
  ) => void,
};

// Test utility for running through the GC lifecycle of a query that contains a
// resolver. Accepts various callbacks which will be called at various points
// during the following:
//
// 1. Lookup the query
// 2. Retain the query
// 3. GC
// 4. Lookup the query
// 5. Free the query
// 6. GC
// 7. Lookup the query
//
// Note that #7 is expected to fail for resolvers that have fragment dependencies.
async function testResolverGC<T: OperationType>({
  query,
  payloads,
  variables,
  beforeLookup,
  afterLookup,
  afterRetainedGC,
  afterFreedGC,
  afterLookupAfterFreedGC,
}: TestProps<T>) {
  const source = RelayRecordSource.create();

  // A purposefully empty query used to allow us to ensure we retain the root
  const emptyQueryOperation = createOperationDescriptor(
    graphql`
      query ResolverGCTestGCEmptyQuery {
        __id
      }
    `,
    {},
  );
  const operation = createOperationDescriptor(query, variables);

  const mockLogger = jest.fn<[LogEvent], void>();

  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
    log: mockLogger,
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create((request, variables) => {
      const mockPaylaod = payloads.shift();
      if (mockPaylaod == null) {
        throw new Error(
          `Expected a payload for for query "${
            request.name
          }" with variables: ${JSON.stringify(variables)}`,
        );
      }
      return Promise.resolve(mockPaylaod);
    }),
    store,
    log: mockLogger,
  });

  await environment.execute({operation}).toPromise();
  beforeLookup(store.getSource().getRecordIDs());

  const retains = [];
  const operations = [operation];
  let snapshot = environment.lookup(operation.fragment);

  // As long as we have missing client edges, go fetch them.
  // This should handle recursive client edges.
  while (
    snapshot.missingClientEdges != null &&
    snapshot.missingClientEdges.length > 0
  ) {
    for (const missingClientEdge of snapshot.missingClientEdges) {
      const originalVariables = operation.fragment.variables;
      const variables = {
        ...originalVariables,
        id: missingClientEdge.clientEdgeDestinationID, // TODO should be a reserved name
      };
      const clientEdgeOperation = createOperationDescriptor(
        missingClientEdge.request,
        variables,
        {}, //  TODO cacheConfig should probably inherent from parent operation
      );
      await environment.execute({operation: clientEdgeOperation}).toPromise();

      operations.push(clientEdgeOperation);
    }
    // Reread the root operation in the hopes that all missing client edges have
    // been resolved.
    snapshot = environment.lookup(operation.fragment);
  }
  afterLookup(snapshot, store.getSource().getRecordIDs(), environment);

  environment.retain(emptyQueryOperation);

  // Retain the original query, and all client edge queries fetched.
  for (const op of operations) {
    retains.push(environment.retain(op));
  }
  store.__gc();

  afterRetainedGC(snapshot, store.getSource().getRecordIDs());
  const nextSnapshot = environment.lookup(operation.fragment);
  afterRetainedGC(nextSnapshot, store.getSource().getRecordIDs());

  // Dispose of the original query and all client edge queries fetched.
  for (const disposable of retains) {
    disposable.dispose();
  }
  store.__gc();
  afterFreedGC(store.getSource().getRecordIDs());

  const finalSnapshot = environment.lookup(operation.fragment);

  afterLookupAfterFreedGC(finalSnapshot, store.getSource().getRecordIDs());
}
