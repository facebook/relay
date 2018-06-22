/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const generateRelayClientID = require('../../store/generateRelayClientID');

const {ROOT_ID} = require('../../store/RelayStoreUtils');

import type {
  HandleFieldPayload,
  RecordSourceProxy,
} from '../../store/RelayStoreTypes';

const VIEWER_ID = generateRelayClientID(ROOT_ID, 'viewer');
const VIEWER_TYPE = 'Viewer';

/**
 * A runtime handler for the `viewer` field. The actual viewer record will
 * *never* be accessed at runtime because all fragments that reference it will
 * delegate to the handle field. So in order to prevent GC from having to check
 * both the original server field *and* the handle field (which would be almost
 * duplicate work), the handler copies server fields and then deletes the server
 * record.
 *
 * NOTE: This means other handles may not be added on viewer, since they may
 * execute after this handle when the server record is already deleted.
 */
function update(store: RecordSourceProxy, payload: HandleFieldPayload): void {
  const record = store.get(payload.dataID);
  if (!record) {
    return;
  }
  const serverViewer = record.getLinkedRecord(payload.fieldKey);
  if (!serverViewer) {
    // If `serverViewer` is null, `viewer` key for `client:root` should already
    // be null, so no need to `setValue` again.
    return;
  }
  // Server data already has viewer data at `client:root:viewer`, so link the
  // handle field to the server viewer record.
  if (serverViewer.getDataID() === VIEWER_ID) {
    record.setValue(null, payload.fieldKey);
    record.setLinkedRecord(serverViewer, payload.handleKey);
    return;
  }
  // Other ways to access viewer such as mutations may have a different id for
  // viewer: synthesize a record at the canonical viewer id, copy its fields
  // from the server record, and delete the server record link to speed up GC.
  const clientViewer =
    store.get(VIEWER_ID) || store.create(VIEWER_ID, VIEWER_TYPE);
  clientViewer.copyFieldsFrom(serverViewer);
  record.setValue(null, payload.fieldKey);
  record.setLinkedRecord(clientViewer, payload.handleKey);

  // Make sure the root object points to the viewer object as well
  const root = store.getRoot();
  root.setLinkedRecord(clientViewer, payload.handleKey);
}

module.exports = {
  VIEWER_ID,
  update,
};
