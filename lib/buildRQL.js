/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule buildRQL
 * 
 * @typechecks
 */

'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var Map = require('fbjs/lib/Map');
var QueryBuilder = require('./QueryBuilder');

var RelayProfiler = require('./RelayProfiler');

var Set = require('fbjs/lib/Set');

var filterObject = require('fbjs/lib/filterObject');
var generateConcreteFragmentID = require('./generateConcreteFragmentID');
var invariant = require('fbjs/lib/invariant');
var mapObject = require('fbjs/lib/mapObject');

// Cache results of executing fragment query builders.
var fragmentCache = new Map();
var concreteFragmentIDSet = new Set();

// Cache results of executing component-specific route query builders.
var queryCache = new Map();

function isDeprecatedCallWithArgCountGreaterThan(nodeBuilder, count) {
  var argLength = nodeBuilder.length;
  if (process.env.NODE_ENV !== 'production') {
    var mockImpl = nodeBuilder;
    while (mockImpl && mockImpl._getMockImplementation) {
      mockImpl = mockImpl._getMockImplementation();
    }
    if (mockImpl) {
      argLength = mockImpl.length;
    }
  }
  return argLength > count;
}

/**
 * @internal
 *
 * Builds a static node representation using a supplied query or fragment
 * builder. This is used for routes, containers, and mutations.
 *
 * If the supplied fragment builder produces an invalid node (e.g. the wrong
 * node type), these will return `undefined`. This is not to be confused with
 * a return value of `null`, which may result from the lack of a node.
 */
var buildRQL = {
  Fragment: function Fragment(fragmentBuilder, values) {
    var node = fragmentCache.get(fragmentBuilder);
    if (node) {
      return QueryBuilder.getFragment(node);
    }
    var variables = toVariables(values);
    !!isDeprecatedCallWithArgCountGreaterThan(fragmentBuilder, 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: Deprecated usage detected. If you are trying to define a ' + 'fragment, use `variables => Relay.QL`.') : invariant(false) : undefined;
    node = fragmentBuilder(variables);
    var fragment = node != null ? QueryBuilder.getFragment(node) : null;
    if (!fragment) {
      return fragment;
    }
    if (concreteFragmentIDSet.has(fragment.id)) {
      fragment = _extends({}, fragment, {
        id: generateConcreteFragmentID()
      });
    }
    concreteFragmentIDSet.add(fragment.id);
    fragmentCache.set(fragmentBuilder, fragment);
    return fragment;
  },

  Query: function Query(queryBuilder, Component, queryName, values) {
    var componentCache = queryCache.get(queryBuilder);
    var node = undefined;
    if (!componentCache) {
      componentCache = new Map();
      queryCache.set(queryBuilder, componentCache);
    } else {
      node = componentCache.get(Component);
    }
    if (!node) {
      var _variables = toVariables(values);
      !!isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 2) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: Deprecated usage detected. If you are trying to define a ' + 'query, use `(Component, variables) => Relay.QL`.') : invariant(false) : undefined;
      if (isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 0)) {
        node = queryBuilder(Component, _variables);
      } else {
        node = queryBuilder(Component, _variables);
        var query = QueryBuilder.getQuery(node);
        if (query) {
          (function () {
            var hasFragment = false;
            var hasScalarFieldsOnly = true;
            if (query.children) {
              query.children.forEach(function (child) {
                if (child) {
                  hasFragment = hasFragment || child.kind === 'Fragment';
                  hasScalarFieldsOnly = hasScalarFieldsOnly && child.kind === 'Field' && (!child.children || child.children.length === 0);
                }
              });
            }
            if (!hasFragment) {
              var children = query.children ? [].concat(_toConsumableArray(query.children)) : [];
              !hasScalarFieldsOnly ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: Expected query `%s` to be empty. For example, use ' + '`node(id: $id)`, not `node(id: $id) { ... }`.', query.fieldName) : invariant(false) : undefined;
              var fragmentVariables = filterObject(_variables, function (_, name) {
                return Component.hasVariable(name);
              });
              children.push(Component.getFragment(queryName, fragmentVariables));
              node = _extends({}, query, {
                children: children
              });
            }
          })();
        }
      }
      componentCache.set(Component, node);
    }
    if (node) {
      return QueryBuilder.getQuery(node) || undefined;
    }
    return null;
  }
};

function toVariables(variables) // ConcreteCallVariable should flow into mixed
{
  return mapObject(variables, function (_, name) {
    return QueryBuilder.createCallVariable(name);
  });
}

RelayProfiler.instrumentMethods(buildRQL, {
  Fragment: 'buildRQL.Fragment',
  Query: 'buildRQL.Query'
});

module.exports = buildRQL;