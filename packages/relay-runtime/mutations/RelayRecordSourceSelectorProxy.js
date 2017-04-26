/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordSourceSelectorProxy
 * @flow
 */

'use strict';

const invariant = require('invariant');

const {getStorageKey} = require('RelayStoreUtils');

import type {ConcreteLinkedField} from 'RelayConcreteNode';
import type {DataID} from 'RelayInternalTypes';
import type {
  RecordProxy,
  Selector,
  RecordSourceProxy,
  RecordSourceSelectorProxy,
} from 'RelayStoreTypes';

/**
 * @internal
 *
 * A subclass of RecordSourceProxy that provides convenience methods for
 * accessing the root fields of a given query/mutation. These fields accept
 * complex arguments and it can be tedious to re-construct the correct sets of
 * arguments to pass to e.g. `getRoot().getLinkedRecord()`.
 */
class RelayRecordSourceSelectorProxy implements RecordSourceSelectorProxy {
  _recordSource: RecordSourceProxy;
  _selector: Selector;

  constructor(
    recordSource: RecordSourceProxy,
    selector: Selector
  ) {
    this._recordSource = recordSource;
    this._selector = selector;
  }

  create(dataID: DataID, typeName: string): RecordProxy {
    return this._recordSource.create(dataID, typeName);
  }

  delete(dataID: DataID): void {
    this._recordSource.delete(dataID);
  }

  get(dataID: DataID): ?RecordProxy {
    return this._recordSource.get(dataID);
  }

  getRoot(): RecordProxy {
    return this._recordSource.getRoot();
  }

  _getRootField(selector: Selector, fieldName: string, plural: boolean): ConcreteLinkedField {
    const field = selector.node.selections.find(selection =>
      selection.kind === 'LinkedField' && selection.name === fieldName
    );
    invariant(
      field && field.kind === 'LinkedField',
      'RelayRecordSourceSelectorProxy#getRootField(): Cannot find root ' +
      'field `%s`, no such field is defined on GraphQL document `%s`.',
      fieldName,
      selector.node.name,
    );
    invariant(
      field.plural === plural,
      'RelayRecordSourceSelectorProxy#getRootField(): Expected root field ' +
      '`%s` to be %s.',
      fieldName,
      plural ? 'plural' : 'singular'
    );
    return field;
  }

  getRootField(fieldName: string): ?RecordProxy {
    const field = this._getRootField(this._selector, fieldName, false);
    const storageKey = getStorageKey(field, this._selector.variables);
    return this.getRoot().getLinkedRecord(storageKey);
  }

  getPluralRootField(fieldName: string): ?Array<?RecordProxy> {
    const field = this._getRootField(this._selector, fieldName, true);
    const storageKey = getStorageKey(field, this._selector.variables);
    return this.getRoot().getLinkedRecords(storageKey);
  }
}

module.exports = RelayRecordSourceSelectorProxy;
