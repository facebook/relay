/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const assign = require('object-assign');

module.exports = function(options) {
  options = assign({
    env: 'production',
    moduleMap: {},
    plugins: [],
  }, options);
  return {
    plugins: options.plugins,
    presets: [
      require('babel-preset-fbjs/configure')({
        autoImport: true,
        inlineRequires: true,
        rewriteModules: {
          map: assign({},
            require('fbjs-scripts/third-party-module-map'),
            require('fbjs/module-map'),
            options.moduleMap
          ),
        },
        stripDEV: options.env === 'production',
      }),
    ],
  };
};
