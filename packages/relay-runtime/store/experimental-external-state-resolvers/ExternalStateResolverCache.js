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

import type {ReaderRelayResolver} from '../../util/ReaderNode';
import type {DataID, Variables} from '../../util/RelayRuntimeTypes';
import type {
  MissingRequiredFields,
  MutableRecordSource,
  Record,
  RelayResolverErrors,
  SingularReaderSelector,
} from '../RelayStoreTypes';
import type {ResolverCache} from '../ResolverCache';
import type {ExternalState} from './ExternalStateResolverStore';

const recycleNodesInto = require('../../util/recycleNodesInto');
const {generateClientID} = require('../ClientID');
const RelayModernRecord = require('../RelayModernRecord');
const RelayRecordSource = require('../RelayRecordSource');
const {
  RELAY_RESOLVER_ERROR_KEY,
  RELAY_RESOLVER_INPUTS_KEY,
  RELAY_RESOLVER_INVALIDATION_KEY,
  RELAY_RESOLVER_MISSING_REQUIRED_FIELDS_KEY,
  RELAY_RESOLVER_READER_SELECTOR_KEY,
  RELAY_RESOLVER_VALUE_KEY,
  getStorageKey,
} = require('../RelayStoreUtils');
const ExternalStateResolverStore = require('./ExternalStateResolverStore');
const warning = require('warning');

// When this experiment gets promoted to stable, these keys will move into
// `RelayStoreUtils`.
const RELAY_RESOLVER_EXTERNAL_STATE_SUBSCRIPTION_KEY =
  '__resolverExternalStateSubscription';
const RELAY_EXTERNAL_STATE_VALUE = '__resolverExternalStateValue';
const RELAY_EXTERNAL_STATE_DIRTY = '__resolverExternalStateDirty';

/**
 * An experimental fork of store/ResolverCache.js intended to let us experiment
 * with External State Resolvers.
 */

type ResolverID = string;

type EvaluationResult<T> = {|
  resolverResult: T,
  fragmentValue: {...},
  resolverID: ResolverID,
  seenRecordIDs: Set<DataID>,
  readerSelector: SingularReaderSelector,
  errors: RelayResolverErrors,
  missingRequiredFields: ?MissingRequiredFields,
|};

// $FlowFixMe[unclear-type] - will always be empty
const emptySet: $ReadOnlySet<any> = new Set();

function addDependencyEdge(
  edges: Map<ResolverID, Set<DataID>> | Map<DataID, Set<ResolverID>>,
  from: ResolverID | DataID,
  to: ResolverID | DataID,
): void {
  let set = edges.get(from);
  if (!set) {
    set = new Set();
    edges.set(from, set);
  }
  set.add(to);
}

class ExternalStateResolverCache implements ResolverCache {
  _resolverIDToRecordIDs: Map<ResolverID, Set<DataID>>;
  _recordIDToResolverIDs: Map<DataID, Set<ResolverID>>;

  _getRecordSource: () => MutableRecordSource;
  _store: ExternalStateResolverStore;

  constructor(
    getRecordSource: () => MutableRecordSource,
    store: ExternalStateResolverStore,
  ) {
    this._resolverIDToRecordIDs = new Map();
    this._recordIDToResolverIDs = new Map();
    this._getRecordSource = getRecordSource;
    this._store = store;
  }

  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: SingularReaderSelector => mixed,
  ): [
    T /* Answer */,
    ?DataID /* Seen record */,
    RelayResolverErrors,
    ?MissingRequiredFields,
  ] {
    const recordSource = this._getRecordSource();
    const recordID = RelayModernRecord.getDataID(record);

    const storageKey = getStorageKey(field, variables);
    let linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    let linkedRecord = linkedID == null ? null : recordSource.get(linkedID);

    if (
      linkedRecord == null ||
      this._isInvalid(linkedRecord, getDataForResolverFragment)
    ) {
      // Cache miss; evaluate the selector and store the result in a new record:
      linkedID = linkedID ?? generateClientID(recordID, storageKey);
      linkedRecord = RelayModernRecord.create(linkedID, '__RELAY_RESOLVER__');

      const evaluationResult = evaluate();

      // In the future we we know from the Reader AST node if we are trying to
      // read a Relay Resolver field or not. For the purpose of this hack, we
      // will just check if it quacks like a duck.
      const externalState = isExternalStateValue(
        evaluationResult.resolverResult,
      );

      if (externalState != null) {
        this._setExternalStateValue(linkedRecord, linkedID, externalState);
      } else {
        RelayModernRecord.setValue(
          linkedRecord,
          RELAY_RESOLVER_VALUE_KEY,
          evaluationResult.resolverResult,
        );
      }
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_INPUTS_KEY,
        evaluationResult.fragmentValue,
      );
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_READER_SELECTOR_KEY,
        evaluationResult.readerSelector,
      );
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_MISSING_REQUIRED_FIELDS_KEY,
        evaluationResult.missingRequiredFields,
      );
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_ERROR_KEY,
        evaluationResult.errors,
      );
      recordSource.set(linkedID, linkedRecord);

      // Link the resolver value record to the resolver field of the record being read:
      const nextRecord = RelayModernRecord.clone(record);
      RelayModernRecord.setLinkedRecordID(nextRecord, storageKey, linkedID);
      recordSource.set(RelayModernRecord.getDataID(nextRecord), nextRecord);

      // Put records observed by the resolver into the dependency graph:
      const resolverID = evaluationResult.resolverID;
      addDependencyEdge(this._resolverIDToRecordIDs, resolverID, linkedID);
      addDependencyEdge(this._recordIDToResolverIDs, recordID, resolverID);
      for (const seenRecordID of evaluationResult.seenRecordIDs) {
        addDependencyEdge(
          this._recordIDToResolverIDs,
          seenRecordID,
          resolverID,
        );
      }
    } else {
      // If this is an External State Resolver, we might have a cache hit (the
      // fragment data hasn't changed since we last evaluated the resolver),
      // but it might still be "dirty" (the external state changed and we need
      // to call `.read()` again).
      //
      // This is currently a bit implicit for now since we rely on the fact that
      // only External State Resolvers can have `RELAY_EXTERNAL_STATE_DIRTY`
      // set. However, in the future, we will have a distinct Reader AST node
      // for External State Resolvers, so we won't have to be so implicit.
      if (
        RelayModernRecord.getValue(linkedRecord, RELAY_EXTERNAL_STATE_DIRTY)
      ) {
        linkedID = linkedID ?? generateClientID(recordID, storageKey);
        linkedRecord = RelayModernRecord.clone(linkedRecord);
        // $FlowFixMe[incompatible-type] - casting mixed
        const externalState: ExternalState<mixed> = RelayModernRecord.getValue(
          linkedRecord,
          RELAY_EXTERNAL_STATE_VALUE,
        );
        // Set the new value for this and future reads.
        RelayModernRecord.setValue(
          linkedRecord,
          RELAY_RESOLVER_VALUE_KEY,
          externalState.read(),
        );
        // Mark the resolver as clean again.
        RelayModernRecord.setValue(
          linkedRecord,
          RELAY_EXTERNAL_STATE_DIRTY,
          false,
        );
        recordSource.set(linkedID, linkedRecord);
      }
    }

    // $FlowFixMe[incompatible-type] - will always be empty
    const answer: T = linkedRecord[RELAY_RESOLVER_VALUE_KEY];

    const missingRequiredFields: ?MissingRequiredFields =
      // $FlowFixMe[incompatible-type] - casting mixed
      linkedRecord[RELAY_RESOLVER_MISSING_REQUIRED_FIELDS_KEY];

    // $FlowFixMe[incompatible-type] - casting mixed
    const errors: RelayResolverErrors = linkedRecord[RELAY_RESOLVER_ERROR_KEY];
    return [answer, linkedID, errors, missingRequiredFields];
  }

  // Register a new External State object in the store, subscribing to future
  // updates.
  _setExternalStateValue(
    linkedRecord: Record,
    linkedID: DataID,
    externalState: ExternalState<mixed>,
  ) {
    // If there's an existing subscription, unsubscribe.
    // $FlowFixMe[incompatible-type] - casting mixed
    const previousUnsubscribe: () => void = RelayModernRecord.getValue(
      linkedRecord,
      RELAY_RESOLVER_EXTERNAL_STATE_SUBSCRIPTION_KEY,
    );

    if (previousUnsubscribe != null) {
      previousUnsubscribe();
    }

    // Subscribe to future values
    const handler = this._makeExternalStateHandler(linkedID, externalState);
    const unsubscribe = externalState.subscribe(handler);

    // Store the external state value for future re-reads.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_EXTERNAL_STATE_VALUE,
      externalState,
    );

    // Store the current value, for this read, and future cached reads.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_RESOLVER_VALUE_KEY,
      externalState.read(),
    );

    // Mark the field as clean.
    RelayModernRecord.setValue(linkedRecord, RELAY_EXTERNAL_STATE_DIRTY, false);

    // Store our our unsubscribe function for future cleanup.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_RESOLVER_EXTERNAL_STATE_SUBSCRIPTION_KEY,
      unsubscribe,
    );
  }

  // Create a callback to handle notifications from the external source that the
  // value may have changed.
  _makeExternalStateHandler(
    linkedID: DataID,
    externalState: ExternalState<mixed>,
  ): () => void {
    return () => {
      const currentSource = this._getRecordSource();
      const currentRecord = currentSource.get(linkedID);
      if (!currentRecord) {
        warning(
          false,
          'Expected a resolver record with ID %s, but it was missing.',
          linkedID,
        );
        return;
      }

      const nextSource = RelayRecordSource.create();
      const nextRecord = RelayModernRecord.clone(currentRecord);

      // Mark the field as dirty. The next time it's read, we will call
      // `ExternalState.read()`.
      RelayModernRecord.setValue(nextRecord, RELAY_EXTERNAL_STATE_DIRTY, true);

      nextSource.set(linkedID, nextRecord);
      this._store.publish(nextSource);

      // In the future, this notify might be defferred if we are within a
      // transaction.
      this._store.notify();
    };
  }

  invalidateDataIDs(
    updatedDataIDs: Set<DataID>, // Mutated in place
  ): void {
    const recordSource = this._getRecordSource();
    const visited: Set<string> = new Set();
    const recordsToVisit = Array.from(updatedDataIDs);
    while (recordsToVisit.length) {
      const recordID = recordsToVisit.pop();
      updatedDataIDs.add(recordID);
      for (const fragment of this._recordIDToResolverIDs.get(recordID) ??
        emptySet) {
        if (!visited.has(fragment)) {
          for (const anotherRecordID of this._resolverIDToRecordIDs.get(
            fragment,
          ) ?? emptySet) {
            this._markInvalidatedResolverRecord(anotherRecordID, recordSource);
            if (!visited.has(anotherRecordID)) {
              recordsToVisit.push(anotherRecordID);
            }
          }
        }
      }
    }
  }

  _markInvalidatedResolverRecord(
    dataID: DataID,
    recordSource: MutableRecordSource, // Written to
  ) {
    const record = recordSource.get(dataID);
    if (!record) {
      warning(
        false,
        'Expected a resolver record with ID %s, but it was missing.',
        dataID,
      );
      return;
    }
    const nextRecord = RelayModernRecord.clone(record);
    RelayModernRecord.setValue(
      nextRecord,
      RELAY_RESOLVER_INVALIDATION_KEY,
      true,
    );
    recordSource.set(dataID, nextRecord);
  }

  _isInvalid(
    record: Record,
    getDataForResolverFragment: SingularReaderSelector => mixed,
  ): boolean {
    if (!RelayModernRecord.getValue(record, RELAY_RESOLVER_INVALIDATION_KEY)) {
      return false;
    }
    const originalInputs = RelayModernRecord.getValue(
      record,
      RELAY_RESOLVER_INPUTS_KEY,
    );
    // $FlowFixMe[incompatible-type] - storing values in records is not typed
    const readerSelector: ?SingularReaderSelector = RelayModernRecord.getValue(
      record,
      RELAY_RESOLVER_READER_SELECTOR_KEY,
    );
    if (originalInputs == null || readerSelector == null) {
      warning(
        false,
        'Expected previous inputs and reader selector on resolver record with ID %s, but they were missing.',
        RelayModernRecord.getDataID(record),
      );
      return true;
    }
    const latestValues = getDataForResolverFragment(readerSelector);
    const recycled = recycleNodesInto(originalInputs, latestValues);
    if (recycled !== originalInputs) {
      return true;
    }
    return false;
  }
}

// In the real implementaiton, we will probably have a special Reader AST node to tell us when
// a value is external state
// $FlowFixMe
function isExternalStateValue(v: Object): ?ExternalState {
  if (
    v != null &&
    typeof v.read === 'function' &&
    typeof v.subscribe === 'function'
  ) {
    return v;
  } else {
    return null;
  }
}

module.exports = {
  ExternalStateResolverCache,
};
