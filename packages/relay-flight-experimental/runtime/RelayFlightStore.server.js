/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {
  NormalizationSelector,
  OperationDescriptor,
  RelayResponsePayload,
  SingularReaderSelector,
  Snapshot,
} from 'relay-runtime/store/RelayStoreTypes';

import defaultGetDataID from 'relay-runtime/store/defaultGetDataID';
import * as RelayModernRecord from 'relay-runtime/store/RelayModernRecord';
import Store from 'relay-runtime/store/RelayModernStore';
import RelayPublishQueue from 'relay-runtime/store/RelayPublishQueue';
import RelayRecordSource from 'relay-runtime/store/RelayRecordSource';
import * as RelayResponseNormalizer from 'relay-runtime/store/RelayResponseNormalizer';
import {ROOT_TYPE} from 'relay-runtime/store/RelayStoreUtils';

const shouldProcessClientComponents = false;

const store: Store = new Store(RelayRecordSource.create(), {
  shouldProcessClientComponents,
});
const publishQueue = new RelayPublishQueue(store, null, defaultGetDataID);

type Data = {[string]: mixed, ...};

function normalizeData(
  data: Data,
  selector: NormalizationSelector,
  typeName: string,
): RelayResponsePayload {
  const source = RelayRecordSource.create();
  const record = RelayModernRecord.create(selector.dataID, typeName);
  source.set(selector.dataID, record);
  const relayPayload = RelayResponseNormalizer.normalize(
    source,
    selector,
    data,
    {
      getDataID: defaultGetDataID,
      treatMissingFieldsAsNull: false,
      shouldProcessClientComponents,
    },
  );
  return {
    ...relayPayload,
    isFinal: true,
  };
}

export function publishData(operation: OperationDescriptor, data: Data): void {
  const payload = normalizeData(data, operation.root, ROOT_TYPE);
  publishQueue.commitPayload(operation, payload);
  publishQueue.run();
}

export function lookup(selector: SingularReaderSelector): Snapshot {
  return store.lookup(selector);
}
