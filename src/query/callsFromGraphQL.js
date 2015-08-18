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

var GraphQL = require('GraphQL');
import type {Call, CallValue} from 'RelayInternalTypes';
import type {Variables} from 'RelayTypes';

var invariant = require('invariant');

/**
 * @internal
 *
 * Convert from GraphQL call nodes to plain object `{name,value}` calls.
 */
function callsFromGraphQL(
  concreteCalls: Array<GraphQL.Call>,
  variables: Variables
): Array<Call> {
  var orderedCalls = [];
  for (var ii = 0; ii < concreteCalls.length; ii++) {
    var {name, value} = concreteCalls[ii];
    // Batch calls are handled separately
    if (
      GraphQL.isBatchCallVariable(value) ||
      (Array.isArray(value) && value.some(GraphQL.isBatchCallVariable))
    ) {
      value = null;
    } else if (Array.isArray(value)) {
      value = value.map(arg => getCallValue(arg, variables));
    } else if (value != null) {
      value = getCallValue(value, variables);
    }

    orderedCalls.push({name, value});
  }
  return orderedCalls;
}

function getCallValue(
  arg: GraphQL.CallValue | GraphQL.CallVariable | GraphQL.BatchCallVariable,
  variables: Variables
): ?CallValue {
  if (GraphQL.isCallVariable(arg)) {
    var variableName = arg.callVariableName;
    invariant(
      variables.hasOwnProperty(variableName),
      'callsFromGraphQL(): Expected a declared value for variable, `$%s`.',
      variableName
    );
    return variables[variableName];
  } else {
    invariant(
      GraphQL.isCallValue(arg),
      'callsFromGraphQL(): Expected an inline value or variable, got `%s`.',
      JSON.stringify(arg)
    );
    return (arg.callValue: any);
  }
}

module.exports = callsFromGraphQL;
