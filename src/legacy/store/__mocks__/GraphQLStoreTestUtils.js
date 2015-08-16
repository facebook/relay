/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var matchRecord = require.requireActual('matchRecord');

var GraphQLStoreTestUtils = {
  matchers: {
    /**
     * Compare the returned result from the GraphQLStore with the expected
     * result object. Result can have extra clientIDs appended to nodes, without
     * ones. This function compares if they are equal, while ignoring the
     * clientIDs.
     */
    toMatchResult: function(expected) {
      var result = matchRecord(this.actual, expected, []);
      if (!result.isMatched) {
        this.message = () => {
          return 'Expected ' + result.path.join('.') + ' to ' + result.message;
        };
      }
      return result.isMatched;
    },
    /**
     * Checks that two query fragments match.
     */
    toMatchQueryFragment: function(expected) {
      /* jslint loopfunc:true */
      var GraphQL = require('GraphQL');

      var actual = this.actual;

      if (!(GraphQL.isFragment(actual))) {
        this.message = () => 'Not a QueryFragment';
        return false;
      }

      if (actual.type() !== expected.type()) {
        this.message = () => 'Expected type "' +
          expected.type() + '", got "' + actual.type() + '"';
        return false;
      }

      var actualFields = actual.getOwnFields().reduce((map, field) => {
        map[field.getGeneratedAlias()] = field;
        return map;
      }, {});
      var expectedFields = expected.getOwnFields().reduce((map, field) => {
        map[field.getGeneratedAlias()] = field;
        return map;
      }, {});

      for (var fieldName in expectedFields) {
        if (!(fieldName in actualFields)) {
          this.message = () => 'Expected a "' + fieldName + '" field';
          return false;
        }

        // TODO: Recurse and check that each field has the same fragments, etc.
        var actualFieldStr = actualFields[fieldName].toString();
        var expectedFieldStr = expectedFields[fieldName].toString();
        if (actualFieldStr !== expectedFieldStr) {
          this.message = () => 'Expected "' + fieldName +
            '" field to equal "' + expectedFieldStr + '", got "' +
            actualFieldStr + '"';
          return false;
        }
      }

      for (var actualFieldName in actualFields) {
        if (!(actualFieldName in expectedFields)) {
          this.message = () => 'Unexpected field "' + actualFieldName + '"';
          return false;
        }
      }

      var actualFragments = actual.getFragments();
      var expectedFragments = expected.getFragments();

      if (actualFragments.length !== expectedFragments.length) {
        this.message = () => 'Expected ' + expectedFragments.length +
          ' fragments, got ' + actualFragments.length;
        return false;
      }

      for (var ii = 0; ii < actualFragments.length; ii++) {
        var context = {
          actual: actualFragments[ii]
        };
        var matches = GraphQLStoreTestUtils.matchers.toMatchQueryFragment.call(
          context,
          expectedFragments[ii]
        );
        if (!matches) {
          this.message = () => 'Expected fragment matching "' +
            expectedFragments[ii].toString() + '", got "' +
            actualFragments[ii].toString() + '"; ' + context.message();
          return false;
        }
      }

      return true;
    },
  },
  /**
   * @param {GraphQLNode} node
   * @param {function} callback
   * @return {GraphQLNode}
   */
  filterFields: function(node, callback) {
    return node.shallowClone(
      node.getOwnFields()
        .map(field => GraphQLStoreTestUtils.filterFields(field, callback))
        .filter(callback),
      node.getFragments().filter(
        fragment => GraphQLStoreTestUtils.filterFields(fragment, callback)
      )
    );
  },
  /**
   * @param {string} type For example: 'log', 'warn', 'error'
   * @return {function}
   */
  genMockConsoleFunction: function(type) {
    /* globals expect: false */
    var consoleFunction = console[type];
    var whitelistedStrings = [];
    var mockFunction = jest.genMockFunction().mockImplementation(
      function(...args) {
        var formatString = args[0];
        if (whitelistedStrings.indexOf(formatString) >= 0) {
          return;
        }
        consoleFunction.apply(console, args);
        // NOTE: This will fail the unit test (and help prevent log spew).
        expect(whitelistedStrings).toContain(formatString);
      }
    );
    // Unit tests should use this method to expect and silence console logs.
    mockFunction.mockWhitelistString = function(string) {
      whitelistedStrings.push(string);
    };
    mockFunction.originalFunction = consoleFunction;
    return mockFunction;
  },
  deepUnmockRQL: function() {
    jest
      .dontMock('GraphQL')
      .dontMock('GraphQLFragmentPointer');
  },
};

module.exports = GraphQLStoreTestUtils;
