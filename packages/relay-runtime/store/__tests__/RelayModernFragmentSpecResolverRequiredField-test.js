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
const {RelayFeatureFlags} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

beforeEach(() => {
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
  let zuckOperation;
  let variables;
  let logger;
  let requiredFieldLogger;

  function setUserField(id, fieldName, value) {
    environment.applyUpdate({
      storeUpdater: store => {
        const user = store.get(id);
        user.setValue(value, fieldName);
      },
    });
  }

  beforeEach(() => {
    logger = jest.fn();
    requiredFieldLogger = jest.fn();
    environment = createMockEnvironment({log: logger, requiredFieldLogger});
    ({UserFragment, UserQuery} = generateAndCompile(`
      query UserQuery($id: ID!) {
        node(id: $id) {
          ...UserFragment
        }
      }
      fragment UserFragment on User {
        id
        name @required(action: THROW)
        alternate_name @required(action: LOG)
      }
    `));
    zuckOperation = createOperationDescriptor(UserQuery, {
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
    variables = {
      id: '4',
    };
    context = {environment, variables};
  });

  it('throws when encountering a missing @required(action: THROW) field', () => {
    setUserField('4', 'name', null);
    const resolver = new RelayModernFragmentSpecResolver(
      context,
      {user: UserFragment},
      {user: zuck},
      jest.fn(),
    );
    expect(() => resolver.resolve()).toThrowError(
      "Relay: Missing @required value at path 'name' in 'UserFragment'.",
    );
  });

  it('logs when encountering a missing @required(action: LOG) field', () => {
    setUserField('4', 'alternate_name', null);
    const resolver = new RelayModernFragmentSpecResolver(
      context,
      {user: UserFragment},
      {user: zuck},
      jest.fn(),
    );
    resolver.resolve();
    expect(requiredFieldLogger).toHaveBeenCalledWith({
      fieldPath: 'alternate_name',
      kind: 'missing_field.log',
      owner: 'UserFragment',
    });
  });

  it('throws when reading a @required(action: THROW) field that has become null', () => {
    const resolver = new RelayModernFragmentSpecResolver(
      context,
      {user: UserFragment},
      {user: zuck},
      jest.fn(),
    );
    const data = resolver.resolve();
    expect(data.user.name).toBe('Zuck');
    setUserField('4', 'name', null);

    expect(() => resolver.resolve()).toThrowError(
      "Relay: Missing @required value at path 'name' in 'UserFragment'.",
    );

    expect(requiredFieldLogger).toHaveBeenCalledWith({
      fieldPath: 'name',
      kind: 'missing_field.throw',
      owner: 'UserFragment',
    });
  });
});
