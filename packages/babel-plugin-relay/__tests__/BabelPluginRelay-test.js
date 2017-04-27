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
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, '../../relay-compiler/testutils/testschema.graphql');
const OLD_SCHEMA_PATH = path.resolve(__dirname, './testschema.rfc.graphql');

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
            [BabelPluginRelay, {
              compat: true,
              schema: SCHEMA_PATH,
              substituteVariables: true,
            }],
          ],
          compact: false,
          parserOpts: {plugins: ['jsx']},
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });

  it('transforms source for modern core when using haste', () => {
    expect('fixtures-modern-haste').toMatchGolden(text => {
      try {
        return babel.transform(text, {
          plugins: [
            [BabelPluginRelay, {haste: true}],
          ],
          compact: false,
          parserOpts: {plugins: ['jsx']},
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });

  it('transforms source for compatability mode when using haste and custom module', () => {
    expect('fixtures-compat-haste').toMatchGolden(text => {
      try {
        return babel.transform(text, {
          plugins: [
            [BabelPluginRelay, {
              compat: true,
              haste: true,
              relayQLModule: 'RelayQL_GENERATED',
              schema: SCHEMA_PATH,
              substituteVariables: true,
            }],
          ],
          compact: false,
          parserOpts: {plugins: ['jsx']},
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });

  it('transforms source with classic Relay.QL tags', () => {
    expect('fixtures-classic').toMatchGolden((text, filename) => {
      try {
        return babel.transform(text, {
          plugins: [
            [BabelPluginRelay, {
              schema: OLD_SCHEMA_PATH,
              debug: true,
              substituteVariables: true,
              suppressWarnings: true,
            }],
          ],
          compact: false,
          filename,
          parserOpts: {plugins: ['jsx']},
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      }
    });
  });

});
