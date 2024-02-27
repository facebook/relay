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

type CatModel = {};

/**
 * @RelayResolver Cat implements IAnimal
 */
function Cat(id: DataID): CatModel {
  return {};
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
