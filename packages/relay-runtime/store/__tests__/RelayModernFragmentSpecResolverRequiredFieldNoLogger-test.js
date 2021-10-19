/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayModernFragmentSpecResolver = require('../RelayModernFragmentSpecResolver');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  RelayFeatureFlags,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

const dev = __DEV__;

beforeEach(() => {
  global.__DEV__ = dev;
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
});

describe('RelayModernFragmentSpecResolver', () => {
  let UserFragment;
  let UserQuery;
  let context;
  let environment;
  let zuck;

  function setUserField(id, fieldName, value) {
    environment.applyUpdate({
      storeUpdater: store => {
        const user = store.get(id);
        user.setValue(value, fieldName);
      },
    });
  }

  beforeEach(() => {
    environment = createMockEnvironment({
      // We intentionally omit `requriedFieldLogger` here.
    });
    UserFragment = getFragment(graphql`
      fragment RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment on User {
        id
        alternate_name @required(action: LOG)
      }
    `);
    UserQuery = getRequest(graphql`
      query RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment
        }
      }
    `);

    const zuckOperation = createOperationDescriptor(UserQuery, {
      id: '4',
    });
    environment.commitPayload(zuckOperation, {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
        alternate_name: 'Zuckster',
      },
    });
    zuck = environment.lookup(zuckOperation.fragment, zuckOperation).data.node;
    const variables = {
      id: '4',
    };
    context = {environment, variables};
  });

  it('Throws in __DEV__ when trying to LOG a missing requried filed if a logger is not supplied.', () => {
    global.__DEV__ = true;
    setUserField('4', 'alternate_name', null);
    const resolver = new RelayModernFragmentSpecResolver(
      context,
      {user: UserFragment},
      {user: zuck},
      jest.fn(),
      true /* rootIsQueryRenderer */,
    );
    expect(() => resolver.resolve()).toThrow(
      'Relay Environment Configuration Error (dev only): `@required(action: LOG)` requires that the Relay Environment be configured with a `requiredFieldLogger`',
    );
  });

  it('Does not throw when trying to LOG a missing requried filed if a logger is not supplied when not __DEV__.', () => {
    global.__DEV__ = false;
    setUserField('4', 'alternate_name', null);
    const resolver = new RelayModernFragmentSpecResolver(
      context,
      {user: UserFragment},
      {user: zuck},
      jest.fn(),
      true /* rootIsQueryRenderer */,
    );
    expect(() => resolver.resolve()).not.toThrow();
  });
});
