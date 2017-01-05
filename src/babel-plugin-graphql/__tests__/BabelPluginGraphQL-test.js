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

const BabelPluginGraphQL = require('BabelPluginGraphQL');

const babel = require('babel-core');
const getGoldenMatchers = require('getGoldenMatchers');

describe('BabelPluginGraphQL', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('transforms source', () => {
    expect('fixtures').toMatchGolden(text => {
      try {
        const plugin = BabelPluginGraphQL.create({
          relayExperimental: true,
        });
        return babel.transform(text, {
          plugins: [plugin],
          compact: false,
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });
});
