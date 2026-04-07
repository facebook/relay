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
 * @relayType RedOctopus implements IWeakAnimal
 * @weak
 */
export type RedOctopus = {
  name: string,
};

/**
 * @relayField RedOctopus.color: String
 */
function color(red_octopus: RedOctopus): ?string {
  return 'red';
}

/**
 * @relayField Query.red_octopus: RedOctopus
 */
function red_octopus(): RedOctopus {
  return {
    name: 'RedOctopus',
  };
}

module.exports = {
  red_octopus,
  color,
};
