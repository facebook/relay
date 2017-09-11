/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordSourceProxy
 * @flow
 * @format
 */

'use strict';

const RelayModernRecord = require('RelayModernRecord');
const RelayRecordProxy = require('RelayRecordProxy');
const RelayRecordSourceSelectorProxy = require('RelayRecordSourceSelectorProxy');

const invariant = require('invariant');
const normalizeRelayPayload = require('normalizeRelayPayload');

const {EXISTENT, NONEXISTENT} = require('RelayRecordState');
const {ROOT_ID, ROOT_TYPE} = require('RelayStoreUtils');

import type {HandlerProvider} from 'RelayDefaultHandlerProvider';
import type {DataID} from 'RelayInternalTypes';
import type RelayRecordSourceMutator from 'RelayRecordSourceMutator';
import type {
  RecordProxy,
  RecordSourceProxy,
  RecordSourceSelectorProxy,
  OperationSelector,
} from 'RelayStoreTypes';

/**
 * @internal
 *
 * A helper for manipulating a `RecordSource` via an imperative/OO-style API.
 */
class RelayRecordSourceProxy implements RecordSourceProxy {
  _handlerProvider: ?HandlerProvider;
  __mutator: RelayRecordSourceMutator;
  _proxies: {[dataID: DataID]: ?RelayRecordProxy};

  constructor(
    mutator: RelayRecordSourceMutator,
    handlerProvider?: ?HandlerProvider,
  ) {
    this.__mutator = mutator;
    this._handlerProvider = handlerProvider || null;
    this._proxies = {};
  }

  commitPayload(
    operation: OperationSelector,
    response: ?Object,
  ): RecordSourceSelectorProxy {
    if (!response) {
      return new RelayRecordSourceSelectorProxy(this, operation.fragment);
    }
    const {source, fieldPayloads} = normalizeRelayPayload(
      operation.root,
      response,
    );
    const dataIDs = source.getRecordIDs();
    dataIDs.forEach(dataID => {
      const status = source.getStatus(dataID);
      if (status === EXISTENT) {
        const sourceRecord = source.get(dataID);
        if (sourceRecord) {
          if (this.__mutator.getStatus(dataID) !== EXISTENT) {
            this.create(dataID, RelayModernRecord.getType(sourceRecord));
          }
          this.__mutator.copyFieldsFromRecord(sourceRecord, dataID);
          delete this._proxies[dataID];
        }
      } else if (status === NONEXISTENT) {
        this.delete(dataID);
      }
    });

    if (fieldPayloads && fieldPayloads.length) {
      fieldPayloads.forEach(fieldPayload => {
        const handler =
          this._handlerProvider && this._handlerProvider(fieldPayload.handle);
        invariant(
          handler,
          'RelayModernEnvironment: Expected a handler to be provided for handle `%s`.',
          fieldPayload.handle,
        );
        handler.update(this, fieldPayload);
      });
    }
    return new RelayRecordSourceSelectorProxy(this, operation.fragment);
  }

  create(dataID: DataID, typeName: string): RecordProxy {
    this.__mutator.create(dataID, typeName);
    delete this._proxies[dataID];
    const record = this.get(dataID);
    // For flow
    invariant(
      record,
      'RelayRecordSourceProxy#create(): Expected the created record to exist.',
    );
    return record;
  }

  delete(dataID: DataID): void {
    invariant(
      dataID !== ROOT_ID,
      'RelayRecordSourceProxy#delete(): Cannot delete the root record.',
    );
    delete this._proxies[dataID];
    this.__mutator.delete(dataID);
  }

  get(dataID: DataID): ?RecordProxy {
    if (!this._proxies.hasOwnProperty(dataID)) {
      const status = this.__mutator.getStatus(dataID);
      if (status === EXISTENT) {
        this._proxies[dataID] = new RelayRecordProxy(
          this,
          this.__mutator,
          dataID,
        );
      } else {
        this._proxies[dataID] = status === NONEXISTENT ? null : undefined;
      }
    }
    return this._proxies[dataID];
  }

  getRoot(): RecordProxy {
    let root = this.get(ROOT_ID);
    if (!root) {
      root = this.create(ROOT_ID, ROOT_TYPE);
    }
    invariant(
      root && root.getType() === ROOT_TYPE,
      'RelayRecordSourceProxy#getRoot(): Expected the source to contain a ' +
        'root record.',
    );
    return root;
  }
}

module.exports = RelayRecordSourceProxy;
