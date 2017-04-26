/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStoreUtils
 * @flow
 */

'use strict';

const RelayConcreteNode = require('RelayConcreteNode');

const invariant = require('invariant');
const stableJSONStringify = require('stableJSONStringify');

import type {
  ConcreteArgument,
  ConcreteField,
} from 'RelayConcreteNode';
import type {Variables} from 'RelayTypes';

const {VARIABLE} = RelayConcreteNode;

/**
 * Returns the values of field/fragment arguments as an object keyed by argument
 * names.
 */
function getArgumentValues(
  args: Array<ConcreteArgument>,
  variables: Variables
): Variables {
  const values = {};
  args.forEach(arg => {
    if (arg.kind === VARIABLE) {
      values[arg.name] = getVariableValue(arg.variableName, variables);
    } else {
      values[arg.name] = arg.value;
    }
  });
  return values;
}

function getHandleFilterValues(
  args: Array<ConcreteArgument>,
  filters: Array<string>,
  variables: Variables
): Variables {
  const filterArgs = args.filter(arg => filters.indexOf(arg.name) > -1);
  return getArgumentValues(filterArgs, variables);
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
function getStorageKey(field: ConcreteField, variables: Variables): string {
  if (field.storageKey) {
    return field.storageKey;
  }
  const {args, name} = field;
  if (!args || !args.length) {
    return name;
  }
  const values = [];
  args.forEach(arg => {
    let value;
    if (arg.kind === VARIABLE) {
      value = getVariableValue(arg.variableName, variables);
    } else {
      value = arg.value;
    }
    if (value != null) {
      values.push(`"${arg.name}":${stableJSONStringify(value)}`);
    }
  });
  if (values.length) {
    return field.name + `{${values.join(',')}}`;
  } else {
    return field.name;
  }
}

function getVariableValue(name: string, variables: Variables): mixed {
  invariant(
    variables.hasOwnProperty(name),
    'getVariableValue(): Undefined variable `%s`.',
    name
  );
  return variables[name];
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
  getStorageKey,
  getHandleFilterValues,
};

module.exports = RelayStoreUtils;
