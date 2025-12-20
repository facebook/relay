/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {IdOf} from '../..';
import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const {graphql} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const {read} = require('../RelayReader');
const RelayRecordSource = require('../RelayRecordSource');
const {
  LiveResolverCache,
} = require('relay-runtime/store/live-resolvers/LiveResolverCache');

const UserMap = new Map([
  ['1', 'Alice'],
  ['2', 'Bob'],
  ['3', 'Claire'],
  ['4', 'Dennis'],
]);

export type TReaderTestUser = {
  name: ?string,
};

let modelMock;
let nameMock;
let bestFriendMock;
let friendsMock;
let user_oneMock;

/**
 * @RelayResolver RelayReaderExecResolversTestUser
 */
export function RelayReaderExecResolversTestUser(id: DataID): TReaderTestUser {
  modelMock();
  return {
    name: UserMap.get(id),
  };
}

/**
 * @RelayResolver RelayReaderExecResolversTestUser.name: String
 */
export function name(user: TReaderTestUser): ?string {
  nameMock();
  return user.name;
}

/**
 * @RelayResolver RelayReaderExecResolversTestUser.best_friend: RelayReaderExecResolversTestUser
 */
export function best_friend(
  user: TReaderTestUser,
): IdOf<'RelayReaderExecResolversTestUser'> {
  bestFriendMock();
  return {id: '2'};
}

/**
 * @RelayResolver RelayReaderExecResolversTestUser.friends: [RelayReaderExecResolversTestUser]
 */
export function friends(
  user: TReaderTestUser,
): Array<IdOf<'RelayReaderExecResolversTestUser'>> {
  friendsMock();
  return [{id: '2'}, {id: '3'}, {id: '4'}];
}

/**
 * @RelayResolver Query.RelayReaderExecResolversTest_user_one: RelayReaderExecResolversTestUser
 */
export function RelayReaderExecResolversTest_user_one(): IdOf<'RelayReaderExecResolversTestUser'> {
  user_oneMock();
  return {id: '1'};
}

beforeEach(() => {
  modelMock = jest.fn();
  nameMock = jest.fn();
  bestFriendMock = jest.fn();
  friendsMock = jest.fn();
  user_oneMock = jest.fn();
});

/**
 * Note that the reading of exec time resolvers is expected to be the same as
 * the reading of standard server queries. The main purpose of testing is to ensure
 * that resolvers marked as exec time are executed as standard server queries and
 * not as read time resolver queries.
 */
describe('RelayReaderExecResolvers', () => {
  it('reads exec_time_resolvers without calling the resolvers when provider returns true', () => {
    const Query = graphql`
      query RelayReaderExecResolversTestQuery
      @exec_time_resolvers(
        enabledProvider: "relayReaderTestExecTimeResolversTrueProvider"
      ) {
        RelayReaderExecResolversTest_user_one {
          name
          best_friend {
            name
          }
          friends {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(Query, {});
    const source = new RelayRecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        RelayReaderExecResolversTest_user_one: {__ref: '1'},
      },
      '1': {
        __id: '1',
        name: 'Alice',
        friends: {__refs: ['2', '3', '4']},
      },
      '2': {
        __id: '2',
        name: 'Bob',
      },
      '3': {
        __id: '3',
        name: 'Claire',
      },
      '4': {
        __id: '4',
        name: 'Dennis',
      },
    });
    const resolverStore = new RelayModernStore(source);
    const {data} = read(
      source,
      operation.fragment,
      null,
      new LiveResolverCache(() => source, resolverStore),
    );

    expect(modelMock).not.toBeCalled();
    expect(nameMock).not.toBeCalled();
    expect(user_oneMock).not.toBeCalled();
    expect(friendsMock).not.toBeCalled();
    expect(data).toEqual({
      RelayReaderExecResolversTest_user_one: {
        name: 'Alice',
        friends: [{name: 'Bob'}, {name: 'Claire'}, {name: 'Dennis'}],
      },
    });
  });

  it('reads read time resolvers when exec time resolvers provider returns false', () => {
    const Query = graphql`
      query RelayReaderExecResolversTestFalseProviderQuery
      @exec_time_resolvers(
        enabledProvider: "relayReaderTestExecTimeResolversFalseProvider"
      ) {
        RelayReaderExecResolversTest_user_one {
          name
          best_friend {
            name
          }
          friends {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(Query, {});
    const source = new RelayRecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        RelayReaderExecResolversTest_user_one: {__ref: '1'},
      },
      '1': {
        __id: '1',
        name: 'Alice',
        friends: {__refs: ['2', '3', '4']},
      },
      '2': {
        __id: '2',
        name: 'Bob',
      },
      '3': {
        __id: '3',
        name: 'Claire',
      },
      '4': {
        __id: '4',
        name: 'Dennis',
      },
    });
    const resolverStore = new RelayModernStore(source);
    const {data} = read(
      source,
      operation.fragment,
      null,
      new LiveResolverCache(() => source, resolverStore),
    );

    expect(modelMock).toBeCalled();
    expect(nameMock).toBeCalled();
    expect(user_oneMock).toBeCalled();
    expect(friendsMock).toBeCalled();
    expect(data).toEqual({
      RelayReaderExecResolversTest_user_one: {
        best_friend: {
          name: 'Bob',
        },
        friends: [
          {
            name: 'Bob',
          },
          {
            name: 'Claire',
          },
          {
            name: 'Dennis',
          },
        ],
        name: 'Alice',
      },
    });
  });

  it('reads exec time resolvers data correctly when client side directives are present, like @required', () => {
    const Query = graphql`
      query RelayReaderExecResolversTestClientDirectiveQuery
      @exec_time_resolvers(
        enabledProvider: "relayReaderTestExecTimeResolversTrueProvider"
      ) {
        RelayReaderExecResolversTest_user_one {
          name @required(action: THROW)
          best_friend {
            name
          }
          friends {
            name
          }
        }
      }
    `;
    const operation = createOperationDescriptor(Query, {});
    const source = new RelayRecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        RelayReaderExecResolversTest_user_one: {__ref: '1'},
      },
      '1': {
        __id: '1',
        name: 'Alice',
        friends: {__refs: ['2', '3', '4']},
      },
      '2': {
        __id: '2',
        name: 'Bob',
      },
      '3': {
        __id: '3',
        name: 'Claire',
      },
      '4': {
        __id: '4',
        name: 'Dennis',
      },
    });
    const resolverStore = new RelayModernStore(source);
    const {data} = read(
      source,
      operation.fragment,
      null,
      new LiveResolverCache(() => source, resolverStore),
    );

    expect(modelMock).not.toBeCalled();
    expect(nameMock).not.toBeCalled();
    expect(user_oneMock).not.toBeCalled();
    expect(friendsMock).not.toBeCalled();
    expect(data).toEqual({
      RelayReaderExecResolversTest_user_one: {
        name: 'Alice',
        friends: [{name: 'Bob'}, {name: 'Claire'}, {name: 'Dennis'}],
      },
    });
  });
});
