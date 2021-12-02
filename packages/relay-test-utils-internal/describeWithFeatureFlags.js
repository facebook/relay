/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * Run a test suite under multiple sets of feature flags.
 * Beware that calling jest.resetModules() within the suite may break this.
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {FeatureFlags} from '../relay-runtime/util/RelayFeatureFlags';

// This function is for running within a test environment, so we use globals
// available within tests -- taken from:
// i code/www/[5ee5e1d71a05e9f58ded3c1c22b810666383164f]/flow/shared/libdefs/jest.js
type JestDoneFn = {
  (): void,
  fail: (error: Error) => void,
  ...
};
declare function afterEach(
  fn: (done: JestDoneFn) => ?Promise<mixed>,
  timeout?: number,
): void;
declare function beforeEach(
  fn: (done: JestDoneFn) => ?Promise<mixed>,
  timeout?: number,
): void;
declare var describe: {
  (name: JestTestName, fn: () => void): void,
  each(
    ...table: $ReadOnlyArray<Array<mixed> | mixed> | [Array<string>, string]
  ): (
    name: JestTestName,
    fn?: (...args: Array<any>) => ?Promise<mixed>,
    timeout?: number,
  ) => void,
  ...
};

function describeWithFeatureFlags(
  flagSets: Array<$Shape<FeatureFlags>>,
  description: string,
  body: () => void,
): void {
  describe.each(flagSets)(`${description} - Feature flags: %o`, flags => {
    let originalFlags;
    beforeEach(() => {
      const {RelayFeatureFlags} = require('relay-runtime');
      originalFlags = {...RelayFeatureFlags};
      Object.assign(RelayFeatureFlags, flags);
    });
    afterEach(() => {
      const {RelayFeatureFlags} = require('relay-runtime'); // re-import in case of jest module resets
      Object.assign(RelayFeatureFlags, originalFlags);
    });
    body();
  });
}

module.exports = describeWithFeatureFlags;
