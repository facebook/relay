/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {
  HandleFieldPayload,
  RecordSourceProxy,
} from '../../store/RelayStoreTypes';

const DeleteRecordHandler = {
  update: (store: RecordSourceProxy, payload: HandleFieldPayload) => {
    const record = store.get(payload.dataID);
    if (record != null) {
      const id = record.getValue(payload.fieldKey);
      if (typeof id === 'string') {
        store.delete(id);
      }
    }
  },
};

module.exports = {
  DeleteRecordHandler,
};
