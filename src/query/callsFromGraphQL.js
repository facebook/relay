/**
 * Copyright 2013-2015, Facebook, Inc.
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
        value = value.map(arg => getCallVaue(arg, variables));
      } else if (value.kind === 'BatchCallVariable') {
        // Batch calls are handled separately
        value = null;
      } else {
        value = getCallVaue(value, variables);
      }
    }
    orderedCalls.push({name, value});
  }
  return orderedCalls;
}

function getCallVaue(
  value: ConcreteCallValue | ConcreteCallVariable,
  variables: Variables
): ?CallValue {
  if (value.kind === 'CallValue') {
    return value.callValue;
  } else {
    var variableName = value.callVariableName;
    invariant(
      variables.hasOwnProperty(variableName),
      'callsFromGraphQL(): Expected a declared value for variable, `$%s`.',
      variableName
    );
    return variables[variableName];
  }
}

module.exports = callsFromGraphQL;
