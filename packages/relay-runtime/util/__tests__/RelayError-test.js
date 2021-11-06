/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const RelayError = require('../RelayError');

describe('RelayError', () => {
  test('simple', () => {
    expect(RelayError.create('foo', 'bar')).toMatchObject({
      type: 'error',
      name: 'foo',
      message: 'bar',
      messageFormat: 'bar',
      messageParams: [],
    });
  });

  test('warning', () => {
    expect(RelayError.createWarning('foo', 'bar')).toMatchObject({
      type: 'warn',
    });
  });

  test('params', () => {
    expect(RelayError.create('foo', 'bar %s bar', 'baz')).toMatchObject({
      type: 'error',
      name: 'foo',
      message: 'bar baz bar',
      messageFormat: 'bar %s bar',
      messageParams: ['baz'],
    });
    expect(
      RelayError.create('foo', 'bar %s, "%s"', 'baz', 'bam'),
    ).toMatchObject({
      message: 'bar baz, "bam"',
      messageFormat: 'bar %s, "%s"',
      messageParams: ['baz', 'bam'],
    });
  });
});
