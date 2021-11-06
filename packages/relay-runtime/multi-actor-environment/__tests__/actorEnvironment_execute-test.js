/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const {create} = require('../../network/RelayNetwork');
const {getDefaultActorIdentifier} = require('../ActorIdentifier');
const MultiActorEnvironment = require('../MultiActorEnvironment');
const {
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');

jest.mock('../ActorIdentifier', () => {
  return {
    getDefaultActorIdentifier: jest.fn(() => {
      return 'actor:12345';
    }),
  };
});

test('send a network request with actor specific params', () => {
  const actorIdentifier = getDefaultActorIdentifier();
  const fetchFn = jest.fn(() => new Promise(jest.fn()));
  const multiActorEnvironment = new MultiActorEnvironment({
    createNetworkForActor: () => create(fetchFn),
    logFn: jest.fn(),
    requiredFieldLogger: jest.fn(),
  });
  const actorEnvironment = multiActorEnvironment.forActor(actorIdentifier);

  const operation = createOperationDescriptor(
    getRequest(graphql`
      query actorEnvironmentExecuteTestQuery($id: ID!) {
        node(id: $id) {
          ... on User {
            name
          }
        }
      }
    `),
    {id: 'my_id'},
  );

  actorEnvironment.execute({operation}).subscribe({
    next: jest.fn(),
  });
  expect(fetchFn).toBeCalled();

  expect(fetchFn.mock.calls.length).toEqual(1);
  expect(fetchFn.mock.calls[0][0].name).toBe(
    'actorEnvironmentExecuteTestQuery',
  );
});
