/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const GraphQLStoreTestUtils = {
  /**
   * @param {object} node
   * @param {function} callback
   * @return {object}
   */
  filterFields: function(node, callback) {
    return node.shallowClone(
      node
        .getOwnFields()
        .map(field => GraphQLStoreTestUtils.filterFields(field, callback))
        .filter(callback),
      node
        .getFragments()
        .filter(fragment =>
          GraphQLStoreTestUtils.filterFields(fragment, callback),
        ),
    );
  },
  /**
   * @param {string} type For example: 'log', 'warn', 'error'
   * @return {function}
   */
  genMockConsoleFunction: function(type) {
    /* globals expect: false */
    // eslint-disable-next-line no-console
    const consoleFunction = console[type];
    const whitelistedStrings = [];
    const mockFunction = jest.fn(function(...args) {
      const formatString = args[0];
      if (whitelistedStrings.indexOf(formatString) >= 0) {
        return;
      }
      consoleFunction.apply(console, args);
      // NOTE: This will fail the unit test (and help prevent log spew).
      expect(whitelistedStrings).toContain(formatString);
    });
    // Unit tests should use this method to expect and silence console logs.
    mockFunction.mockWhitelistString = function(string) {
      whitelistedStrings.push(string);
    };
    mockFunction.originalFunction = consoleFunction;
    return mockFunction;
  },
  deepUnmockRQL: function() {
    jest.unmock('RelayFragmentPointer');
  },
};

module.exports = GraphQLStoreTestUtils;
