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

const invariant = require('invariant');

import type {Call, CallValue} from '../tools/RelayInternalTypes';
import type {
  ConcreteCall,
  ConcreteValue,
  ConcreteCallValue,
  ConcreteCallVariable,
} from './ConcreteQuery';
import type {Variables} from 'RelayRuntime';

type CallOrDirective = {
  name: string,
  metadata?: {
    type?: ?string,
  },
  value: ?ConcreteValue,
};

/**
 * @internal
 *
 * Convert from GraphQL call nodes to plain object `{name,value}` calls.
 */
function callsFromGraphQL(
  concreteCalls: Array<ConcreteCall>,
  variables: Variables,
): Array<Call> {
  // $FlowIssue: ConcreteCall should flow into CallOrDirective
  const callsOrDirectives: Array<CallOrDirective> = (concreteCalls: $FlowIssue);
  const orderedCalls = [];
  for (let ii = 0; ii < callsOrDirectives.length; ii++) {
    const callOrDirective = callsOrDirectives[ii];
    let {value} = callOrDirective;
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
    const {metadata, name} = callOrDirective;
    const orderedCall: Call = {name, value};
    if (metadata && metadata.type) {
      orderedCall.type = metadata.type;
    }
    orderedCalls.push(orderedCall);
  }
  return orderedCalls;
}

function getCallValue(
  concreteValue: ConcreteCallValue | ConcreteCallVariable,
  variables: Variables,
): ?CallValue {
  let callValue;
  if (concreteValue.kind === 'CallValue') {
    callValue = concreteValue.callValue;
  } else {
    const variableName = concreteValue.callVariableName;
    invariant(
      variables.hasOwnProperty(variableName),
      'callsFromGraphQL(): Expected a declared value for variable, `$%s`.',
      variableName,
    );
    callValue = variables[variableName];
  }
  // Perform a shallow check to ensure the value conforms to `CallValue` type:
  // For performance reasons, skip recursively testing array/object values.
  const valueType = typeof callValue;
  invariant(
    callValue == null ||
      valueType === 'boolean' ||
      valueType === 'number' ||
      valueType === 'string' ||
      valueType === 'object',
    'callsFromGraphQL(): Expected argument value `%s` to either be null or a ' +
      'boolean, number, string, or array/object.',
    JSON.stringify(callValue),
  );
  return (callValue: any);
}

module.exports = callsFromGraphQL;
