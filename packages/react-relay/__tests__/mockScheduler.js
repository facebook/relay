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

const invariant = require('invariant');
const Scheduler = require('scheduler/unstable_mock');

// The version of scheduler we get internally is always the latest. However, the
// version we get on GitHub is a transitive dependency from `react-test-renderer`.
//
// Some methods in the unstable_mock have been renamed between these two
// versions. This mock file provides a centralized place to reconcile those
// differences so that the same tests can work both internally and on GitHub.

if (Scheduler.log == null) {
  invariant(
    Scheduler.unstable_yieldValue != null,
    'Expected to find one of log or unstable_yieldValue',
  );
  Scheduler.log = Scheduler.unstable_yieldValue;
}
if (Scheduler.unstable_clearLog == null) {
  invariant(
    Scheduler.unstable_clearYields != null,
    'Expected to find one of unstable_clearLog or unstable_clearYields',
  );
  Scheduler.unstable_clearLog = Scheduler.unstable_clearYields;
}
module.exports = Scheduler;
