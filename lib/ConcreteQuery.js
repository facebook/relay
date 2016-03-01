/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ConcreteQuery
 * 
 * @typechecks
 */

'use strict';

/**
 * @internal
 *
 * Types representing the transformed output of Relay.QL queries.
 */

/**
 * Ideally this would be a union of Field/Fragment/Mutation/Query/Subscription,
 * but that causes lots of Flow errors.
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});
// FB Printer
// from @relay directive
// OSS Printer from `@relay`