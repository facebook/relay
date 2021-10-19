/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'registerEnvironmentWithDevTools()',
  environmentType => {
    describe(environmentType, () => {
      it('should register environment with DevTools', () => {
        const registerEnvironment = jest.fn();
        global.__RELAY_DEVTOOLS_HOOK__ = {
          registerEnvironment,
        };

        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: jest.fn(),
        });
        const source = RelayRecordSource.create();

        const environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(jest.fn()),
                store: new RelayModernStore(source),
              });
        expect(registerEnvironment).toBeCalledWith(environment);
      });
    });
  },
);
