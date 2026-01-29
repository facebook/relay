/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = {
  'no-mixed-import-and-require': require('./rules/no-mixed-import-and-require'),
  'sort-imports': require('./rules/sort-imports'), // Synced from WWW
  'no-for-of-loops': require('./rules/no-for-of-loops'),
};
