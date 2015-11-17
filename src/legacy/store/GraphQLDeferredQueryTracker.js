/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLDeferredQueryTracker
 * @typechecks
 * @flow
 */

'use strict';

var ErrorUtils = require('ErrorUtils');
var Map = require('Map');
import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayRecordStore from 'RelayRecordStore';

var forEachObject = require('forEachObject');
var forEachRootCallArg = require('forEachRootCallArg');
var invariant = require('invariant');
var isEmpty = require('isEmpty');
var resolveImmediate = require('resolveImmediate');

type DeferredQuerySubscriber = {
  dataID: string;
  fragmentID: string;
  callbacks: ListenerCallbacks;
};

type DeferredQueryEvent = {
  dataID: string;
  fragmentID: string;
  error: ?Error;
};

type ListenerCallbacks = {
  onSuccess: (dataID: string, fragmentID: string) => void;
  onFailure: (dataID: string, fragmentID: string, error: Error) => void;
};

type Removable = {
  remove: () => void;
};

/**
 * This module tracks pending queries and maintains information about which
 * deferred data is pending or resolved. It also provides a method to observe
 * when a deferred query for a given node either resolves or fails.
 *
 * @internal
 */
class GraphQLDeferredQueryTracker {
  _recordStore: RelayRecordStore;

  /**
   * List of all subscriptions of form {callback, dataID, fragmentID}
   */
  _subscribers: Array<?DeferredQuerySubscriber>;

  /**
   * List of all deferred queries that have resolved/failed since the last
   * broadcast.
   */
  _broadcastItems: ?Array<DeferredQueryEvent>;

  /**
   * Map of pending dataID => Set<fragmentID>
   * Stores a set as object<string,string> of all pending deferred fragmentIDs
   * for a given dataID. Presence of dataID => fragmentID pair
   * means that the query is pending, absence that it has resolved.
   */
  _dataIDToFragmentNameMap: Map;

  /**
   * Map of pending rootCall => Set<fragmentID>
   * Stores a temporary mapping of fragmentIDs when the correct dataID is
   * unknown. Entries will get moved to dataIDToFragmentNameMap as the dataID
   * for the rootCall is determinble.
   */
  _rootCallToFragmentNameMap: Map;

  /**
   * Map of parent query ID => [child queries]
   */
  _parentToChildQueryMap: Map;

  constructor(recordStore: RelayRecordStore) {
    this.reset();
    this._recordStore = recordStore;
  }

  /**
   * Add a listener for when the given fragment resolves/fails for dataID.
   * Returns a subscription object {remove} where calling remove cancels the
   * subscription.
   */
  addListenerForFragment(
    dataID: string,
    fragmentID: string,
    callbacks: ListenerCallbacks
  ): Removable {
    var subscriber = {
      callbacks,
      dataID,
      fragmentID,
    };
    this._subscribers.push(subscriber);
    return {
      remove: () => {
        var index = this._subscribers.indexOf(subscriber);
        invariant(
          index >= 0,
          'remove() can only be called once'
        );
        this._subscribers[index] = null;
      }
    };
  }

  /**
   * Record the query as being sent, updating internal tracking to note
   * that the dataID/fragment pairs are pending.
   */
  recordQuery(
    query: RelayQuery.Root
  ): void {
    var parentID = getQueryParentID(query);
    if (parentID) {
      // child query: record parent => [children] list
      var children = this._parentToChildQueryMap.get(parentID) || [];
      children.push(query);
      this._parentToChildQueryMap.set(parentID, children);
    } else {
      var deferredFragmentNames = query.getDeferredFragmentNames();
      if (deferredFragmentNames) {
        // deferred query: record ID => fragment set
        var dataIDs = this._getRootCallToIDMap(query);
        forEachObject(dataIDs, (dataID, storageKey) => {
          if (dataID) {
            var dataIDSet = this._dataIDToFragmentNameMap.get(dataID) || {};
            Object.assign(dataIDSet, deferredFragmentNames); // set union
            this._dataIDToFragmentNameMap.set(dataID, dataIDSet);
          } else {
            var rootCallSet =
              this._rootCallToFragmentNameMap.get(storageKey) || {};
            Object.assign(rootCallSet, deferredFragmentNames);
            this._rootCallToFragmentNameMap.set(storageKey, rootCallSet);
          }
        });
      }
    }
  }

  /**
   * Record the query as being resolved with the given data, updating
   * internal tracking and firing subscriptions.
   */
  resolveQuery(
    query: RelayQuery.Root,
    response: ?Object,
    refParams: ?{[name: string]: mixed}
  ): void {
    var parentID = getQueryParentID(query);
    this._resolveFragmentsForRootCall(query);
    if (query.isDeferred()) {
      this._resolveDeferredQuery(query, (dataID, fragmentID) => {
        this._broadcastChangeForFragment(dataID, fragmentID);
      }, refParams);
      if (parentID) {
        this._resolveDeferredRefQuery(query);
      }
    } else if (response) {
      this._resolveDeferredParentQuery(query, response);
    }
  }

  /**
   * Record that the query has resolved with an error.
   */
  rejectQuery(
    query: RelayQuery.Root,
    error: Error
  ): void {
    var parentID = getQueryParentID(query);
    if (query.isDeferred()) {
      this._rejectDeferredFragmentsForRootCall(query);
      this._resolveDeferredQuery(query, (dataID, fragmentID) => {
        this._broadcastErrorForFragment(dataID, fragmentID, error);
      });
      if (parentID) {
        this._resolveDeferredRefQuery(query);
      }
    } else {
      this._rejectDeferredParentQuery(query);
    }
  }

  /**
   * Determine if the given query is pending by checking if it is fetching
   * the same dataID/fragments as any pending queries.
   */
  isQueryPending(
    dataID: DataID,
    fragmentID: string
  ): boolean {
    if (this._dataIDToFragmentNameMap.has(dataID)) {
      var dataIDSet = this._dataIDToFragmentNameMap.get(dataID);
      if (dataIDSet.hasOwnProperty(fragmentID)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear all query tracking and subscriptions.
   */
  reset(): void {
    this._dataIDToFragmentNameMap = new Map();
    this._parentToChildQueryMap = new Map();
    this._rootCallToFragmentNameMap = new Map();
    this._subscribers = [];
    this._broadcastItems = null;
  }

  /**
   * Clears all pending dataID => fragmentID associations for this query
   * and calls the callback for each (dataID, fragmentID) pair.
   */
  _resolveDeferredQuery(
    query: RelayQuery.Root,
    callback: (dataID: DataID, fragmentID: string) => void,
    refParams: ?{[name: string]: mixed}
  ): void {
    var deferredFragmentNames = query.getDeferredFragmentNames();
    if (!deferredFragmentNames) {
      return;
    }
    var dataIDs = {};
    var batchCall = query.getBatchCall();
    if (batchCall) {
      // refParams can be undefined if the node is null in the parent query.
      var refIDs = refParams && refParams[batchCall.refParamName];
      if (refIDs != null) {
        refIDs = Array.isArray(refIDs) ? refIDs : [refIDs];
        (refIDs: any).forEach(id => dataIDs[id] = id);
      }
    } else {
      dataIDs = this._getRootCallToIDMap(query);
    }
    forEachObject(dataIDs, dataID => {
      if (dataID && this._dataIDToFragmentNameMap.has(dataID)) {
        var dataIDSet = this._dataIDToFragmentNameMap.get(dataID);
        forEachObject(deferredFragmentNames, fragmentID => {
          delete dataIDSet[fragmentID];
          callback(dataID, fragmentID);
        });
        if (!isEmpty(dataIDSet)) {
          this._dataIDToFragmentNameMap.set(dataID, dataIDSet);
        } else {
          this._dataIDToFragmentNameMap.delete(dataID);
        }
      }
    });
  }

  /**
   * Clears the deferred query from its parent's list of dependent queries.
   */
  _resolveDeferredRefQuery(
    query: RelayQuery.Root
  ): void {
    var parentID = getQueryParentID(query);
    var children = this._parentToChildQueryMap.get(parentID) || [];
    children = children.filter(q => q !== query);
    if (children.length) {
      this._parentToChildQueryMap.set(parentID, children);
    } else {
      this._parentToChildQueryMap.delete(parentID);
    }
  }

  /**
   * Resolves the root IDs for any dependent queries of the given query.
   */
  _resolveDeferredParentQuery(
    query: RelayQuery.Root,
    response: any
  ): void {
    // resolve IDs in child queries, add to ID => fragment set
    var children = this._parentToChildQueryMap.get(query.getID()) || [];
    for (var ii = 0; ii < children.length; ii++) {
      var childQuery = children[ii];
      var childFragmentNames = childQuery.getDeferredFragmentNames();
      var childDataIDs = getRefParamFromResponse(response, childQuery);
      forEachObject(childDataIDs, dataID => {
        var dataIDSet = this._dataIDToFragmentNameMap.get(dataID) || {};
        Object.assign(dataIDSet, childFragmentNames);
        this._dataIDToFragmentNameMap.set(dataID, dataIDSet);
      });
    }
  }

  /**
   * Maps the deferred fragments for a root call with a previously unknown ID to
   * the resolved ID value.
   */
  _resolveFragmentsForRootCall(
    query: RelayQuery.Root
  ): void {
    var rootCallMap = this._getRootCallToIDMap(query);
    forEachObject(rootCallMap, (dataID, storageKey) => {
      if (dataID && this._rootCallToFragmentNameMap.has(storageKey)) {
        var rootCallSet = this._rootCallToFragmentNameMap.get(storageKey) || {};
        var dataIDSet = this._dataIDToFragmentNameMap.get(dataID) || {};
        Object.assign(dataIDSet, rootCallSet);
        this._dataIDToFragmentNameMap.set(dataID, dataIDSet);
        this._rootCallToFragmentNameMap.delete(storageKey);
      }
    });
  }

  /**
   * Removes the deferred fragments for a previously unresolved root call ID.
   */
  _rejectDeferredFragmentsForRootCall(
    query: RelayQuery.Root
  ): void {
    var rootCallMap = this._getRootCallToIDMap(query);
    var deferredFragmentNames = query.getDeferredFragmentNames();
    forEachObject(rootCallMap, (dataID, storageKey) => {
      if (this._rootCallToFragmentNameMap.has(storageKey)) {
        var rootCallSet = this._rootCallToFragmentNameMap.get(storageKey) || {};
        forEachObject(deferredFragmentNames, (fragmentID) => {
          delete rootCallSet[fragmentID];
        });
        if (!isEmpty(rootCallSet)) {
          this._rootCallToFragmentNameMap.delete(storageKey);
        } else {
          this._rootCallToFragmentNameMap.set(storageKey, rootCallSet);
        }
      }
    });
  }

  /**
   * Rejects the parent ID, clearing all tracking for both the parent and all
   * its dependent deferred ref queries.
   */
  _rejectDeferredParentQuery(
    query: RelayQuery.Root
  ): void {
    var parentID = query.getID();
    this._parentToChildQueryMap.delete(parentID);
  }

  /**
   * Notify observers that the given deferred fragment has resolved for node
   * with dataID.
   */
  _broadcastChangeForFragment(
    dataID: DataID,
    fragmentID: string
  ): void {
    var broadcastItems = this._broadcastItems;
    if (!broadcastItems) {
      this._broadcastItems = broadcastItems = [];
      resolveImmediate(() => this._processBroadcasts());
    }
    broadcastItems.push({dataID, fragmentID, error: null});
  }

  /**
   * Record that an error occurred for this dataID, fragment pair
   * and broadcast an update.
   */
  _broadcastErrorForFragment(
    dataID: DataID,
    fragmentID: string,
    error: any
  ): void {
    var broadcastItems = this._broadcastItems;
    if (!broadcastItems) {
      this._broadcastItems = broadcastItems = [];
      resolveImmediate(() => this._processBroadcasts());
    }
    broadcastItems.push({dataID, fragmentID, error});
  }

  /**
   * Process broadcast items from previous event loop.
   */
  _processBroadcasts() {
    if (!this._broadcastItems) {
      return;
    }

    for (var ii = 0; ii < this._subscribers.length; ii++) {
      for (var jj = 0; jj < this._broadcastItems.length; jj++) {
        var subscriber = this._subscribers[ii];
        if (subscriber) {
          var {
            dataID,
            error,
            fragmentID,
          } = this._broadcastItems[jj];
          var method;
          var args;
          if (error) {
            method = subscriber.callbacks.onFailure;
            args = [dataID, fragmentID, error];
          } else {
            method = subscriber.callbacks.onSuccess;
            args = [dataID, fragmentID];
          }
          ErrorUtils.applyWithGuard(
            method,
            null,
            args,
            null,
            'GraphQLDeferredQueryTracker'
          );
        }
      }
    }

    this._subscribers =
      this._subscribers.filter(subscriber => subscriber !== null);
    this._broadcastItems = null;
  }

  _getRootCallToIDMap(
    query: RelayQuery.Root
  ): {[key: string]: string} {
    var mapping = {};
    if (!query.getBatchCall()) {
      const storageKey = query.getStorageKey();
      forEachRootCallArg(query, identifyingArgValue => {
        const compositeStorageKey = identifyingArgValue == null ?
          storageKey :
          `${storageKey}:${identifyingArgValue}`;
        mapping[compositeStorageKey] =
          this._recordStore.getDataID(storageKey, identifyingArgValue);
      });
    }
    return mapping;
  }
}

/**
 * Helper to extract the JSONPath value(s) of a query from a response.
 */
function getRefParamFromResponse(
  response: any,
  query: RelayQuery.Root
): {[key: string]: mixed} {
  var batchCall = query.getBatchCall();
  var refTarget = batchCall ? batchCall.sourceQueryPath : null;
  if (!refTarget) {
    return {};
  }
  var values = {};
  var tokens = refTarget.split('.');

  getRefParamFromNode(values, response, tokens, 1); // skip root '$' marker
  return values;
}

/**
 * Recursive helper to extract the ref parameter (represented as tokens)
 * into the values object.
 */
function getRefParamFromNode(
  values: {[key: string]: mixed},
  node: any,
  tokens: Array<string>,
  index: number
): void {
  if (index === tokens.length && typeof node === 'string') {
    // base case
    values[node] = node;
    return;
  } else if (
    // mismatched path/response
    index >= tokens.length ||
    !node ||
    typeof node !== 'object' ||
    Array.isArray(node)
  ) {
    return;
  }
  var token = tokens[index];
  if (token === '*') {
    forEachObject(node, subNode => {
      getRefParamFromNode(values, subNode, tokens, index + 1);
    });
  } else if (node.hasOwnProperty(token)) {
    getRefParamFromNode(values, node[token], tokens, index + 1);
  }
}

/**
 * Helper to get a query's sourceQueryID
 */
function getQueryParentID(
  query: RelayQuery.Root
): ?string {
  var batchCall = query.getBatchCall();
  if (batchCall) {
    return batchCall.sourceQueryID;
  }
  return null;
}

module.exports = GraphQLDeferredQueryTracker;
