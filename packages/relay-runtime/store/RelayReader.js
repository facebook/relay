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
  ReaderActorChange,
  ReaderAliasedFragmentSpread,
  ReaderCatchField,
  ReaderClientEdge,
  ReaderFragment,
  ReaderFragmentSpread,
  ReaderInlineDataFragmentSpread,
  ReaderInlineFragment,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderNode,
  ReaderRelayLiveResolver,
  ReaderRelayResolver,
  ReaderRequiredField,
  ReaderScalarField,
  ReaderSelection,
} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  ClientEdgeTraversalInfo,
  DataIDSet,
  ErrorResponseFields,
  MissingClientEdgeRequestInfo,
  MissingLiveResolverField,
  MissingRequiredFields,
  Record,
  RecordSource,
  RelayResolverErrors,
  RequestDescriptor,
  SelectorData,
  SingularReaderSelector,
  Snapshot,
} from './RelayStoreTypes';
import type {Arguments} from './RelayStoreUtils';
import type {EvaluationResult, ResolverCache} from './ResolverCache';

const {
  ACTOR_CHANGE,
  ALIASED_FRAGMENT_SPREAD,
  ALIASED_INLINE_FRAGMENT_SPREAD,
  CATCH_FIELD,
  CLIENT_EDGE_TO_CLIENT_OBJECT,
  CLIENT_EDGE_TO_SERVER_OBJECT,
  CLIENT_EXTENSION,
  CONDITION,
  DEFER,
  FRAGMENT_SPREAD,
  INLINE_DATA_FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  RELAY_LIVE_RESOLVER,
  RELAY_RESOLVER,
  REQUIRED_FIELD,
  SCALAR_FIELD,
  STREAM,
} = require('../util/RelayConcreteNode');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const {
  isSuspenseSentinel,
} = require('./experimental-live-resolvers/LiveResolverSuspenseSentinel');
const RelayConcreteVariables = require('./RelayConcreteVariables');
const RelayModernRecord = require('./RelayModernRecord');
const {
  CLIENT_EDGE_TRAVERSAL_PATH,
  FRAGMENT_OWNER_KEY,
  FRAGMENT_PROP_NAME_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  MODULE_COMPONENT_KEY,
  ROOT_ID,
  getArgumentValues,
  getModuleComponentKey,
  getStorageKey,
} = require('./RelayStoreUtils');
const {NoopResolverCache} = require('./ResolverCache');
const {
  RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL,
  withResolverContext,
} = require('./ResolverFragments');
const {generateTypeID} = require('./TypeID');
const invariant = require('invariant');

type RequiredOrCatchField = ReaderRequiredField | ReaderCatchField;

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
  _missingLiveResolverFields: Array<MissingLiveResolverField>;
  _isWithinUnmatchedTypeRefinement: boolean;
  _missingRequiredFields: ?MissingRequiredFields;
  _errorResponseFields: ?ErrorResponseFields;
  _owner: RequestDescriptor;
  _recordSource: RecordSource;
  _seenRecords: DataIDSet;
  _updatedDataIDs: DataIDSet;
  _selector: SingularReaderSelector;
  _variables: Variables;
  _resolverCache: ResolverCache;
  _resolverErrors: RelayResolverErrors;
  _fragmentName: string;

  constructor(
    recordSource: RecordSource,
    selector: SingularReaderSelector,
    resolverCache: ResolverCache,
  ) {
    this._clientEdgeTraversalPath = selector.clientEdgeTraversalPath?.length
      ? [...selector.clientEdgeTraversalPath]
      : [];
    this._missingClientEdges = [];
    this._missingLiveResolverFields = [];
    this._isMissingData = false;
    this._isWithinUnmatchedTypeRefinement = false;
    this._missingRequiredFields = null;
    this._errorResponseFields = null;
    this._owner = selector.owner;
    this._recordSource = recordSource;
    this._seenRecords = new Set();
    this._selector = selector;
    this._variables = selector.variables;
    this._resolverCache = resolverCache;
    this._resolverErrors = [];
    this._fragmentName = selector.node.name;
    this._updatedDataIDs = new Set();
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
      const implementsInterface = this._implementsInterface(
        record,
        abstractKey,
      );
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

    if (this._updatedDataIDs.size > 0) {
      this._resolverCache.notifyUpdatedSubscribers(this._updatedDataIDs);
      this._updatedDataIDs.clear();
    }
    return {
      data,
      isMissingData: this._isMissingData && isDataExpectedToBePresent,
      missingClientEdges: this._missingClientEdges.length
        ? this._missingClientEdges
        : null,
      missingLiveResolverFields: this._missingLiveResolverFields,
      seenRecords: this._seenRecords,
      selector: this._selector,
      missingRequiredFields: this._missingRequiredFields,
      relayResolverErrors: this._resolverErrors,
      errorResponseFields: this._errorResponseFields,
    };
  }

  _maybeAddErrorResponseFields(record: Record, storageKey: string): void {
    if (!RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING) {
      return;
    }

    const errors = RelayModernRecord.getErrors(record, storageKey);

    if (errors == null) {
      return;
    }
    const owner = this._fragmentName;

    if (this._errorResponseFields == null) {
      this._errorResponseFields = [];
    }
    for (const error of errors) {
      this._errorResponseFields.push({
        owner,
        path: (error.path ?? []).join('.'),
        error,
      });
    }
  }

  _markDataAsMissing(): void {
    this._isMissingData = true;
    if (this._clientEdgeTraversalPath.length) {
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

  _maybeReportUnexpectedNull(fieldPath: string, action: 'LOG' | 'THROW') {
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

  _handleCatchFieldValue(
    selection: ReaderCatchField,
    record: Record,
    data: SelectorData,
    value: mixed,
  ) {
    const {to} = selection;
    const field = selection.field?.backingField ?? selection.field;
    const fieldName = field?.alias ?? field?.name;

    // ReaderClientExtension doesn't have `alias` or `name`
    // so we don't support this yet
    invariant(
      fieldName != null,
      "Couldn't determine field name for this field. It might be a ReaderClientExtension - which is not yet supported.",
    );

    if (this._errorResponseFields != null) {
      for (let i = 0; i < this._errorResponseFields.length; i++) {
        // if it's a @catch - it can only be NULL or RESULT. So we always add the "to" from the CatchField.
        this._errorResponseFields[i].to = to;
      }
    }
    // If we have a nested @required(THROW)  that will throw,
    // we want to catch that error and provide it, and remove the original error
    if (this._missingRequiredFields?.action === 'THROW') {
      if (this._missingRequiredFields?.field == null) {
        return;
      }

      // We want to catch nested @required THROWs
      if (this._errorResponseFields == null) {
        this._errorResponseFields = [];
      }

      const {owner, path} = this._missingRequiredFields.field;
      this._errorResponseFields.push({
        owner,
        path,
        error: {
          message: `Relay: Missing @required value at path '${path}' in '${owner}'.`,
        },
        to,
      });

      // remove missing required because we're providing it in catch instead.
      this._missingRequiredFields = null;

      return;
    }

    if (this._errorResponseFields != null) {
      const errors = this._errorResponseFields.map(error => error.error);

      data[fieldName] = {
        ok: false,
        errors,
      };
      return;
    }

    data[fieldName] = {
      ok: true,
      value,
    };

    // we do nothing if to is 'NULL'
  }

  _handleRequiredFieldValue(
    selection: ReaderRequiredField,
    value: mixed,
  ): boolean /*should continue to siblings*/ {
    if (value == null) {
      const {action} = selection;
      if (action !== 'NONE') {
        this._maybeReportUnexpectedNull(selection.path, action);
      }
      // We are going to throw, or our parent is going to get nulled out.
      // Either way, sibling values are going to be ignored, so we can
      // bail early here as an optimization.
      return false;
    }
    return true;
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
          const requiredFieldValue = this._readClientSideDirectiveField(
            selection,
            record,
            data,
          );
          if (!this._handleRequiredFieldValue(selection, requiredFieldValue)) {
            return false;
          }
          break;
        case CATCH_FIELD:
          const catchFieldValue = this._readClientSideDirectiveField(
            selection,
            record,
            data,
          );
          if (RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE) {
            /* NULL is old behavior. do nothing. */
            if (selection.to != 'NULL') {
              /* @catch(to: RESULT) is the default */
              this._handleCatchFieldValue(
                selection,
                record,
                data,
                catchFieldValue,
              );
            }
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
          if (this._readInlineFragment(selection, record, data) === false) {
            return false;
          }
          break;
        }
        case RELAY_LIVE_RESOLVER:
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
        case ALIASED_FRAGMENT_SPREAD:
          data[selection.name] = this._createAliasedFragmentSpread(
            selection,
            record,
          );
          break;
        case ALIASED_INLINE_FRAGMENT_SPREAD: {
          let fieldValue = this._readInlineFragment(
            selection.fragment,
            record,
            {},
          );
          if (fieldValue === false) {
            fieldValue = null;
          }
          data[selection.name] = fieldValue;
          break;
        }
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
          this._clientEdgeTraversalPath.push(null);
          const hasExpectedData = this._traverseSelections(
            selection.selections,
            record,
            data,
          );
          // The only case where we want to suspend due to missing data off of
          // a client extension is if we reached a client edge that we might be
          // able to fetch, or there is a missing data in one of the live resolvers.
          this._isMissingData =
            isMissingData ||
            this._missingClientEdges.length > alreadyMissingClientEdges ||
            this._missingLiveResolverFields.length > 0;
          this._clientEdgeTraversalPath.pop();
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
        case ACTOR_CHANGE:
          this._readActorChange(selection, record, data);
          break;
        case CLIENT_EDGE_TO_CLIENT_OBJECT:
        case CLIENT_EDGE_TO_SERVER_OBJECT:
          this._readClientEdge(selection, record, data);
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

  _readClientSideDirectiveField(
    selection: RequiredOrCatchField,
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
      case RELAY_LIVE_RESOLVER:
        if (!RelayFeatureFlags.ENABLE_RELAY_RESOLVERS) {
          throw new Error('Relay Resolver fields are not yet supported.');
        }
        return this._readResolverField(selection.field, record, data);
      case CLIENT_EDGE_TO_CLIENT_OBJECT:
      case CLIENT_EDGE_TO_SERVER_OBJECT:
        if (!RelayFeatureFlags.ENABLE_RELAY_RESOLVERS) {
          throw new Error('Relay Resolver fields are not yet supported.');
        }
        return this._readClientEdge(selection.field, record, data);
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
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    record: Record,
    data: SelectorData,
  ): mixed {
    const parentRecordID = RelayModernRecord.getDataID(record);
    const result = this._readResolverFieldImpl(field, parentRecordID);

    const fieldName = field.alias ?? field.name;
    data[fieldName] = result;
    return result;
  }

  _readResolverFieldImpl(
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    parentRecordID: DataID,
  ): mixed {
    const {fragment} = field;

    // Found when reading the resolver fragment, which can happen either when
    // evaluating the resolver and it calls readFragment, or when checking if the
    // inputs have changed since a previous evaluation:
    let snapshot: ?Snapshot;

    // The function `getDataForResolverFragment` serves two purposes:
    // 1. To memoize reads of the resolver's root fragment. This is important
    //    because we may read it twice. Once to check if the results have changed
    //    since last read, and once when we actually evaluate.
    // 2. To intercept the snapshot so that it can be cached by the resolver
    //    cache. This is what enables the change detection described in #1.
    //
    // Note: In the future this can be moved into the ResolverCache.
    const getDataForResolverFragment = (
      singularReaderSelector: SingularReaderSelector,
    ) => {
      if (snapshot != null) {
        // It was already read when checking for input staleness; no need to read it again.
        // Note that the variables like fragmentSeenRecordIDs in the outer closure will have
        // already been set and will still be used in this case.
        return {
          data: snapshot.data,
          isMissingData: snapshot.isMissingData,
        };
      }

      snapshot = read(
        this._recordSource,
        singularReaderSelector,
        this._resolverCache,
      );

      return {
        data: snapshot.data,
        isMissingData: snapshot.isMissingData,
      };
    };

    // This function `evaluate` tells the resolver cache how to read this
    // resolver. It returns an `EvaluationResult` which gives the resolver cache:
    // * `resolverResult` The value returned by the resolver function
    // * `snapshot` The snapshot returned when reading the resolver's root fragment (if it has one)
    // * `error` If the resolver throws, its error is caught (inside
    //   `getResolverValue`) and converted into an error object.
    const evaluate = (): EvaluationResult<mixed> => {
      if (fragment != null) {
        const key = {
          __id: parentRecordID,
          __fragmentOwner: this._owner,
          __fragments: {
            [fragment.name]: fragment.args
              ? getArgumentValues(fragment.args, this._variables)
              : {},
          },
        };
        const resolverContext = {getDataForResolverFragment};
        return withResolverContext(resolverContext, () => {
          const [resolverResult, resolverError] = getResolverValue(
            field,
            this._variables,
            key,
          );
          return {resolverResult, snapshot, error: resolverError};
        });
      } else {
        const [resolverResult, resolverError] = getResolverValue(
          field,
          this._variables,
          null,
        );
        return {resolverResult, snapshot: undefined, error: resolverError};
      }
    };

    const [
      result,
      seenRecord,
      resolverError,
      cachedSnapshot,
      suspenseID,
      updatedDataIDs,
    ] = this._resolverCache.readFromCacheOrEvaluate(
      parentRecordID,
      field,
      this._variables,
      evaluate,
      getDataForResolverFragment,
    );

    this._propogateResolverMetadata(
      field.path,
      cachedSnapshot,
      resolverError,
      seenRecord,
      suspenseID,
      updatedDataIDs,
    );

    return result;
  }

  // Reading a resolver field can uncover missing data, errors, suspense,
  // additional seen records and updated dataIDs. All of these facts must be
  // represented in the snapshot we return for this fragment.
  _propogateResolverMetadata(
    fieldPath: string,
    cachedSnapshot: ?Snapshot,
    resolverError: ?Error,
    seenRecord: ?DataID,
    suspenseID: ?DataID,
    updatedDataIDs: ?DataIDSet,
  ) {
    // The resolver's root fragment (if there is one) may be missing data, have
    // errors, or be in a suspended state. Here we propagate those cases
    // upwards to mimic the behavior of having traversed into that fragment directly.
    if (cachedSnapshot != null) {
      if (cachedSnapshot.missingRequiredFields != null) {
        this._addMissingRequiredFields(cachedSnapshot.missingRequiredFields);
      }
      if (cachedSnapshot.missingClientEdges != null) {
        for (const missing of cachedSnapshot.missingClientEdges) {
          this._missingClientEdges.push(missing);
        }
      }
      if (cachedSnapshot.missingLiveResolverFields != null) {
        this._isMissingData =
          this._isMissingData ||
          cachedSnapshot.missingLiveResolverFields.length > 0;

        for (const missingResolverField of cachedSnapshot.missingLiveResolverFields) {
          this._missingLiveResolverFields.push(missingResolverField);
        }
      }
      for (const error of cachedSnapshot.relayResolverErrors) {
        this._resolverErrors.push(error);
      }
      this._isMissingData = this._isMissingData || cachedSnapshot.isMissingData;
    }

    // If the resolver errored, we track that as part of our traversal so that
    // the errors can be attached to this read's snapshot. This allows the error
    // to be logged.
    if (resolverError) {
      this._resolverErrors.push({
        field: {path: fieldPath, owner: this._fragmentName},
        error: resolverError,
      });
    }

    // The resolver itself creates a record in the store. We record that we've
    // read this record so that subscribers to this snapshot also subscribe to
    // this resolver.
    if (seenRecord != null) {
      this._seenRecords.add(seenRecord);
    }

    // If this resolver, or a dependency of this resolver, has suspended, we
    // need to report that in our snapshot. The `suspenseID` is the key in to
    // store where the suspended LiveState value lives. This ID allows readers
    // of the snapshot to subscribe to updates on that live resolver so that
    // they know when to unsuspend.
    if (suspenseID != null) {
      this._isMissingData = true;
      this._missingLiveResolverFields.push({
        path: `${this._fragmentName}.${fieldPath}`,
        liveStateID: suspenseID,
      });
    }
    if (updatedDataIDs != null) {
      for (const recordID of updatedDataIDs) {
        this._updatedDataIDs.add(recordID);
      }
    }
  }

  _readClientEdge(
    field: ReaderClientEdge,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const backingField = field.backingField;

    // Because ReaderClientExtension doesn't have `alias` or `name` and so I don't know
    // how to get its fieldName or storageKey yet:
    invariant(
      backingField.kind !== 'ClientExtension',
      'Client extension client edges are not yet implemented.',
    );

    const fieldName = backingField.alias ?? backingField.name;
    const backingFieldData = {};
    this._traverseSelections([backingField], record, backingFieldData);
    // At this point, backingFieldData is an object with a single key (fieldName)
    // whose value is the value returned from the resolver, or a suspense sentinel.

    // $FlowFixMe[invalid-computed-prop]
    const clientEdgeResolverResponse = backingFieldData[fieldName];
    if (
      clientEdgeResolverResponse == null ||
      isSuspenseSentinel(clientEdgeResolverResponse)
    ) {
      data[fieldName] = clientEdgeResolverResponse;
      return clientEdgeResolverResponse;
    }

    if (field.linkedField.plural) {
      invariant(
        Array.isArray(clientEdgeResolverResponse),
        'Expected plural Client Edge Relay Resolver to return an array containing IDs or objects with shape {id}.',
      );
      let storeIDs: $ReadOnlyArray<DataID>;
      invariant(
        field.kind === CLIENT_EDGE_TO_CLIENT_OBJECT,
        'Unexpected Client Edge to plural server type. This should be prevented by the compiler.',
      );
      if (field.backingField.normalizationInfo == null) {
        // @edgeTo case where we need to ensure that the record has `id` field
        storeIDs = clientEdgeResolverResponse.map(itemResponse => {
          const concreteType = field.concreteType ?? itemResponse.__typename;
          invariant(
            typeof concreteType === 'string',
            'Expected resolver modeling an edge to an abstract type to return an object with a `__typename` property.',
          );
          const localId = extractIdFromResponse(itemResponse);
          const id = this._resolverCache.ensureClientRecord(
            localId,
            concreteType,
          );

          const modelResolvers = field.modelResolvers;
          if (modelResolvers != null) {
            const modelResolver = modelResolvers[concreteType];
            invariant(
              modelResolver !== undefined,
              `Invalid \`__typename\` returned by resolver. Expected one of ${Object.keys(modelResolvers).join(', ')} but got \`${concreteType}\`.`,
            );
            const model = this._readResolverFieldImpl(modelResolver, id);
            return model != null ? id : null;
          }
          return id;
        });
      } else {
        // The normalization process in LiveResolverCache should take care of generating the correct ID.
        storeIDs = clientEdgeResolverResponse.map(extractIdFromResponse);
      }
      this._clientEdgeTraversalPath.push(null);
      const edgeValues = this._readLinkedIds(
        field.linkedField,
        storeIDs,
        record,
        data,
      );
      this._clientEdgeTraversalPath.pop();
      data[fieldName] = edgeValues;
      return edgeValues;
    } else {
      const id = extractIdFromResponse(clientEdgeResolverResponse);
      let storeID: DataID;
      const concreteType =
        field.concreteType ?? clientEdgeResolverResponse.__typename;
      let traversalPathSegment: ClientEdgeTraversalInfo | null;
      if (field.kind === CLIENT_EDGE_TO_CLIENT_OBJECT) {
        if (field.backingField.normalizationInfo == null) {
          invariant(
            typeof concreteType === 'string',
            'Expected resolver modeling an edge to an abstract type to return an object with a `__typename` property.',
          );
          // @edgeTo case where we need to ensure that the record has `id` field
          storeID = this._resolverCache.ensureClientRecord(id, concreteType);
          traversalPathSegment = null;
        } else {
          // The normalization process in LiveResolverCache should take care of generating the correct ID.
          storeID = id;
          traversalPathSegment = null;
        }
      } else {
        storeID = id;
        traversalPathSegment = {
          readerClientEdge: field,
          clientEdgeDestinationID: id,
        };
      }

      const modelResolvers = field.modelResolvers;
      if (modelResolvers != null) {
        invariant(
          typeof concreteType === 'string',
          'Expected resolver modeling an edge to an abstract type to return an object with a `__typename` property.',
        );
        const modelResolver = modelResolvers[concreteType];
        invariant(
          modelResolver !== undefined,
          `Invalid \`__typename\` returned by resolver. Expected one of ${Object.keys(modelResolvers).join(', ')} but got \`${concreteType}\`.`,
        );
        const model = this._readResolverFieldImpl(modelResolver, storeID);
        if (model == null) {
          // If the model resolver returns undefined, we should still return null
          // to match GQL behavior.
          data[fieldName] = null;
          return null;
        }
      }
      this._clientEdgeTraversalPath.push(traversalPathSegment);

      const prevData = data[fieldName];
      invariant(
        prevData == null || typeof prevData === 'object',
        'RelayReader(): Expected data for field `%s` on record `%s` ' +
          'to be an object, got `%s`.',
        fieldName,
        RelayModernRecord.getDataID(record),
        prevData,
      );
      const edgeValue = this._traverse(
        field.linkedField,
        storeID,
        // $FlowFixMe[incompatible-variance]
        prevData,
      );
      this._clientEdgeTraversalPath.pop();
      data[fieldName] = edgeValue;
      return edgeValue;
    }
  }

  _readScalar(
    field: ReaderScalarField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const value = RelayModernRecord.getValue(record, storageKey);
    if (value === null) {
      this._maybeAddErrorResponseFields(record, storageKey);
    } else if (value === undefined) {
      this._markDataAsMissing();
    }
    data[fieldName] = value;
    return value;
  }

  _readLink(
    field: ReaderLinkedField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (linkedID == null) {
      data[fieldName] = linkedID;
      if (linkedID === null) {
        this._maybeAddErrorResponseFields(record, storageKey);
      } else if (linkedID === undefined) {
        this._markDataAsMissing();
      }
      return linkedID;
    }

    const prevData = data[fieldName];
    invariant(
      prevData == null || typeof prevData === 'object',
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an object, got `%s`.',
      fieldName,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    // $FlowFixMe[incompatible-variance]
    const value = this._traverse(field, linkedID, prevData);
    data[fieldName] = value;
    return value;
  }

  _readActorChange(
    field: ReaderActorChange,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const externalRef = RelayModernRecord.getActorLinkedRecordID(
      record,
      storageKey,
    );

    if (externalRef == null) {
      data[fieldName] = externalRef;
      if (externalRef === undefined) {
        this._markDataAsMissing();
      } else if (externalRef === null) {
        this._maybeAddErrorResponseFields(record, storageKey);
      }
      return data[fieldName];
    }
    const [actorIdentifier, dataID] = externalRef;

    const fragmentRef = {};
    this._createFragmentPointer(
      field.fragmentSpread,
      RelayModernRecord.fromObject<>({
        __id: dataID,
      }),
      fragmentRef,
    );
    data[fieldName] = {
      __fragmentRef: fragmentRef,
      __viewer: actorIdentifier,
    };
    return data[fieldName];
  }

  _readPluralLink(
    field: ReaderLinkedField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);
    if (linkedIDs === null) {
      this._maybeAddErrorResponseFields(record, storageKey);
    }
    return this._readLinkedIds(field, linkedIDs, record, data);
  }

  _readLinkedIds(
    field: ReaderLinkedField,
    linkedIDs: ?$ReadOnlyArray<?DataID>,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const fieldName = field.alias ?? field.name;

    if (linkedIDs == null) {
      data[fieldName] = linkedIDs;
      if (linkedIDs === undefined) {
        this._markDataAsMissing();
      }
      return linkedIDs;
    }

    const prevData = data[fieldName];
    invariant(
      prevData == null || Array.isArray(prevData),
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an array, got `%s`.',
      fieldName,
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
        fieldName,
        RelayModernRecord.getDataID(record),
        prevItem,
      );
      // $FlowFixMe[cannot-write]
      // $FlowFixMe[incompatible-variance]
      linkedArray[nextIndex] = this._traverse(field, linkedID, prevItem);
    });
    data[fieldName] = linkedArray;
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

  _createAliasedFragmentSpread(
    namedFragmentSpread: ReaderAliasedFragmentSpread,
    record: Record,
  ): ?Record {
    const {abstractKey} = namedFragmentSpread;
    if (abstractKey == null) {
      // concrete type refinement: only read data if the type exactly matches
      const typeName = RelayModernRecord.getType(record);
      if (typeName == null || typeName !== namedFragmentSpread.type) {
        // This selection does not match the fragment spread. Do nothing.
        return null;
      }
    } else {
      const implementsInterface = this._implementsInterface(
        record,
        abstractKey,
      );

      if (implementsInterface === false) {
        // Type known to not implement the interface, no data expected
        return null;
      } else if (implementsInterface == null) {
        // Don't know if the type implements the interface or not
        this._markDataAsMissing();
        // Judgement call here. In some cases this will cause us to hide data that is actually valid.
        return undefined;
      }
    }
    const fieldData = {};
    this._createFragmentPointer(
      namedFragmentSpread.fragment,
      record,
      fieldData,
    );
    return RelayModernRecord.fromObject<>(fieldData);
  }

  // Has three possible return values:
  // * null: The type condition did not match
  // * undefined: We are missing data
  // * false: The selection contained missing @required fields
  // * data: The successfully populated SelectorData object
  _readInlineFragment(
    inlineFragment: ReaderInlineFragment,
    record: Record,
    data: SelectorData,
  ): ?(SelectorData | false) {
    if (inlineFragment.type == null) {
      // Inline fragment without a type condition: always read data
      // Usually this would get compiled away, but fragments with @alias
      // and no type condition will get preserved.
      const hasExpectedData = this._traverseSelections(
        inlineFragment.selections,
        record,
        data,
      );
      if (hasExpectedData === false) {
        return false;
      }
      return data;
    }
    const {abstractKey} = inlineFragment;
    if (abstractKey == null) {
      // concrete type refinement: only read data if the type exactly matches
      const typeName = RelayModernRecord.getType(record);
      if (typeName == null || typeName !== inlineFragment.type) {
        // This selection does not match the fragment spread. Do nothing.
        return null;
      } else {
        const hasExpectedData = this._traverseSelections(
          inlineFragment.selections,
          record,
          data,
        );
        if (!hasExpectedData) {
          // Bubble up null due to a missing @required field
          return false;
        }
      }
    } else {
      const implementsInterface = this._implementsInterface(
        record,
        abstractKey,
      );

      // store flags to reset after reading
      const parentIsMissingData = this._isMissingData;
      const parentIsWithinUnmatchedTypeRefinement =
        this._isWithinUnmatchedTypeRefinement;

      this._isWithinUnmatchedTypeRefinement =
        parentIsWithinUnmatchedTypeRefinement || implementsInterface === false;

      // @required is not allowed within inline fragments on abstract types, so
      // we can ignore the `hasMissingData` result of `_traverseSelections`.
      this._traverseSelections(inlineFragment.selections, record, data);

      // Reset
      this._isWithinUnmatchedTypeRefinement =
        parentIsWithinUnmatchedTypeRefinement;

      if (implementsInterface === false) {
        // Type known to not implement the interface, no data expected
        this._isMissingData = parentIsMissingData;
        return undefined;
      } else if (implementsInterface == null) {
        // Don't know if the type implements the interface or not
        this._markDataAsMissing();
        return null;
      }
    }
    return data;
  }

  _createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = ({}: {
        [string]: Arguments,
      });
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
    fragmentPointers[fragmentSpread.name] = getArgumentValues(
      fragmentSpread.args,
      this._variables,
      this._isWithinUnmatchedTypeRefinement,
    );
    data[FRAGMENT_OWNER_KEY] = this._owner;

    if (
      this._clientEdgeTraversalPath.length > 0 &&
      this._clientEdgeTraversalPath[
        this._clientEdgeTraversalPath.length - 1
      ] !== null
    ) {
      data[CLIENT_EDGE_TRAVERSAL_PATH] = [...this._clientEdgeTraversalPath];
    }
  }

  _createInlineDataOrResolverFragmentPointer(
    fragmentSpreadOrFragment: ReaderInlineDataFragmentSpread | ReaderFragment,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = ({}: {[string]: {...}});
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

    const parentVariables = this._variables;

    // If the inline fragment spread has arguments, we need to temporarily
    // switch this._variables to include the fragment spread's arguments
    // for the duration of its traversal.
    const argumentVariables = fragmentSpreadOrFragment.args
      ? getArgumentValues(fragmentSpreadOrFragment.args, this._variables)
      : {};

    this._variables = RelayConcreteVariables.getFragmentVariables(
      fragmentSpreadOrFragment,
      this._owner.variables,
      argumentVariables,
    );

    this._traverseSelections(
      fragmentSpreadOrFragment.selections,
      record,
      inlineData,
    );

    // Put the parent variables back
    this._variables = parentVariables;

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

  _implementsInterface(record: Record, abstractKey: string): ?boolean {
    const typeName = RelayModernRecord.getType(record);
    const typeRecord = this._recordSource.get(generateTypeID(typeName));
    const implementsInterface =
      typeRecord != null
        ? RelayModernRecord.getValue(typeRecord, abstractKey)
        : null;
    // $FlowFixMe Casting record value
    return implementsInterface;
  }
}

// Constructs the arguments for a resolver function and then evaluates it.
//
// If the resolver's fragment is missing data (query is in-flight, a dependency
// field is suspending, or is missing required fields) then `readFragment` will
// throw `RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL`. This function ensures that
// we catch that error and instead create an error object which can be
// propagated to the reader snapshot.
function getResolverValue(
  field: ReaderRelayResolver | ReaderRelayLiveResolver,
  variables: Variables,
  fragmentKey: mixed,
): [mixed, ?Error] {
  // Support for languages that work (best) with ES6 modules, such as TypeScript.
  const resolverFunction =
    typeof field.resolverModule === 'function'
      ? field.resolverModule
      : field.resolverModule.default;

  let resolverResult = null;
  let resolverError = null;
  try {
    const resolverFunctionArgs = [];
    if (field.fragment != null) {
      resolverFunctionArgs.push(fragmentKey);
    }
    const args = field.args
      ? getArgumentValues(field.args, variables)
      : undefined;

    resolverFunctionArgs.push(args);

    resolverResult = resolverFunction.apply(null, resolverFunctionArgs);
  } catch (e) {
    if (e === RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL) {
      resolverResult = undefined;
    } else {
      resolverError = e;
    }
  }
  return [resolverResult, resolverError];
}

function extractIdFromResponse(individualResponse: mixed): string {
  if (typeof individualResponse === 'string') {
    return individualResponse;
  } else if (
    typeof individualResponse === 'object' &&
    individualResponse != null &&
    typeof individualResponse.id === 'string'
  ) {
    return individualResponse.id;
  }
  invariant(
    false,
    'Expected object returned from an edge resolver to be a string or an object with an `id` property',
  );
}

module.exports = {read};
