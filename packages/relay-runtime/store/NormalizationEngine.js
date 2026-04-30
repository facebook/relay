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

import type {GraphQLResponseWithData} from '../network/RelayNetworkTypes';
import type {
  NormalizationLinkedField,
  NormalizationOperation,
  NormalizationRootNode,
} from '../util/NormalizationNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {NormalizationOptions} from './RelayResponseNormalizer';
import type {
  DeferPlaceholder,
  FollowupPayload,
  HandleFieldPayload,
  IncrementalDataPlaceholder,
  ModuleImportPayload,
  MutableRecordSource,
  NormalizationSelector,
  NormalizeResponseFunction,
  OperationLoader,
  Record,
  RecordSourceProxy,
  RelayResponsePayload,
  StreamPlaceholder,
} from './RelayStoreTypes';

const {stableCopy} = require('../util/stableCopy');
const {generateClientID} = require('./ClientID');
const defaultGetDataID = require('./defaultGetDataID');
const RelayModernRecord = require('./RelayModernRecord');
const {createNormalizationSelector} = require('./RelayModernSelector');
const {ROOT_ID, ROOT_TYPE, getStorageKey} = require('./RelayStoreUtils');

function err(message: string): Error {
  const e = new Error(message);
  void e.stack;
  return e;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableCopy(value)) ?? '';
}

export type NormalizationResult = Readonly<{
  payloads: ReadonlyArray<RelayResponsePayload>,
  // Each pending module resolves to its own NormalizationResult so the caller
  // can recursively drain nested incremental data (extra payloads + further
  // pending modules) produced by an async @module load. Mirrors the recursion
  // that OperationExecutor performs synchronously via `_processPayloadFollowups`.
  pendingModules: ReadonlyArray<Promise<NormalizationResult>>,
}>;

type Config = Readonly<{
  getDataID?: (fieldValue: {+[string]: unknown}, typeName: string) => unknown,
  normalizeResponse: NormalizeResponseFunction,
  operation: NormalizationOperation,
  operationLoader?: ?OperationLoader,
  treatMissingFieldsAsNull?: boolean,
  variables: Variables,
}>;

type ParentEntry = {
  fieldPayloads: Array<HandleFieldPayload>,
  record: Record,
};

/**
 * Per-request normalization engine. Normalizes raw server responses and
 * returns pre-normalized RelayResponsePayload objects (with isPreNormalized:
 * true) that OperationExecutor can commit directly to the store, bypassing
 * the normalization pass it would otherwise perform.
 *
 * Handles initial responses, @defer chunks, @stream items, and @module
 * followups. Tracks per-request state for incremental delivery including
 * placeholder registration, response buffering, and parent record caching.
 *
 * Returns results synchronously via arrays. Async @module loads are returned
 * as Promises — the caller bridges them to the sink.
 */
class NormalizationEngine {
  _normalizeResponse: NormalizeResponseFunction;
  _operationLoader: ?OperationLoader;
  _options: NormalizationOptions;
  _rootSelector: NormalizationSelector;
  _useExecTimeResolvers: boolean;

  // Per-request incremental delivery state
  _placeholders: Map<string, IncrementalDataPlaceholder>;
  _bufferedResponses: Map<string, Array<GraphQLResponseWithData>>;
  _parentRecords: Map<string, ParentEntry>;
  _serverComplete: boolean;

  constructor(config: Config) {
    this._normalizeResponse = config.normalizeResponse;
    this._operationLoader = config.operationLoader ?? null;
    this._rootSelector = {
      dataID: ROOT_ID,
      node: config.operation,
      variables: config.variables,
    };
    this._options = {
      deferDeduplicatedFields: false,
      getDataID: config.getDataID ?? defaultGetDataID,
      log: null,
      path: [],
      treatMissingFieldsAsNull: config.treatMissingFieldsAsNull ?? false,
    };
    this._useExecTimeResolvers =
      config.operation.use_exec_time_resolvers ??
      config.operation.exec_time_resolvers_enabled_provider?.get() === true ??
      false;
    this._placeholders = new Map();
    this._bufferedResponses = new Map();
    this._parentRecords = new Map();
    this._serverComplete = false;
  }

  /**
   * Process an initial (non-incremental) server response. Normalizes the
   * response, registers any incremental placeholders, processes @module
   * followups, and flushes buffered responses.
   *
   * Returns an array of payloads (the primary result plus any flushed
   * buffered responses) and an array of Promises for async @module loads.
   */
  processResponse(response: GraphQLResponseWithData): NormalizationResult {
    const payload = this._normalizeResponse(
      response,
      this._rootSelector,
      ROOT_TYPE,
      this._options,
      this._useExecTimeResolvers,
    );

    const extraPayloads: Array<RelayResponsePayload> = [];
    const pendingModules: Array<Promise<NormalizationResult>> = [];

    // Register incremental placeholders and flush any buffered responses
    if (
      payload.incrementalPlaceholders != null &&
      payload.incrementalPlaceholders.length > 0
    ) {
      this._registerPlaceholders(
        payload.incrementalPlaceholders,
        payload.source,
        payload.fieldPayloads,
        extraPayloads,
        pendingModules,
      );
    }

    // Process module followups
    if (
      payload.followupPayloads != null &&
      payload.followupPayloads.length > 0
    ) {
      this._processFollowups(
        payload.followupPayloads,
        extraPayloads,
        pendingModules,
      );
    }

    const primaryPayload: RelayResponsePayload = {
      ...payload,
      followupPayloads: null,
      incrementalPlaceholders: null,
      isFinal: this._computeIsFinal(payload.isFinal),
      isPreNormalized: true,
    };

    return {
      payloads: [primaryPayload, ...extraPayloads],
      pendingModules,
    };
  }

  /**
   * Process an incremental response (@defer chunk or @stream item).
   * Matches the response to a registered placeholder by label + path.
   *
   * Returns null if the response was buffered (no placeholder yet).
   * Otherwise returns payloads array and pending module Promises.
   */
  processIncrementalResponse(
    response: GraphQLResponseWithData,
  ): ?NormalizationResult {
    const label: ?string = response.label;
    const path: ?ReadonlyArray<string | number> = response.path;

    if (label == null || path == null) {
      throw err(
        'NormalizationEngine: Expected incremental response to have ' +
          '`label` and `path` properties.',
      );
    }

    const isDefer = label.indexOf('$defer$') !== -1;
    const pathKey = isDefer
      ? path.map(String).join('.')
      : path.slice(0, -2).map(String).join('.');
    const key = makeKey(label, pathKey);

    const placeholder = this._placeholders.get(key);

    if (placeholder == null) {
      // Buffer: response arrived before placeholder was registered
      let buffer = this._bufferedResponses.get(key);
      if (buffer == null) {
        buffer = [];
        this._bufferedResponses.set(key, buffer);
      }
      buffer.push(response);
      return null;
    }

    if (placeholder.kind === 'defer') {
      return this._processDefer(response, path, placeholder);
    } else {
      return this._processStream(response, path, placeholder);
    }
  }

  /**
   * Mark the server stream as complete for isFinal computation.
   */
  setServerComplete(): void {
    this._serverComplete = true;
  }

  /**
   * Whether the server is complete AND all incremental data has been received.
   */
  isFinal(): boolean {
    return (
      this._serverComplete &&
      this._bufferedResponses.size === 0 &&
      this._placeholders.size === 0
    );
  }

  // ---------------------------------------------------------------------------
  // Private: @defer handling
  // ---------------------------------------------------------------------------

  _processDefer(
    response: GraphQLResponseWithData,
    _path: ReadonlyArray<unknown>,
    placeholder: DeferPlaceholder,
  ): NormalizationResult {
    const payload = this._normalizeResponse(
      response,
      placeholder.selector,
      placeholder.typeName,
      {
        ...this._options,
        deferDeduplicatedFields: true,
        path: placeholder.path,
      },
      this._useExecTimeResolvers,
    );

    const extraPayloads: Array<RelayResponsePayload> = [];
    const pendingModules: Array<Promise<NormalizationResult>> = [];

    // Register nested placeholders (recursive @defer)
    if (
      payload.incrementalPlaceholders != null &&
      payload.incrementalPlaceholders.length > 0
    ) {
      this._registerPlaceholders(
        payload.incrementalPlaceholders,
        payload.source,
        payload.fieldPayloads,
        extraPayloads,
        pendingModules,
      );
    }

    // Process nested followups (recursive @module)
    if (
      payload.followupPayloads != null &&
      payload.followupPayloads.length > 0
    ) {
      this._processFollowups(
        payload.followupPayloads,
        extraPayloads,
        pendingModules,
      );
    }

    // Replay handle field payloads from parent
    // TODO(skyyao): emit parent fieldPayloads as a separate payload (with empty
    // source) like OperationExecutor._processDeferResponse so handles run
    // against the just-committed updated parent record.
    const parentID = placeholder.selector.dataID;
    const parentEntry = this._parentRecords.get(parentID);
    let fieldPayloads = payload.fieldPayloads;
    if (parentEntry != null && parentEntry.fieldPayloads.length > 0) {
      fieldPayloads = (fieldPayloads ?? []).concat(parentEntry.fieldPayloads);
    }

    const primaryPayload: RelayResponsePayload = {
      ...payload,
      fieldPayloads,
      followupPayloads: null,
      incrementalPlaceholders: null,
      isFinal: this._computeIsFinal(payload.isFinal),
      isPreNormalized: true,
    };

    return {
      payloads: [primaryPayload, ...extraPayloads],
      pendingModules,
    };
  }

  // ---------------------------------------------------------------------------
  // Private: @stream handling
  // ---------------------------------------------------------------------------

  _processStream(
    response: GraphQLResponseWithData,
    path: ReadonlyArray<unknown>,
    placeholder: StreamPlaceholder,
  ): NormalizationResult {
    const {node, parentID, variables} = placeholder;

    // Find the LinkedField where @stream was applied
    const field = node.selections[0];
    if (
      field == null ||
      field.kind !== 'LinkedField' ||
      field.plural !== true
    ) {
      throw err(
        'NormalizationEngine: Expected @stream to be used on a plural field.',
      );
    }

    const {
      fieldPayloads,
      itemID,
      itemIndex,
      prevIDs,
      relayPayload,
      storageKey,
    } = this._normalizeStreamItem(
      response,
      parentID,
      field,
      variables,
      path,
      placeholder.path,
    );

    // Build store updater for concurrent modification detection
    const storeUpdater = (store: RecordSourceProxy) => {
      const currentParentRecord = store.get(parentID);
      if (currentParentRecord == null) {
        return;
      }
      const currentItems = currentParentRecord.getLinkedRecords(storageKey);
      if (currentItems == null) {
        return;
      }
      if (
        currentItems.length !== prevIDs.length ||
        currentItems.some(
          (item, i) => prevIDs[i] !== (item && item.getDataID()),
        )
      ) {
        return; // Concurrent modification -- drop stale stream data
      }
      const nextItems = [...currentItems];
      nextItems[itemIndex] = store.get(itemID);
      currentParentRecord.setLinkedRecords(nextItems, storageKey);
    };

    // Replay handle field payloads from parent
    // TODO(skyyao): emit parent fieldPayloads as a separate payload (with empty
    // source) like OperationExecutor._processStreamResponse so handles run
    // against the just-committed updated parent record.
    let mergedFieldPayloads = relayPayload.fieldPayloads;
    if (fieldPayloads.length > 0) {
      mergedFieldPayloads = (mergedFieldPayloads ?? []).concat(fieldPayloads);
    }

    return {
      payloads: [
        {
          ...relayPayload,
          fieldPayloads: mergedFieldPayloads,
          followupPayloads: null,
          incrementalPlaceholders: null,
          isFinal: this._computeIsFinal(relayPayload.isFinal),
          isPreNormalized: true,
          storeUpdater,
        },
      ],
      pendingModules: [],
    };
  }

  _normalizeStreamItem(
    response: GraphQLResponseWithData,
    parentID: string,
    field: NormalizationLinkedField,
    variables: Variables,
    path: ReadonlyArray<unknown>,
    normalizationPath: ReadonlyArray<string>,
  ): {
    fieldPayloads: Array<HandleFieldPayload>,
    itemID: string,
    itemIndex: number,
    prevIDs: Array<?string>,
    relayPayload: RelayResponsePayload,
    storageKey: string,
  } {
    const {data} = response;
    if (typeof data !== 'object') {
      throw err(
        'NormalizationEngine: Expected the GraphQL @stream payload `data` ' +
          'value to be an object.',
      );
    }
    const responseKey = field.alias ?? field.name;
    const storageKey = getStorageKey(field, variables);

    const parentEntry = this._parentRecords.get(parentID);
    if (parentEntry == null) {
      throw err(
        'NormalizationEngine: Expected the parent record `' +
          parentID +
          '` for @stream data to exist.',
      );
    }
    const {fieldPayloads, record: parentRecord} = parentEntry;

    const prevIDs = RelayModernRecord.getLinkedRecordIDs(
      parentRecord,
      storageKey,
    );
    if (prevIDs == null) {
      throw err(
        'NormalizationEngine: Expected record `' +
          parentID +
          '` to have fetched field `' +
          field.name +
          '` with @stream.',
      );
    }

    const finalPathEntry = path[path.length - 1];
    const itemIndex = parseInt(finalPathEntry, 10);
    if (itemIndex !== finalPathEntry || itemIndex < 0) {
      throw err(
        'NormalizationEngine: Expected path for @stream to end in a ' +
          'positive integer index, got `' +
          String(finalPathEntry) +
          '`',
      );
    }

    const typeName = field.concreteType ?? (data as $FlowFixMe).__typename;
    if (typeof typeName !== 'string') {
      throw err(
        'NormalizationEngine: Expected @stream field `' +
          field.name +
          '` to have a __typename.',
      );
    }

    const getDataID = this._options.getDataID;
    const itemID =
      (typeof getDataID === 'function'
        ? getDataID(data as $FlowFixMe, typeName)
        : null) ??
      prevIDs?.[itemIndex] ??
      generateClientID(parentID, storageKey, itemIndex);
    if (typeof itemID !== 'string') {
      throw err(
        'NormalizationEngine: Expected id of elements of field `' +
          storageKey +
          '` to be strings.',
      );
    }

    const selector = createNormalizationSelector(field, itemID, variables);

    const nextParentRecord = RelayModernRecord.clone(parentRecord);
    const nextIDs = [...prevIDs];
    nextIDs[itemIndex] = itemID;
    RelayModernRecord.setLinkedRecordIDs(nextParentRecord, storageKey, nextIDs);
    this._parentRecords.set(parentID, {
      fieldPayloads,
      record: nextParentRecord,
    });

    const relayPayload = this._normalizeResponse(
      response,
      selector,
      typeName,
      {
        ...this._options,
        path: [...normalizationPath, responseKey, String(itemIndex)],
      },
      this._useExecTimeResolvers,
    );

    return {
      fieldPayloads,
      itemID,
      itemIndex,
      prevIDs,
      relayPayload,
      storageKey,
    };
  }

  // ---------------------------------------------------------------------------
  // Private: placeholder registration
  // ---------------------------------------------------------------------------

  _registerPlaceholders(
    placeholders: ReadonlyArray<IncrementalDataPlaceholder>,
    source: MutableRecordSource,
    fieldPayloads: ?ReadonlyArray<HandleFieldPayload>,
    outPayloads: Array<RelayResponsePayload>,
    outPendingModules: Array<Promise<NormalizationResult>>,
  ): void {
    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i];
      const {label, path} = placeholder;
      const pathKey = path.map(String).join('.');
      const key = makeKey(label, pathKey);
      this._placeholders.set(key, placeholder);

      // Cache parent record for @stream concurrent modification detection
      // and for @defer handle field replay
      let parentID: string;
      if (placeholder.kind === 'stream') {
        parentID = placeholder.parentID;
      } else {
        parentID = placeholder.selector.dataID;
      }

      const parentRecord = source.get(parentID);
      if (parentRecord == null) {
        throw err(
          'NormalizationEngine: Expected record `' + parentID + '` to exist.',
        );
      }

      const parentPayloads = (fieldPayloads ?? []).filter(
        (fieldPayload: HandleFieldPayload) => {
          const fieldID = generateClientID(
            fieldPayload.dataID,
            fieldPayload.fieldKey,
          );
          return fieldPayload.dataID === parentID || fieldID === parentID;
        },
      );

      const previousEntry = this._parentRecords.get(parentID);
      if (previousEntry != null) {
        const nextRecord = RelayModernRecord.update(
          previousEntry.record,
          parentRecord,
        );
        const handlePayloads = new Map<string, HandleFieldPayload>();
        // TODO(skyyao): use cheaper structural key (dataID + fieldKey + handleKey)
        // to skip serializing args/handleArgs; apply the same optimization to
        // OperationExecutor.js:1317.
        for (let j = 0; j < previousEntry.fieldPayloads.length; j++) {
          const p = previousEntry.fieldPayloads[j];
          handlePayloads.set(stableStringify(p), p);
        }
        for (let j = 0; j < parentPayloads.length; j++) {
          const p = parentPayloads[j];
          handlePayloads.set(stableStringify(p), p);
        }
        this._parentRecords.set(parentID, {
          fieldPayloads: Array.from(handlePayloads.values()),
          record: nextRecord,
        });
      } else {
        this._parentRecords.set(parentID, {
          fieldPayloads: parentPayloads,
          record: parentRecord,
        });
      }

      // Flush any buffered responses that arrived before this placeholder
      const buffered = this._bufferedResponses.get(key);
      if (buffered != null) {
        this._bufferedResponses.delete(key);
        for (let j = 0; j < buffered.length; j++) {
          const resp = buffered[j];
          let result: ?NormalizationResult;
          if (placeholder.kind === 'defer') {
            result = this._processDefer(resp, resp.path ?? [], placeholder);
          } else {
            result = this._processStream(resp, resp.path ?? [], placeholder);
          }
          if (result != null) {
            outPayloads.push(...result.payloads);
            outPendingModules.push(...result.pendingModules);
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private: @module followup handling
  // ---------------------------------------------------------------------------

  _processFollowups(
    followups: ReadonlyArray<FollowupPayload>,
    outPayloads: Array<RelayResponsePayload>,
    outPendingModules: Array<Promise<NormalizationResult>>,
  ): void {
    for (let i = 0; i < followups.length; i++) {
      const followup = followups[i];
      if (followup.kind === 'ModuleImportPayload') {
        this._processModuleImport(followup, outPayloads, outPendingModules);
      }
    }
  }

  _processModuleImport(
    followup: ModuleImportPayload,
    outPayloads: Array<RelayResponsePayload>,
    outPendingModules: Array<Promise<NormalizationResult>>,
  ): void {
    const operationLoader = this._operationLoader;
    if (operationLoader == null) {
      return;
    }

    // Try sync first
    const node: ?NormalizationRootNode = operationLoader.get(
      followup.operationReference,
    );
    if (node != null) {
      const result = this._normalizeFollowup(followup, node);
      outPayloads.push(...result.payloads);
      outPendingModules.push(...result.pendingModules);
      return;
    }

    // Async: return a Promise that resolves to the full NormalizationResult,
    // preserving any nested payloads and further pending modules produced by
    // the followup. The caller drains pendingModules recursively (see
    // ReactiveQueryExecutionNode_EXPERIMENTAL.executeWithNetwork) — this
    // mirrors OperationExecutor's recursive `_processPayloadFollowups`.
    const emptyResult: NormalizationResult = {
      payloads: [],
      pendingModules: [],
    };
    outPendingModules.push(
      operationLoader
        .load(followup.operationReference)
        .then((loadedNode: ?NormalizationRootNode) =>
          loadedNode != null
            ? this._normalizeFollowup(followup, loadedNode)
            : emptyResult,
        )
        // TODO(skyyao): surface async @module load errors instead of silently
        // swallowing — OperationExecutor terminates execution via sink.error().
        .catch((_error: unknown) => emptyResult),
    );
  }

  _normalizeFollowup(
    followup: ModuleImportPayload,
    node: NormalizationRootNode,
  ): NormalizationResult {
    const operationNode =
      node.kind === 'SplitOperation' ? node : node.operation;
    // TODO(skyyao): for SplitOperation followups, bind variables via
    // getLocalVariables(followup.variables, operationNode.argumentDefinitions,
    // followup.args) like OperationExecutor._normalizeFollowupPayload — current
    // pass-through breaks @module argument binding.
    // TODO(skyyao): propagate is_final extension on the synthetic response when
    // in loading_final state, to enable nested defer/3D processing on
    // non-streaming server mode (see OperationExecutor.js:864-870).
    const selector = createNormalizationSelector(
      operationNode,
      followup.dataID,
      followup.variables,
    );

    const payload = this._normalizeResponse(
      {data: followup.data} as $FlowFixMe,
      selector,
      followup.typeName,
      {
        ...this._options,
        path: followup.path,
      },
      this._useExecTimeResolvers,
    );

    const extraPayloads: Array<RelayResponsePayload> = [];
    const pendingModules: Array<Promise<NormalizationResult>> = [];

    // Register nested placeholders
    if (
      payload.incrementalPlaceholders != null &&
      payload.incrementalPlaceholders.length > 0
    ) {
      this._registerPlaceholders(
        payload.incrementalPlaceholders,
        payload.source,
        payload.fieldPayloads,
        extraPayloads,
        pendingModules,
      );
    }

    // Process nested followups
    if (
      payload.followupPayloads != null &&
      payload.followupPayloads.length > 0
    ) {
      this._processFollowups(
        payload.followupPayloads,
        extraPayloads,
        pendingModules,
      );
    }

    const primaryPayload: RelayResponsePayload = {
      ...payload,
      followupPayloads: null,
      incrementalPlaceholders: null,
      isFinal: this._computeIsFinal(payload.isFinal),
      isPreNormalized: true,
    };

    return {
      payloads: [primaryPayload, ...extraPayloads],
      pendingModules,
    };
  }

  // ---------------------------------------------------------------------------
  // Private: completion tracking
  // ---------------------------------------------------------------------------

  _computeIsFinal(serverIsFinal: boolean): boolean {
    return (
      (serverIsFinal || this._serverComplete) &&
      this._bufferedResponses.size === 0
    );
  }
}

/**
 * Build a unique key for matching incremental responses to placeholders.
 */
function makeKey(label: string, pathKey: string): string {
  return `${label}::${pathKey}`;
}

module.exports = NormalizationEngine;
