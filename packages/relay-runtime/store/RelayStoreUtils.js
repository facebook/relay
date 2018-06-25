/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');

const getRelayHandleKey = require('../util/getRelayHandleKey');
const invariant = require('invariant');
const stableCopy = require('../util/stableCopy');

import type {
  ConcreteArgument,
  ConcreteField,
  ConcreteHandle,
} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';

export type Arguments = {[argName: string]: mixed};

const {VARIABLE} = RelayConcreteNode;

/**
 * Returns the values of field/fragment arguments as an object keyed by argument
 * names. Guaranteed to return a result with stable ordered nested values.
 */
function getArgumentValues(
  args: Array<ConcreteArgument>,
  variables: Variables,
): Arguments {
  const values = {};
  args.forEach(arg => {
    if (arg.kind === VARIABLE) {
      // Variables are provided at runtime and are not guaranteed to be stable.
      values[arg.name] = getStableVariableValue(arg.variableName, variables);
    } else {
      // The Relay compiler generates stable ConcreteArgument values.
      values[arg.name] = arg.value;
    }
  });
  return values;
}

/**
 * Given a handle field and variable values, returns a key that can be used to
 * uniquely identify the combination of the handle name and argument values.
 *
 * Note: the word "storage" here refers to the fact this key is primarily used
 * when writing the results of a key in a normalized graph or "store". This
 * name was used in previous implementations of Relay internals and is also
 * used here for consistency.
 */
function getHandleStorageKey(
  handleField: ConcreteHandle,
  variables: Variables,
): string {
  const {handle, key, name, args, filters} = handleField;
  const handleName = getRelayHandleKey(handle, key, name);
  if (!args || !filters || args.length === 0 || filters.length === 0) {
    return handleName;
  }
  const filterArgs = args.filter(arg => filters.indexOf(arg.name) > -1);
  return formatStorageKey(handleName, getArgumentValues(filterArgs, variables));
}

/**
 * Given a field and variable values, returns a key that can be used to
 * uniquely identify the combination of the field name and argument values.
 *
 * Note: the word "storage" here refers to the fact this key is primarily used
 * when writing the results of a key in a normalized graph or "store". This
 * name was used in previous implementations of Relay internals and is also
 * used here for consistency.
 */
function getStorageKey(
  field: ConcreteField | ConcreteHandle,
  variables: Variables,
): string {
  if (field.storageKey) {
    // TODO T23663664: Handle nodes do not yet define a static storageKey.
    return (field: $FlowFixMe).storageKey;
  }
  const {args, name} = field;
  return args && args.length !== 0
    ? formatStorageKey(name, getArgumentValues(args, variables))
    : name;
}

/**
 * Given a `name` (eg. "foo") and an object representing argument values
 * (eg. `{orberBy: "name", first: 10}`) returns a unique storage key
 * (ie. `foo{"first":10,"orderBy":"name"}`).
 *
 * This differs from getStorageKey which requires a ConcreteNode where arguments
 * are assumed to already be sorted into a stable order.
 */
function getStableStorageKey(name: string, args: ?Arguments): string {
  return formatStorageKey(name, stableCopy(args));
}

/**
 * Given a name and argument values, format a storage key.
 *
 * Arguments and the values within them are expected to be ordered in a stable
 * alphabetical ordering.
 */
function formatStorageKey(name: string, argValues: ?Arguments): string {
  if (!argValues) {
    return name;
  }
  const values = [];
  for (const argName in argValues) {
    if (argValues.hasOwnProperty(argName)) {
      const value = argValues[argName];
      if (value != null) {
        values.push(argName + ':' + JSON.stringify(value));
      }
    }
  }
  return values.length === 0 ? name : name + `(${values.join(',')})`;
}

/**
 * Given Variables and a variable name, return a variable value with
 * all values in a stable order.
 */
function getStableVariableValue(name: string, variables: Variables): mixed {
  invariant(
    variables.hasOwnProperty(name),
    'getVariableValue(): Undefined variable `%s`.',
    name,
  );
  return stableCopy(variables[name]);
}

/**
 * Constants shared by all implementations of RecordSource/MutableRecordSource/etc.
 */
const RelayStoreUtils = {
  FRAGMENTS_KEY: '__fragments',
  ID_KEY: '__id',
  REF_KEY: '__ref',
  REFS_KEY: '__refs',
  ROOT_ID: 'client:root',
  ROOT_TYPE: '__Root',
  TYPENAME_KEY: '__typename',
  UNPUBLISH_RECORD_SENTINEL: Object.freeze({__UNPUBLISH_RECORD_SENTINEL: true}),
  UNPUBLISH_FIELD_SENTINEL: Object.freeze({__UNPUBLISH_FIELD_SENTINEL: true}),

  getArgumentValues,
  getHandleStorageKey,
  getStorageKey,
  getStableStorageKey,
};

module.exports = RelayStoreUtils;
