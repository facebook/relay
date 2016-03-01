/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule callsFromGraphQL
 * 
 * @typechecks
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 * @internal
 *
 * Convert from GraphQL call nodes to plain object `{name,value}` calls.
 */
function callsFromGraphQL(concreteCalls, variables) {
  // $FlowIssue: ConcreteCall should flow into CallOrDirective
  var callsOrDirectives = concreteCalls;
  var orderedCalls = [];
  for (var ii = 0; ii < callsOrDirectives.length; ii++) {
    var _callsOrDirectives$ii = callsOrDirectives[ii];
    var name = _callsOrDirectives$ii.name;
    var value = _callsOrDirectives$ii.value;

    if (value != null) {
      if (Array.isArray(value)) {
        value = value.map(function (arg) {
          return getCallValue(arg, variables);
        });
      } else if (value.kind === 'BatchCallVariable') {
        // Batch calls are handled separately
        value = null;
      } else {
        value = getCallValue(value, variables);
      }
    }
    orderedCalls.push({ name: name, value: value });
  }
  return orderedCalls;
}

function getCallValue(value, variables) {
  if (value.kind === 'CallValue') {
    return value.callValue;
  } else {
    var variableName = value.callVariableName;
    !variables.hasOwnProperty(variableName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'callsFromGraphQL(): Expected a declared value for variable, `$%s`.', variableName) : invariant(false) : undefined;
    return variables[variableName];
  }
}

module.exports = callsFromGraphQL;