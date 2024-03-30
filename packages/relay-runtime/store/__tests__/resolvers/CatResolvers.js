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

type CatModel = {
  __id: DataID,
};

/**
 * @RelayResolver Cat implements IAnimal
 */
function Cat(id: DataID): ?CatModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @RelayResolver Cat.legs: Int
 */
function legs(cat: CatModel): number {
  return 4;
}

/**
 * @RelayResolver Query.cat: Cat
 */
function cat(): {id: DataID} {
  return {id: '9'};
}

module.exports = {
  cat,
  Cat,
  legs,
};
