/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

const RelayTestUtils = require('RelayTestUtils');

describe('RelayTestUtils', () => {
  describe('dedent()', () => {
    const {dedent} = RelayTestUtils;

    describe('with an empty string', () => {
      it('does nothing', () => {
        expect(dedent('')).toBe('');
      });

      it('does not pad a blank line', () => {
        expect(dedent('', '  ')).toBe('');
      });
    });

    describe('with a blank string', () => {
      it('strips the entire string', () => {
        expect(dedent('    ')).toBe('');
      });

      it('does not pad a blank line', () => {
        expect(dedent('   ', '   ')).toBe('');
      });
    });

    describe('with a simple string', () => {
      it('does nothing when there is no indent', () => {
        expect(dedent('foo')).toBe('foo');
      });

      it('strips a leading indent', () => {
        expect(dedent('  foo')).toBe('foo');
      });

      it('applies a custom padding if requested', () => {
        expect(dedent('   foo', ' ')).toBe(' foo');
      });

      it('does nothing to trailing whitespace', () => {
        expect(dedent('foo  ')).toBe('foo  ');
        expect(dedent('foo  ', '  ')).toBe('  foo  ');
      });
    });

    describe('with a multiline string', () => {
      it('dedents based on the leading whitespace', () => {
        const string = `
          query MyQuery {
            example {
              text
            }
          }
        `;
        expect(dedent(string)).toBe(
          'query MyQuery {\n' +
          '  example {\n' +
          '    text\n' +
          '  }\n' +
          '}'
        );
      });

      it('applies a custom padding if requested', () => {
        const string = `
          query MyQuery {
            example {
              text
            }
          }
        `;
        expect(dedent(string, '    ')).toBe(
          '    query MyQuery {\n' +
          '      example {\n' +
          '        text\n' +
          '      }\n' +
          '    }'
        );
      });

      it('is deals with zero-width lines', () => {
        const string = `
          query MyQuery {
            example {
              text
            }

            more
          }
        `;
        expect(dedent(string)).toBe(
          'query MyQuery {\n' +
          '  example {\n' +
          '    text\n' +
          '  }\n' +
          '\n' +
          '  more\n' +
          '}'
        );
      });

      it('does not insert entirely blank lines when applying padding', () => {
        const string = `
          query MyQuery {
            example {
              text
            }

            more
          }
        `;
        expect(dedent(string, '  ')).toBe(
          '  query MyQuery {\n' +
          '    example {\n' +
          '      text\n' +
          '    }\n' +
          '\n' +
          '    more\n' +
          '  }'
        );
      });

      it('suppresses blank lines in the output', () => {
        /* eslint-disable no-trailing-spaces */
        const string = `
          query MyQuery {
            example {
              text
            }
            
            more
          }
        `;
        /* eslint-enable no-trailing-spaces */
        expect(dedent(string, '  ')).toBe(
          '  query MyQuery {\n' +
          '    example {\n' +
          '      text\n' +
          '    }\n' +
          '\n' +
          '    more\n' +
          '  }'
        );
      });
    });
  });

  describe('matchers', () => {
    let comparator;

    beforeEach(() => {
      comparator = RelayTestUtils.matchers.toMatchRecord().compare;

      // Define custom matchers to test our custom matchers...
      jasmine.addMatchers({
        toFail() {
          return {
            compare(actual, expected) {
              if (actual.pass) {
                if (expected) {
                  return {
                    pass: false,
                    message: (
                      'Expected matcher to fail with message: ' +
                      JSON.stringify(expected) +
                      ' but it passed.'
                    ),
                  };
                } else {
                  return {
                    pass: false,
                    message: 'Expected matcher to fail but it passed.',
                  };
                }
              } else if (expected instanceof RegExp) {
                if (!actual.message.match(expected)) {
                  return {
                    pass: false,
                    message: (
                      'Expected matcher to fail with message matching: ' +
                      expected.toString() +
                      ' but it failed with message: ' +
                      JSON.stringify(actual.message)
                    ),
                  };
                }
              } else if (expected && actual.message !== expected) {
                return {
                  pass: false,
                  message: (
                    'Expected matcher to fail with message: ' +
                    JSON.stringify(expected) +
                    ' but it failed with message: ' +
                    JSON.stringify(actual.message)
                  ),
                };
              }
              return {pass: true};
            },
          };
        },

        toPass() {
          return {
            compare(actual, _) {
              if (actual.pass) {
                return {pass: true};
              } else {
                return {
                  pass: false,
                  message: (
                    'Expected matcher to pass but it failed with message: ' +
                    JSON.stringify(actual.message)
                  ),
                };
              }
            },
          };
        },
      });
    });

    describe('toMatchRecord()', () => {
      it('compares equal primitive objects', () => {
        expect(comparator('foo', 'foo')).toPass();
        expect(comparator('foo', 'bar')).toFail(
          'Expected value to be "bar", but got "foo"'
        );

        expect(comparator(7337, 7337)).toPass();
        expect(comparator(1, 2)).toFail();
      });

      it('compares null', () => {
        expect(comparator(null, null)).toPass();
        expect(comparator(null, 1)).toFail(
          'Expected value to be 1, but got null'
        );
      });

      it('compares shallow arrays', () => {
        expect(comparator([1, 2, 'foo'], [1, 2, 'foo'])).toPass();
        expect(comparator([1, 2, 'bar'], [1, 2, 'baz'])).toFail(
          'Expected property at path `2` to be "baz", but got "bar"'
        );
        expect(comparator([1, 2, 3], [1, 2])).toFail();
        expect(comparator([1, 2], [1, 2, 3])).toFail();
      });

      it('compares nested arrays', () => {
        expect(comparator(
          [1, 2, ['this', null], 'foo'],
          [1, 2, ['this', null], 'foo']
        )).toPass();

        expect(comparator(
          [1, 2, ['this', null], 'foo'],
          [10, 20, ['this', null], 'foo']
        )).toFail();

        expect(comparator(
          [1, 2, ['this', null], 'foo'],
          [1, 2, ['that', null], 'foo']
        )).toFail();
      });

      it('compares simple objects', () => {
        expect(comparator(
          {foo: 1, bar: 'thing'},
          {foo: 1, bar: 'thing'},
        )).toPass();

        expect(comparator(
          {foo: 1, bar: 'thing'},
          {fizz: 1, buzz: 'thing'},
        )).toFail();

        expect(comparator(
          {foo: 1, bar: 'thing'},
          {foo: 10, bar: 'things'},
        )).toFail();

        expect(comparator(
          {foo: 1, bar: 'thing'},
          {foo: 1},
        )).toFail();
      });

      it('compares nested objects', () => {
        expect(comparator(
          {foo: 1, bar: {other: 'thing'}},
          {foo: 1, bar: {other: 'thing'}},
        )).toPass();

        expect(comparator(
          {foo: 1, bar: {other: 'thing'}},
          {foo: 1, bar: {other: 'thing', excess: true}},
        )).toFail();
      });

      it('compares objects with metadata attributes', () => {
        expect(comparator(
          {__dataID__: 'client:0', foo: 1, bar: {other: 'thing'}},
          {foo: 1, bar: {other: 'thing'}},
        )).toPass();
      });

      it('deals with undefined values', () => {
        expect(comparator(
          undefined,
          {thing: 1}
        )).toFail(
          /^Expected value to be {\"thing\":1}, but got undefined$/
        );
      });

      it('does not handle "exotic" objects', () => {
        // Dates have no keys, so we consider these equal.
        expect(comparator(new Date('2015-08-11'), new Date())).toPass();

        // But note that we at least distinguish different object types.
        expect(comparator([], new Date())).toFail(
          /^Expected value to be ".+", but got \[\]$/
        );
      });
    });
  });
});
