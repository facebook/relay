/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule printRelayQuery
 * @typechecks
 * @flow
 */

'use strict';

import type {Call, PrintedQuery} from 'RelayInternalTypes';
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');

var invariant = require('invariant');
var mapObject = require('mapObject');

type PrinterState = {
  fragmentMap: {[fragmentID: string]: string};
  nextVariableID: number;
  variableMap: {[variableID: string]: Variable};
};
type Variable = {
  type: string;
  value: mixed;
};

/**
 * @internal
 *
 * `printRelayQuery(query)` returns a string representation of the query. The
 * supplied `node` must be flattened (and not contain fragments).
 */
function printRelayQuery(node: RelayQuery.Node): PrintedQuery {
  var printerState = {
    fragmentMap: {},
    nextVariableID: 0,
    variableMap: {},
  };
  var queryText = null;
  if (node instanceof RelayQuery.Root) {
    queryText = printRoot(node, printerState);
  } else if (node instanceof RelayQuery.Fragment) {
    queryText = printFragment(node, printerState);
  } else if (node instanceof RelayQuery.Field) {
    queryText = printField(node, printerState);
  } else if (node instanceof RelayQuery.Mutation) {
    queryText = printMutation(node, printerState);
  }
  invariant(
    queryText,
    'printRelayQuery(): Unsupported node type.'
  );
  // Reassign to preserve Flow type refinement within closure.
  var text = queryText;
  Object.keys(printerState.fragmentMap).forEach(fragmentID => {
    var fragmentText = printerState.fragmentMap[fragmentID];
    if (fragmentText) {
      text = text + ' ' + fragmentText;
    }
  });
  var variables = mapObject(
    printerState.variableMap,
    variable => variable.value
  );
  return {
    text,
    variables,
  };
}

function printRoot(
  node: RelayQuery.Root,
  printerState: PrinterState
): string {
  invariant(
    !node.getBatchCall(),
    'printRelayQuery(): Deferred queries are not supported.'
  );

  var queryString = node.getName();
  var rootCall = node.getRootCall();
  var rootArgumentName = node.getRootCallArgument();
  var rootFieldString = rootCall.name;
  if (rootCall.value != null) {
    invariant(
      rootArgumentName,
      'printRelayQuery(): Expected an argument name for root field `%s`.',
      rootCall.name
    );
    var rootArgString = printArgument(
      rootArgumentName,
      rootCall.value,
      node.getCallType(),
      printerState
    );
    if (rootArgString) {
      rootFieldString += '(' + rootArgString + ')';
    }
  }

  var argStrings = null;
  Object.keys(printerState.variableMap).forEach(variableID => {
    var variable = printerState.variableMap[variableID];
    if (variable) {
      argStrings = argStrings || [];
      argStrings.push('$' + variableID + ':' + variable.type);
    }
  });
  if (argStrings) {
    queryString += '(' + argStrings.join(',') + ')';
  }

  return 'query ' + queryString + '{' +
    rootFieldString + printChildren(node, printerState) + '}';
}

function printMutation(
  node: RelayQuery.Mutation,
  printerState: PrinterState
): string {
  var inputName = node.getCallVariableName();
  var call = '(' + inputName + ':$' + inputName + ')';
  return 'mutation ' + node.getName() + '($' + inputName + ':' +
    node.getInputType() + ')' + '{' +
    node.getCall().name + call +
    printChildren(node, printerState) + '}';
}

function printFragment(
  node: RelayQuery.Fragment,
  printerState: PrinterState
): string {
  return 'fragment ' + node.getDebugName() + ' on ' +
    node.getType() + printChildren(node, printerState);
}

function printInlineFragment(
  node: RelayQuery.Fragment,
  printerState: PrinterState
): string {
  var fragmentID = node.getFragmentID();
  var {fragmentMap} = printerState;
  if (!(fragmentID in fragmentMap)) {
    fragmentMap[fragmentID] = 'fragment ' + fragmentID + ' on ' +
      node.getType() + printChildren(node, printerState);
  }
  return '...' + fragmentID;
}

function printField(
  node: RelayQuery.Field,
  printerState: PrinterState
): string {
  invariant(
    node instanceof RelayQuery.Field,
    'printRelayQuery(): Query must be flattened before printing.'
  );
  var schemaName = node.getSchemaName();
  var serializationKey = node.getSerializationKey();
  var callsWithValues = node.getCallsWithValues();
  var fieldString = schemaName;
  var argStrings = null;
  if (callsWithValues.length) {
    callsWithValues.forEach(({name, value}) => {
      var argString = printArgument(
        name,
        value,
        node.getCallType(name),
        printerState
      );
      if (argString) {
        argStrings = argStrings || [];
        argStrings.push(argString);
      }
    });
    if (argStrings) {
      fieldString += '(' + argStrings.join(',') + ')';
    }
  }
  return (serializationKey !== schemaName ? serializationKey + ':' : '') +
    fieldString + printChildren(node, printerState);
}

function printChildren(
  node: RelayQuery.Node,
  printerState: PrinterState
): string {
  var children = node.getChildren().map(node => {
    if (node instanceof RelayQuery.Field) {
      return printField(node, printerState);
    } else {
      invariant(
        node instanceof RelayQuery.Fragment,
        'printRelayQuery(): expected child node to be a `Field` or ' +
        '`Fragment`, got `%s`.',
        node.constructor.name
      );
      return printInlineFragment(node, printerState);
    }
  });
  if (!children.length) {
    return '';
  }
  return '{' + children.join(',') + '}';
}

function printArgument(
  name: string,
  value: mixed,
  type: ?string,
  printerState: PrinterState
): ?string {
  var stringValue;
  if (value == null) {
    return value;
  }
  if (type != null) {
    var variableID = createVariable(name, value, type, printerState);
    stringValue = '$' + variableID;
  } else {
    stringValue = JSON.stringify(value);
  }
  return name + ':' + stringValue;
}

function createVariable(
  name: string,
  value: mixed,
  type: string,
  printerState: PrinterState
): string {
  var variableID = printerState.nextVariableID.toString(36);
  printerState.nextVariableID++;
  printerState.variableMap[variableID] = {
    type,
    value,
  };
  return variableID;
}

module.exports = RelayProfiler.instrument(
  'printRelayQuery',
  printRelayQuery
);
