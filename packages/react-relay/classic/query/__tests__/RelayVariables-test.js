/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {getFragmentVariables, getOperationVariables} = require('RelayVariables');

describe('RelayConcreteVariables', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('getFragmentVariables()', () => {
    /**
     * defs: size: Int
     * root vars: n/a
     * arg vars: {size: 42}
     * => size: 42
     */
    it('sets variables to literal argument values', () => {
      const fragment = {
        kind: 'FragmentDefinition',
        argumentDefinitions: [
          {
            kind: 'LocalArgument',
            name: 'size',
            defaultValue: null,
          },
        ],
        node: {name: 'Fragment'},
      };
      const variables = getFragmentVariables(fragment, {}, {size: 42});
      expect(variables).toEqual({
        size: 42,
      });
    });

    /**
     * defs: size: Int = 42
     * root vars: n/a
     * arg vars: n/a
     * => size: 42
     */
    it('sets variables to default values if defined and no argument', () => {
      const fragment = {
        kind: 'FragmentDefinition',
        argumentDefinitions: [
          {
            kind: 'LocalArgument',
            name: 'size',
            defaultValue: 42,
          },
        ],
        node: {name: 'Fragment'},
      };
      const variables = getFragmentVariables(fragment, {}, {});
      expect(variables).toEqual({
        size: 42,
      });
    });

    /**
     * defs: size: Int = import 'rootSize'
     * root vars: rootSize: 42
     * arg vars: n/a
     * => size: 42
     */
    it('resolves imported values from root variables', () => {
      const fragment = {
        kind: 'FragmentDefinition',
        argumentDefinitions: [
          {
            kind: 'RootArgument',
            name: 'size',
          },
        ],
        node: {name: 'Fragment'},
      };
      const variables = getFragmentVariables(fragment, {size: 42}, {});
      expect(variables).toEqual({
        size: 42,
      });
    });
  });

  describe('getOperationVariables()', () => {
    it('filters extraneous variables', () => {
      const query = {
        kind: 'OperationDefinition',
        argumentDefinitions: [
          {
            kind: 'LocalArgument',
            name: 'id',
            defaultValue: null,
          },
        ],
        name: 'Query',
      };
      const variables = getOperationVariables(query, {
        id: '4',
        count: 10, // not defined on Query
      });
      expect(variables).toEqual({
        id: '4',
        // count is filtered out
      });
    });

    it('sets default values', () => {
      const query = {
        kind: 'OperationDefinition',
        argumentDefinitions: [
          {
            kind: 'LocalArgument',
            name: 'id',
            defaultValue: 'beast',
          },
          {
            kind: 'LocalArgument',
            name: 'count',
            defaultValue: 10,
          },
          {
            kind: 'LocalArgument',
            name: 'order',
            defaultValue: ['name'],
          },
        ],
        name: 'Query',
      };
      const variables = getOperationVariables(query, {
        id: '4',
        // no count
        order: null,
      });
      expect(variables).toEqual({
        id: '4', // user value overwrites default
        count: 10, // set to default
        order: ['name'], // set to default
      });
    });
  });
});
