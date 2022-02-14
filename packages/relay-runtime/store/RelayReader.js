/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {
  ReaderActorChange,
  ReaderClientEdge,
  ReaderFlightField,
  ReaderFragment,
  ReaderFragmentSpread,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderNode,
  ReaderRelayResolver,
  ReaderRequiredField,
  ReaderScalarField,
  ReaderSelection,
} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  ClientEdgeTraversalInfo,
  DataIDSet,
  MissingClientEdgeRequestInfo,
  MissingRequiredFields,
  Record,
  RecordSource,
  RequestDescriptor,
  SelectorData,
  SingularReaderSelector,
  Snapshot,
} from './RelayStoreTypes';
import type {ResolverCache} from './ResolverCache';

const {
  ACTOR_CHANGE,
  CLIENT_EDGE,
  CLIENT_EXTENSION,
  CONDITION,
  DEFER,
  FLIGHT_FIELD,
  FRAGMENT_SPREAD,
  INLINE_DATA_FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  RELAY_RESOLVER,
  REQUIRED_FIELD,
  SCALAR_FIELD,
  STREAM,
} = require('../util/RelayConcreteNode');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const ClientID = require('./ClientID');
const RelayModernRecord = require('./RelayModernRecord');
const {getReactFlightClientResponse} = require('./RelayStoreReactFlightUtils');
const {
  CLIENT_EDGE_TRAVERSAL_PATH,
  FRAGMENT_OWNER_KEY,
  FRAGMENT_PROP_NAME_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  IS_WITHIN_UNMATCHED_TYPE_REFINEMENT,
  MODULE_COMPONENT_KEY,
  ROOT_ID,
  getArgumentValues,
  getModuleComponentKey,
  getStorageKey,
} = require('./RelayStoreUtils');
const {NoopResolverCache} = require('./ResolverCache');
const {withResolverContext} = require('./ResolverFragments');
const {generateTypeID} = require('./TypeID');
const invariant = require('invariant');

function read(
  recordSource: RecordSource,
  selector: SingularReaderSelector,
  resolverCache?: ResolverCache,
): Snapshot {
  const reader = new RelayReader(
    recordSource,
    selector,
    resolverCache ?? new NoopResolverCache(),
  );
  return reader.read();
}

/**
 * @private
 */
class RelayReader {
  _clientEdgeTraversalPath: Array<ClientEdgeTraversalInfo | null>;
  _isMissingData: boolean;
  _missingClientEdges: Array<MissingClientEdgeRequestInfo>;
  _isWithinUnmatchedTypeRefinement: boolean;
  _missingRequiredFields: ?MissingRequiredFields;
  _owner: RequestDescriptor;
  _recordSource: RecordSource;
  _seenRecords: DataIDSet;
  _selector: SingularReaderSelector;
  _variables: Variables;
  _resolverCache: ResolverCache;
  _fragmentName: string;

  constructor(
    recordSource: RecordSource,
    selector: SingularReaderSelector,
    resolverCache: ResolverCache,
  ) {
    this._clientEdgeTraversalPath =
      RelayFeatureFlags.ENABLE_CLIENT_EDGES &&
      selector.clientEdgeTraversalPath?.length
        ? [...selector.clientEdgeTraversalPath]
        : [];
    this._missingClientEdges = [];
    this._isMissingData = false;
    this._isWithinUnmatchedTypeRefinement = false;
    this._missingRequiredFields = null;
    this._owner = selector.owner;
    this._recordSource = recordSource;
    this._seenRecords = new Set();
    this._selector = selector;
    this._variables = selector.variables;
    this._resolverCache = resolverCache;
    this._fragmentName = selector.node.name;
  }

  read(): Snapshot {
    const {node, dataID, isWithinUnmatchedTypeRefinement} = this._selector;
    const {abstractKey} = node;
    const record = this._recordSource.get(dataID);

    // Relay historically allowed child fragments to be read even if the root object
    // did not match the type of the fragment: either the root object has a different
    // concrete type than the fragment (for concrete fragments) or the root object does
    // not conform to the interface/union for abstract fragments.
    // For suspense purposes, however, we want to accurately compute whether any data
    // is missing: but if the fragment type doesn't match (or a parent type didn't
    // match), then no data is expected to be present.

    // By default data is expected to be present unless this selector was read out
    // from within a non-matching type refinement in a parent fragment:
    let isDataExpectedToBePresent = !isWithinUnmatchedTypeRefinement;

    // If this is a concrete fragment and the concrete type of the record does not
    // match, then no data is expected to be present.
    if (isDataExpectedToBePresent && abstractKey == null && record != null) {
      const recordType = RelayModernRecord.getType(record);
      if (
        recordType !== node.type &&
        // The root record type is a special `__Root` type and may not match the
        // type on the ast, so ignore type mismatches at the root.
        // We currently detect whether we're at the root by checking against ROOT_ID,
        // but this does not work for mutations/subscriptions which generate unique
        // root ids. This is acceptable in practice as we don't read data for mutations/
        // subscriptions in a situation where we would use isMissingData to decide whether
        // to suspend or not.
        // TODO T96653810: Correctly detect reading from root of mutation/subscription
        dataID !== ROOT_ID
      ) {
        isDataExpectedToBePresent = false;
      }
    }

    // If this is an abstract fragment (and the precise refinement GK is enabled)
    // then data is only expected to be present if the record type is known to
    // implement the interface. If we aren't sure whether the record implements
    // the interface, that itself constitutes "expected" data being missing.
    if (isDataExpectedToBePresent && abstractKey != null && record != null) {
      const recordType = RelayModernRecord.getType(record);
      const typeID = generateTypeID(recordType);
      const typeRecord = this._recordSource.get(typeID);
      const implementsInterface =
        typeRecord != null
          ? RelayModernRecord.getValue(typeRecord, abstractKey)
          : null;
      if (implementsInterface === false) {
        // Type known to not implement the interface
        isDataExpectedToBePresent = false;
      } else if (implementsInterface == null) {
        // Don't know if the type implements the interface or not
        this._isMissingData = true;
      }
    }

    this._isWithinUnmatchedTypeRefinement = !isDataExpectedToBePresent;
    const data = this._traverse(node, dataID, null);
    return {
      data,
      isMissingData: this._isMissingData && isDataExpectedToBePresent,
      missingClientEdges:
        RelayFeatureFlags.ENABLE_CLIENT_EDGES && this._missingClientEdges.length
          ? this._missingClientEdges
          : null,
      seenRecords: this._seenRecords,
      selector: this._selector,
      missingRequiredFields: this._missingRequiredFields,
    };
  }

  _markDataAsMissing(): void {
    this._isMissingData = true;
    if (
      RelayFeatureFlags.ENABLE_CLIENT_EDGES &&
      this._clientEdgeTraversalPath.length
    ) {
      const top =
        this._clientEdgeTraversalPath[this._clientEdgeTraversalPath.length - 1];
      // Top can be null if we've traversed past a client edge into an ordinary
      // client extension field; we never want to fetch in response to missing
      // data off of a client extension field.
      if (top !== null) {
        this._missingClientEdges.push({
          request: top.readerClientEdge.operation,
          clientEdgeDestinationID: top.clientEdgeDestinationID,
        });
      }
    }
  }

  _traverse(
    node: ReaderNode,
    dataID: DataID,
    prevData: ?SelectorData,
  ): ?SelectorData {
    const record = this._recordSource.get(dataID);
    this._seenRecords.add(dataID);
    if (record == null) {
      if (record === undefined) {
        this._markDataAsMissing();
      }
      return record;
    }
    const data = prevData || {};
    const hadRequiredData = this._traverseSelections(
      node.selections,
      record,
      data,
    );
    return hadRequiredData ? data : null;
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayReader(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _maybeReportUnexpectedNull(
    fieldPath: string,
    action: 'LOG' | 'THROW',
    record: Record,
  ) {
    if (this._missingRequiredFields?.action === 'THROW') {
      // Chained @required directives may cause a parent `@required(action:
      // THROW)` field to become null, so the first missing field we
      // encounter is likely to be the root cause of the error.
      return;
    }
    const owner = this._fragmentName;

    switch (action) {
      case 'THROW':
        this._missingRequiredFields = {action, field: {path: fieldPath, owner}};
        return;
      case 'LOG':
        if (this._missingRequiredFields == null) {
          this._missingRequiredFields = {
            action,
            fields: [{path: fieldPath, owner}],
          };
        } else {
          this._missingRequiredFields = {
            action,
            fields: [
              ...this._missingRequiredFields.fields,
              {path: fieldPath, owner},
            ],
          };
        }
        return;
      default:
        (action: empty);
    }
  }

  _traverseSelections(
    selections: $ReadOnlyArray<ReaderSelection>,
    record: Record,
    data: SelectorData,
  ): boolean /* had all expected data */ {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case REQUIRED_FIELD:
          const fieldValue = this._readRequiredField(selection, record, data);
          if (fieldValue == null) {
            const {action} = selection;
            if (action !== 'NONE') {
              this._maybeReportUnexpectedNull(selection.path, action, record);
            }
            // We are going to throw, or our parent is going to get nulled out.
            // Either way, sibling values are going to be ignored, so we can
            // bail early here as an optimization.
            return false;
          }
          break;
        case SCALAR_FIELD:
          this._readScalar(selection, record, data);
          break;
        case LINKED_FIELD:
          if (selection.plural) {
            this._readPluralLink(selection, record, data);
          } else {
            this._readLink(selection, record, data);
          }
          break;
        case CONDITION:
          const conditionValue = Boolean(
            this._getVariableValue(selection.condition),
          );
          if (conditionValue === selection.passingValue) {
            const hasExpectedData = this._traverseSelections(
              selection.selections,
              record,
              data,
            );
            if (!hasExpectedData) {
              return false;
            }
          }
          break;
        case INLINE_FRAGMENT: {
          const {abstractKey} = selection;
          if (abstractKey == null) {
            // concrete type refinement: only read data if the type exactly matches
            const typeName = RelayModernRecord.getType(record);
            if (typeName != null && typeName === selection.type) {
              const hasExpectedData = this._traverseSelections(
                selection.selections,
                record,
                data,
              );
              if (!hasExpectedData) {
                return false;
              }
            }
          } else {
            // Similar to the logic in read(): data is only expected to be present
            // if the record is known to conform to the interface. If we don't know
            // whether the type conforms or not, that constitutes missing data.

            // store flags to reset after reading
            const parentIsMissingData = this._isMissingData;
            const parentIsWithinUnmatchedTypeRefinement =
              this._isWithinUnmatchedTypeRefinement;

            const typeName = RelayModernRecord.getType(record);
            const typeID = generateTypeID(typeName);
            const typeRecord = this._recordSource.get(typeID);
            const implementsInterface =
              typeRecord != null
                ? RelayModernRecord.getValue(typeRecord, abstractKey)
                : null;
            this._isWithinUnmatchedTypeRefinement =
              parentIsWithinUnmatchedTypeRefinement ||
              implementsInterface === false;
            this._traverseSelections(selection.selections, record, data);
            this._isWithinUnmatchedTypeRefinement =
              parentIsWithinUnmatchedTypeRefinement;

            if (implementsInterface === false) {
              // Type known to not implement the interface, no data expected
              this._isMissingData = parentIsMissingData;
            } else if (implementsInterface == null) {
              // Don't know if the type implements the interface or not
              this._markDataAsMissing();
            }
          }
          break;
        }
        case RELAY_RESOLVER: {
          if (!RelayFeatureFlags.ENABLE_RELAY_RESOLVERS) {
            throw new Error('Relay Resolver fields are not yet supported.');
          }
          this._readResolverField(selection, record, data);
          break;
        }
        case FRAGMENT_SPREAD:
          this._createFragmentPointer(selection, record, data);
          break;
        case MODULE_IMPORT:
          this._readModuleImport(selection, record, data);
          break;
        case INLINE_DATA_FRAGMENT_SPREAD:
          this._createInlineDataOrResolverFragmentPointer(
            selection,
            record,
            data,
          );
          break;
        case DEFER:
        case CLIENT_EXTENSION: {
          const isMissingData = this._isMissingData;
          const alreadyMissingClientEdges = this._missingClientEdges.length;
          if (RelayFeatureFlags.ENABLE_CLIENT_EDGES) {
            this._clientEdgeTraversalPath.push(null);
          }
          const hasExpectedData = this._traverseSelections(
            selection.selections,
            record,
            data,
          );
          // The only case where we want to suspend due to missing data off of
          // a client extension is if we reached a client edge that we might be
          // able to fetch:
          this._isMissingData =
            isMissingData ||
            this._missingClientEdges.length > alreadyMissingClientEdges;
          if (RelayFeatureFlags.ENABLE_CLIENT_EDGES) {
            this._clientEdgeTraversalPath.pop();
          }
          if (!hasExpectedData) {
            return false;
          }
          break;
        }
        case STREAM: {
          const hasExpectedData = this._traverseSelections(
            selection.selections,
            record,
            data,
          );
          if (!hasExpectedData) {
            return false;
          }
          break;
        }
        case FLIGHT_FIELD:
          if (RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD) {
            this._readFlightField(selection, record, data);
          } else {
            throw new Error('Flight fields are not yet supported.');
          }
          break;
        case ACTOR_CHANGE:
          this._readActorChange(selection, record, data);
          break;
        case CLIENT_EDGE:
          if (RelayFeatureFlags.ENABLE_CLIENT_EDGES) {
            this._readClientEdge(selection, record, data);
          } else {
            throw new Error('Client edges are not yet supported.');
          }
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayReader(): Unexpected ast kind `%s`.',
            selection.kind,
          );
      }
    }
    return true;
  }

  _readRequiredField(
    selection: ReaderRequiredField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    switch (selection.field.kind) {
      case SCALAR_FIELD:
        return this._readScalar(selection.field, record, data);
      case LINKED_FIELD:
        if (selection.field.plural) {
          return this._readPluralLink(selection.field, record, data);
        } else {
          return this._readLink(selection.field, record, data);
        }
      case RELAY_RESOLVER:
        if (!RelayFeatureFlags.ENABLE_RELAY_RESOLVERS) {
          throw new Error('Relay Resolver fields are not yet supported.');
        }
        return this._readResolverField(selection.field, record, data);
      default:
        (selection.field.kind: empty);
        invariant(
          false,
          'RelayReader(): Unexpected ast kind `%s`.',
          selection.kind,
        );
    }
  }

  _readResolverField(
    field: ReaderRelayResolver,
    record: Record,
    data: SelectorData,
  ): mixed {
    const {resolverModule, fragment} = field;
    const storageKey = getStorageKey(field, this._variables);
    const resolverID = ClientID.generateClientID(
      RelayModernRecord.getDataID(record),
      storageKey,
    );

    // Found when reading the resolver fragment, which can happen either when
    // evaluating the resolver and it calls readFragment, or when checking if the
    // inputs have changed since a previous evaluation:
    let fragmentValue;
    let fragmentReaderSelector;
    let fragmentMissingRequiredFields: ?MissingRequiredFields;
    let previousMissingRequriedFields: ?MissingRequiredFields;
    const fragmentSeenRecordIDs = new Set();

    const getDataForResolverFragment = singularReaderSelector => {
      if (fragmentValue != null) {
        // It was already read when checking for input staleness; no need to read it again.
        // Note that the variables like fragmentSeenRecordIDs in the outer closure will have
        // already been set and will still be used in this case.
        return fragmentValue;
      }
      fragmentReaderSelector = singularReaderSelector;
      const existingSeenRecords = this._seenRecords;
      try {
        this._seenRecords = fragmentSeenRecordIDs;
        const resolverFragmentData = {};
        previousMissingRequriedFields = this._missingRequiredFields;
        this._missingRequiredFields = null;
        this._createInlineDataOrResolverFragmentPointer(
          singularReaderSelector.node,
          record,
          resolverFragmentData,
        );
        fragmentMissingRequiredFields = this._missingRequiredFields;
        fragmentValue = resolverFragmentData[FRAGMENTS_KEY]?.[fragment.name];
        invariant(
          typeof fragmentValue === 'object' && fragmentValue !== null,
          `Expected reader data to contain a __fragments property with a property for the fragment named ${fragment.name}, but it is missing.`,
        );
        return fragmentValue;
      } finally {
        this._seenRecords = existingSeenRecords;
        this._missingRequiredFields = previousMissingRequriedFields;
      }
    };
    const resolverContext = {getDataForResolverFragment};

    const [result, seenRecord, missingRequiredFields] =
      this._resolverCache.readFromCacheOrEvaluate(
        record,
        field,
        this._variables,
        () => {
          const key = {
            __id: RelayModernRecord.getDataID(record),
            __fragmentOwner: this._owner,
            __fragments: {
              [fragment.name]: {}, // Arguments to this fragment; not yet supported.
            },
          };
          return withResolverContext(resolverContext, () => {
            // $FlowFixMe[prop-missing] - resolver module's type signature is a lie
            const resolverResult = resolverModule(key);
            return {
              resolverResult,
              fragmentValue,
              resolverID,
              seenRecordIDs: fragmentSeenRecordIDs,
              readerSelector: fragmentReaderSelector,
              missingRequiredFields: fragmentMissingRequiredFields,
            };
          });
        },
        getDataForResolverFragment,
      );

    if (missingRequiredFields != null) {
      this._addMissingRequiredFields(missingRequiredFields);
    }
    if (seenRecord != null) {
      this._seenRecords.add(seenRecord);
    }

    const applicationName = field.alias ?? field.name;
    data[applicationName] = result;
    return result;
  }

  _readClientEdge(
    field: ReaderClientEdge,
    record: Record,
    data: SelectorData,
  ): void {
    const backingField = field.backingField;

    // Because ReaderClientExtension doesn't have `alias` or `name` and so I don't know
    // how to get its applicationName or storageKey yet:
    invariant(
      backingField.kind !== 'ClientExtension',
      'Client extension client edges are not yet implemented.',
    );

    const applicationName = backingField.alias ?? backingField.name;

    const backingFieldData = {};
    this._traverseSelections([backingField], record, backingFieldData);
    const destinationDataID = backingFieldData[applicationName];

    if (destinationDataID == null) {
      data[applicationName] = destinationDataID;
      return;
    }

    invariant(
      typeof destinationDataID === 'string',
      'Plural client edges not are yet implemented',
    ); // FIXME support plural

    // Not wrapping the push/pop in a try/finally because if we throw, the
    // Reader object is not usable after that anyway.
    this._clientEdgeTraversalPath.push({
      readerClientEdge: field,
      clientEdgeDestinationID: destinationDataID,
    });

    const prevData = data[applicationName];
    invariant(
      prevData == null || typeof prevData === 'object',
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an object, got `%s`.',
      applicationName,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    const value = this._traverse(
      field.linkedField,
      destinationDataID,
      // $FlowFixMe[incompatible-variance]
      prevData,
    );
    data[applicationName] = value;

    this._clientEdgeTraversalPath.pop();
  }

  _readFlightField(
    field: ReaderFlightField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const reactFlightClientResponseRecordID =
      RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (reactFlightClientResponseRecordID == null) {
      data[applicationName] = reactFlightClientResponseRecordID;
      if (reactFlightClientResponseRecordID === undefined) {
        this._markDataAsMissing();
      }
      return reactFlightClientResponseRecordID;
    }
    const reactFlightClientResponseRecord = this._recordSource.get(
      reactFlightClientResponseRecordID,
    );
    this._seenRecords.add(reactFlightClientResponseRecordID);
    if (reactFlightClientResponseRecord == null) {
      data[applicationName] = reactFlightClientResponseRecord;
      if (reactFlightClientResponseRecord === undefined) {
        this._markDataAsMissing();
      }
      return reactFlightClientResponseRecord;
    }
    const clientResponse = getReactFlightClientResponse(
      reactFlightClientResponseRecord,
    );
    data[applicationName] = clientResponse;
    return clientResponse;
  }

  _readScalar(
    field: ReaderScalarField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const value = RelayModernRecord.getValue(record, storageKey);
    if (value === undefined) {
      this._markDataAsMissing();
    }
    data[applicationName] = value;
    return value;
  }

  _readLink(
    field: ReaderLinkedField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        this._markDataAsMissing();
      }
      return linkedID;
    }

    const prevData = data[applicationName];
    invariant(
      prevData == null || typeof prevData === 'object',
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an object, got `%s`.',
      applicationName,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    // $FlowFixMe[incompatible-variance]
    const value = this._traverse(field, linkedID, prevData);
    data[applicationName] = value;
    return value;
  }

  _readActorChange(
    field: ReaderActorChange,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const externalRef = RelayModernRecord.getActorLinkedRecordID(
      record,
      storageKey,
    );

    if (externalRef == null) {
      data[applicationName] = externalRef;
      if (externalRef === undefined) {
        this._markDataAsMissing();
      }
      return data[applicationName];
    }
    const [actorIdentifier, dataID] = externalRef;

    const fragmentRef = {};
    this._createFragmentPointer(
      field.fragmentSpread,
      {
        __id: dataID,
      },
      fragmentRef,
    );
    data[applicationName] = {
      __fragmentRef: fragmentRef,
      __viewer: actorIdentifier,
    };
    return data[applicationName];
  }

  _readPluralLink(
    field: ReaderLinkedField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);

    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      if (linkedIDs === undefined) {
        this._markDataAsMissing();
      }
      return linkedIDs;
    }

    const prevData = data[applicationName];
    invariant(
      prevData == null || Array.isArray(prevData),
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an array, got `%s`.',
      applicationName,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    const linkedArray = prevData || [];
    linkedIDs.forEach((linkedID, nextIndex) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
          this._markDataAsMissing();
        }
        // $FlowFixMe[cannot-write]
        linkedArray[nextIndex] = linkedID;
        return;
      }
      const prevItem = linkedArray[nextIndex];
      invariant(
        prevItem == null || typeof prevItem === 'object',
        'RelayReader(): Expected data for field `%s` on record `%s` ' +
          'to be an object, got `%s`.',
        applicationName,
        RelayModernRecord.getDataID(record),
        prevItem,
      );
      // $FlowFixMe[cannot-write]
      // $FlowFixMe[incompatible-variance]
      linkedArray[nextIndex] = this._traverse(field, linkedID, prevItem);
    });
    data[applicationName] = linkedArray;
    return linkedArray;
  }

  /**
   * Reads a ReaderModuleImport, which was generated from using the @module
   * directive.
   */
  _readModuleImport(
    moduleImport: ReaderModuleImport,
    record: Record,
    data: SelectorData,
  ): void {
    // Determine the component module from the store: if the field is missing
    // it means we don't know what component to render the match with.
    const componentKey = getModuleComponentKey(moduleImport.documentName);
    const component = RelayModernRecord.getValue(record, componentKey);
    if (component == null) {
      if (component === undefined) {
        this._markDataAsMissing();
      }
      return;
    }

    // Otherwise, read the fragment and module associated to the concrete
    // type, and put that data with the result:
    // - For the matched fragment, create the relevant fragment pointer and add
    //   the expected fragmentPropName
    // - For the matched module, create a reference to the module
    this._createFragmentPointer(
      {
        kind: 'FragmentSpread',
        name: moduleImport.fragmentName,
        args: moduleImport.args,
      },
      record,
      data,
    );
    data[FRAGMENT_PROP_NAME_KEY] = moduleImport.fragmentPropName;
    data[MODULE_COMPONENT_KEY] = component;
  }

  _createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = {};
    }
    invariant(
      typeof fragmentPointers === 'object' && fragmentPointers != null,
      'RelayReader: Expected fragment spread data to be an object, got `%s`.',
      fragmentPointers,
    );
    if (data[ID_KEY] == null) {
      data[ID_KEY] = RelayModernRecord.getDataID(record);
    }
    // $FlowFixMe[cannot-write] - writing into read-only field
    fragmentPointers[fragmentSpread.name] = fragmentSpread.args
      ? getArgumentValues(fragmentSpread.args, this._variables)
      : {};
    data[FRAGMENT_OWNER_KEY] = this._owner;
    data[IS_WITHIN_UNMATCHED_TYPE_REFINEMENT] =
      this._isWithinUnmatchedTypeRefinement;

    if (RelayFeatureFlags.ENABLE_CLIENT_EDGES) {
      if (
        this._clientEdgeTraversalPath.length > 0 &&
        this._clientEdgeTraversalPath[
          this._clientEdgeTraversalPath.length - 1
        ] !== null
      ) {
        data[CLIENT_EDGE_TRAVERSAL_PATH] = [...this._clientEdgeTraversalPath];
      }
    }
  }

  _createInlineDataOrResolverFragmentPointer(
    fragmentSpreadOrFragment: ReaderInlineDataFragmentSpread | ReaderFragment,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = {};
    }
    invariant(
      typeof fragmentPointers === 'object' && fragmentPointers != null,
      'RelayReader: Expected fragment spread data to be an object, got `%s`.',
      fragmentPointers,
    );
    if (data[ID_KEY] == null) {
      data[ID_KEY] = RelayModernRecord.getDataID(record);
    }
    const inlineData = {};
    const parentFragmentName = this._fragmentName;
    this._fragmentName = fragmentSpreadOrFragment.name;
    this._traverseSelections(
      fragmentSpreadOrFragment.selections,
      record,
      inlineData,
    );
    this._fragmentName = parentFragmentName;
    // $FlowFixMe[cannot-write] - writing into read-only field
    fragmentPointers[fragmentSpreadOrFragment.name] = inlineData;
  }

  _addMissingRequiredFields(additional: MissingRequiredFields) {
    if (this._missingRequiredFields == null) {
      this._missingRequiredFields = additional;
      return;
    }

    if (this._missingRequiredFields.action === 'THROW') {
      return;
    }
    if (additional.action === 'THROW') {
      this._missingRequiredFields = additional;
      return;
    }

    this._missingRequiredFields = {
      action: 'LOG',
      fields: [...this._missingRequiredFields.fields, ...additional.fields],
    };
  }
}

module.exports = {read};
