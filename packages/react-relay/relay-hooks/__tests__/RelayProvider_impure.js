/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

let counter = 0;
export function get(): number {
  return counter++;
}

export function test_reset(): void {
  counter = 0;
}
