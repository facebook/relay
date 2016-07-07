/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule validateRelayReadQuery
 * @flow
 */

'use strict';

import type RelayQuery from 'RelayQuery';
const RelayQueryVisitor = require('RelayQueryVisitor');
import type {StoreReaderOptions} from 'RelayTypes';

const emptyFunction = require('emptyFunction');

type AliasMap = {
  children: {[applicationName: string]: AliasMap},
  hash: ?string,
};

let validateRelayReadQuery = emptyFunction;

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
    validateRelayReadQuery = function _validateRelayReadQuery(
      queryNode: RelayQuery.Node,
      options?: StoreReaderOptions
    ): void {
      const validator = new RelayStoreReadValidator(options);
      validator.visit(queryNode, {
        children: {},
        hash: null,
      });
    };

    /**
     * Returns the nested AliasMap for `node`, initializing if it necessary.
     */
    function getAliasMap(
      node: RelayQuery.Field,
      parentAliasMap: AliasMap
    ): AliasMap {
      const applicationName = node.getApplicationName();
      const hash = node.getShallowHash();
      const {children} = parentAliasMap;
      if (!children.hasOwnProperty(applicationName)) {
        children[applicationName] = {
          children: {},
          hash,
        };
      } else if (children[applicationName].hash !== hash) {
        console.error(
          '`%s` is used as an alias more than once. Please use unique aliases.',
          applicationName
        );
      }
      return children[applicationName];
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

      visitField(
        node: RelayQuery.Field,
        parentAliasMap: AliasMap
      ): void {
        const aliasMap = getAliasMap(node, parentAliasMap);

        if (node.isGenerated()) {
          return;
        } else if (!node.canHaveSubselections()) {
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
      ): void {
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
