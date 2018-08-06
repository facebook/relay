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

const RelayModernRecord = require('../store/RelayModernRecord');
const RelayRecordProxy = require('./RelayRecordProxy');
const RelayRecordSourceSelectorProxy = require('./RelayRecordSourceSelectorProxy');

const invariant = require('invariant');
const normalizeRelayPayload = require('../store/normalizeRelayPayload');

const {EXISTENT, NONEXISTENT} = require('../store/RelayRecordState');
const {ROOT_ID, ROOT_TYPE} = require('../store/RelayStoreUtils');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {
  HandleFieldPayload,
  RecordSource,
  RecordProxy,
  RecordSourceProxy,
  RecordSourceSelectorProxy,
  OperationSelector,
} from '../store/RelayStoreTypes';
import type {DataID} from '../util/RelayRuntimeTypes';
import type RelayRecordSourceMutator from './RelayRecordSourceMutator';

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

  publishSource(
    source: RecordSource,
    fieldPayloads?: ?Array<HandleFieldPayload>,
  ): void {
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
    this.publishSource(source, fieldPayloads);
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
