/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule validateRelayReadQuery
 * @flow
 * @typechecks
 */

'use strict';

import type RelayQuery from 'RelayQuery';
var RelayQueryVisitor = require('RelayQueryVisitor');
import type {StoreReaderOptions} from 'RelayTypes';

var emptyFunction = require('emptyFunction');

var SERIALIZATION_KEY = ('__serializationKey__': $FlowIssue); // task #7117200

type AliasMap = {
  __serializationKey__?: SerializationKey;
  [applicationName: string]: AliasMap;
};
type SerializationKey = string;

var validateRelayReadQuery = emptyFunction;

if (__DEV__) {
  // Wrap in an IIFE to avoid unwanted function hoisting.
  (function() {
    /**
     * @internal
     *
     * `validateRelayReadQuery` is a `__DEV__`-only validator that checks that a
     * query used to read data from `RelayStore` is well-formed. Validation
     * problems are reported via `console.error`.
     *
     * At the moment, "well-formed" means that the query does not contain
     * duplicate aliases.
     */
    validateRelayReadQuery = function validateRelayReadQuery(
      queryNode: RelayQuery.Node,
      options?: StoreReaderOptions
    ): void {
      var validator = new RelayStoreReadValidator(options);
      validator.visit(queryNode, {});
    };

    function assertUniqueAlias(
      field: RelayQuery.Field,
      aliasMap: AliasMap,
    ): void {
      var serializationKey = field.getSerializationKey();
      if (aliasMap[SERIALIZATION_KEY]) {
        if (aliasMap[SERIALIZATION_KEY] !== serializationKey) {
          console.error(
            '`%s` is used as an alias more than once. Please use unique ' +
            'aliases.',
            field.getApplicationName()
          );
        }
      } else {
        aliasMap[SERIALIZATION_KEY] = serializationKey;
      }
    }

    /**
     * Returns the nested AliasMap for `node`, initializing it to an empty map
     * if it does not already exist.
     */
    function getAliasMap(node: RelayQuery.Field, aliasMap: AliasMap): AliasMap {
      var applicationName = node.getApplicationName();
      if (!aliasMap[applicationName]) {
        aliasMap[applicationName] = {};
      }
      return aliasMap[applicationName];
    }

    class RelayStoreReadValidator extends RelayQueryVisitor<AliasMap> {
      _traverseFragmentReferences: boolean;

      constructor(
        options?: StoreReaderOptions
      ) {
        super();
        this._traverseFragmentReferences =
          (options && options.traverseFragmentReferences) || false;
      }

      visitField(node: RelayQuery.Field, aliasMap: AliasMap): ?RelayQuery.Node {
        aliasMap = getAliasMap(node, aliasMap);
        assertUniqueAlias(node, aliasMap);

        if (node.isGenerated()) {
          return;
        } else if (node.isScalar()) {
          return;
        } else if (node.isPlural()) {
          this._readPlural(node, aliasMap);
        } else {
          // No special handling needed for connections, edges, page_info etc.
          this._readLinkedField(node, aliasMap);
        }
      }

      visitFragment(
        node: RelayQuery.Fragment,
        aliasMap: AliasMap
      ): ?RelayQuery.Node {
        if (this._traverseFragmentReferences || !node.isContainerFragment()) {
          this.traverse(node, aliasMap);
        }
      }

      _readPlural(node: RelayQuery.Field, aliasMap: AliasMap): void {
        node.getChildren().forEach(child => this.visit(child, aliasMap));
      }

      _readLinkedField(node: RelayQuery.Field, aliasMap: AliasMap): void {
        aliasMap = getAliasMap(node, aliasMap);
        this.traverse(node, aliasMap);
      }
    }
  }());
}

module.exports = validateRelayReadQuery;
