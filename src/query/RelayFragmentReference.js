/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentReference
 * @typechecks
 * @flow
 */

'use strict';

var GraphQL = require('GraphQL');
import type RelayMetaRoute from 'RelayMetaRoute';
import type {Variables} from 'RelayTypes';

var forEachObject = require('forEachObject');
var getWeakIdForObject = require('getWeakIdForObject');
var invariant = require('invariant');

type Condition = (variables: Variables) => boolean;
type FragmentGetter = () => GraphQL.QueryFragment;
type PrepareVariablesCallback = (
  prevVariables: Variables,
  route: RelayMetaRoute
) => Variables;
type VariableMapping = {[key: string]: mixed};

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
class RelayFragmentReference {
  _conditions: ?Array<Condition>;
  _initialVariables: Variables;
  _fragment: ?GraphQL.QueryFragment;
  _fragmentGetter: FragmentGetter;
  _isDeferred: boolean;
  _isTypeConditional: boolean;
  _variableMapping: ?VariableMapping;
  _prepareVariables: ?PrepareVariablesCallback;

  constructor(
    fragmentGetter: FragmentGetter,
    initialVariables?: ?Variables,
    variableMapping?: ?VariableMapping,
    prepareVariables?: ?PrepareVariablesCallback
  ) {
    this._initialVariables = initialVariables || {};
    this._fragment = undefined;
    this._fragmentGetter = fragmentGetter;
    this._isDeferred = false;
    this._isTypeConditional = false;
    this._variableMapping = variableMapping;
    this._prepareVariables = prepareVariables;

    // Help find `getFragment` calls with undefined variable values.
    // For example, `${Child.getFragment('foo', {variable: undefined})}`.
    if (__DEV__) {
      if (variableMapping) {
        forEachObject(variableMapping, (variableValue, variableName) => {
          if (variableValue === undefined) {
            console.error(
              'RelayFragmentReference: Variable `%s` cannot be undefined.',
              variableName
            );
          }
        });
      }
    }
  }

  /**
   * Mark this usage of the fragment as deferred.
   */
  defer(): RelayFragmentReference {
    this._isDeferred = true;
    return this;
  }

  /**
   * Mark this usage of the fragment as conditional on its type.
   */
  conditionOnType(): RelayFragmentReference {
    this._isTypeConditional = true;
    return this;
  }

  /**
   * Mark this fragment for inclusion only if the given variable is truthy.
   */
  if(callVariable: any): RelayFragmentReference {
    invariant(
      GraphQL.isCallVariable(callVariable),
      'RelayFragmentReference: Invalid value `%s` supplied to `if()`. ' +
      'Expected a variable.',
      callVariable
    );
    this._addCondition(
      variables => !!variables[callVariable.callVariableName]
    );
    return this;
  }

  /**
   * Mark this fragment for inclusion only if the given variable is falsy.
   */
  unless(callVariable: any): RelayFragmentReference {
    invariant(
      GraphQL.isCallVariable(callVariable),
      'RelayFragmentReference: Invalid value `%s` supplied to `unless()`. ' +
      'Expected a variable.',
      callVariable
    );
    this._addCondition(
      variables => !variables[callVariable.callVariableName]
    );
    return this;
  }

  /**
   * @private
   *
   * Memoize the fragment so it has the same `getWeakIdForObject`.
   */
  _getFragment(): GraphQL.Fragment {
    if (this._fragment == null) {
      this._fragment = this._fragmentGetter();
    }
    return this._fragment;
  }

  /**
   * Get the referenced fragment if all conditions are met.
   */
  getFragment(variables: Variables): ?GraphQL.QueryFragment {
    // determine if the variables match the supplied if/unless conditions
    var conditions = this._conditions;
    if (conditions && !conditions.every(cb => cb(variables))) {
      return null;
    }
    return this._getFragment();
  }

  /**
   * Get the variables to pass to the referenced fragment, accounting for
   * initial values, overrides, and route-specific variables.
   */
  getVariables(route: RelayMetaRoute, variables: Variables): Variables {
    var innerVariables = {...this._initialVariables};

    // map variables from outer -> inner scope
    var variableMapping = this._variableMapping;
    if (variableMapping) {
      forEachObject(variableMapping, (value, name) => {
        if (GraphQL.isCallVariable(value)) {
          value = variables[value.callVariableName];
        }
        if (value !== undefined) {
          innerVariables[name] = value;
        }
      });
    }

    var prepareVariables = this._prepareVariables;
    if (prepareVariables) {
      innerVariables = prepareVariables(innerVariables, route);
    }

    return innerVariables;
  }

  getFragmentName(): string {
    return getWeakIdForObject(this._getFragment());
  }

  isTypeConditional(): boolean {
    return this._isTypeConditional;
  }

  isDeferred(): boolean {
    return this._isDeferred;
  }

  _addCondition(condition: Condition): void {
    var conditions = this._conditions;
    if (!conditions) {
      conditions = [];
      this._conditions = conditions;
    }
    conditions.push(condition);
  }
}

module.exports = RelayFragmentReference;
