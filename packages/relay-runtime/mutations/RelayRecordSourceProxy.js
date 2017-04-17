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
 */

'use strict';

const RelayRecordProxy = require('RelayRecordProxy');
const RelayStaticRecord = require('RelayStaticRecord');

const invariant = require('invariant');
const normalizeRelayPayload = require('normalizeRelayPayload');

const {
  EXISTENT,
  NONEXISTENT,
} = require('RelayRecordState');
const {ROOT_ID, ROOT_TYPE} = require('RelayStoreUtils');

import type {HandlerProvider} from 'RelayDefaultHandlerProvider';
import type {DataID} from 'RelayInternalTypes';
import type RelayRecordSourceMutator from 'RelayRecordSourceMutator';
import type {
  RecordProxy,
  RecordSourceProxy,
  Selector,
} from 'RelayStoreTypes';

/**
 * @internal
 *
 * A helper for manipulating a `RecordSource` via an imperative/OO-style API.
 */
class RelayRecordSourceProxy implements RecordSourceProxy {
  _handlerProvider: ?HandlerProvider;
  _mutator: RelayRecordSourceMutator;
  _proxies: {[dataID: DataID]: ?RelayRecordProxy};

  constructor(
    mutator: RelayRecordSourceMutator,
    handlerProvider?: ?HandlerProvider
  ) {
    this._mutator = mutator;
    this._handlerProvider = handlerProvider || null;
    this._proxies = {};
  }

  commitPayload(selector: Selector, response: Object): void {
    const {source, fieldPayloads} = normalizeRelayPayload(selector, response);
    const dataIDs = source.getRecordIDs();
    dataIDs.forEach((dataID) => {
      const status = source.getStatus(dataID);
      if (status === EXISTENT) {
        const sourceRecord = source.get(dataID);
        if (sourceRecord) {
          if (this._mutator.getStatus(dataID) !== EXISTENT) {
            this.create(dataID, RelayStaticRecord.getType(sourceRecord));
          }
          this._mutator.copyFieldsFromRecord(sourceRecord, dataID);
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
          'RelayStaticEnvironment: Expected a handler to be provided for handle `%s`.',
          fieldPayload.handle
        );
        handler.update(this, fieldPayload);
      });
    }
  }

  create(dataID: DataID, typeName: string): RecordProxy {
    this._mutator.create(dataID, typeName);
    delete this._proxies[dataID];
    const record = this.get(dataID);
    // For flow
    invariant(
      record,
      'RelayRecordSourceProxy#create(): Expected the created record to exist.'
    );
    return record;
  }

  delete(dataID: DataID): void {
    invariant(
      dataID !== ROOT_ID,
      'RelayRecordSourceProxy#delete(): Cannot delete the root record.'
    );
    delete this._proxies[dataID];
    this._mutator.delete(dataID);
  }

  get(dataID: DataID): ?RecordProxy {
    if (!this._proxies.hasOwnProperty(dataID)) {
      const status = this._mutator.getStatus(dataID);
      if (status === EXISTENT) {
        this._proxies[dataID] = new RelayRecordProxy(this, this._mutator, dataID);
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
      'root record.'
    );
    return root;
  }
}

module.exports = RelayRecordSourceProxy;
