/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule printRelayOSSQuery
 * @typechecks
 * @flow
 */

'use strict';

import type {PrintedQuery} from 'RelayInternalTypes';
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');

var forEachObject = require('forEachObject');
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
 * `printRelayOSSQuery(query)` returns a string representation of the query. The
 * supplied `node` must be flattened (and not contain fragments).
 */
function printRelayOSSQuery(node: RelayQuery.Node): PrintedQuery {
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
    'printRelayOSSQuery(): Unsupported node type.'
  );
  // Reassign to preserve Flow type refinement within closure.
  var text = queryText;
  forEachObject(printerState.fragmentMap, (fragmentText, fragmentID) => {
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
    'printRelayOSSQuery(): Deferred queries are not supported.'
  );
  const identifyingArg = node.getIdentifyingArg();
  const identifyingArgName = (identifyingArg && identifyingArg.name) || null;
  const identifyingArgType = (identifyingArg && identifyingArg.type) || null;
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  var fieldName = node.getFieldName();
  if (identifyingArgValue != null) {
    invariant(
      identifyingArgName,
      'printRelayOSSQuery(): Expected an argument name for root field `%s`.',
      fieldName
    );
    var rootArgString = printArgument(
      identifyingArgName,
      identifyingArgValue,
      identifyingArgType,
      printerState
    );
    if (rootArgString) {
      fieldName += '(' + rootArgString + ')';
    }
  }
  // Note: children must be traversed before printing variable definitions
  var children = printChildren(node, printerState);
  var queryString = node.getName() + printVariableDefinitions(printerState);
  fieldName += printDirectives(node);

  return 'query ' + queryString + '{' + fieldName + children + '}';
}

function printMutation(
  node: RelayQuery.Mutation,
  printerState: PrinterState
): string {
  var call = node.getCall();
  var inputString = printArgument(
    node.getCallVariableName(),
    call.value,
    node.getInputType(),
    printerState
  );
  invariant(
    inputString,
    'printRelayOSSQuery(): Expected mutation `%s` to have a value for `%s`.',
    node.getName(),
    node.getCallVariableName()
  );
  // Note: children must be traversed before printing variable definitions
  var children = printChildren(node, printerState);
  var mutationString = node.getName() + printVariableDefinitions(printerState);
  var fieldName = call.name + '(' + inputString + ')';

  return 'mutation ' + mutationString + '{' + fieldName + children + '}';
}

function printVariableDefinitions(printerState: PrinterState): string {
  var argStrings = null;
  forEachObject(printerState.variableMap, (variable, variableID) => {
    argStrings = argStrings || [];
    argStrings.push('$' + variableID + ':' + variable.type);
  });
  if (argStrings) {
    return '(' + argStrings.join(',') + ')';
  }
  return '';
}

function printFragment(
  node: RelayQuery.Fragment,
  printerState: PrinterState
): string {
  var directives = printDirectives(node);
  return 'fragment ' + node.getDebugName() + ' on ' +
    node.getType() + directives + printChildren(node, printerState);
}

function printInlineFragment(
  node: RelayQuery.Fragment,
  printerState: PrinterState
): string {
  var fragmentID = node.getFragmentID();
  var {fragmentMap} = printerState;
  if (!(fragmentID in fragmentMap)) {
    var directives = printDirectives(node);
    fragmentMap[fragmentID] = 'fragment ' + node.getFragmentID() + ' on ' +
      node.getType() + directives + printChildren(node, printerState);
  }
  return '...' + fragmentID;
}

function printField(
  node: RelayQuery.Field,
  printerState: PrinterState
): string {
  invariant(
    node instanceof RelayQuery.Field,
    'printRelayOSSQuery(): Query must be flattened before printing.'
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
  var directives = printDirectives(node);
  return (serializationKey !== schemaName ? serializationKey + ':' : '') +
    fieldString + directives + printChildren(node, printerState);
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
        'printRelayOSSQuery(): expected child node to be a `Field` or ' +
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

function printDirectives(node) {
  var directiveStrings;
  node.getDirectives().forEach(directive => {
    var dirString = '@' + directive.name;
    if (directive.arguments.length) {
      dirString +=
        '(' + directive.arguments.map(printDirective).join(',') + ')';
    }
    directiveStrings = directiveStrings || [];
    directiveStrings.push(dirString);
  });
  if (!directiveStrings) {
    return '';
  }
  return ' ' + directiveStrings.join(' ');
}

function printDirective({name, value}) {
  invariant(
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string',
    'printRelayOSSQuery(): Relay only supports directives with scalar values ' +
    '(boolean, number, or string), got `%s: %s`.',
    name,
    value
  );
  return name + ':' + JSON.stringify(value);
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
  var variableID = name + '_' + printerState.nextVariableID.toString(36);
  printerState.nextVariableID++;
  printerState.variableMap[variableID] = {
    type,
    value,
  };
  return variableID;
}

module.exports = RelayProfiler.instrument(
  'printRelayQuery',
  printRelayOSSQuery
);
