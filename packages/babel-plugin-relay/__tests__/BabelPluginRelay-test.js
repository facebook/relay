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

  function transformerWithOptions(
    options: RelayPluginOptions,
    environment: 'development' | 'production' = 'production',
  ): string => string {
    return (text, filename) => {
      const previousEnv = process.env.BABEL_ENV;
      try {
        process.env.BABEL_ENV = environment;
        return babel.transform(text, {
          compact: false,
          filename,
          parserOpts: {plugins: ['jsx']},
          plugins: [[BabelPluginRelay, options]],
        }).code;
      } catch (e) {
        return 'ERROR:\n\n' + e;
      } finally {
        process.env.BABEL_ENV = previousEnv;
      }
    };
  }

  it('transforms source for modern core', () => {
    expect('fixtures-modern').toMatchGolden(transformerWithOptions({}));
  });

  it('transforms source for compatability mode', () => {
    expect('fixtures-compat').toMatchGolden(
      transformerWithOptions({
        compat: true,
        schema: SCHEMA_PATH,
        substituteVariables: true,
      }),
    );
  });

  it('transforms source for modern core when using haste', () => {
    expect('fixtures-modern-haste').toMatchGolden(
      transformerWithOptions({
        haste: true,
      }),
    );
  });

  it('transforms source for compatability mode when using haste and custom module', () => {
    expect('fixtures-compat-haste').toMatchGolden(
      transformerWithOptions({
        compat: true,
        haste: true,
        schema: SCHEMA_PATH,
        substituteVariables: true,
      }),
    );
  });

  it('transforms source with classic Relay.QL tags', () => {
    expect('fixtures-classic').toMatchGolden(
      transformerWithOptions({
        schema: OLD_SCHEMA_PATH,
        substituteVariables: true,
      }),
    );
  });

  describe('`development` option', () => {
    it('tests the hash when `development` is set', () => {
      expect(
        transformerWithOptions({}, 'development')(
          'graphql`fragment TestFrag on Node { id }`',
        ),
      ).toMatchSnapshot();
    });

    it('tests the hash when `isDevVariable` is set', () => {
      expect(
        transformerWithOptions({isDevVariable: 'IS_DEV'})(
          'graphql`fragment TestFrag on Node { id }`',
        ),
      ).toMatchSnapshot();
    });

    it('uses a custom build command in message', () => {
      expect(
        transformerWithOptions(
          {
            buildCommand: 'relay-build',
          },
          'development',
        )('graphql`fragment TestFrag on Node { id }`'),
      ).toMatchSnapshot();
    });

    it('does not test the hash when `development` is not set', () => {
      expect(
        transformerWithOptions({}, 'production')(
          'graphql`fragment TestFrag on Node { id }`',
        ),
      ).toMatchSnapshot();
    });
  });
});
