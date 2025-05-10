/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (context, options) {
  return {
    name: 'custom-webpack-alias',
    configureWebpack() {
      // The relative location of the JSON schema file differs between GitHub
      // and internal Meta builds, so we need a place to handle that
      // conditionality.

      const CANDIDATE_PATHS = [
        // Used in OSS builds
        '../../compiler/crates/relay-compiler/relay-compiler-config-schema.json',
        // Used in internal Meta builds
        '../../../../../../../../../fbcode/relay/oss/crates/relay-compiler/relay-compiler-config-schema.json',
      ].map(p => path.resolve(__dirname, p));

      const jsonSchemaPath = CANDIDATE_PATHS.find(p => fs.existsSync(p));

      if (!jsonSchemaPath) {
        throw new Error(
          `Could not find JSON schema file for compiler config. Looked in: ${CANDIDATE_PATHS.join(
            ', ',
          )}`,
        );
      }

      return {
        resolve: {
          alias: {
            '@compilerConfigJsonSchema': jsonSchemaPath,
          },
        },
      };
    },
  };
};
