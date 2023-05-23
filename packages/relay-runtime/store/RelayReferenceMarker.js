/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  NormalizationClientEdgeToClientObject,
  NormalizationFlightField,
  NormalizationLinkedField,
  NormalizationModuleImport,
  NormalizationNode,
  NormalizationResolverField,
  NormalizationSelection,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  DataIDSet,
  NormalizationSelector,
  OperationLoader,
  ReactFlightReachableExecutableDefinitions,
  Record,
  RecordSource,
} from './RelayStoreTypes';

const getOperation = require('../util/getOperation');
const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const cloneRelayHandleSourceField = require('./cloneRelayHandleSourceField');
const getOutputTypeRecordIDs = require('./experimental-live-resolvers/getOutputTypeRecordIDs');
const {getLocalVariables} = require('./RelayConcreteVariables');
const RelayModernRecord = require('./RelayModernRecord');
const RelayStoreReactFlightUtils = require('./RelayStoreReactFlightUtils');
const RelayStoreUtils = require('./RelayStoreUtils');
const {generateTypeID} = require('./TypeID');
const invariant = require('invariant');

const {
  ACTOR_CHANGE,
  CONDITION,
  CLIENT_COMPONENT,
  CLIENT_EXTENSION,
  DEFER,
  FLIGHT_FIELD,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  LINKED_HANDLE,
  SCALAR_FIELD,
  SCALAR_HANDLE,
  STREAM,
  TYPE_DISCRIMINATOR,
  RELAY_RESOLVER,
  CLIENT_EDGE_TO_CLIENT_OBJECT,
} = RelayConcreteNode;
const {ROOT_ID, getStorageKey, getModuleOperationKey} = RelayStoreUtils;

function mark(
  recordSource: RecordSource,
  selector: NormalizationSelector,
  references: DataIDSet,
  operationLoader: ?OperationLoader,
  shouldProcessClientComponents: ?boolean,
): void {
  const {dataID, node, variables} = selector;
  const marker = new RelayReferenceMarker(
    recordSource,
    variables,
    references,
    operationLoader,
    shouldProcessClientComponents,
  );
  marker.mark(node, dataID);
}

/**
 * @private
 */
class RelayReferenceMarker {
  _operationLoader: OperationLoader | null;
  _operationName: ?string;
  _recordSource: RecordSource;
  _references: DataIDSet;
  _variables: Variables;
  _shouldProcessClientComponents: ?boolean;

  constructor(
    recordSource: RecordSource,
    variables: Variables,
    references: DataIDSet,
    operationLoader: ?OperationLoader,
    shouldProcessClientComponents: ?boolean,
  ) {
    this._operationLoader = operationLoader ?? null;
    this._operationName = null;
    this._recordSource = recordSource;
    this._references = references;
    this._variables = variables;
    this._shouldProcessClientComponents = shouldProcessClientComponents;
  }

  mark(node: NormalizationNode, dataID: DataID): void {
    if (node.kind === 'Operation' || node.kind === 'SplitOperation') {
      this._operationName = node.name;
    }
    this._traverse(node, dataID);
  }

  _traverse(node: NormalizationNode, dataID: DataID): void {
    this._references.add(dataID);
    const record = this._recordSource.get(dataID);
    if (record == null) {
      return;
    }
    this._traverseSelections(node.selections, record);
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayReferenceMarker(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _traverseSelections(
    selections: $ReadOnlyArray<NormalizationSelection>,
    record: Record,
  ): void {
    selections.forEach(selection => {
      /* eslint-disable no-fallthrough */
      switch (selection.kind) {
        case ACTOR_CHANGE:
          // TODO: T89695151 Support multi-actor record sources in RelayReferenceMarker.js
          this._traverseLink(selection.linkedField, record);
          break;
        case LINKED_FIELD:
          if (selection.plural) {
            this._traversePluralLink(selection, record);
          } else {
            this._traverseLink(selection, record);
          }
          break;
        case CONDITION:
          const conditionValue = Boolean(
            this._getVariableValue(selection.condition),
          );
          if (conditionValue === selection.passingValue) {
            this._traverseSelections(selection.selections, record);
          }
          break;
        case INLINE_FRAGMENT:
          if (selection.abstractKey == null) {
            const typeName = RelayModernRecord.getType(record);
            if (
              (typeName != null && typeName === selection.type) ||
              // Our root record has a special type of `__Root` which may not
              // match the schema type of Query/Mutation or whatever the schema
              // specifies.
              //
              // If we have an inline fragment on a concrete type within an
              // operation root, and our query has been validated, we know that
              // concrete type must match, since the operation selection must be
              // on a concrete type.
              typeName === RelayStoreUtils.ROOT_TYPE
            ) {
              this._traverseSelections(selection.selections, record);
            }
          } else {
            const typeName = RelayModernRecord.getType(record);
            const typeID = generateTypeID(typeName);
            this._references.add(typeID);
            this._traverseSelections(selection.selections, record);
          }
          break;
        case FRAGMENT_SPREAD:
          const prevVariables = this._variables;
          this._variables = getLocalVariables(
            this._variables,
            selection.fragment.argumentDefinitions,
            selection.args,
          );
          this._traverseSelections(selection.fragment.selections, record);
          this._variables = prevVariables;
          break;
        case LINKED_HANDLE:
          // The selections for a "handle" field are the same as those of the
          // original linked field where the handle was applied. Reference marking
          // therefore requires traversing the original field selections against
          // the synthesized client field.
          //
          // TODO: Instead of finding the source field in `selections`, change
          // the concrete structure to allow shared subtrees, and have the linked
          // handle directly refer to the same selections as the LinkedField that
          // it was split from.
          const handleField = cloneRelayHandleSourceField(
            selection,
            selections,
            this._variables,
          );
          if (handleField.plural) {
            this._traversePluralLink(handleField, record);
          } else {
            this._traverseLink(handleField, record);
          }
          break;
        case DEFER:
        case STREAM:
          this._traverseSelections(selection.selections, record);
          break;
        case SCALAR_FIELD:
        case SCALAR_HANDLE:
          break;
        case TYPE_DISCRIMINATOR: {
          const typeName = RelayModernRecord.getType(record);
          const typeID = generateTypeID(typeName);
          this._references.add(typeID);
          break;
        }
        case MODULE_IMPORT:
          this._traverseModuleImport(selection, record);
          break;
        case CLIENT_EXTENSION:
          this._traverseSelections(selection.selections, record);
          break;
        case FLIGHT_FIELD:
          if (RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD) {
            this._traverseFlightField(selection, record);
          } else {
            throw new Error('Flight fields are not yet supported.');
          }
          break;
        case CLIENT_COMPONENT:
          if (this._shouldProcessClientComponents === false) {
            break;
          }
          this._traverseSelections(selection.fragment.selections, record);
          break;
        case RELAY_RESOLVER:
          this._traverseResolverField(selection, record);
          break;
        case CLIENT_EDGE_TO_CLIENT_OBJECT:
          this._traverseClientEdgeToClientObject(selection, record);
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayReferenceMarker: Unknown AST node `%s`.',
            selection,
          );
      }
    });
  }

  _traverseClientEdgeToClientObject(
    field: NormalizationClientEdgeToClientObject,
    record: Record,
  ): void {
    const dataID = this._traverseResolverField(field.backingField, record);
    if (dataID == null) {
      return;
    }
    const resolverRecord = this._recordSource.get(dataID);
    if (resolverRecord == null) {
      return;
    }
    if (field.backingField.isOutputType) {
      // Mark all @outputType record IDs
      const outputTypeRecordIDs = getOutputTypeRecordIDs(resolverRecord);
      if (outputTypeRecordIDs != null) {
        for (const dataID of outputTypeRecordIDs) {
          this._references.add(dataID);
        }
      }
    } else {
      const {linkedField} = field;
      const concreteType = linkedField.concreteType;
      if (concreteType == null) {
        // TODO: Handle retaining abstract client edges to client types.
        return;
      }
      if (linkedField.plural) {
        const dataIDs = RelayModernRecord.getResolverLinkedRecordIDs(
          resolverRecord,
          concreteType,
        );

        if (dataIDs != null) {
          for (const dataID of dataIDs) {
            if (dataID != null) {
              this._traverse(linkedField, dataID);
            }
          }
        }
      } else {
        const dataID = RelayModernRecord.getResolverLinkedRecordID(
          resolverRecord,
          concreteType,
        );
        if (dataID != null) {
          this._traverse(linkedField, dataID);
        }
      }
    }
  }

  _traverseResolverField(
    field: NormalizationResolverField,
    record: Record,
  ): ?DataID {
    const storageKey = getStorageKey(field, this._variables);
    const dataID = RelayModernRecord.getLinkedRecordID(record, storageKey);

    // If the resolver value has been created, we should retain it.
    // This record contains our cached resolver value, and potential Live
    // Resolver subscription.
    if (dataID != null) {
      this._references.add(dataID);
    }

    const {fragment} = field;
    if (fragment != null) {
      // Mark the contents of the resolver's data dependencies.
      this._traverseSelections([fragment], record);
    }

    return dataID;
  }

  _traverseModuleImport(
    moduleImport: NormalizationModuleImport,
    record: Record,
  ): void {
    const operationLoader = this._operationLoader;
    invariant(
      operationLoader !== null,
      'RelayReferenceMarker: Expected an operationLoader to be configured when using `@module`. ' +
        'Could not load fragment `%s` in operation `%s`.',
      moduleImport.fragmentName,
      this._operationName ?? '(unknown)',
    );
    const operationKey = getModuleOperationKey(moduleImport.documentName);
    const operationReference = RelayModernRecord.getValue(record, operationKey);
    if (operationReference == null) {
      return;
    }
    const normalizationRootNode = operationLoader.get(operationReference);
    if (normalizationRootNode != null) {
      const operation = getOperation(normalizationRootNode);
      const prevVariables = this._variables;
      this._variables = getLocalVariables(
        this._variables,
        operation.argumentDefinitions,
        moduleImport.args,
      );
      this._traverseSelections(operation.selections, record);
      this._variables = prevVariables;
    }
    // Otherwise, if the operation is not available, we assume that the data
    // cannot have been processed yet and therefore isn't in the store to
    // begin with.
  }

  _traverseLink(field: NormalizationLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);

    if (linkedID == null) {
      return;
    }
    this._traverse(field, linkedID);
  }

  _traversePluralLink(field: NormalizationLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);

    if (linkedIDs == null) {
      return;
    }
    linkedIDs.forEach(linkedID => {
      if (linkedID != null) {
        this._traverse(field, linkedID);
      }
    });
  }

  _traverseFlightField(field: NormalizationFlightField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (linkedID == null) {
      return;
    }
    this._references.add(linkedID);

    const reactFlightClientResponseRecord = this._recordSource.get(linkedID);

    if (reactFlightClientResponseRecord == null) {
      return;
    }

    const reachableExecutableDefinitions = RelayModernRecord.getValue(
      reactFlightClientResponseRecord,
      RelayStoreReactFlightUtils.REACT_FLIGHT_EXECUTABLE_DEFINITIONS_STORAGE_KEY,
    );

    if (!Array.isArray(reachableExecutableDefinitions)) {
      return;
    }

    const operationLoader = this._operationLoader;
    invariant(
      operationLoader !== null,
      'DataChecker: Expected an operationLoader to be configured when using ' +
        'React Flight',
    );
    // In Flight, the variables that are in scope for reachable executable
    // definitions aren't the same as what's in scope for the outer query.
    const prevVariables = this._variables;
    // $FlowFixMe[incompatible-cast]
    for (const definition of (reachableExecutableDefinitions: Array<ReactFlightReachableExecutableDefinitions>)) {
      this._variables = definition.variables;
      const operationReference = definition.module;
      const normalizationRootNode = operationLoader.get(operationReference);
      if (normalizationRootNode != null) {
        const operation = getOperation(normalizationRootNode);
        this._traverse(operation, ROOT_ID);
      }
    }
    this._variables = prevVariables;
  }
}

module.exports = {mark};
