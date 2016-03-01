/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentReference
 * @typechecks
 * 
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var QueryBuilder = require('./QueryBuilder');

var forEachObject = require('fbjs/lib/forEachObject');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

/**
 * @internal
 *
 * RelayFragmentReference is the return type of fragment composition:
 *
 *   fragment on Foo {
 *     ${Child.getFragment('bar', {baz: variables.qux})}
 *   }
 *
 * Whereas a fragment defines a sub-query's structure, a fragment reference is
 * a particular instantiation of the fragment as it is composed within a query
 * or another fragment. It encodes the source fragment, initial variables, and
 * a mapping from variables in the composing query's (or fragment's) scope to
 * variables in the fragment's scope.
 *
 * The variable mapping is represented by `variableMapping`, a dictionary that
 * maps from names of variables in the parent scope to variables that exist in
 * the fragment. Example:
 *
 * ```
 * // Fragment:
 * var Container = Relay.createContainer(..., {
 *   initialVariables: {
 *     private: 'foo',
 *     public: 'bar',
 *     variable: null,
 *   },
 *   fragments: {
 *     foo: ...
 *   }
 * });
 *
 * // Reference:
 * ${Container.getQuery(
 *   'foo',
 *   // Variable Mapping:
 *   {
 *     public: 'BAR',
 *     variable: variables.source,
 *   }
 * )}
 * ```
 *
 * When evaluating the referenced fragment, `$public` will be overridden with
 * `'Bar'`. The value of `$variable` will become the value of `$source` in the
 * outer scope. This is analagous to:
 *
 * ```
 * function inner(private = 'foo', public = 'bar', variable) {}
 * function outer(source) {
 *   inner(public = 'BAR', variable = source);
 * }
 * ```
 *
 * Where the value of the inner `variable` depends on how `outer` is called.
 *
 * The `prepareVariables` function allows for variables to be modified based on
 * the runtime environment or route name.
 */

var RelayFragmentReference = (function () {
  RelayFragmentReference.createForContainer = function createForContainer(fragmentGetter, initialVariables, variableMapping, prepareVariables) {
    var reference = new RelayFragmentReference(fragmentGetter, initialVariables, variableMapping, prepareVariables);
    reference._isContainerFragment = true;
    return reference;
  };

  function RelayFragmentReference(fragmentGetter, initialVariables, variableMapping, prepareVariables) {
    _classCallCheck(this, RelayFragmentReference);

    this._initialVariables = initialVariables || {};
    this._fragment = undefined;
    this._fragmentGetter = fragmentGetter;
    this._isContainerFragment = false;
    this._isDeferred = false;
    this._variableMapping = variableMapping;
    this._prepareVariables = prepareVariables;
  }

  /**
   * Mark this usage of the fragment as deferred.
   */

  RelayFragmentReference.prototype.defer = function defer() {
    this._isDeferred = true;
    return this;
  };

  /**
   * Mark this fragment for inclusion only if the given variable is truthy.
   */

  RelayFragmentReference.prototype['if'] = function _if(value) {
    var callVariable = QueryBuilder.getCallVariable(value);
    !callVariable ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayFragmentReference: Invalid value `%s` supplied to `if()`. ' + 'Expected a variable.', callVariable) : invariant(false) : undefined;
    this._addCondition(function (variables) {
      return !!variables[callVariable.callVariableName];
    });
    return this;
  };

  /**
   * Mark this fragment for inclusion only if the given variable is falsy.
   */

  RelayFragmentReference.prototype.unless = function unless(value) {
    var callVariable = QueryBuilder.getCallVariable(value);
    !callVariable ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayFragmentReference: Invalid value `%s` supplied to `unless()`. ' + 'Expected a variable.', callVariable) : invariant(false) : undefined;
    this._addCondition(function (variables) {
      return !variables[callVariable.callVariableName];
    });
    return this;
  };

  /**
   * @private
   */

  RelayFragmentReference.prototype._getFragment = function _getFragment() {
    var fragment = this._fragment;
    if (fragment == null) {
      fragment = this._fragmentGetter();
      this._fragment = fragment;
    }
    return fragment;
  };

  /**
   * Get the referenced fragment if all conditions are met.
   */

  RelayFragmentReference.prototype.getFragment = function getFragment(variables) {
    // determine if the variables match the supplied if/unless conditions
    var conditions = this._conditions;
    if (conditions && !conditions.every(function (cb) {
      return cb(variables);
    })) {
      return null;
    }
    return this._getFragment();
  };

  /**
   * Get the variables to pass to the referenced fragment, accounting for
   * initial values, overrides, and route-specific variables.
   */

  RelayFragmentReference.prototype.getVariables = function getVariables(route, variables) {
    var _this = this;

    var innerVariables = _extends({}, this._initialVariables);

    // map variables from outer -> inner scope
    var variableMapping = this._variableMapping;
    if (variableMapping) {
      forEachObject(variableMapping, function (value, name) {
        var callVariable = QueryBuilder.getCallVariable(value);
        if (callVariable) {
          value = variables[callVariable.callVariableName];
        }
        if (value === undefined) {
          process.env.NODE_ENV !== 'production' ? warning(false, 'RelayFragmentReference: Variable `%s` is undefined in fragment ' + '`%s`.', name, _this._getFragment().name) : undefined;
        } else {
          innerVariables[name] = value;
        }
      });
    }

    var prepareVariables = this._prepareVariables;
    if (prepareVariables) {
      innerVariables = prepareVariables(innerVariables, route);
    }

    return innerVariables;
  };

  RelayFragmentReference.prototype.isContainerFragment = function isContainerFragment() {
    return this._isContainerFragment;
  };

  RelayFragmentReference.prototype.isDeferred = function isDeferred() {
    return this._isDeferred;
  };

  RelayFragmentReference.prototype._addCondition = function _addCondition(condition) {
    var conditions = this._conditions;
    if (!conditions) {
      conditions = [];
      this._conditions = conditions;
    }
    conditions.push(condition);
  };

  return RelayFragmentReference;
})();

module.exports = RelayFragmentReference;