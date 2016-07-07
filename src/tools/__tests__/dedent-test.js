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

jest.unmock('dedent');

const dedent = require('dedent');

describe('dedent()', () => {
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
