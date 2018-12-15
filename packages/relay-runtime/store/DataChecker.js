/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayRecordSourceMutator = require('../mutations/RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('../mutations/RelayRecordSourceProxy');
const RelayStoreUtils = require('./RelayStoreUtils');

const cloneRelayHandleSourceField = require('./cloneRelayHandleSourceField');
const invariant = require('invariant');

const {EXISTENT, UNKNOWN} = require('./RelayRecordState');

import type {
  NormalizationLinkedField,
  NormalizationMatchField,
  NormalizationNode,
  NormalizationScalarField,
  NormalizationSelection,
  NormalizationField,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  OperationLoader,
  MissingFieldHandler,
  MutableRecordSource,
  RecordSource,
  NormalizationSelector,
} from './RelayStoreTypes';
import type {Record} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

const {
  CONDITION,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  MATCH_FIELD,
  SCALAR_FIELD,
  SCALAR_HANDLE,
} = RelayConcreteNode;
const {getStorageKey, getArgumentValues, MATCH_FRAGMENT_KEY} = RelayStoreUtils;

/**
 * Synchronously check whether the records required to fulfill the given
 * `selector` are present in `source`.
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
  selector: NormalizationSelector,
  handlers: $ReadOnlyArray<MissingFieldHandler>,
  operationLoader: ?OperationLoader,
): boolean {
  const {dataID, node, variables} = selector;
  const checker = new DataChecker(
    source,
    target,
    variables,
    handlers,
    operationLoader,
  );
  return checker.check(node, dataID);
}

/**
 * @private
 */
class DataChecker {
  _operationLoader: OperationLoader | null;
  _handlers: $ReadOnlyArray<MissingFieldHandler>;
  _mutator: RelayRecordSourceMutator;
  _recordWasMissing: boolean;
  _recordSourceProxy: RelayRecordSourceProxy;
  _source: RecordSource;
  _variables: Variables;

  constructor(
    source: RecordSource,
    target: MutableRecordSource,
    variables: Variables,
    handlers: $ReadOnlyArray<MissingFieldHandler>,
    operationLoader: ?OperationLoader,
  ) {
    this._operationLoader = operationLoader ?? null;
    this._handlers = handlers;
    this._mutator = new RelayRecordSourceMutator(source, target);
    this._recordWasMissing = false;
    this._source = source;
    this._variables = variables;
    this._recordSourceProxy = new RelayRecordSourceProxy(this._mutator);
  }

  check(node: NormalizationNode, dataID: DataID): boolean {
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
    field: NormalizationField,
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

  _handleMissingScalarField(
    field: NormalizationScalarField,
    dataID: DataID,
  ): mixed {
    const {args, record} = this._getDataForHandlers(field, dataID);
    for (const handler of this._handlers) {
      if (handler.kind === 'scalar') {
        const newValue = handler.handle(
          field,
          record,
          args,
          this._recordSourceProxy,
        );
        if (newValue !== undefined) {
          return newValue;
        }
      }
    }
    this._handleMissing();
  }

  _handleMissingLinkField(
    field: NormalizationLinkedField,
    dataID: DataID,
  ): ?DataID {
    const {args, record} = this._getDataForHandlers(field, dataID);
    for (const handler of this._handlers) {
      if (handler.kind === 'linked') {
        const newValue = handler.handle(
          field,
          record,
          args,
          this._recordSourceProxy,
        );
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
    field: NormalizationLinkedField,
    dataID: DataID,
  ): ?Array<?DataID> {
    const {args, record} = this._getDataForHandlers(field, dataID);
    for (const handler of this._handlers) {
      if (handler.kind === 'pluralLinked') {
        const newValue = handler.handle(
          field,
          record,
          args,
          this._recordSourceProxy,
        );
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

  _traverse(node: NormalizationNode, dataID: DataID): void {
    const status = this._mutator.getStatus(dataID);
    if (status === UNKNOWN) {
      this._handleMissing();
    }
    if (status === EXISTENT) {
      this._traverseSelections(node.selections, dataID);
    }
  }

  _traverseSelections(
    selections: $ReadOnlyArray<NormalizationSelection>,
    dataID: DataID,
  ): void {
    selections.forEach(selection => {
      switch (selection.kind) {
        case SCALAR_FIELD:
          this._checkScalar(selection, dataID);
          break;
        case LINKED_FIELD:
          if (selection.plural) {
            this._checkPluralLink(selection, dataID);
          } else {
            this._checkLink(selection, dataID);
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
            this._checkPluralLink(handleField, dataID);
          } else {
            this._checkLink(handleField, dataID);
          }
          break;
        case MATCH_FIELD:
          this._checkMatch(selection, dataID);
          break;
        case SCALAR_HANDLE:
        case FRAGMENT_SPREAD:
          invariant(
            false,
            'RelayAsyncLoader(): Unexpected ast kind `%s`.',
            selection.kind,
          );
          // $FlowExpectedError - we need the break; for OSS linter
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayAsyncLoader(): Unexpected ast kind `%s`.',
            selection.kind,
          );
      }
    });
  }

  _checkMatch(field: NormalizationMatchField, dataID: DataID): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = this._mutator.getLinkedRecordID(dataID, storageKey);

    if (linkedID === undefined) {
      this._handleMissing();
    } else if (linkedID !== null) {
      const status = this._mutator.getStatus(linkedID);
      if (status === UNKNOWN) {
        this._handleMissing();
        return;
      }
      if (status !== EXISTENT) {
        return;
      }
      const typeName = this._mutator.getType(linkedID);
      const match = typeName != null ? field.matchesByType[typeName] : null;
      if (match != null) {
        const operationLoader = this._operationLoader;
        invariant(
          operationLoader !== null,
          'DataChecker: Expected an operationLoader to be configured when using `@match`.',
        );
        const operationReference = this._mutator.getValue(
          linkedID,
          MATCH_FRAGMENT_KEY,
        );
        if (operationReference === undefined) {
          this._handleMissing();
          return;
        } else if (operationReference === null) {
          return;
        }
        const operation = operationLoader.get(operationReference);
        if (operation != null) {
          this._traverse(operation, linkedID);
        } else {
          // If the fragment is not available, we assume that the data cannot have been
          // processed yet and must therefore be missing.
          this._handleMissing();
        }
      } else {
        // TODO: warn: store is corrupt: the field should be null if the typename did not match
      }
    }
  }

  _checkScalar(field: NormalizationScalarField, dataID: DataID): void {
    const storageKey = getStorageKey(field, this._variables);
    let fieldValue = this._mutator.getValue(dataID, storageKey);
    if (fieldValue === undefined) {
      fieldValue = this._handleMissingScalarField(field, dataID);
      if (fieldValue !== undefined) {
        this._mutator.setValue(dataID, storageKey, fieldValue);
      }
    }
  }

  _checkLink(field: NormalizationLinkedField, dataID: DataID): void {
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

  _checkPluralLink(field: NormalizationLinkedField, dataID: DataID): void {
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
