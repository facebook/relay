/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.autoMockOff();

require('configureForRelayOSS');

const BabelPluginRelay = require('BabelPluginRelay');

const babel = require('babel-core');
const getGoldenMatchers = require('getGoldenMatchers');

describe('BabelPluginRelay', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('transforms source for modern core', () => {
    expect('fixtures-modern').toMatchGolden(text => {
      try {
        return babel.transform(text, {
          plugins: [
            BabelPluginRelay,
          ],
          compact: false,
          parserOpts: {plugins: ['jsx']},
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });

  it('transforms source for compatability mode', () => {
    expect('fixtures-compat').toMatchGolden(text => {
      try {
        return babel.transform(text, {
          plugins: [
            [BabelPluginRelay, {compat: true}],
          ],
          compact: false,
          parserOpts: {plugins: ['jsx']},
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });
});
