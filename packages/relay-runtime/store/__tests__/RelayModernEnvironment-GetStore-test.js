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

const RelayNetwork = require('../../network/RelayNetwork');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('getStore()', () => {
  it('returns the store passed to the constructor', () => {
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    expect(environment.getStore()).toBe(store);
  });
});
