/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {
  disallowWarnings,
  expectToWarn,
  expectToWarnMany,
  expectWarningWillFire,
} = require('../warnings');
const warning = require('warning');

disallowWarnings();

describe('warnings', () => {
  const unexpected_message = 'unexpected warning';
  const expected_message1 = 'expected warning #1';
  const expected_message2 = 'expected warning #2';
  const expected_message3 = 'expected warning #3';
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('throws when disallow warnings is called twice', () => {
    expect(disallowWarnings).toThrowError(
      'disallowWarnings should be called only once',
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
      'Expected warning in callback: ' + expected_message1,
    );
  });

  it('warns on unexpected contextual warning', () => {
    expect(() =>
      expectToWarn(expected_message1, () => {
        warning(false, expected_message2);
      }),
    ).toThrowError('Warning: ' + expected_message2);
  });

  it('matches multiple contextual warnings first', () => {
    expectWarningWillFire(expected_message1);

    expectToWarnMany([expected_message1, expected_message2], () => {
      warning(false, expected_message1);
      warning(false, expected_message2);
    });
    warning(false, expected_message1);
  });

  it('matches multiple contextual warnings in order', () => {
    expect(() => {
      expectToWarnMany([expected_message2, expected_message1], () => {
        warning(false, expected_message1);
        warning(false, expected_message2);
      });
    }).toThrowError('Warning: ' + expected_message1);
  });

  it('warnings for unfired warning, given multiple contextual warnings', () => {
    expect(() => {
      expectToWarnMany(
        [expected_message1, expected_message2, expected_message3],
        () => {
          warning(false, expected_message1);
          warning(false, expected_message2);
        },
      );
    }).toThrowError('Expected warning in callback: ' + expected_message3);
  });
});
