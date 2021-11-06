/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const Matchers = require('../Matchers');

beforeEach(() => {
  // Define custom matchers to test our custom matchers...
  expect.extend({
    toFail(actual, expected) {
      const actualMessage = actual.message();
      if (actual.pass) {
        if (expected) {
          return {
            pass: false,
            message: () =>
              'Expected matcher to fail with message: ' +
              JSON.stringify(expected) +
              ' but it passed.',
          };
        } else {
          return {
            pass: false,
            message: () => 'Expected matcher to fail but it passed.',
          };
        }
      } else if (expected instanceof RegExp) {
        if (!actualMessage.match(expected)) {
          return {
            pass: false,
            message: () =>
              'Expected matcher to fail with message matching: ' +
              expected.toString() +
              ' but it failed with message: ' +
              JSON.stringify(actualMessage),
          };
        }
      } else if (expected && actualMessage !== expected) {
        return {
          pass: false,
          message: () =>
            'Expected matcher to fail with message: ' +
            JSON.stringify(expected) +
            ' but it failed with message: ' +
            JSON.stringify(actualMessage),
        };
      }
      return {pass: true};
    },

    toPass(actual) {
      if (actual.pass) {
        return {pass: true};
      } else {
        return {
          pass: false,
          message: () =>
            'Expected matcher to pass but it failed with message: ' +
            JSON.stringify(actual.message()),
        };
      }
    },
  });
});

describe('toWarn()', () => {
  let toWarn;
  let not;
  let warning;

  beforeEach(() => {
    jest.mock('warning');
    warning = require('warning');
    const matcher = Matchers.toWarn;
    toWarn = matcher.bind({isNot: false});
    not = {
      toWarn: (...args) => {
        const matcherResp = matcher.apply({isNot: true}, args);
        return {
          ...matcherResp,
          pass: !matcherResp.pass,
        };
      },
    };
  });

  it('verifies that `warning` is called with expected arguments', () => {
    expect(
      toWarn(
        () => warning(false, 'Failed %s.', 'spectacularly'),
        ['Failed %s.', 'spectacularly'],
      ),
    ).toPass();
  });

  it('gracefully handles non-Array expected arguments', () => {
    expect(
      toWarn(
        () => warning(false, 'Welcome to Clowntown.'),
        'Welcome to Clowntown.',
      ),
    ).toPass();
  });

  it('can identify a matching warning with a regular expression', () => {
    expect(
      toWarn(
        () => warning(false, 'Press CTRL+ALT+DEL again to restart.'),
        /CTRL\+[A-Z]+\+DEL/,
      ),
    ).toPass();
  });

  it('can identify a matching warning with regular expressions', () => {
    expect(
      toWarn(
        () => warning(false, 'Press %s again to restart.', 'CTRL+ALT+DEL'),
        [/^Press.+/, /CTRL/],
      ),
    ).toPass();
  });

  it('detects failure to call `warning` with expected arguments', () => {
    expect(
      toWarn(
        () => warning(false, 'Failed %s.', 'unexpectedly'),
        ['Failed %s.', 'as I have foreseen it'],
      ),
    ).toFail(
      'Expected to warn: [false, "Failed %s.", "as I have foreseen it"] ' +
        'but `warning` received the following calls: [false, "Failed %s.", ' +
        '"unexpectedly"].',
    );
  });

  it('formats failure output for multiple `warning` calls prettily', () => {
    expect(
      toWarn(() => {
        warning(false, 'Failed %s.', 'unexpectedly');
        warning(false, 'Failed %s.', 'spectacularly');
      }, ['Failed %s.', 'as I have foreseen it']),
    ).toFail(
      'Expected to warn: [false, "Failed %s.", "as I have foreseen it"] ' +
        'but `warning` received the following calls: [false, "Failed %s.", ' +
        '"unexpectedly"], [false, "Failed %s.", "spectacularly"].',
    );
  });

  it('detects failure to trigger `warning` with a falsey expression', () => {
    expect(
      toWarn(
        () => warning(true, 'Failed %s.', 'unexpectedly'),
        ['Failed %s.', 'unexpectedly'],
      ),
    ).toFail(
      'Expected to warn: [false, "Failed %s.", "unexpectedly"] but ' +
        '`warning` received the following calls: [true, "Failed %s.", ' +
        '"unexpectedly"].',
    );
  });

  it('detects failure to call `warning` with an arg matching a regex', () => {
    expect(toWarn(() => warning(false, 'Something'), /THING/)).toFail(
      'Expected to warn: [false, /THING/] but `warning` received the ' +
        'following calls: [false, "Something"].',
    );
  });

  it('detects failure to call `warning` with a args matching regexen', () => {
    expect(
      toWarn(() => warning(false, 'Foo: %s', 'Bar'), [/FOO/, /BAR/]),
    ).toFail(
      'Expected to warn: [false, /FOO/, /BAR/] but `warning` received the ' +
        'following calls: [false, "Foo: %s", "Bar"].',
    );
  });

  it('ignores unexpected `warning` calls', () => {
    expect(
      toWarn(() => {
        warning(false, 'Failed right!');
        warning(false, 'Failed left!');
        warning(false, 'Ignored');
      }, 'Failed left!'),
    ).toPass();
  });

  it('verifies that `warning` not called with unexpected arguments', () => {
    expect(
      not.toWarn(() => warning(false, 'Unrelated warning'), 'Broke.'),
    ).toPass();
  });

  it('verifies that `warning` not called with falsey expression', () => {
    expect(not.toWarn(() => warning(true, 'Bad thing'), 'Bad thing.')).toPass();
  });

  it('does not overwrite a pre-existing `warning` mock', () => {
    jest.mock('warning');
    /* eslint-disable no-shadow */
    const warning = require('warning');
    /* eslint-enable no-shadow */
    toWarn(() => warning(false, 'BOOM!'), 'BOOM!');
    expect(require('warning')).toBe(warning);
  });

  it('is not confused by multiple calls', () => {
    jest.mock('warning');
    /* eslint-disable no-shadow */
    const warning = require('warning');
    /* eslint-enable no-shadow */
    expect(toWarn(() => warning(false, 'BOOM!'), 'BOOM!')).toPass();

    expect(toWarn(() => warning(false, 'BANG!'), 'BOOM!')).toFail();
  });

  it('throws if `warning` it not previously mocked', () => {
    jest.unmock('warning');
    expect(toWarn).toThrowError("toWarn(): Requires `jest.mock('warning')`.");
  });

  it('allows errors thrown during its callback to bubble up', () => {
    expect(() => {
      toWarn(() => {
        throw new Error('BOOM!');
      });
    }).toThrowError('BOOM!');
  });

  describe('when not supplied an argument', () => {
    it('matches any `warning`', () => {
      expect(
        toWarn(() => warning(false, 'Failed %s.', 'spectacularly')),
      ).toPass();
    });

    it('detects failure to warn', () => {
      expect(toWarn(() => {})).toFail(
        'Expected to warn but `warning` received the following calls: [].',
      );
    });

    it('detects failure to warn with a falsey expression', () => {
      expect(toWarn(() => warning(true, 'Something went wrong.'))).toFail(
        'Expected to warn but `warning` received the following calls: ' +
          '[true, "Something went wrong."].',
      );
    });

    it('verifies that `warning` not called at all', () => {
      expect(not.toWarn(() => {})).toPass();
    });

    it('verifies that `warning` not called with a falsey expression', () => {
      expect(
        not.toWarn(() => warning(true, 'You need to restart your computer.')),
      ).toPass();
    });

    it('detects unexpected calls to `warning`', () => {
      expect(not.toWarn(() => warning(false, 'Guru meditation.'))).toFail(
        'Expected not to warn but `warning` received the following calls: ' +
          '[false, "Guru meditation."].',
      );
    });
  });
});
