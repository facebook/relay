/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLStoreDataHandler
 * @flow
 * @typechecks
 */

'use strict';

var METADATA_KEYS = {
  __dataID__: true,
  __range__: true,
  __resolvedFragmentMap__: true,
  __resolvedFragmentMapGeneration__: true,
  __status__: true,
};

/**
 * Utility functions for working with data stored in GraphQLStore.
 *
 * @internal
 */
var GraphQLStoreDataHandler = {
  /**
   * Returns the id that can be used to reference the given node in
   * the store.
   */
  getID: function(node: Object): ?string {
    return node.__dataID__;
  },

  /**
   * Returns a pointer object containing a `__dataID__` property for the node
   * corresponding to the given id.
   */
  createPointerWithID: function(dataID: string): {__dataID__: string} {
    return {__dataID__: dataID};
  },

 /**
  * Checks whether the given ID was created on the client, as opposed to an ID
  * that's understood by the server as well.
  */
  isClientID: function(dataID: string): boolean {
    return dataID.substring(0, 7) === 'client:';
  },

  /**
   * Checks whether the given key is a valid metadata key.
   */
  isMetadataKey: function(key: string): boolean {
    return METADATA_KEYS[key] || false;
  },
};

module.exports = GraphQLStoreDataHandler;
