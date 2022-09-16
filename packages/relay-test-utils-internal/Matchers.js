/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

/* global expect */

function toBeDeeplyFrozen(actual) {
  function check(value) {
    expect(Object.isFrozen(value)).toBe(true);
    if (Array.isArray(value)) {
      value.forEach(item => check(item));
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        check(value[key]);
      }
    }
  }
  check(actual);
  return {
    pass: true,
  };
}

function toWarn(actual, expected) {
  const negative = this.isNot;

  function formatItem(item) {
    return item instanceof RegExp ? item.toString() : JSON.stringify(item);
  }

  function formatArray(array) {
    return '[' + array.map(formatItem).join(', ') + ']';
  }

  function formatExpected(args) {
    return formatArray([false].concat(args));
  }

  function formatActual(calls) {
    if (calls.length) {
      return calls
        .map(args => {
          return formatArray([!!args[0]].concat(args.slice(1)));
        })
        .join(', ');
    } else {
      return '[]';
    }
  }

  const warning = require('warning');
  if (!warning.mock) {
    throw new Error("toWarn(): Requires `jest.mock('warning')`.");
  }

  const callsCount = warning.mock.calls.length;
  actual();
  const calls = warning.mock.calls.slice(callsCount);

  // Simple case: no explicit expectation.
  if (!expected) {
    const warned = calls.filter(args => !args[0]).length;
    return {
      pass: !!warned,
      message: () =>
        `Expected ${negative ? 'not ' : ''}to warn but ` +
        '`warning` received the following calls: ' +
        `${formatActual(calls)}.`,
    };
  }

  // Custom case: explicit expectation.
  if (!Array.isArray(expected)) {
    expected = [expected];
  }
  const call = calls.find(args => {
    return (
      args.length === expected.length + 1 &&
      args.every((arg, index) => {
        if (!index) {
          return !arg;
        }
        const other = expected[index - 1];
        return other instanceof RegExp ? other.test(arg) : arg === other;
      })
    );
  });

  return {
    pass: !!call,
    message: () =>
      `Expected ${negative ? 'not ' : ''}to warn: ` +
      `${formatExpected(expected)} but ` +
      '`warning` received the following calls: ' +
      `${formatActual(calls)}.`,
  };
}

module.exports = {
  toBeDeeplyFrozen,
  toWarn,
};
