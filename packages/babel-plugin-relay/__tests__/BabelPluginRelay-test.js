/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const BabelPluginRelay = require('BabelPluginRelay');

const babel = require('babel-core');
const getGoldenMatchers = require('getGoldenMatchers');
const path = require('path');

const SCHEMA_PATH = path.resolve(
  __dirname,
  '../../relay-compiler/testutils/testschema.graphql',
);
const OLD_SCHEMA_PATH = path.resolve(__dirname, './testschema.rfc.graphql');

describe('BabelPluginRelay', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('transforms source for modern core', () => {
    expect('fixtures-modern').toMatchGolden(text => {
      try {
        return babel.transform(text, {
          plugins: [BabelPluginRelay],
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
            [
              BabelPluginRelay,
              {
                compat: true,
                schema: SCHEMA_PATH,
                substituteVariables: true,
              },
            ],
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
          plugins: [[BabelPluginRelay, {haste: true}]],
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
            [
              BabelPluginRelay,
              {
                compat: true,
                haste: true,
                schema: SCHEMA_PATH,
                substituteVariables: true,
              },
            ],
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
            [
              BabelPluginRelay,
              {
                schema: OLD_SCHEMA_PATH,
                substituteVariables: true,
              },
            ],
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
