/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @oncall relay
 */

/**
 * @RelayResolver Octopus implements IWeakAnimal
 * @weak
 */
export type Octopus = {};

/**
 * @RelayResolver Octopus.legs: Int
 */
function legs(octopus: Octopus): number {
  return 8;
}

/**
 * @RelayResolver Query.octopus: Octopus
 */
function octopus(): Octopus {
  return {};
}

module.exports = {
  octopus,
  legs,
};
