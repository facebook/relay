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

const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayRecordSourceMutator = require('../mutations/RelayRecordSourceMutator');
const RelayStoreUtils = require('./RelayStoreUtils');

const cloneRelayHandleSourceField = require('./cloneRelayHandleSourceField');
const invariant = require('invariant');

const {EXISTENT, UNKNOWN} = require('./RelayRecordState');

import type {
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteSelection,
  ConcreteField,
} from '../util/RelayConcreteNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  MissingFieldHandler,
  MutableRecordSource,
  RecordSource,
  Selector,
} from './RelayStoreTypes';
import type {Record} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

const {
  CONDITION,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  SCALAR_FIELD,
} = RelayConcreteNode;
const {getStorageKey, getArgumentValues} = RelayStoreUtils;

/**
 * Synchronously check whether the records required to fulfill the
 * given `selector` are present in `source`.
 *
 * If a field is missing, it uses the provided handlers to attempt to substitute
 * data. The `target` will store all records that are modified because of a
 * successful substitution.
 *
 * If all records are present, returns `true`, otherwise `false`.
 */
function check(
  source: RecordSource,
  target: MutableRecordSource,
  selector: Selector,
  handlers: Array<MissingFieldHandler>,
): boolean {
  const {dataID, node, variables} = selector;
  const loader = new RelayDataLoader(source, target, variables, handlers);
  return loader.check(node, dataID);
}

/**
 * @private
 */
class RelayDataLoader {
  _done: boolean;
  _source: RecordSource;
  _mutator: RelayRecordSourceMutator;
  _variables: Variables;
  _recordWasMissing: boolean;
  _handlers: Array<MissingFieldHandler>;

  constructor(
    source: RecordSource,
    target: MutableRecordSource,
    variables: Variables,
    handlers: Array<MissingFieldHandler>,
  ) {
    this._source = source;
    this._variables = variables;
    this._recordWasMissing = false;
    this._handlers = handlers;
    this._mutator = new RelayRecordSourceMutator(source, target);
  }

  check(node: ConcreteNode, dataID: DataID): boolean {
    this._traverse(node, dataID);
    return !this._recordWasMissing;
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayAsyncLoader(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _handleMissing(): void {
    this._recordWasMissing = true;
  }

  _getDataForHandlers(
    field: ConcreteField,
    dataID: DataID,
  ): {args: Variables, record: ?Record} {
    return {
      args: field.args ? getArgumentValues(field.args, this._variables) : {},
      // Getting a snapshot of the record state is potentially expensive since
      // we will need to merge the sink and source records. Since we do not create
      // any new records in this process, it is probably reasonable to provide
      // handlers with a copy of the source record.
      // The only thing that the provided record will not contain is fields
      // added by previous handlers.
      record: this._source.get(dataID),
    };
  }

  _handleMissingScalarField(field: ConcreteScalarField, dataID: DataID): mixed {
    const {args, record} = this._getDataForHandlers(field, dataID);
    for (const handler of this._handlers) {
      if (handler.kind === 'scalar') {
        const newValue = handler.handle(field, record, args);
        if (newValue !== undefined) {
          return newValue;
        }
      }
    }
    this._handleMissing();
  }

  _handleMissingLinkField(field: ConcreteLinkedField, dataID: DataID): ?DataID {
    const {args, record} = this._getDataForHandlers(field, dataID);
    for (const handler of this._handlers) {
      if (handler.kind === 'linked') {
        const newValue = handler.handle(field, record, args);
        if (
          newValue != null &&
          this._mutator.getStatus(newValue) === EXISTENT
        ) {
          return newValue;
        }
      }
    }
    this._handleMissing();
  }

  _handleMissingPluralLinkField(
    field: ConcreteLinkedField,
    dataID: DataID,
  ): ?Array<?DataID> {
    const {args, record} = this._getDataForHandlers(field, dataID);
    for (const handler of this._handlers) {
      if (handler.kind === 'pluralLinked') {
        const newValue = handler.handle(field, record, args);
        if (newValue != null) {
          return newValue.filter(
            linkedID =>
              linkedID != null &&
              this._mutator.getStatus(linkedID) === EXISTENT,
          );
        }
      }
    }
    this._handleMissing();
  }

  _traverse(node: ConcreteNode, dataID: DataID): void {
    const status = this._mutator.getStatus(dataID);
    if (status === UNKNOWN) {
      this._handleMissing();
    }
    if (status === EXISTENT) {
      this._traverseSelections(node.selections, dataID);
    }
  }

  _traverseSelections(
    selections: Array<ConcreteSelection>,
    dataID: DataID,
  ): void {
    selections.every(selection => {
      switch (selection.kind) {
        case SCALAR_FIELD:
          this._prepareScalar(selection, dataID);
          break;
        case LINKED_FIELD:
          if (selection.plural) {
            this._preparePluralLink(selection, dataID);
          } else {
            this._prepareLink(selection, dataID);
          }
          break;
        case CONDITION:
          const conditionValue = this._getVariableValue(selection.condition);
          if (conditionValue === selection.passingValue) {
            this._traverseSelections(selection.selections, dataID);
          }
          break;
        case INLINE_FRAGMENT:
          const typeName = this._mutator.getType(dataID);
          if (typeName != null && typeName === selection.type) {
            this._traverseSelections(selection.selections, dataID);
          }
          break;
        case LINKED_HANDLE:
          // Handles have no selections themselves; traverse the original field
          // where the handle was set-up instead.
          const handleField = cloneRelayHandleSourceField(
            selection,
            selections,
            this._variables,
          );
          if (handleField.plural) {
            this._preparePluralLink(handleField, dataID);
          } else {
            this._prepareLink(handleField, dataID);
          }
          break;
        default:
          invariant(
            selection.kind === SCALAR_FIELD,
            'RelayAsyncLoader(): Unexpected ast kind `%s`.',
            selection.kind,
          );
      }
      return !this._done;
    });
  }

  _prepareScalar(field: ConcreteScalarField, dataID: DataID): void {
    const storageKey = getStorageKey(field, this._variables);
    let fieldValue = this._mutator.getValue(dataID, storageKey);
    if (fieldValue === undefined) {
      fieldValue = this._handleMissingScalarField(field, dataID);
      if (fieldValue !== undefined) {
        this._mutator.setValue(dataID, storageKey, fieldValue);
      }
    }
  }

  _prepareLink(field: ConcreteLinkedField, dataID: DataID): void {
    const storageKey = getStorageKey(field, this._variables);
    let linkedID = this._mutator.getLinkedRecordID(dataID, storageKey);

    if (linkedID === undefined) {
      linkedID = this._handleMissingLinkField(field, dataID);
      if (linkedID != null) {
        this._mutator.setLinkedRecordID(dataID, storageKey, linkedID);
      }
    }
    if (linkedID != null) {
      this._traverse(field, linkedID);
    }
  }

  _preparePluralLink(field: ConcreteLinkedField, dataID: DataID): void {
    const storageKey = getStorageKey(field, this._variables);
    let linkedIDs = this._mutator.getLinkedRecordIDs(dataID, storageKey);

    if (linkedIDs === undefined) {
      linkedIDs = this._handleMissingPluralLinkField(field, dataID);
      if (linkedIDs != null) {
        this._mutator.setLinkedRecordIDs(dataID, storageKey, linkedIDs);
      }
    }
    if (linkedIDs) {
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
};
