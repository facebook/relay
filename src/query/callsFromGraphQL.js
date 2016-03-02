/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule callsFromGraphQL
 * @flow
 * @typechecks
 */

'use strict';

import type {
  ConcreteCall,
  ConcreteValue,
  ConcreteCallValue,
  ConcreteCallVariable,
} from 'ConcreteQuery';
import type {Call, CallValue} from 'RelayInternalTypes';
import type {Variables} from 'RelayTypes';

const invariant = require('invariant');

type CallOrDirective = {
  name: string;
  value: ?ConcreteValue;
};

/**
 * @internal
 *
 * Convert from GraphQL call nodes to plain object `{name,value}` calls.
 */
function callsFromGraphQL(
  concreteCalls: Array<ConcreteCall>,
  variables: Variables
): Array<Call> {
  // $FlowIssue: ConcreteCall should flow into CallOrDirective
  var callsOrDirectives: Array<CallOrDirective> = (concreteCalls: $FlowIssue);
  var orderedCalls = [];
  for (var ii = 0; ii < callsOrDirectives.length; ii++) {
    var {name, value} = callsOrDirectives[ii];
    if (value != null) {
      if (Array.isArray(value)) {
        value = value.map(arg => getCallValue(arg, variables));
      } else if (value.kind === 'BatchCallVariable') {
        // Batch calls are handled separately
        value = null;
      } else {
        value = getCallValue(value, variables);
      }
    }
    orderedCalls.push({name, value});
  }
  return orderedCalls;
}

function getCallValue(
  concreteValue: ConcreteCallValue | ConcreteCallVariable,
  variables: Variables
): ?CallValue {
  let callValue;
  if (concreteValue.kind === 'CallValue') {
    callValue = concreteValue.callValue;
  } else {
    var variableName = concreteValue.callVariableName;
    invariant(
      variables.hasOwnProperty(variableName),
      'callsFromGraphQL(): Expected a declared value for variable, `$%s`.',
      variableName
    );
    callValue = variables[variableName];
  }
  const valueType = typeof callValue;
  // Perform a shallow check to ensure the value conforms to `CallValue` type:
  // skip testing recursive array/object values.
  invariant (
    callValue == null ||
    valueType === 'boolean' ||
    valueType === 'number' ||
    valueType === 'string' ||
    valueType === 'object' ||
    Array.isArray(valueType),
    'callsFromGraphQL(): Expected value to be null, a boolean, string, ' +
    'or an array/object of the same, but got `%s`.',
    JSON.stringify(callValue)
  );
  return (callValue: any);
}

module.exports = callsFromGraphQL;
