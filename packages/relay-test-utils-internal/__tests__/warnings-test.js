/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

'use strict';

const {
  disallowWarnings,
  expectToWarn,
  expectWarningWillFire,
} = require('../warnings');
const warning = require('warning');

disallowWarnings();

describe('warnings', () => {
  const unexpected_message = 'unexpected warning';
  const expected_message1 = 'expected warning #1';
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('throws when disallow warnings is called twice', () => {
    expect(disallowWarnings).toThrowError(
      '`disallowWarnings` should be called at most once',
    );
  });
  it('throws when unexpected warning is fired', () => {
    expect(() => warning(false, unexpected_message)).toThrowError(
      'Warning: ' + unexpected_message,
    );
  });
  it('does not throw when expected warning is fired', () => {
    expectWarningWillFire(expected_message1);
    warning(false, expected_message1);
  });

  it('matches contextual warning', () => {
    expectToWarn(expected_message1, () => warning(false, expected_message1));
  });

  it('matches contextual warning first', () => {
    expectWarningWillFire(expected_message1);
    expectToWarn(expected_message1, () => warning(false, expected_message1));
    warning(false, expected_message1);
  });

  it('warns on unfired contextual warning', () => {
    expect(() => expectToWarn(expected_message1, () => {})).toThrowError(
      'Expected callback to warn: ' + expected_message1,
    );
  });
});
