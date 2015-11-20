/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var objectAssign = require('object-assign');

var _moduleMap = objectAssign({}, require('fbjs/module-map'), {
    'React': 'react',
    'ReactDOM': 'react-dom',
    'ReactUpdates': 'react/lib/ReactUpdates',
    'StaticContainer.react': 'react-static-container',
    'core-js/library/es6/map': 'core-js/library/es6/map',
    'promise': 'promise',
    'ua-parser-js': 'ua-parser-js',
    'whatwg-fetch': 'whatwg-fetch'
  });

/**
 * Rewrites module string literals according to the `_moduleMap` babel option.
 * This allows other npm packages to be published and used directly without
 * being a part of the same build.
 */
function mapModule(module) {
  var moduleMap = _moduleMap || {};
  if (moduleMap.hasOwnProperty(module)) {
    return moduleMap[module];
  }
}

module.exports = function(babel) {
  var t = babel.types;

  /**
   * Transforms `require('Foo')` and `require.requireActual('Foo')`.
   */
  function transformRequireCall(path) {
    let node = path.node;
    if (
      !t.isIdentifier(node.callee, {name: 'require'}) &&
      !(
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.object, {name: 'require'}) &&
        t.isIdentifier(node.callee.property, {name: 'requireActual'})
      )
    ) {
      return;
    }
    var moduleArg = node.arguments[0];
    if (moduleArg && moduleArg.type.indexOf('Literal') >= 0) {
      var module = mapModule(moduleArg.value);
      if (module) {
        path.replaceWith(t.callExpression(
          node.callee,
          [t.valueToNode(module)]
        ));
      }
    }
  }

  /**
   * Transforms either individual or chained calls to `jest.dontMock('Foo')`,
   * `jest.mock('Foo')`, and `jest.genMockFromModule('Foo')`.
   */
  function transformJestCall(path) {
    let node = path.node;
    if(!node)
      node = path;

    if (!t.isMemberExpression(node.callee)) {
      return;
    }
    var object;
    var member = node.callee;
    if (t.isIdentifier(member.object, {name: 'jest'})) {
      object = member.object;
    } else if (t.isCallExpression(member.object)) {
      object = transformJestCall(member.object);
    }
    if (!object) {
      return;
    }
    var args = node.arguments;
    if (
      args[0] &&
      args[0].type.indexOf('Literal') >= 0 &&
      (
        t.isIdentifier(member.property, {name: 'dontMock'}) ||
        t.isIdentifier(member.property, {name: 'mock'}) ||
        t.isIdentifier(member.property, {name: 'genMockFromModule'})
      )
    ) {
      var module = mapModule(args[0].value);
      if (module) {
        args = [t.valueToNode(module)];
        path.replaceWith(t.callExpression(
          t.memberExpression(object, member.property),
          args
        ));
      }
    }
  }

  return {
    visitor: {
    CallExpression: {
      exit(path) {
          transformRequireCall(path) || transformJestCall(path);
      }
    }
  }};
};
