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
  NormalizationSelectableNode,
  NormalizationSelection,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  DeferPlaceholder,
  NormalizationSelector,
  Record,
  RecordSource,
} from './RelayStoreTypes';

import RelayModernRecord from './RelayModernRecord';
import {createNormalizationSelector} from './RelayModernSelector';
import {getStorageKey} from './RelayStoreUtils';

export type RecoveredDeferPayload = {
  readonly selector: NormalizationSelector,
  readonly typeName: string,
  readonly response: GraphQLResponseWithData,
  readonly existingRootRecord: ?Record,
};

/**
 * Recover the effective selector + response for a deferred chunk that
 * landed at a `subPath` beyond its placeholder's registration path.
 * Returns null when the addressed location can't be resolved in the store.
 */
function resolveDeferSubPathChunk(
  placeholder: DeferPlaceholder,
  response: GraphQLResponseWithData,
  subPath: ReadonlyArray<unknown>,
  storeSource: RecordSource,
): ?RecoveredDeferPayload {
  return subPath.some(key => typeof key === 'number')
    ? recoverAtChildRecord(placeholder, response, subPath, storeSource)
    : recoverAtParentRecord(placeholder, response, subPath, storeSource);
}

function recoverAtParentRecord(
  placeholder: DeferPlaceholder,
  response: GraphQLResponseWithData,
  subPath: ReadonlyArray<unknown>,
  storeSource: RecordSource,
): RecoveredDeferPayload {
  // Inject each hop's store id into its wrapper level. The server dedupes
  // already-delivered fields, so the chunk carries no `id` — normalizing it
  // re-derives record identity from the partial payload via getDataID, and
  // defaultGetDataID's Viewer special case then answers the constant
  // `client:root:viewer` even when the store's link is a real-id viewer,
  // repointing the link at a record the chunk's fields get stranded on.
  // Supplying the id the store already holds keeps identity stable.
  const hopIDs = resolveSubPathRecordIDs(
    placeholder.selector.node,
    subPath,
    storeSource,
    placeholder.selector.dataID,
    placeholder.selector.variables,
  );
  return {
    selector: placeholder.selector,
    typeName: placeholder.typeName,
    response: {
      ...response,
      data: wrapUnderSubPath(subPath, response.data, hopIDs),
    },
    existingRootRecord: storeSource.get(placeholder.selector.dataID),
  };
}

function recoverAtChildRecord(
  placeholder: DeferPlaceholder,
  response: GraphQLResponseWithData,
  subPath: ReadonlyArray<unknown>,
  storeSource: RecordSource,
): ?RecoveredDeferPayload {
  const walk = walkSubPathToLinkedField(
    placeholder.selector.node,
    subPath,
    storeSource,
    placeholder.selector.dataID,
    placeholder.selector.variables,
  );
  if (walk == null) return null;
  const {dataID, field} = walk;
  const {concreteType} = field;
  if (concreteType == null) return null;
  return {
    selector: createNormalizationSelector(
      field,
      dataID,
      placeholder.selector.variables,
    ),
    typeName: concreteType,
    response,
    existingRootRecord: storeSource.get(dataID),
  };
}

/**
 * Fold string subPath keys back into `data`:
 * `wrapUnderSubPath(['address'], {city}) → {address: {city}}`.
 * When `hopIDs` is given, the record object at each level gets its store id
 * injected (see recoverAtParentRecord).
 */
function wrapUnderSubPath(
  subPath: ReadonlyArray<unknown>,
  data: unknown,
  hopIDs: ReadonlyArray<DataID>,
): {[string]: unknown} {
  let wrapped: unknown = data;
  for (let i = subPath.length - 1; i >= 0; i--) {
    wrapped = withInjectedRecordID(
      wrapped,
      i < hopIDs.length ? hopIDs[i] : null,
    );
    wrapped = {[String(subPath[i])]: wrapped};
  }
  // The loop always ends on a wrapping step, so the result is an object.
  return wrapped as $FlowFixMe;
}

/**
 * Return `data` with `id` set to the record's store id — only when the store
 * id is a real server id (never fabricate a `client:` id as a server field),
 * `data` is a record object, and the chunk did not already supply an id.
 */
function withInjectedRecordID(data: unknown, dataID: ?DataID): unknown {
  if (
    dataID == null ||
    dataID.startsWith('client:') ||
    data == null ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    (data as $FlowFixMe).id != null
  ) {
    return data;
  }
  return {...data, id: dataID};
}

/**
 * Resolve the store dataID of each hop along a string-only subPath. Entry i
 * is the record reached after following subPath[0..i]. Resolution is greedy:
 * it stops at the first unresolvable hop — a missing LinkedField in the AST
 * or a link the store has not written yet — and returns the ids gathered so
 * far. A link the store does not hold has no identity to protect, so
 * normalization is free to derive one for it.
 */
function resolveSubPathRecordIDs(
  node: NormalizationSelectableNode,
  subPath: ReadonlyArray<unknown>,
  storeSource: RecordSource,
  rootDataID: DataID,
  variables: Variables,
): ReadonlyArray<DataID> {
  let currentSelections = node.selections;
  let currentDataID = rootDataID;
  const ids: Array<DataID> = [];
  for (let i = 0; i < subPath.length; i++) {
    const key = subPath[i];
    if (typeof key !== 'string') {
      break;
    }
    const field = findLinkedField(currentSelections, key);
    if (field == null || field.plural === true) {
      break;
    }
    const record = storeSource.get(currentDataID);
    if (record == null) {
      break;
    }
    const linked = RelayModernRecord.getLinkedRecordID(
      record,
      getStorageKey(field, variables),
    );
    if (linked == null) {
      break;
    }
    currentDataID = linked;
    currentSelections = field.selections;
    ids.push(currentDataID);
  }
  return ids;
}

type WalkState = {
  readonly field: ?NormalizationLinkedField,
  readonly selections: ReadonlyArray<NormalizationSelection>,
  readonly dataID: DataID,
  readonly pendingIDs: ?ReadonlyArray<?DataID>,
};

/**
 * Walk the fragment's normalization AST alongside the store, following each
 * `subPath` key (string = LinkedField name, number = index into the previous
 * plural link), to find the target LinkedField and its item dataID.
 */
function walkSubPathToLinkedField(
  node: NormalizationSelectableNode,
  subPath: ReadonlyArray<unknown>,
  storeSource: RecordSource,
  rootDataID: DataID,
  variables: Variables,
): ?{dataID: DataID, field: NormalizationLinkedField} {
  let state: WalkState = {
    field: null,
    selections: node.selections,
    dataID: rootDataID,
    pendingIDs: null,
  };
  for (const key of subPath) {
    const next =
      typeof key === 'string'
        ? stepIntoField(state, key, storeSource, variables)
        : typeof key === 'number'
          ? stepIntoIndex(state, key)
          : null;
    if (next == null) return null;
    state = next;
  }
  return state.field != null
    ? {dataID: state.dataID, field: state.field}
    : null;
}

function stepIntoField(
  state: WalkState,
  name: string,
  storeSource: RecordSource,
  variables: Variables,
): ?WalkState {
  const field = findLinkedField(state.selections, name);
  if (field == null) return null;
  const record = storeSource.get(state.dataID);
  if (record == null) return null;
  const storageKey = getStorageKey(field, variables);
  if (field.plural === true) {
    const pendingIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);
    if (pendingIDs == null) return null;
    return {
      field,
      selections: field.selections,
      dataID: state.dataID,
      pendingIDs,
    };
  }
  const linked = RelayModernRecord.getLinkedRecordID(record, storageKey);
  if (linked == null) return null;
  return {
    field,
    selections: field.selections,
    dataID: linked,
    pendingIDs: null,
  };
}

function stepIntoIndex(state: WalkState, index: number): ?WalkState {
  if (state.pendingIDs == null) return null;
  const itemID = state.pendingIDs[index];
  if (itemID == null) return null;
  return {...state, dataID: itemID, pendingIDs: null};
}

function findLinkedField(
  selections: ReadonlyArray<NormalizationSelection>,
  responseKey: string,
): ?NormalizationLinkedField {
  for (const selection of selections) {
    if (
      selection.kind === 'LinkedField' &&
      (selection.alias ?? selection.name) === responseKey
    ) {
      return selection;
    }
  }
  return null;
}

module.exports = resolveDeferSubPathChunk;
