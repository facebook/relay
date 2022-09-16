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

import type {ClientEdgeToClientObjectTest3Query$data} from './__generated__/ClientEdgeToClientObjectTest3Query.graphql';

const {RelayFeatureFlags, commitLocalUpdate} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
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

disallowConsoleErrors();
disallowWarnings();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
});

test('Can read a deep portion of the schema that is backed by client edges to client objects.', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      id: '1',
      __typename: 'User',
      birthdate: {__ref: '2'},
    },
    '2': {
      __id: '2',
      id: '2',
      __typename: 'Date',
      day: 11,
      month: 3,
    },
  });
  const FooQuery = graphql`
    query ClientEdgeToClientObjectTest1Query {
      me {
        astrological_sign {
          __id
          name
          house
          opposite {
            __id
            name
            house
            opposite {
              __id
              name
            }
          }
        }
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me} = (environment.lookup(operation.fragment).data: any);

  expect(me).toMatchInlineSnapshot(`
    Object {
      "astrological_sign": Object {
        "__id": "client:AstrologicalSign:Pisces",
        "house": 12,
        "name": "Pisces",
        "opposite": Object {
          "__id": "client:AstrologicalSign:Virgo",
          "house": 6,
          "name": "Virgo",
          "opposite": Object {
            "__id": "client:AstrologicalSign:Pisces",
            "name": "Pisces",
          },
        },
      },
    }
  `);
});

test('Can read a plural client edge to list of client defined types', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      id: '1',
      __typename: 'User',
    },
  });
  const FooQuery = graphql`
    query ClientEdgeToClientObjectTest2Query {
      all_astrological_signs {
        name
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const {data} = environment.lookup(operation.fragment);

  expect(data).toMatchInlineSnapshot(`
    Object {
      "all_astrological_signs": Array [
        Object {
          "name": "Aries",
        },
        Object {
          "name": "Taurus",
        },
        Object {
          "name": "Gemini",
        },
        Object {
          "name": "Cancer",
        },
        Object {
          "name": "Leo",
        },
        Object {
          "name": "Virgo",
        },
        Object {
          "name": "Libra",
        },
        Object {
          "name": "Scorpio",
        },
        Object {
          "name": "Sagittarius",
        },
        Object {
          "name": "Capricorn",
        },
        Object {
          "name": "Aquarius",
        },
        Object {
          "name": "Pisces",
        },
      ],
    }
  `);
});

test('Uses an existing client record if it already exists', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      id: '1',
      __typename: 'User',
      birthdate: {__ref: '2'},
    },
    '2': {
      __id: '2',
      id: '2',
      __typename: 'Date',
      day: 11,
      month: 3,
    },
  });

  const FooQuery = graphql`
    query ClientEdgeToClientObjectTest3Query {
      me {
        astrological_sign {
          __id
          name
          notes
        }
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const liveStore = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: liveStore,
  });

  const data: ClientEdgeToClientObjectTest3Query$data = (environment.lookup(
    operation.fragment,
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  ).data: any);

  expect(data).toEqual({
    me: {
      astrological_sign: {
        __id: 'client:AstrologicalSign:Pisces',
        name: 'Pisces',
        notes: undefined,
      },
    },
  });

  commitLocalUpdate(environment, store => {
    const id = data.me?.astrological_sign?.__id;
    if (id == null) {
      throw new Error('Expected to get an id');
    }
    const sign = store.get(id);
    if (sign == null) {
      throw new Error('Tried to reference a non-existent sign');
    }
    sign.setValue('This is a cool note.', 'notes');
  });

  const {data: newData} = environment.lookup(operation.fragment);

  expect(newData).toEqual({
    me: {
      astrological_sign: {
        __id: 'client:AstrologicalSign:Pisces',
        name: 'Pisces',
        notes: 'This is a cool note.',
      },
    },
  });
});
