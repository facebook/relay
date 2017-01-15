/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayGraphQLTagMap
 */

'use strict';

/**
 * This module is intended for memoizing the results of `graphql` tag functions.
 * `WeakMap` is used if supported in order to avoid retaining results for tags
 * that are no longer referenced. `Map` is used as a fallback: the expected
 * number of tags is typically fixed for an application.
 */
module.exports = typeof WeakMap !== 'undefined' ?
  WeakMap :
  Map;
