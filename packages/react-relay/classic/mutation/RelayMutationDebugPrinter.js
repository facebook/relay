/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationDebugPrinter
 * @flow
 * @format
 */

'use strict';
const printRelayQuery = require('printRelayQuery');

import type RelayQuery from 'RelayQuery';

/**
 * @internal
 *
 * Helper functions to print mutation queries for debugging purposes.
 */
const RelayMutationDebugPrinter = {
  printOptimisticMutation(query: ?RelayQuery.Node, response: ?Object): void {
    /* eslint-disable no-console */
    if (!console.groupCollapsed || !console.groupEnd) {
      return;
    }
    RelayMutationDebugPrinter.printMutation(query, 'Optimistic');

    console.groupCollapsed('Optimistic Response');
    console.log(response);
    console.groupEnd();
    /* eslint-enable no-console */
  },

  printMutation(query: ?RelayQuery.Node, name?: string): void {
    /* eslint-disable no-console */
    if (!console.groupCollapsed || !console.groupEnd) {
      return;
    }
    const printedQuery = query ? printRelayQuery(query) : null;
    name = name || 'Mutation';

    console.groupCollapsed(name + ' Variables');
    console.log(printedQuery ? printedQuery.variables : {});
    console.groupEnd();

    console.groupCollapsed(name + ' Query');
    console.log(printedQuery ? printedQuery.text : '');
    console.groupEnd();
    /* eslint-enable no-console */
  },
};

module.exports = RelayMutationDebugPrinter;
