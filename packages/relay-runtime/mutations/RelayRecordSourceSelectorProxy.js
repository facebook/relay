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

const RelayRecordSourceProxy = require('RelayRecordSourceProxy');

const invariant = require('invariant');

const {getStorageKey} = require('RelayStoreUtils');

import type {ConcreteLinkedField} from 'RelayConcreteNode';
import type {HandlerProvider} from 'RelayDefaultHandlerProvider';
import type RelayRecordSourceMutator from 'RelayRecordSourceMutator';
import type {RecordProxy, Selector, RecordSourceSelectorProxy} from 'RelayStoreTypes';

/**
 * @internal
 *
 * A subclass of RecordSourceProxy that provides convenience methods for
 * accessing the root fields of a given query/mutation. These fields accept
 * complex arguments and it can be tedious to re-construct the correct sets of
 * arguments to pass to e.g. `getRoot().getLinkedRecord()`.
 */
class RelayRecordSourceSelectorProxy
  extends RelayRecordSourceProxy
  implements RecordSourceSelectorProxy {

  _selector: Selector;

  constructor(
    mutator: RelayRecordSourceMutator,
    selector: Selector,
    handlerProvider?: ?HandlerProvider
  ) {
    super(mutator, handlerProvider);
    this._selector = selector;
  }

  _getRootField(fieldName: string, plural: boolean): ConcreteLinkedField {
    const field = this._selector.node.selections.find(selection =>
      selection.kind === 'LinkedField' && selection.name === fieldName
    );
    invariant(
      field && field.kind === 'LinkedField',
      'RelayRecordSourceSelectorProxy#getRootField(): Cannot find root ' +
      'field `%s`, no such field is defined on GraphQL document `%s`.',
      fieldName,
      this._selector.node.name,
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
    const field = this._getRootField(fieldName, false);
    const storageKey = getStorageKey(field, this._selector.variables);
    return this.getRoot().getLinkedRecord(storageKey);
  }

  getPluralRootField(fieldName: string): ?Array<?RecordProxy> {
    const field = this._getRootField(fieldName, true);
    const storageKey = getStorageKey(field, this._selector.variables);
    return this.getRoot().getLinkedRecords(storageKey);
  }
}

module.exports = RelayRecordSourceSelectorProxy;
