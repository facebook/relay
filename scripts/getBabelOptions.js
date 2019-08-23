/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

module.exports = function(options) {
  options = Object.assign(
    {
      env: 'production',
      plugins: [],
    },
    options,
  );

  const fbjsPreset = require('babel-preset-fbjs/configure')({
    autoImport: options.autoImport || false,
    objectAssign: false,
    stripDEV: options.env === 'production',
  });

  fbjsPreset.presets[0].plugins.push([
    require('./rewrite-modules'),
    {
      map: {
        ErrorUtils: 'fbjs/lib/ErrorUtils',
        Promise: 'fbjs/lib/Promise',
        areEqual: 'fbjs/lib/areEqual',
        invariant: 'fbjs/lib/invariant',
        mapObject: 'fbjs/lib/mapObject',
        warning: 'fbjs/lib/warning',
      },
    },
  ]);

  if (options.postPlugins) {
    fbjsPreset.presets.push({
      plugins: options.postPlugins,
    });
  }

  return {
    plugins: options.plugins.concat('@babel/plugin-transform-spread'),
    presets: [fbjsPreset],
  };
};
