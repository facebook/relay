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

import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const {INVALID_ID} = require('./AnimalQueryResolvers');

type SpecialUserModel = {
  __id: DataID,
};

/**
 * @RelayResolver SpecialUser implements IBasicUser
 */
function SpecialUser(id: DataID): ?SpecialUserModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @RelayResolver SpecialUser.data: String
 */
function data(specialUser: SpecialUserModel): string {
  return 'specialUserData';
}

module.exports = {
  SpecialUser,
  data,
};
