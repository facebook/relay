/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

const BabelPluginRelay = require('../../BabelPluginRelay');

const babel = require('babel-core');

function transformGraphQL(schemaPath, source, filename) {
  return babel.transform(source, {
    plugins: [
      [BabelPluginRelay, {
        compat: true,
        schema: schemaPath,
        debug: true,
        substituteVariables: true,
        suppressWarnings: true,
      }],
    ],
    compact: false,
    filename,
  }).code;
}

module.exports = transformGraphQL;
