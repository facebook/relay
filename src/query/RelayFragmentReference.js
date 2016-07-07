/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentReference
 * @flow
 */

'use strict';

import type {ConcreteFragment} from 'ConcreteQuery';
const QueryBuilder = require('QueryBuilder');
import type RelayMetaRoute from 'RelayMetaRoute';
import type {Variables} from 'RelayTypes';

const forEachObject = require('forEachObject');
const invariant = require('invariant');
const warning = require('warning');

type Condition = {
  passingValue: boolean,
  variable: string,
};
type FragmentGetter = () => ConcreteFragment;
type PrepareVariablesCallback = (
  prevVariables: Variables,
  route: RelayMetaRoute
) => Variables;
export type VariableMapping = {[key: string]: mixed};

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
  _fragment: ?ConcreteFragment;
  _fragmentGetter: FragmentGetter;
  _isContainerFragment: boolean;
  _isDeferred: boolean;
  _isTypeConditional: boolean;
  _variableMapping: ?VariableMapping;
  _prepareVariables: ?PrepareVariablesCallback;

  static createForContainer(
    fragmentGetter: FragmentGetter,
    initialVariables?: ?Variables,
    variableMapping?: ?VariableMapping,
    prepareVariables?: ?PrepareVariablesCallback
  ): RelayFragmentReference {
    const reference = new RelayFragmentReference(
      fragmentGetter,
      initialVariables,
      variableMapping,
      prepareVariables
    );
    reference._isContainerFragment = true;
    return reference;
  }

  constructor(
    fragmentGetter: FragmentGetter,
    initialVariables?: ?Variables,
    variableMapping?: ?VariableMapping,
    prepareVariables?: ?PrepareVariablesCallback
  ) {
    this._conditions = null;
    this._initialVariables = initialVariables || {};
    this._fragment = undefined;
    this._fragmentGetter = fragmentGetter;
    this._isContainerFragment = false;
    this._isDeferred = false;
    this._isTypeConditional = false;
    this._variableMapping = variableMapping;
    this._prepareVariables = prepareVariables;
  }

  conditionOnType(): RelayFragmentReference {
    this._isTypeConditional = true;
    return this;
  }

  getConditions(): ?Array<Condition> {
    return this._conditions;
  }

  getFragmentUnconditional(): ConcreteFragment {
    let fragment = this._fragment;
    if (fragment == null) {
      fragment = this._fragmentGetter();
      this._fragment = fragment;
    }
    return fragment;
  }

  getInitialVariables(): Variables {
    return this._initialVariables;
  }

  getVariableMapping(): ?VariableMapping {
    return this._variableMapping;
  }

  /**
   * Mark this usage of the fragment as deferred.
   */
  defer(): RelayFragmentReference {
    this._isDeferred = true;
    return this;
  }

  /**
   * Mark this fragment for inclusion only if the given variable is truthy.
   */
  if(value: any): RelayFragmentReference {
    const callVariable = QueryBuilder.getCallVariable(value);
    invariant(
      callVariable,
      'RelayFragmentReference: Invalid value `%s` supplied to `if()`. ' +
      'Expected a variable.',
      callVariable
    );
    this._addCondition({
      passingValue: true,
      variable: callVariable.callVariableName,
    });
    return this;
  }

  /**
   * Mark this fragment for inclusion only if the given variable is falsy.
   */
  unless(value: any): RelayFragmentReference {
    const callVariable = QueryBuilder.getCallVariable(value);
    invariant(
      callVariable,
      'RelayFragmentReference: Invalid value `%s` supplied to `unless()`. ' +
      'Expected a variable.',
      callVariable
    );
    this._addCondition({
      passingValue: false,
      variable: callVariable.callVariableName,
    });
    return this;
  }

  /**
   * Get the referenced fragment if all conditions are met.
   */
  getFragment(variables: Variables): ?ConcreteFragment {
    // determine if the variables match the supplied if/unless conditions
    const conditions = this._conditions;
    if (conditions && !conditions.every(({variable, passingValue}) => {
      return !!variables[variable] === passingValue;
    })) {
      return null;
    }
    return this.getFragmentUnconditional();
  }

  /**
   * Get the variables to pass to the referenced fragment, accounting for
   * initial values, overrides, and route-specific variables.
   */
  getVariables(route: RelayMetaRoute, variables: Variables): Variables {
    let innerVariables = {...this._initialVariables};

    // map variables from outer -> inner scope
    const variableMapping = this._variableMapping;
    if (variableMapping) {
      forEachObject(variableMapping, (value, name) => {
        const callVariable = QueryBuilder.getCallVariable(value);
        if (callVariable) {
          value = variables[callVariable.callVariableName];
        }
        if (value === undefined) {
          warning(
            false,
            'RelayFragmentReference: Variable `%s` is undefined in fragment ' +
            '`%s`.',
            name,
            this.getFragmentUnconditional().name
          );
        } else {
          innerVariables[name] = value;
        }
      });
    }

    const prepareVariables = this._prepareVariables;
    if (prepareVariables) {
      innerVariables = prepareVariables(innerVariables, route);
    }

    return innerVariables;
  }

  isContainerFragment(): boolean {
    return this._isContainerFragment;
  }

  isDeferred(): boolean {
    return this._isDeferred;
  }

  isTypeConditional(): boolean {
    return this._isTypeConditional;
  }

  _addCondition(condition: Condition): void {
    let conditions = this._conditions;
    if (!conditions) {
      conditions = [];
      this._conditions = conditions;
    }
    conditions.push(condition);
  }
}

module.exports = RelayFragmentReference;
