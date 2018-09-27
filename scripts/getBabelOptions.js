/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noformat
 */

'use strict';

module.exports = function(options) {
  options = Object.assign(
    {
      env: 'production',
      moduleMap: {},
      plugins: [],
    },
    options
  );

  const fbjsPreset = require('babel-preset-fbjs/configure')({
    autoImport: options.autoImport || false,
    objectAssign: false,
    inlineRequires: true,
    stripDEV: options.env === 'production',
  });

  // The module rewrite transform needs to be positioned relative to fbjs's
  // many other transforms.
  const moduleMap = Object.assign(
    {},
    require('fbjs/module-map'),
    options.moduleMap
  );
  // TODO: Delete `nullthrows` from fbjs.
  moduleMap.nullthrows = 'nullthrows';

  fbjsPreset.presets[0].plugins.push([
    require('./rewrite-modules'),
    {
      map: moduleMap,
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
