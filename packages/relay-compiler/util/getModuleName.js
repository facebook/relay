/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getModuleName
 * @flow
 * @format
 */

'use strict';

const path = require('path');

function getModuleName(filePath: string): string {
  const filename = path.basename(filePath, path.extname(filePath));
  // /path/to/button/index.js -> button
  let moduleName = filename === 'index'
    ? path.basename(path.dirname(filePath))
    : filename;

  // Example.ios -> Example
  // Example.product.android -> Example
  moduleName = moduleName.replace(/(?:\.\w+)+/, '');

  // foo-bar -> foo_bar
  // NOTE: should probably be fooBar instead because of compat mode
  moduleName = moduleName.replace(/[^a-zA-Z0-9_]/g, '_');

  // button -> Button
  // moduleName = moduleName.replace(/^\w/, m => m.toUpperCase());

  return moduleName;
}

module.exports = getModuleName;
