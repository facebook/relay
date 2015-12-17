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
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');

const base62 = require('base62');
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const mapObject = require('mapObject');

type PrinterState = {
  fragmentCount: number;
  fragmentMap: {[fragmentID: string]: {name: string, text: string}};
  variableCount: number;
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
  const printerState = {
    fragmentCount: 0,
    fragmentMap: {},
    variableCount: 0,
    variableMap: {},
  };
  let queryText = null;
  if (node instanceof RelayQuery.Root) {
    queryText = printRoot(node, printerState);
  } else if (node instanceof RelayQuery.Mutation) {
    queryText = printMutation(node, printerState);
  } else {
    // NOTE: `node` shouldn't be a field or fragment except for debugging. There
    // is no guarantee that it would be a valid server request if printed.
    if (node instanceof RelayQuery.Fragment) {
      queryText = printFragment(node, printerState);
    } else if (node instanceof RelayQuery.Field) {
      queryText = printField(node, printerState);
    }
  }
  invariant(
    queryText,
    'printRelayOSSQuery(): Unsupported node type.'
  );
  // Reassign to preserve Flow type refinement within closure.
  let text = queryText;
  forEachObject(printerState.fragmentMap, fragment => {
    text = text + ' ' + fragment.text;
  });
  const variables = mapObject(
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
  let fieldName = node.getFieldName();
  if (identifyingArgValue != null) {
    invariant(
      identifyingArgName,
      'printRelayOSSQuery(): Expected an argument name for root field `%s`.',
      fieldName
    );
    const rootArgString = printArgument(
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
  const children = printChildren(node, printerState);
  const queryString = node.getName() + printVariableDefinitions(printerState);
  fieldName += printDirectives(node);

  return 'query ' + queryString + '{' + fieldName + children + '}';
}

function printMutation(
  node: RelayQuery.Mutation,
  printerState: PrinterState
): string {
  const call = node.getCall();
  const inputString = printArgument(
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
  const children = printChildren(node, printerState);
  const mutationString = node.getName() + printVariableDefinitions(printerState);
  const fieldName = call.name + '(' + inputString + ')';

  return 'mutation ' + mutationString + '{' + fieldName + children + '}';
}

function printVariableDefinitions(printerState: PrinterState): string {
  let argStrings = null;
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
  const directives = printDirectives(node);
  return 'fragment ' + node.getDebugName() + ' on ' +
    node.getType() + directives + printChildren(node, printerState);
}

function printInlineFragment(
  node: RelayQuery.Fragment,
  printerState: PrinterState
): ?string {
  if (!node.getChildren().length) {
    return null;
  }
  let fragmentName;
  const fragmentID = node.getFragmentID();
  const fragmentMap = printerState.fragmentMap;
  if (fragmentMap.hasOwnProperty(fragmentID)) {
    fragmentName = fragmentMap[fragmentID].name;
  } else {
    const directives = printDirectives(node);
    fragmentName = 'F' + base62(printerState.fragmentCount++);
    fragmentMap[fragmentID] = {
      name: fragmentName,
      text: 'fragment ' + fragmentName + ' on ' + node.getType() + directives +
        printChildren(node, printerState),
    };
  }
  return '...' + fragmentName;
}

function printField(
  node: RelayQuery.Field,
  printerState: PrinterState
): string {
  invariant(
    node instanceof RelayQuery.Field,
    'printRelayOSSQuery(): Query must be flattened before printing.'
  );
  const schemaName = node.getSchemaName();
  const serializationKey = node.getSerializationKey();
  const callsWithValues = node.getCallsWithValues();
  let fieldString = schemaName;
  let argStrings = null;
  if (callsWithValues.length) {
    callsWithValues.forEach(({name, value}) => {
      const argString = printArgument(
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
  const directives = printDirectives(node);
  return (serializationKey !== schemaName ? serializationKey + ':' : '') +
    fieldString + directives + printChildren(node, printerState);
}

function printChildren(
  node: RelayQuery.Node,
  printerState: PrinterState
): string {
  let children;
  node.getChildren().forEach(node => {
    if (node instanceof RelayQuery.Field) {
      children = children || [];
      children.push(printField(node, printerState));
    } else {
      invariant(
        node instanceof RelayQuery.Fragment,
        'printRelayOSSQuery(): expected child node to be a `Field` or ' +
        '`Fragment`, got `%s`.',
        node.constructor.name
      );
      const printedFragment = printInlineFragment(node, printerState);
      if (printedFragment) {
        children = children || [];
        children.push(printedFragment);
      }
    }
  });
  if (!children) {
    return '';
  }
  return '{' + children.join(',') + '}';
}

function printDirectives(node) {
  let directiveStrings;
  node.getDirectives().forEach(directive => {
    let dirString = '@' + directive.name;
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
  if (value == null) {
    return value;
  }
  let stringValue;
  if (type != null) {
    const variableID = createVariable(name, value, type, printerState);
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
  const variableID = name + '_' + base62(printerState.variableCount++);
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
