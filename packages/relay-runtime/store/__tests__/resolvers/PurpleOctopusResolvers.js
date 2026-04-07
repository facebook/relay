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
 * @relayType PurpleOctopus implements IWeakAnimal
 * @weak
 */
export type PurpleOctopus = {
  name: string,
};

/**
 * @relayField PurpleOctopus.color: String
 */
function color(purpleOctopus: PurpleOctopus): ?string {
  return 'purple';
}

/**
 * @relayField Query.purple_octopus: PurpleOctopus
 */
function purpleOctopus(): PurpleOctopus {
  return {
    name: 'PurpleOctopus',
  };
}

module.exports = {
  color,
  purpleOctopus,
};
