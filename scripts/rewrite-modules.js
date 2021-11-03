/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const path = require('path');

/**
 * This file is a fork from fbjs's transform of the same name. It has been
 * modified to also apply to import statements, and to account for relative
 * file names in require statements.
 */

function mapModule(state, module) {
  var moduleMap = state.opts.map || {};
  if (moduleMap.hasOwnProperty(module)) {
    return moduleMap[module];
  }
  return null;
}

var jestMethods = [
  'dontMock',
  'genMockFromModule',
  'mock',
  'setMock',
  'unmock',
];

function isJestProperty(t, property) {
  return t.isIdentifier(property) && jestMethods.includes(property.name);
}

module.exports = function (babel) {
  var t = babel.types;

  /**
   * Transforms `require('Foo')` and `jest.requireActual('Foo')`.
   */
  function transformRequireCall(path, state) {
    var calleePath = path.get('callee');
    if (
      !t.isIdentifier(calleePath.node, {name: 'require'}) &&
      !(
        t.isMemberExpression(calleePath.node) &&
        t.isIdentifier(calleePath.node.object, {name: 'require'}) &&
        t.isIdentifier(calleePath.node.property, {name: 'requireActual'})
      )
    ) {
      return;
    }

    var args = path.get('arguments');
    if (!args.length) {
      return;
    }
    var moduleArg = args[0];
    if (moduleArg.node.type === 'StringLiteral') {
      var module = mapModule(state, moduleArg.node.value);
      if (module) {
        moduleArg.replaceWith(t.stringLiteral(module));
      }
    }
  }

  /**
   * Transforms `import type Bar from 'foo'`
   */
  function transformImport(path, state) {
    var source = path.get('source');
    if (source.type === 'StringLiteral') {
      var module = mapModule(state, source.node.value);
      if (module) {
        source.replaceWith(t.stringLiteral(module));
      }
    }
  }

  /**
   * Transforms either individual or chained calls to `jest.dontMock('Foo')`,
   * `jest.mock('Foo')`, and `jest.genMockFromModule('Foo')`.
   */
  function transformJestHelper(path, state) {
    var calleePath = path.get('callee');
    var args = path.get('arguments');
    if (!args.length) {
      return;
    }
    var moduleArg = args[0];
    if (
      moduleArg.node.type === 'StringLiteral' &&
      calleePath.node &&
      isJestProperty(t, calleePath.node.property)
    ) {
      var module = mapModule(state, moduleArg.node.value);
      if (module) {
        moduleArg.replaceWith(t.stringLiteral(module));
      }
    }
  }

  const jestIdentifier = {
    Identifier(path) {
      if (path.node.name === 'jest') {
        this.isJest = true;
      }
    },
  };

  function transformJestCall(path, state) {
    let params = {isJest: false};
    path.traverse(jestIdentifier, params);
    if (params.isJest) {
      transformJestHelper(path, state);
    }
  }

  return {
    visitor: {
      CallExpression: {
        exit(path, state) {
          if (!path.node.seen) {
            path.node.seen = true;
            transformRequireCall(path, state);
            transformJestCall(path, state);
          }
        },
      },
      ImportDeclaration: {
        exit(path, state) {
          if (!path.node.seen) {
            path.node.seen = true;
            transformImport(path, state);
          }
        },
      },
    },
  };
};
