/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

/**
 * @RelayResolver PurpleOctopus implements IWeakAnimal
 * @weak
 */
export type PurpleOctopus = {};

/**
 * @RelayResolver PurpleOctopus.legs: Int
 */
function legs(purpleOctopus: PurpleOctopus): number {
  return 8;
}

/**
 * @RelayResolver Query.purple_octopus: PurpleOctopus
 */
function purpleOctopus(): PurpleOctopus {
  return {};
}

module.exports = {
  legs,
  purpleOctopus,
};
