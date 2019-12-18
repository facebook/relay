/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayFeatureFlags = require('../util/RelayFeatureFlags');

const {ROOT_TYPE} = require('../store/RelayStoreUtils');
const {VIEWER_ID} = require('../store/ViewerPattern');

import type {MissingFieldHandler} from '../store/RelayStoreTypes';

function getHandler(): $ReadOnlyArray<MissingFieldHandler> {
  if (RelayFeatureFlags.ENABLE_MISSING_VIEWER_FIELD_HANDLER) {
    return [
      {
        kind: 'linked',
        handle(field, record, argValues) {
          if (
            record != null &&
            record.__typename === ROOT_TYPE &&
            field.name === 'viewer'
          ) {
            return VIEWER_ID;
          }
        },
      },
    ];
  }
  return [];
}

module.exports = getHandler;
