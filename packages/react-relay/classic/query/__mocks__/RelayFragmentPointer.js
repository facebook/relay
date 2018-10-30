/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const RelayFragmentPointer = jest.requireActual('../RelayFragmentPointer');

RelayFragmentPointer.createForRoot = jest.fn(
  RelayFragmentPointer.createForRoot,
);

module.exports = RelayFragmentPointer;
