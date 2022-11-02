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

const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} = require('relay-runtime');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('isServer', () => {
  const fetch = () => Observable.create<any>(() => {});
  it('defaults to false', () => {
    const environment = new Environment({
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
    });
    expect(environment.isServer()).toEqual(false);
  });
  it('comes from config', () => {
    let environment = new Environment({
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
      isServer: true,
    });
    expect(environment.isServer()).toEqual(true);
    environment = new Environment({
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
      isServer: false,
    });
    expect(environment.isServer()).toEqual(false);
  });
});
