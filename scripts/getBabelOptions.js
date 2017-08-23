/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

module.exports = function(options) {
  options = Object.assign(
    {
      env: 'production',
      moduleMap: {},
      plugins: []
    },
    options
  );

  const fbjsPreset = require('babel-preset-fbjs/configure')({
    autoImport: options.autoImport || false,
    objectAssign: false,
    inlineRequires: true,
    stripDEV: options.env === 'production'
  });

  // The module rewrite transform needs to be positioned relative to fbjs's
  // many other transforms.
  fbjsPreset.presets[0].plugins.push([
    require('./rewrite-modules'),
    {
      map: Object.assign({}, require('fbjs/module-map'), options.moduleMap)
    }
  ]);

  if (options.postPlugins) {
    fbjsPreset.presets.push({
      plugins: options.postPlugins
    });
  }

  return {
    plugins: options.plugins.concat('transform-es2015-spread'),
    presets: [fbjsPreset]
  };
};
