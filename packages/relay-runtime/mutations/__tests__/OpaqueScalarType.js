/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 * @emails oncall+relay
 */

'use strict';

// This is just an example complex object, that can be stored as a custom scalar in Relay store
export opaque type OpaqueScalarType = {|
  name: string,
  callback: () => void,
|};

function createOpaqueScalarTypeValue(
  name: string,
  callback: () => void,
): OpaqueScalarType {
  return {
    name,
    callback,
  };
}

module.exports = {createOpaqueScalarTypeValue};
