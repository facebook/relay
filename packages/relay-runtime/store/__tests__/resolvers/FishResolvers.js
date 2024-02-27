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

import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

type FishModel = {};

/**
 * @RelayResolver Fish implements IAnimal
 */
function Fish(id: DataID): FishModel {
  return {};
}

/**
 * @RelayResolver Fish.legs: Int
 */
function legs(cat: FishModel): number {
  return 0;
}

/**
 * @RelayResolver Query.fish: Fish
 */
function fish(): {id: DataID} {
  return {id: '12redblue'};
}

module.exports = {
  fish,
  Fish,
  legs,
};
