/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

export type FetchMode = $Keys<typeof RelayFetchMode>;

const RelayFetchMode = Object.freeze({
  CLIENT: 'CLIENT',
  PRELOAD: 'PRELOAD',
  REFETCH: 'REFETCH',
});

module.exports = RelayFetchMode;
