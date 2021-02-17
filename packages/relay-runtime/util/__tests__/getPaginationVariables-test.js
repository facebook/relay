/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const getPaginationVariables = require('../getPaginationVariables');

describe('getPaginationVariables', () => {
  let direction;

  describe('forward', () => {
    beforeEach(() => {
      direction = 'forward';
    });

    it('throws error if forward pagination metadata is missing', () => {
      expect(() =>
        getPaginationVariables(
          direction,
          10,
          'cursor-1',
          {order_by: 'LAST_NAME'},
          {},
          {forward: null, backward: null, path: []},
        ),
      ).toThrowError(
        /^Relay: Expected forward pagination metadata to be available/,
      );

      // Assert output when forward metadata is malformed
      expect(() =>
        getPaginationVariables(
          direction,
          10,
          'cursor-1',
          {order_by: 'LAST_NAME'},
          {},
          // $FlowFixMe[incompatible-call]
          {forward: {count: null, cursor: 'after'}, backward: null, path: []},
        ),
      ).toThrowError(
        /^Relay: Expected forward pagination metadata to be available/,
      );
    });

    it('returns correct variables when no backward pagination metadata is present', () => {
      // Testing using different variable names for count and cursor
      let variables;

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {forward: {count: 'count', cursor: 'cursor'}, backward: null, path: []},
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        count: 10,
        cursor: 'cursor-1',
      });

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {forward: {count: 'first', cursor: 'after'}, backward: null, path: []},
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        first: 10,
        after: 'cursor-1',
      });

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {
          forward: {count: 'customCountVar', cursor: 'customCursorVar'},
          backward: null,
          path: [],
        },
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        customCountVar: 10,
        customCursorVar: 'cursor-1',
      });
    });

    it('returns correct variables when backward pagination metadata is present', () => {
      let variables;

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {
          forward: {count: 'first', cursor: 'after'},
          backward: {count: 'last', cursor: 'before'},
          path: [],
        },
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        first: 10,
        after: 'cursor-1',
        last: null,
        before: null,
      });

      // Assert output when backward metadata is malformed
      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {
          forward: {count: 'first', cursor: 'after'},
          // $FlowFixMe[incompatible-call]
          backward: {count: null, cursor: 'before'},
          path: [],
        },
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        first: 10,
        after: 'cursor-1',
        before: null,
      });
    });
  });

  describe('backward', () => {
    beforeEach(() => {
      direction = 'backward';
    });

    it('throws error if backward pagination metadata is missing', () => {
      expect(() =>
        getPaginationVariables(
          direction,
          10,
          'cursor-1',
          {order_by: 'LAST_NAME'},
          {},
          {forward: null, backward: null, path: []},
        ),
      ).toThrowError(
        /^Relay: Expected backward pagination metadata to be available/,
      );

      // Assert output when forward metadata is malformed
      expect(() =>
        getPaginationVariables(
          direction,
          10,
          'cursor-1',
          {order_by: 'LAST_NAME'},
          {},
          // $FlowFixMe[incompatible-call]
          {forward: null, backward: {count: null, cursor: 'before'}, path: []},
        ),
      ).toThrowError(
        /^Relay: Expected backward pagination metadata to be available/,
      );
    });

    it('returns correct variables when no forward pagination metadata is present', () => {
      // Testing using different variable names for count and cursor
      let variables;

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {forward: null, backward: {count: 'count', cursor: 'cursor'}, path: []},
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        count: 10,
        cursor: 'cursor-1',
      });

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {forward: null, backward: {count: 'last', cursor: 'before'}, path: []},
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        last: 10,
        before: 'cursor-1',
      });

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {
          forward: null,
          backward: {count: 'customCountVar', cursor: 'customCursorVar'},
          path: [],
        },
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        customCountVar: 10,
        customCursorVar: 'cursor-1',
      });
    });

    it('returns correct variables when forward pagination metadata is present', () => {
      let variables;

      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {
          forward: {count: 'first', cursor: 'after'},
          backward: {count: 'last', cursor: 'before'},
          path: [],
        },
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        first: null,
        after: null,
        last: 10,
        before: 'cursor-1',
      });

      // Assert output when forward metadata is malformed
      variables = getPaginationVariables(
        direction,
        10,
        'cursor-1',
        {order_by: 'LAST_NAME'},
        {},
        {
          // $FlowFixMe[incompatible-call]
          forward: {count: null, cursor: 'after'},
          backward: {count: 'last', cursor: 'before'},
          path: [],
        },
      );
      expect(variables).toEqual({
        order_by: 'LAST_NAME',
        last: 10,
        before: 'cursor-1',
        after: null,
      });
    });
  });
});
