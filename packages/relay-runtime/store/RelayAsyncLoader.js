/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayAsyncLoader
 * @flow
 */

'use strict';

const RelayConcreteNode = require('RelayConcreteNode');
const RelayModernRecord = require('RelayModernRecord');
const RelayStoreUtils = require('RelayStoreUtils');

const cloneRelayHandleSourceField = require('cloneRelayHandleSourceField');
const invariant = require('invariant');

import type {
  Disposable,
  Record,
} from 'RelayCombinedEnvironmentTypes';
import type {
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteSelection,
} from 'RelayConcreteNode';
import type {DataID} from 'RelayInternalTypes';
import type {
  AsyncLoadCallback,
  LoadingState,
  MutableRecordSource,
  RecordSource,
  Selector,
} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

const {
  CONDITION,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  SCALAR_FIELD,
} = RelayConcreteNode;
const {getStorageKey} = RelayStoreUtils;

/**
 * Attempts to synchronously check whether the records required to fulfill the
 * given `selector` are present in `source` (synchronous checks, for example,
 * are possible with the `RelayInMemoryRecordSource`).
 *
 * If so, returns `true`, and the records will be present in `target`;
 * otherwise `false`.
 */
function check(
  source: RecordSource,
  target: MutableRecordSource,
  selector: Selector
): boolean {
  let state = null;
  const {dataID, node, variables} = selector;
  function callback(loadingState: LoadingState) {
    state = loadingState;
  }
  const loader = new RelayAsyncLoader(source, target, variables, callback);
  const disposable = loader.load(node, dataID);
  disposable.dispose();
  return !!(
    state &&
    state.status === 'complete'
  );
}

/**
 * Load the records required to fulfill the given `selector` from `source` and add
 * them to `target`, calling the provided callback exactly once with an argument
 * as follows:
 * - {status: 'aborted'}: If `dispose()` was called on the Disposable returned
 *   by `load` before loading the required records could be completed.
 * - {status: 'complete'}: If a cached value/record was found for all fields in
 *   the selector.
 * - {status: 'error', error}: If an error occured loading any record from
 *   source.
 * - {status: 'missing'}: If any value/record was missing.
 *
 * Note that the callback may be called synchronously *or* asynchronously.
 */
function load(
  source: RecordSource,
  target: MutableRecordSource,
  selector: Selector,
  callback: AsyncLoadCallback
): Disposable {
  const {dataID, node, variables} = selector;
  const loader = new RelayAsyncLoader(source, target, variables, callback);
  return loader.load(node, dataID);
}

/**
 * @private
 */
class RelayAsyncLoader {
  _callback: AsyncLoadCallback;
  _done: boolean;
  _loadingCount: number;
  _source: RecordSource;
  _target: MutableRecordSource;
  _variables: Variables;

  constructor(
    source: RecordSource,
    target: MutableRecordSource,
    variables: Variables,
    callback: AsyncLoadCallback
  ) {
    this._callback = callback;
    this._done = false;
    this._loadingCount = 0;
    this._source = source;
    this._target = target;
    this._variables = variables;
  }

  load(
    node: ConcreteNode,
    dataID: DataID
  ): Disposable {
    const dispose = () => this._handleAbort();
    this._traverse(node, dataID);
    return {dispose};
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayAsyncLoader(): Undefined variable `%s`.',
      name
    );
    return this._variables[name];
  }

  _handleComplete(): void {
    if (!this._done) {
      this._done = true;
      this._callback({status: 'complete'});
    }
  }

  _handleError(error: Error): void {
    if (!this._done) {
      this._done = true;
      this._callback({
        error,
        status: 'error',
      });
    }
  }

  _handleMissing(): void {
    if (!this._done) {
      this._done = true;
      this._callback({status: 'missing'});
    }
  }

  _handleAbort(): void {
    if (!this._done) {
      this._done = true;
      this._callback({status: 'aborted'});
    }
  }

  _traverse(
    node: ConcreteNode,
    dataID: DataID
  ): void {
    // Don't load the same node twice:
    if (!this._target.has(dataID)) {
      this._loadAndTraverse(node, dataID);
    } else {
      this._loadingCount++;
      const record = this._target.get(dataID);
      if (record) {
        this._traverseSelections(node.selections, record);
      }
      this._loadingCount--;
      if (this._loadingCount === 0) {
        this._handleComplete();
      }
    }
  }

  _loadAndTraverse(
    node: ConcreteNode,
    dataID: DataID
  ): void {
    this._loadingCount++;
    this._source.load(dataID, (error, record) => {
      if (this._done) {
        return;
      }
      if (error) {
        this._handleError(error);
      } else if (record === undefined) {
        this._handleMissing();
      } else {
        if (record === null) {
          this._target.delete(dataID);
        } else {
          this._target.set(dataID, record);
          this._traverseSelections(node.selections, record);
        }
        this._loadingCount--;
        if (this._loadingCount === 0) {
          this._handleComplete();
        }
      }
    });
  }

  _traverseSelections(
    selections: Array<ConcreteSelection>,
    record: Record
  ): void {
    selections.every(selection => {
      switch (selection.kind) {
        case SCALAR_FIELD:
          this._prepareScalar(selection, record);
          break;
        case LINKED_FIELD:
          if (selection.plural) {
            this._preparePluralLink(selection, record);
          } else {
            this._prepareLink(selection, record);
          }
          break;
        case CONDITION:
          const conditionValue = this._getVariableValue(selection.condition);
          if (conditionValue === selection.passingValue) {
            this._traverseSelections(selection.selections, record);
          }
          break;
        case INLINE_FRAGMENT:
          const typeName = RelayModernRecord.getType(record);
          if (typeName != null && typeName === selection.type) {
            this._traverseSelections(selection.selections, record);
          }
          break;
        case LINKED_HANDLE:
          // Handles have no selections themselves; traverse the original field
          // where the handle was set-up instead.
          const handleField = cloneRelayHandleSourceField(selection, selections, this._variables);
          if (handleField.plural) {
            this._preparePluralLink(handleField, record);
          } else {
            this._prepareLink(handleField, record);
          }
          break;
        default:
          invariant(
            selection.kind === SCALAR_FIELD,
            'RelayAsyncLoader(): Unexpected ast kind `%s`.',
            selection.kind
          );
      }
      return !this._done;
    });
  }

  _prepareScalar(
    field: ConcreteScalarField,
    record: Record
  ): void {
    const storageKey = getStorageKey(field, this._variables);
    const fieldValue = RelayModernRecord.getValue(record, storageKey);
    if (fieldValue === undefined) {
      this._handleMissing();
    }
  }

  _prepareLink(
    field: ConcreteLinkedField,
    record: Record
  ): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);

    if (linkedID === undefined) {
      this._handleMissing();
    } else if (linkedID != null) {
      this._traverse(field, linkedID);
    }
  }

  _preparePluralLink(
    field: ConcreteLinkedField,
    record: Record
  ): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs =
      RelayModernRecord.getLinkedRecordIDs(record, storageKey);

    if (linkedIDs === undefined) {
      this._handleMissing();
    } else if (linkedIDs) {
      linkedIDs.forEach(linkedID => {
        if (linkedID != null) {
          this._traverse(field, linkedID);
        }
      });
    }
  }
}

module.exports = {
  check,
  load,
};
