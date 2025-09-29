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
import type {ClientEdgeToClientObjectTestClientRootFragment$key} from './__generated__/ClientEdgeToClientObjectTestClientRootFragment.graphql';
import type {ClientEdgeToClientObjectTestClientRootNameFragment$key} from './__generated__/ClientEdgeToClientObjectTestClientRootNameFragment.graphql';

const {readFragment} = require('../ResolverFragments');
const {commitLocalUpdate} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayModernStore = require('relay-runtime/store/RelayModernStore.js');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowConsoleErrors();
disallowWarnings();

test('Can read a deep portion of the schema that is backed by client edges to client objects.', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      birthdate: {__ref: '2'},
      id: '1',
    },
    '2': {
      __id: '2',
      __typename: 'Date',
      day: 11,
      id: '2',
      month: 3,
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
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
  const store = new RelayModernStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = environment.lookup(operation.fragment).data;

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
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
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
  const store = new RelayModernStore(source, {
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
    '1': {
      __id: '1',
      __typename: 'User',
      birthdate: {__ref: '2'},
      id: '1',
    },
    '2': {
      __id: '2',
      __typename: 'Date',
      day: 11,
      id: '2',
      month: 3,
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
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
  const liveStore = new RelayModernStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: liveStore,
  });

  const data: ClientEdgeToClientObjectTest3Query$data = environment.lookup(
    operation.fragment,
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  ).data as any;

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

type Account = {
  account_name: string,
};
/**
 * @RelayResolver Query.account: ClientAccount
 */
function account(): {id: string} {
  return {id: '1'};
}

/**
 * @RelayResolver ClientAccount.self: RelayResolverValue
 * @rootFragment ClientEdgeToClientObjectTestClientRootFragment
 */
function self(
  fragmentKey: ClientEdgeToClientObjectTestClientRootFragment$key,
): Account {
  const data = readFragment(
    graphql`
      fragment ClientEdgeToClientObjectTestClientRootFragment on ClientAccount {
        id @required(action: THROW)
      }
    `,
    fragmentKey,
  );
  return {account_name: JSON.stringify(data)};
}

/**
 * @RelayResolver ClientAccount.account_name: String
 * @rootFragment ClientEdgeToClientObjectTestClientRootNameFragment
 */
function account_name(
  fragmentKey: ClientEdgeToClientObjectTestClientRootNameFragment$key,
): ?string {
  const acct = readFragment(
    graphql`
      fragment ClientEdgeToClientObjectTestClientRootNameFragment on ClientAccount {
        self
      }
    `,
    fragmentKey,
  );
  return acct.self?.account_name;
}

test('it can read a rootFragment on a client type defined on client schema', () => {
  const AccountQuery = graphql`
    query ClientEdgeToClientObjectTestClientRootFragmentQuery {
      account {
        __id
        id
        account_name
      }
    }
  `;

  const source = RelayRecordSource.create();

  const operation = createOperationDescriptor(AccountQuery, {});
  const liveStore = new RelayModernStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: liveStore,
  });

  const data = environment.lookup(operation.fragment).data;

  expect(data).toEqual({
    account: {
      __id: 'client:ClientAccount:1',
      account_name: '{"id":"1"}',
      id: '1',
    },
  });
});

module.exports = {
  account,
  account_name,
  self,
};
