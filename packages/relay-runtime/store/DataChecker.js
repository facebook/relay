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

// flowlint ambiguous-object-type:error

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const RelayModernRecord = require('./RelayModernRecord');
const RelayRecordSourceMutator = require('../mutations/RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('../mutations/RelayRecordSourceProxy');
const RelayStoreReactFlightUtils = require('./RelayStoreReactFlightUtils');
const RelayStoreUtils = require('./RelayStoreUtils');

const cloneRelayHandleSourceField = require('./cloneRelayHandleSourceField');
const cloneRelayScalarHandleSourceField = require('./cloneRelayScalarHandleSourceField');
const getOperation = require('../util/getOperation');
const invariant = require('invariant');

const {isClientID} = require('./ClientID');
const {EXISTENT, UNKNOWN} = require('./RelayRecordState');
const {generateTypeID} = require('./TypeID');

import type {
  NormalizationField,
  NormalizationFlightField,
  NormalizationLinkedField,
  NormalizationModuleImport,
  NormalizationNode,
  NormalizationScalarField,
  NormalizationSelection,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  MissingFieldHandler,
  MutableRecordSource,
  NormalizationSelector,
  OperationLoader,
  ReactFlightReachableQuery,
  Record,
  RecordSource,
} from './RelayStoreTypes';

export type Availability = {|
  +status: 'available' | 'missing',
  +mostRecentlyInvalidatedAt: ?number,
|};

const {
  CONDITION,
  CLIENT_EXTENSION,
  DEFER,
  FLIGHT_FIELD,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  MODULE_IMPORT,
  SCALAR_FIELD,
  SCALAR_HANDLE,
  STREAM,
  TYPE_DISCRIMINATOR,
} = RelayConcreteNode;
const {
  ROOT_ID,
  getModuleOperationKey,
  getStorageKey,
  getArgumentValues,
} = RelayStoreUtils;

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
  getDataID: GetDataID,
): Availability {
  const {dataID, node, variables} = selector;
  const checker = new DataChecker(
    source,
    target,
    variables,
    handlers,
    operationLoader,
    getDataID,
  );
  return checker.check(node, dataID);
}

/**
 * @private
 */
class DataChecker {
  _handlers: $ReadOnlyArray<MissingFieldHandler>;
  _mostRecentlyInvalidatedAt: number | null;
  _mutator: RelayRecordSourceMutator;
  _operationLoader: OperationLoader | null;
  _operationLastWrittenAt: ?number;
  _recordSourceProxy: RelayRecordSourceProxy;
  _recordWasMissing: boolean;
  _source: RecordSource;
  _variables: Variables;

  constructor(
    source: RecordSource,
    target: MutableRecordSource,
    variables: Variables,
    handlers: $ReadOnlyArray<MissingFieldHandler>,
    operationLoader: ?OperationLoader,
    getDataID: GetDataID,
  ) {
    const mutator = new RelayRecordSourceMutator(source, target);
    this._mostRecentlyInvalidatedAt = null;
    this._handlers = handlers;
    this._mutator = mutator;
    this._operationLoader = operationLoader ?? null;
    this._recordSourceProxy = new RelayRecordSourceProxy(mutator, getDataID);
    this._recordWasMissing = false;
    this._source = source;
    this._variables = variables;
  }

  check(node: NormalizationNode, dataID: DataID): Availability {
    this._traverse(node, dataID);

    return this._recordWasMissing === true
      ? {
          status: 'missing',
          mostRecentlyInvalidatedAt: this._mostRecentlyInvalidatedAt,
        }
      : {
          status: 'available',
          mostRecentlyInvalidatedAt: this._mostRecentlyInvalidatedAt,
        };
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
  ): {
    args: Variables,
    record: ?Record,
    ...
  } {
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
    if (field.name === 'id' && field.alias == null && isClientID(dataID)) {
      return undefined;
    }
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
          newValue !== undefined &&
          (newValue === null || this._mutator.getStatus(newValue) === EXISTENT)
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
          const allItemsKnown = newValue.every(
            linkedID =>
              linkedID != null &&
              this._mutator.getStatus(linkedID) === EXISTENT,
          );
          if (allItemsKnown) {
            return newValue;
          }
        } else if (newValue === null) {
          return null;
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
      const record = this._source.get(dataID);
      const invalidatedAt = RelayModernRecord.getInvalidationEpoch(record);
      if (invalidatedAt != null) {
        this._mostRecentlyInvalidatedAt =
          this._mostRecentlyInvalidatedAt != null
            ? Math.max(this._mostRecentlyInvalidatedAt, invalidatedAt)
            : invalidatedAt;
      }

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
        case INLINE_FRAGMENT: {
          const {abstractKey} = selection;
          if (abstractKey == null) {
            // concrete type refinement: only check data if the type exactly matches
            const typeName = this._mutator.getType(dataID);
            if (typeName === selection.type) {
              this._traverseSelections(selection.selections, dataID);
            }
          } else if (RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT) {
            // Abstract refinement: check data depending on whether the type
            // conforms to the interface/union or not:
            // - Type known to _not_ implement the interface: don't check the selections.
            // - Type is known _to_ implement the interface: check selections.
            // - Unknown whether the type implements the interface: don't check the selections
            //   and treat the data as missing; we do this because the Relay Compiler
            //   guarantees that the type discriminator will always be fetched.
            const recordType = this._mutator.getType(dataID);
            invariant(
              recordType != null,
              'DataChecker: Expected record `%s` to have a known type',
              dataID,
            );
            const typeID = generateTypeID(recordType);
            const implementsInterface = this._mutator.getValue(
              typeID,
              abstractKey,
            );
            if (implementsInterface === true) {
              this._traverseSelections(selection.selections, dataID);
            } else if (implementsInterface == null) {
              // unsure if the type implements the interface: data is
              // missing so don't bother reading the fragment
              this._handleMissing();
            } // else false: known to not implement the interface
          } else {
            // legacy behavior for abstract refinements: always check even
            // if the type doesn't conform
            this._traverseSelections(selection.selections, dataID);
          }
          break;
        }
        case LINKED_HANDLE: {
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
        }
        case SCALAR_HANDLE: {
          const handleField = cloneRelayScalarHandleSourceField(
            selection,
            selections,
            this._variables,
          );

          this._checkScalar(handleField, dataID);
          break;
        }
        case MODULE_IMPORT:
          this._checkModuleImport(selection, dataID);
          break;
        case DEFER:
        case STREAM:
          this._traverseSelections(selection.selections, dataID);
          break;
        // $FlowFixMe[incompatible-type]
        case FRAGMENT_SPREAD:
          invariant(
            false,
            'RelayAsyncLoader(): Unexpected ast kind `%s`.',
            selection.kind,
          );
          // $FlowExpectedError[unreachable-code] - we need the break; for OSS linter
          break;
        case CLIENT_EXTENSION:
          const recordWasMissing = this._recordWasMissing;
          this._traverseSelections(selection.selections, dataID);
          this._recordWasMissing = recordWasMissing;
          break;
        case TYPE_DISCRIMINATOR:
          if (RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT) {
            const {abstractKey} = selection;
            const recordType = this._mutator.getType(dataID);
            invariant(
              recordType != null,
              'DataChecker: Expected record `%s` to have a known type',
              dataID,
            );
            const typeID = generateTypeID(recordType);
            const implementsInterface = this._mutator.getValue(
              typeID,
              abstractKey,
            );
            if (implementsInterface == null) {
              // unsure if the type implements the interface: data is
              // missing
              this._handleMissing();
            } // else: if it does or doesn't implement, we don't need to check or skip anything else
          }
          break;
        case FLIGHT_FIELD:
          if (RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD) {
            this._checkFlightField(selection, dataID);
          } else {
            throw new Error('Flight fields are not yet supported.');
          }
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

  _checkModuleImport(
    moduleImport: NormalizationModuleImport,
    dataID: DataID,
  ): void {
    const operationLoader = this._operationLoader;
    invariant(
      operationLoader !== null,
      'DataChecker: Expected an operationLoader to be configured when using `@module`.',
    );
    const operationKey = getModuleOperationKey(moduleImport.documentName);
    const operationReference = this._mutator.getValue(dataID, operationKey);
    if (operationReference == null) {
      if (operationReference === undefined) {
        this._handleMissing();
      }
      return;
    }
    const normalizationRootNode = operationLoader.get(operationReference);
    if (normalizationRootNode != null) {
      const operation = getOperation(normalizationRootNode);
      this._traverse(operation, dataID);
    } else {
      // If the fragment is not available, we assume that the data cannot have been
      // processed yet and must therefore be missing.
      this._handleMissing();
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
      } else if (linkedID === null) {
        this._mutator.setValue(dataID, storageKey, null);
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
      } else if (linkedIDs === null) {
        this._mutator.setValue(dataID, storageKey, null);
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

  _checkFlightField(field: NormalizationFlightField, dataID: DataID): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = this._mutator.getLinkedRecordID(dataID, storageKey);

    if (linkedID == null) {
      if (linkedID === undefined) {
        this._handleMissing();
        return;
      }
      return;
    }

    const tree = this._mutator.getValue(
      linkedID,
      RelayStoreReactFlightUtils.REACT_FLIGHT_TREE_STORAGE_KEY,
    );
    const reachableQueries = this._mutator.getValue(
      linkedID,
      RelayStoreReactFlightUtils.REACT_FLIGHT_QUERIES_STORAGE_KEY,
    );

    if (tree == null || !Array.isArray(reachableQueries)) {
      this._handleMissing();
      return;
    }

    const operationLoader = this._operationLoader;
    invariant(
      operationLoader !== null,
      'DataChecker: Expected an operationLoader to be configured when using ' +
        'React Flight.',
    );
    // In Flight, the variables that are in scope for reachable queries aren't
    // the same as what's in scope for the outer query.
    const prevVariables = this._variables;
    // $FlowFixMe[incompatible-cast]
    for (const query of (reachableQueries: Array<ReactFlightReachableQuery>)) {
      this._variables = query.variables;
      const normalizationRootNode = operationLoader.get(query.module);
      if (normalizationRootNode != null) {
        const operation = getOperation(normalizationRootNode);
        this._traverseSelections(operation.selections, ROOT_ID);
      } else {
        // If the fragment is not available, we assume that the data cannot have
        // been processed yet and must therefore be missing.
        this._handleMissing();
      }
    }
    this._variables = prevVariables;
  }
}

module.exports = {
  check,
};
