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

const {INVALID_ID} = require('./AnimalQueryResolvers');

type FishModel = {
  __id: DataID,
};

/**
 * @relayType Fish implements IAnimal
 */
function Fish(id: DataID): ?FishModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @relayField Fish.legs: Int
 */
function legs(cat: FishModel): number {
  return 0;
}

/**
 * @relayField Query.fish: Fish
 */
function fish(): {id: DataID} {
  return {id: '12redblue'};
}

module.exports = {
  fish,
  Fish,
  legs,
};
