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

import type {Result} from '../experimental';
import type {
  CatchFieldTo,
  ReaderActorChange,
  ReaderAliasedInlineFragmentSpread,
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
  FieldError,
  FieldErrors,
  MissingClientEdgeRequestInfo,
  Record,
  RecordSource,
  RequestDescriptor,
  ResolverContext,
  SelectorData,
  SingularReaderSelector,
  Snapshot,
} from './RelayStoreTypes';
import type {Arguments} from './RelayStoreUtils';
import type {EvaluationResult, ResolverCache} from './ResolverCache';

const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const {
  isSuspenseSentinel,
} = require('./live-resolvers/LiveResolverSuspenseSentinel');
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
  RESOLVER_FRAGMENT_ERRORED_SENTINEL,
  withResolverContext,
} = require('./ResolverFragments');
const {generateTypeID} = require('./TypeID');
const invariant = require('invariant');

function read(
  recordSource: RecordSource,
  selector: SingularReaderSelector,
  resolverCache?: ResolverCache,
  resolverContext?: ResolverContext,
): Snapshot {
  const reader = new RelayReader(
    recordSource,
    selector,
    resolverCache ?? new NoopResolverCache(),
    resolverContext,
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
  _missingLiveResolverFields: Array<DataID>;
  _isWithinUnmatchedTypeRefinement: boolean;
  _fieldErrors: ?FieldErrors;
  _owner: RequestDescriptor;
  // Exec time resolvers are run before reaching the Relay store so the store already contains
  // the normalized data; the same as if the data were sent from the server. However, since a
  // resolver could be used at read time or exec time in different queries, the reader AST for
  // a resolver is the read time AST. At runtime, this flag is used to ignore the extra
  // information in the read time resolver AST and use the "standard", non-resolver read paths
  _useExecTimeResolvers: boolean;
  _recordSource: RecordSource;
  _seenRecords: DataIDSet;
  _updatedDataIDs: DataIDSet;
  _selector: SingularReaderSelector;
  _variables: Variables;
  _resolverCache: ResolverCache;
  _fragmentName: string;
  _resolverContext: ?ResolverContext;

  constructor(
    recordSource: RecordSource,
    selector: SingularReaderSelector,
    resolverCache: ResolverCache,
    resolverContext: ?ResolverContext,
  ) {
    this._clientEdgeTraversalPath = selector.clientEdgeTraversalPath?.length
      ? [...selector.clientEdgeTraversalPath]
      : [];
    this._missingClientEdges = [];
    this._missingLiveResolverFields = [];
    this._isMissingData = false;
    this._isWithinUnmatchedTypeRefinement = false;
    this._fieldErrors = null;
    this._owner = selector.owner;
    this._useExecTimeResolvers =
      this._owner.node.operation.use_exec_time_resolvers ??
      this._owner.node.operation.exec_time_resolvers_enabled_provider?.get() ===
        true ??
      false;
    this._recordSource = recordSource;
    this._seenRecords = new Set();
    this._selector = selector;
    this._variables = selector.variables;
    this._resolverCache = resolverCache;
    this._fragmentName = selector.node.name;
    this._updatedDataIDs = new Set();
    this._resolverContext = resolverContext;
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
      if (!this._recordMatchesTypeCondition(record, node.type)) {
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
      }
    }

    this._isWithinUnmatchedTypeRefinement = !isDataExpectedToBePresent;
    let data = this._traverse(node, dataID, null);

    // If the fragment/operation was marked with @catch, we need to handle any
    // errors that were encountered while reading the fields within it.
    const catchTo = this._selector.node.metadata?.catchTo;
    if (catchTo != null) {
      data = this._catchErrors(data, catchTo, null) as $FlowFixMe;
    }

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
      fieldErrors: this._fieldErrors,
    };
  }

  _maybeAddFieldErrors(record: Record, storageKey: string): void {
    const errors = RelayModernRecord.getErrors(record, storageKey);

    if (errors == null) {
      return;
    }
    const owner = this._fragmentName;

    if (this._fieldErrors == null) {
      this._fieldErrors = [];
    }
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      this._fieldErrors.push({
        kind: 'relay_field_payload.error',
        owner,
        fieldPath: (error.path ?? []).join('.'),
        error,
        shouldThrow: this._selector.node.metadata?.throwOnFieldError ?? false,
        handled: false,
        // the uiContext is always undefined here.
        // the loggingContext is provided by hooks - and assigned to uiContext in handlePotentialSnapshotErrors
        uiContext: undefined,
      });
    }
  }

  _markDataAsMissing(fieldName: string): void {
    if (this._isWithinUnmatchedTypeRefinement) {
      return;
    }
    if (this._fieldErrors == null) {
      this._fieldErrors = [];
    }

    // we will add the path later
    const owner = this._fragmentName;

    this._fieldErrors.push(
      this._selector.node.metadata?.throwOnFieldError ?? false
        ? {
            kind: 'missing_expected_data.throw',
            owner,
            fieldPath: fieldName,
            handled: false,
            // the uiContext is always undefined here.
            // the loggingContext is provided by hooks - and assigned to uiContext in handlePotentialSnapshotErrors
            uiContext: undefined,
          }
        : {
            kind: 'missing_expected_data.log',
            owner,
            fieldPath: fieldName,
            // the uiContext is always undefined here.
            // the loggingContext is provided by hooks - and assigned to uiContext in handlePotentialSnapshotErrors
            uiContext: undefined,
          },
    );

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
        this._markDataAsMissing('<record>');
      }
      // $FlowFixMe[incompatible-return]
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

  _maybeReportUnexpectedNull(selection: ReaderRequiredField) {
    if (selection.action === 'NONE') {
      return;
    }
    const owner = this._fragmentName;

    if (this._fieldErrors == null) {
      this._fieldErrors = [];
    }

    let fieldName: string;
    if (selection.field.linkedField != null) {
      fieldName =
        selection.field.linkedField.alias ?? selection.field.linkedField.name;
    } else {
      fieldName = selection.field.alias ?? selection.field.name;
    }

    switch (selection.action) {
      case 'THROW':
        this._fieldErrors.push({
          kind: 'missing_required_field.throw',
          fieldPath: fieldName,
          owner,
          handled: false,
          // the uiContext is always undefined here.
          // the loggingContext is provided by hooks - and assigned to uiContext in handlePotentialSnapshotErrors
          uiContext: undefined,
        });
        return;
      case 'LOG':
        this._fieldErrors.push({
          kind: 'missing_required_field.log',
          fieldPath: fieldName,
          owner,
          // the uiContext is always undefined here.
          // the loggingContext is provided by hooks - and assigned to uiContext in handlePotentialSnapshotErrors
          uiContext: undefined,
        });
        return;
      default:
        (selection.action: empty);
    }
  }

  _handleRequiredFieldValue(
    selection: ReaderRequiredField,
    value: mixed,
  ): boolean /*should continue to siblings*/ {
    if (value == null) {
      this._maybeReportUnexpectedNull(selection);
      // We are going to throw, or our parent is going to get nulled out.
      // Either way, sibling values are going to be ignored, so we can
      // bail early here as an optimization.
      return false;
    }
    return true;
  }

  /**
   * Fields, aliased inline fragments, fragments and operations with `@catch`
   * directives must handle the case that errors were encountered while reading
   * any fields within them.
   *
   * 1. Before traversing into the selection(s) marked as `@catch`, the caller
   *   stores the previous field errors (`this._fieldErrors`) in a
   *   variable.
   * 2. After traversing into the selection(s) marked as `@catch`, the caller
   *   calls this method with the resulting value, the `to` value from the
   *   `@catch` directive, and the previous field errors.
   *
   * This method will then:
   *
   * 1. Compute the correct value to return based on any errors encountered and the supplied `to` type.
   * 2. Mark any errors encountered within the `@catch` as "handled" to ensure they don't cause the reader to throw.
   * 3. Merge any errors encountered within the `@catch` with the previous field errors.
   */
  _catchErrors<T>(
    _value: T,
    to: CatchFieldTo,
    previousResponseFields: ?FieldErrors,
  ): ?T | Result<T, mixed> {
    let value: T | null | Result<T, mixed> = _value;
    switch (to) {
      case 'RESULT':
        value = this._asResult(_value);
        break;
      case 'NULL':
        if (this._fieldErrors != null && this._fieldErrors.length > 0) {
          value = null;
        }
        break;
      default:
        (to: empty);
    }

    const childrenFieldErrors = this._fieldErrors;

    this._fieldErrors = previousResponseFields;

    // Merge any errors encountered within the @catch with the previous field
    // errors, but mark them as "handled" first.
    if (childrenFieldErrors != null) {
      if (this._fieldErrors == null) {
        this._fieldErrors = [];
      }
      for (let i = 0; i < childrenFieldErrors.length; i++) {
        // We mark any errors encountered within the @catch as "handled"
        // to ensure that they don't cause the reader to throw, but can
        // still be logged.
        this._fieldErrors.push(
          markFieldErrorHasHandled(childrenFieldErrors[i]),
        );
      }
    }
    return value;
  }

  /**
   * Convert a value into a Result object based on the presence of errors in the
   * `this._fieldErrors` array.
   *
   * **Note**: This method does _not_ mark errors as handled. It is the caller's
   * responsibility to ensure that errors are marked as handled.
   */
  _asResult<T>(value: T): Result<T, mixed> {
    if (this._fieldErrors == null || this._fieldErrors.length === 0) {
      return {ok: true, value};
    }

    // TODO: Should we be hiding log level events here?
    const errors = this._fieldErrors
      .map(error => {
        switch (error.kind) {
          case 'relay_field_payload.error':
            const {message, ...displayError} = error.error;
            return displayError;
          case 'missing_expected_data.throw':
          case 'missing_expected_data.log':
            return {
              path: error.fieldPath.split('.'),
            };
          case 'relay_resolver.error':
            return {
              message: `Relay: Error in resolver for field at ${error.fieldPath} in ${error.owner}`,
            };
          case 'missing_required_field.throw':
            // If we have a nested @required(THROW) that will throw,
            // we want to catch that error and provide it
            return {
              message: `Relay: Missing @required value at path '${error.fieldPath}' in '${error.owner}'.`,
            };
          case 'missing_required_field.log':
            // For backwards compatibility, we don't surface log level missing required fields
            return null;
          default:
            (error.kind: empty);
            invariant(
              false,
              'Unexpected error fieldError kind: %s',
              error.kind,
            );
        }
      })
      .filter(Boolean);

    return {ok: false, errors};
  }

  _traverseSelections(
    selections: $ReadOnlyArray<ReaderSelection>,
    record: Record,
    data: SelectorData,
  ): boolean /* had all expected data */ {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];

      switch (selection.kind) {
        case 'RequiredField':
          const requiredFieldValue = this._readClientSideDirectiveField(
            selection,
            record,
            data,
          );
          if (!this._handleRequiredFieldValue(selection, requiredFieldValue)) {
            return false;
          }
          break;
        case 'CatchField': {
          const previousResponseFields = this._fieldErrors;

          this._fieldErrors = null;

          const catchFieldValue = this._readClientSideDirectiveField(
            selection,
            record,
            data,
          );

          const field = selection.field?.backingField ?? selection.field;
          const fieldName = field?.alias ?? field?.name;
          // ReaderClientExtension doesn't have `alias` or `name`
          // so we don't support this yet
          invariant(
            fieldName != null,
            "Couldn't determine field name for this field. It might be a ReaderClientExtension - which is not yet supported.",
          );

          data[fieldName] = this._catchErrors(
            catchFieldValue,
            selection.to,
            previousResponseFields,
          );

          break;
        }
        case 'ScalarField':
          this._readScalar(selection, record, data);
          break;
        case 'LinkedField':
          if (selection.plural) {
            this._readPluralLink(selection, record, data);
          } else {
            this._readLink(selection, record, data);
          }
          break;
        case 'Condition':
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
        case 'InlineFragment': {
          const hasExpectedData = this._readInlineFragment(
            selection,
            record,
            data,
            false,
          );
          if (hasExpectedData === false) {
            // We are missing @required data, so we bubble up.
            return false;
          }
          break;
        }
        case 'RelayLiveResolver':
        case 'RelayResolver': {
          if (this._useExecTimeResolvers) {
            this._readScalar(selection, record, data);
          } else {
            this._readResolverField(selection, record, data);
          }
          break;
        }
        case 'FragmentSpread':
          this._createFragmentPointer(selection, record, data);
          break;
        case 'AliasedInlineFragmentSpread': {
          this._readAliasedInlineFragment(selection, record, data);
          break;
        }
        case 'ModuleImport':
          this._readModuleImport(selection, record, data);
          break;
        case 'InlineDataFragmentSpread':
          this._createInlineDataOrResolverFragmentPointer(
            selection,
            record,
            data,
          );
          break;
        case 'Defer':
        case 'ClientExtension': {
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
        case 'Stream': {
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
        case 'ActorChange':
          this._readActorChange(selection, record, data);
          break;
        case 'ClientEdgeToClientObject':
        case 'ClientEdgeToServerObject':
          if (
            this._useExecTimeResolvers &&
            (selection.backingField.kind === 'RelayResolver' ||
              selection.backingField.kind === 'RelayLiveResolver')
          ) {
            const {linkedField} = selection;
            if (linkedField.plural) {
              this._readPluralLink(linkedField, record, data);
            } else {
              this._readLink(linkedField, record, data);
            }
          } else {
            this._readClientEdge(selection, record, data);
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

  _readClientSideDirectiveField(
    selection: ReaderRequiredField | ReaderCatchField,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    switch (selection.field.kind) {
      case 'ScalarField':
        return this._readScalar(selection.field, record, data);
      case 'LinkedField':
        if (selection.field.plural) {
          return this._readPluralLink(selection.field, record, data);
        } else {
          return this._readLink(selection.field, record, data);
        }

      case 'RelayResolver':
      case 'RelayLiveResolver': {
        if (this._useExecTimeResolvers) {
          return this._readScalar(selection.field, record, data);
        } else {
          return this._readResolverField(selection.field, record, data);
        }
      }
      case 'ClientEdgeToClientObject':
      case 'ClientEdgeToServerObject':
        if (
          this._useExecTimeResolvers &&
          (selection.field.backingField.kind === 'RelayResolver' ||
            selection.field.backingField.kind === 'RelayLiveResolver')
        ) {
          const {field} = selection;
          if (field.linkedField.plural) {
            return this._readPluralLink(field.linkedField, record, data);
          } else {
            return this._readLink(field.linkedField, record, data);
          }
        } else {
          return this._readClientEdge(selection.field, record, data);
        }
      case 'AliasedInlineFragmentSpread':
        return this._readAliasedInlineFragment(selection.field, record, data);
      default:
        (selection.field.kind: empty);
        invariant(
          false,
          'RelayReader(): Unexpected ast kind `%s`.',
          selection.field.kind,
        );
    }
  }

  _readResolverField(
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    record: Record,
    data: SelectorData,
  ): mixed {
    const parentRecordID = RelayModernRecord.getDataID(record);
    const prevErrors = this._fieldErrors;
    this._fieldErrors = null;
    const result = this._readResolverFieldImpl(field, parentRecordID);

    const fieldName = field.alias ?? field.name;
    this._prependPreviousErrors(prevErrors, fieldName);
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
          fieldErrors: snapshot.fieldErrors,
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
        fieldErrors: snapshot.fieldErrors,
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
        const key: SelectorData = {
          __id: parentRecordID,
          __fragmentOwner: this._owner,
          __fragments: {
            [fragment.name]: fragment.args
              ? getArgumentValues(fragment.args, this._variables)
              : {},
          },
        };
        if (
          this._clientEdgeTraversalPath.length > 0 &&
          this._clientEdgeTraversalPath[
            this._clientEdgeTraversalPath.length - 1
          ] !== null
        ) {
          key[CLIENT_EDGE_TRAVERSAL_PATH] = [...this._clientEdgeTraversalPath];
        }
        const resolverContext = {getDataForResolverFragment};
        return withResolverContext(resolverContext, () => {
          const [resolverResult, resolverError] = getResolverValue(
            field,
            this._variables,
            key,
            this._resolverContext,
          );
          return {resolverResult, snapshot, error: resolverError};
        });
      } else {
        const [resolverResult, resolverError] = getResolverValue(
          field,
          this._variables,
          null,
          this._resolverContext,
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

    this._propagateResolverMetadata(
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
  _propagateResolverMetadata(
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
      if (cachedSnapshot.missingClientEdges != null) {
        for (let i = 0; i < cachedSnapshot.missingClientEdges.length; i++) {
          const missing = cachedSnapshot.missingClientEdges[i];
          this._missingClientEdges.push(missing);
        }
      }
      if (cachedSnapshot.missingLiveResolverFields != null) {
        this._isMissingData =
          this._isMissingData ||
          cachedSnapshot.missingLiveResolverFields.length > 0;

        for (
          let i = 0;
          i < cachedSnapshot.missingLiveResolverFields.length;
          i++
        ) {
          const missingResolverField =
            cachedSnapshot.missingLiveResolverFields[i];
          this._missingLiveResolverFields.push(missingResolverField);
        }
      }
      if (cachedSnapshot.fieldErrors != null) {
        if (this._fieldErrors == null) {
          this._fieldErrors = [];
        }
        for (let i = 0; i < cachedSnapshot.fieldErrors.length; i++) {
          const error = cachedSnapshot.fieldErrors[i];
          if (this._selector.node.metadata?.throwOnFieldError === true) {
            // If this fragment is @throwOnFieldError, any destructive error
            // encountered inside a resolver's fragment is equivilent to the
            // resolver field having a field error, and we want that to cause this
            // fragment to throw. So, we propagate all errors as is.
            this._fieldErrors.push(error);
          } else {
            // If this fragment is _not_ @throwOnFieldError, we will simply
            // accept that any destructive errors encountered in the resolver's
            // root fragment will cause the resolver to return null, and well
            // pass the errors along to the logger marked as "handled".
            this._fieldErrors.push(markFieldErrorHasHandled(error));
          }
        }
      }
      this._isMissingData = this._isMissingData || cachedSnapshot.isMissingData;
    }

    // If the resolver errored, we track that as part of our traversal so that
    // the errors can be attached to this read's snapshot. This allows the error
    // to be logged.
    if (resolverError) {
      const errorEvent: FieldError = {
        kind: 'relay_resolver.error',
        fieldPath,
        owner: this._fragmentName,
        error: resolverError,
        shouldThrow: this._selector.node.metadata?.throwOnFieldError ?? false,
        handled: false,
        // the uiContext is always undefined here.
        // the loggingContext is provided by hooks - and assigned to uiContext in handlePotentialSnapshotErrors
        uiContext: undefined,
      };
      if (this._fieldErrors == null) {
        this._fieldErrors = [errorEvent];
      } else {
        this._fieldErrors.push(errorEvent);
      }
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
      this._missingLiveResolverFields.push(suspenseID);
    }
    if (updatedDataIDs != null) {
      // Iterating a Set with for of is okay
      // eslint-disable-next-line relay-internal/no-for-of-loops
      updatedDataIDs.forEach(recordID => {
        this._updatedDataIDs.add(recordID);
      });
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
        'Expected plural Client Edge Relay Resolver at `%s` in `%s` to return an array containing IDs or objects with shape {id}.',
        backingField.path,
        this._owner.identifier,
      );
      let storeIDs: $ReadOnlyArray<DataID>;
      invariant(
        field.kind === 'ClientEdgeToClientObject',
        'Unexpected Client Edge to plural server type `%s`. This should be prevented by the compiler.',
        field.kind,
      );
      if (field.backingField.normalizationInfo == null) {
        // @edgeTo case where we need to ensure that the record has `id` field
        storeIDs = clientEdgeResolverResponse.map(itemResponse => {
          const concreteType = field.concreteType ?? itemResponse.__typename;
          invariant(
            typeof concreteType === 'string',
            'Expected resolver for field at `%s` in `%s` modeling an edge to an abstract type to return an object with a `__typename` property.',
            backingField.path,
            this._owner.identifier,
          );
          const localId = extractIdFromResponse(
            itemResponse,
            backingField.path,
            this._owner.identifier,
          );
          const id = this._resolverCache.ensureClientRecord(
            localId,
            concreteType,
          );

          const modelResolvers = field.modelResolvers;
          if (modelResolvers != null) {
            const modelResolver = modelResolvers[concreteType];
            invariant(
              modelResolver !== undefined,
              'Invalid `__typename` returned by resolver at `%s` in `%s`. Expected one of %s but got `%s`.',
              backingField.path,
              this._owner.identifier,
              Object.keys(modelResolvers).join(', '),
              concreteType,
            );
            const model = this._readResolverFieldImpl(modelResolver, id);
            return model != null ? id : null;
          }
          return id;
        });
      } else {
        // The normalization process in LiveResolverCache should take care of generating the correct ID.
        storeIDs = clientEdgeResolverResponse.map(obj =>
          extractIdFromResponse(obj, backingField.path, this._owner.identifier),
        );
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
      const id = extractIdFromResponse(
        clientEdgeResolverResponse,
        backingField.path,
        this._owner.identifier,
      );
      let storeID: DataID;
      const concreteType =
        field.concreteType ?? clientEdgeResolverResponse.__typename;
      let traversalPathSegment: ClientEdgeTraversalInfo | null;
      if (field.kind === 'ClientEdgeToClientObject') {
        if (field.backingField.normalizationInfo == null) {
          invariant(
            typeof concreteType === 'string',
            'Expected resolver for field at `%s` in `%s` modeling an edge to an abstract type to return an object with a `__typename` property.',
            backingField.path,
            this._owner.identifier,
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
          'Expected resolver for field at `%s` in `%s` modeling an edge to an abstract type to return an object with a `__typename` property.',
          backingField.path,
          this._owner.identifier,
        );
        const modelResolver = modelResolvers[concreteType];
        invariant(
          modelResolver !== undefined,
          'Invalid `__typename` returned by resolver at `%s` in `%s`. Expected one of %s but got `%s`.',
          backingField.path,
          this._owner.identifier,
          Object.keys(modelResolvers).join(', '),
          concreteType,
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
        'RelayReader(): Expected data for field at `%s` in `%s` on record `%s` ' +
          'to be an object, got `%s`.',
        backingField.path,
        this._owner.identifier,
        RelayModernRecord.getDataID(record),
        prevData,
      );
      const prevErrors = this._fieldErrors;
      this._fieldErrors = null;
      const edgeValue = this._traverse(
        field.linkedField,
        storeID,
        // $FlowFixMe[incompatible-variance]
        prevData,
      );
      this._prependPreviousErrors(prevErrors, fieldName);
      this._clientEdgeTraversalPath.pop();
      data[fieldName] = edgeValue;
      return edgeValue;
    }
  }

  _readScalar(
    field: ReaderScalarField | ReaderRelayResolver | ReaderRelayLiveResolver,
    record: Record,
    data: SelectorData,
  ): ?mixed {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const value = RelayModernRecord.getValue(record, storageKey);
    if (
      value === null ||
      (RelayFeatureFlags.ENABLE_NONCOMPLIANT_ERROR_HANDLING_ON_LISTS &&
        Array.isArray(value) &&
        value.length === 0)
    ) {
      this._maybeAddFieldErrors(record, storageKey);
    } else if (value === undefined) {
      this._markDataAsMissing(fieldName);
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
        this._maybeAddFieldErrors(record, storageKey);
      } else if (linkedID === undefined) {
        this._markDataAsMissing(fieldName);
      }
      return linkedID;
    }

    const prevData = data[fieldName];
    invariant(
      prevData == null || typeof prevData === 'object',
      'RelayReader(): Expected data for field `%s` at `%s` on record `%s` ' +
        'to be an object, got `%s`.',
      fieldName,
      this._owner.identifier,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    const prevErrors = this._fieldErrors;
    this._fieldErrors = null;
    // $FlowFixMe[incompatible-variance]
    const value = this._traverse(field, linkedID, prevData);

    this._prependPreviousErrors(prevErrors, fieldName);
    data[fieldName] = value;
    return value;
  }

  /**
   * Adds a set of field errors to `this._fieldErrors`, ensuring the
   * `fieldPath` property of existing field errors are prefixed with the given
   * `fieldNameOrIndex`.
   *
   * In order to make field errors maximally useful in logs/errors, we want to
   * include the path to the field that caused the error. A naive approach would
   * be to maintain a path property on RelayReader which we push/pop field names
   * to as we traverse into fields/etc. However, this would be expensive to
   * maintain, and in the common case where there are no field errors, the work
   * would go unused.
   *
   * Instead, we take a lazy approach where as we exit the recurison into a
   * field/etc we prepend any errors encountered while traversing that field
   * with the field name. This is somewhat more expensive in the error case, but
   * ~free in the common case where there are no errors.
   *
   * To achieve this, named field readers must do the following to correctly
   * track error filePaths:
   *
   * 1. Stash the value of `this._fieldErrors` in a local variable
   * 2. Set `this._fieldErrors` to `null`
   * 3. Traverse into the field
   * 4. Call this method with the stashed errors and the field's name
   *
   * Similarly, when creating field errors, we simply initialize the `fieldPath`
   * as the direct field name.
   *
   * Today we only use this apporach for `missing_expected_data` and
   * `missing_required_field` errors, but we intend to broaden it to handle all
   * field error paths.
   */
  _prependPreviousErrors(
    prevErrors: ?Array<FieldError>,
    fieldNameOrIndex: string | number,
  ): void {
    if (this._fieldErrors != null) {
      for (let i = 0; i < this._fieldErrors.length; i++) {
        const event = this._fieldErrors[i];
        if (
          event.owner === this._fragmentName &&
          (event.kind === 'missing_expected_data.throw' ||
            event.kind === 'missing_expected_data.log' ||
            event.kind === 'missing_required_field.throw' ||
            event.kind === 'missing_required_field.log')
        ) {
          event.fieldPath = `${fieldNameOrIndex}.${event.fieldPath}`;
        }
      }
      if (prevErrors != null) {
        for (let i = this._fieldErrors.length - 1; i >= 0; i--) {
          prevErrors.push(this._fieldErrors[i]);
        }
        this._fieldErrors = prevErrors;
      }
    } else {
      this._fieldErrors = prevErrors;
    }
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
        this._markDataAsMissing(fieldName);
      } else if (externalRef === null) {
        this._maybeAddFieldErrors(record, storageKey);
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
    if (
      linkedIDs === null ||
      (RelayFeatureFlags.ENABLE_NONCOMPLIANT_ERROR_HANDLING_ON_LISTS &&
        Array.isArray(linkedIDs) &&
        linkedIDs.length === 0)
    ) {
      this._maybeAddFieldErrors(record, storageKey);
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
        this._markDataAsMissing(fieldName);
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
    const prevErrors = this._fieldErrors;
    this._fieldErrors = null;
    const linkedArray = prevData || [];
    linkedIDs.forEach((linkedID, nextIndex) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
          this._markDataAsMissing(String(nextIndex));
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
      const prevErrors = this._fieldErrors;
      this._fieldErrors = null;
      // $FlowFixMe[cannot-write]
      // $FlowFixMe[incompatible-variance]
      linkedArray[nextIndex] = this._traverse(field, linkedID, prevItem);
      this._prependPreviousErrors(prevErrors, nextIndex);
    });
    this._prependPreviousErrors(prevErrors, fieldName);
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
    const relayStoreComponent = RelayModernRecord.getValue(
      record,
      componentKey,
    );
    // componentModuleProvider is used by Client 3D for read time resolvers.
    const component =
      relayStoreComponent !== undefined
        ? relayStoreComponent
        : moduleImport.componentModuleProvider;
    if (component == null) {
      if (component === undefined) {
        this._markDataAsMissing('<module-import>');
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

  /**
   * Aliased inline fragments allow the user to check if the data in an inline
   * fragment was fetched. Data in the inline fragment can be conditional in the
   * case of a type condition on the inline fragment or directives like `@skip`
   * or `@include`.
   *
   * We model aliased inline fragments as a special reader node wrapped around a
   * regular inline fragment reader node.
   *
   * This allows us to read the inline fragment as normal, check if it matched,
   * and then define the alias to either contain the inline fragment's data, or
   * null.
   */
  _readAliasedInlineFragment(
    aliasedInlineFragment: ReaderAliasedInlineFragmentSpread,
    record: Record,
    data: SelectorData,
  ) {
    const prevErrors = this._fieldErrors;
    this._fieldErrors = null;
    let fieldValue = this._readInlineFragment(
      aliasedInlineFragment.fragment,
      record,
      {},
      true,
    );
    this._prependPreviousErrors(prevErrors, aliasedInlineFragment.name);
    if (fieldValue === false) {
      fieldValue = null;
    }
    data[aliasedInlineFragment.name] = fieldValue;
  }

  // Has three possible return values:
  // * null: The type condition did not match
  // * undefined: We are missing data
  // * false: The selection contained missing @required fields
  // * data: The successfully populated SelectorData object
  //
  // The `skipUnmatchedAbstractTypes` flag is used to signal if we should skip
  // reading the contents of an inline fragment on an abstract type if we _know_
  // the type condition does not match.
  _readInlineFragment(
    inlineFragment: ReaderInlineFragment,
    record: Record,
    data: SelectorData,
    skipUnmatchedAbstractTypes: boolean,
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
      if (!this._recordMatchesTypeCondition(record, inlineFragment.type)) {
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

      if (implementsInterface === false && skipUnmatchedAbstractTypes) {
        return null;
      }

      // store flags to reset after reading
      const parentIsMissingData = this._isMissingData;
      const parentIsWithinUnmatchedTypeRefinement =
        this._isWithinUnmatchedTypeRefinement;

      this._isWithinUnmatchedTypeRefinement =
        parentIsWithinUnmatchedTypeRefinement || implementsInterface === false;

      // @required is allowed within inline fragments on abstract types if they
      // have @alias. So we must bubble up null if we have a missing @required
      // field.
      const hasMissingData = this._traverseSelections(
        inlineFragment.selections,
        record,
        data,
      );

      // Reset
      this._isWithinUnmatchedTypeRefinement =
        parentIsWithinUnmatchedTypeRefinement;

      if (implementsInterface === false) {
        // Type known to not implement the interface, no data expected
        this._isMissingData = parentIsMissingData;
        return null;
      } else if (implementsInterface == null) {
        // Don't know if the type implements the interface or not
        return undefined;
      } else if (hasMissingData === false) {
        // Bubble up null due to a missing @required field
        return false;
      }
    }
    return data;
  }

  _recordMatchesTypeCondition(record: Record, type: string): boolean {
    const typeName = RelayModernRecord.getType(record);
    return (
      (typeName != null && typeName === type) ||
      // The root record type is a special `__Root` type and may not match the
      // type on the ast, so ignore type mismatches at the root.  We currently
      // detect whether we're at the root by checking against ROOT_ID, but this
      // does not work for mutations/subscriptions which generate unique root
      // ids. This is acceptable in practice as we don't read data for
      // mutations/subscriptions in a situation where we would use
      // isMissingData to decide whether to suspend or not.
      // TODO T96653810: Correctly detect reading from root of mutation/subscription
      RelayModernRecord.getDataID(record) === ROOT_ID
    );
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

  _implementsInterface(record: Record, abstractKey: string): ?boolean {
    const typeName = RelayModernRecord.getType(record);
    const typeRecord = this._recordSource.get(generateTypeID(typeName));
    const implementsInterface =
      typeRecord != null
        ? RelayModernRecord.getValue(typeRecord, abstractKey)
        : null;

    if (implementsInterface == null) {
      // In some cases, like a graph relationship change, we might have never
      // fetched the `__is[AbstractType]` flag for this concrete type. In this
      // case we need to report that we are missing data, in case that field is
      // still in flight.
      this._markDataAsMissing('<abstract-type-hint>');
    }
    // $FlowFixMe Casting record value
    return implementsInterface;
  }
}

function markFieldErrorHasHandled(event: FieldError): FieldError {
  switch (event.kind) {
    case 'missing_expected_data.throw':
    case 'missing_required_field.throw':
    case 'relay_field_payload.error':
    case 'relay_resolver.error':
      return {...event, handled: true};
    case 'missing_expected_data.log':
    case 'missing_required_field.log':
      return event;
    default:
      event.kind as empty;
      invariant(false, 'Unexpected error response field kind: %s', event.kind);
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
  resolverContext: ?ResolverContext,
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

    resolverFunctionArgs.push(resolverContext);

    resolverResult = resolverFunction.apply(null, resolverFunctionArgs);
  } catch (e) {
    // GraphQL coerces resolver errors to null or nullable fields, and Relay
    // does not support non-nullable Relay Resolvers.
    resolverResult = null;
    if (e !== RESOLVER_FRAGMENT_ERRORED_SENTINEL) {
      resolverError = e;
    }
  }
  return [resolverResult, resolverError];
}

function extractIdFromResponse(
  individualResponse: mixed,
  path: string,
  owner: string,
): string {
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
    'Expected object returned from edge resolver to be a string or an object with an `id` property at path %s in %s,',
    path,
    owner,
  );
}

module.exports = {read};
