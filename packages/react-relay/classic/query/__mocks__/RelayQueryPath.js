/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const RelayQueryPath = jest.requireActual('../RelayQueryPath');

RelayQueryPath.fromJSON = jest.fn(RelayQueryPath.fromJSON);

module.exports = RelayQueryPath;
