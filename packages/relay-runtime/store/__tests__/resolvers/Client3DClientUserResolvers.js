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

type ClientUserModel = {
  __id: DataID,
};

/**
 * @relayType ClientUser implements IBasicUser
 */
function ClientUser(id: DataID): ?ClientUserModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @relayField ClientUser.data: String
 */
function data(clientUser: ClientUserModel): string {
  return 'clientUserData';
}

module.exports = {
  ClientUser,
  data,
};
