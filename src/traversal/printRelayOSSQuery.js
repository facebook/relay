/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const Map = require('Map');
import type {PrintedQuery} from 'RelayInternalTypes';
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');

const base62 = require('base62');
const invariant = require('invariant');

type PrinterState = {
  fragmentCount: number;
  fragmentNameByHash: {[fragmentHash: string]: string};
  fragmentNameByText: {[fragmentText: string]: string};
  fragmentTexts: Array<string>;
  variableCount: number;
  variableMap: Map<string, Map<mixed, Variable>>;
};
type Variable = {
  value: mixed;
  variableID: string;
};

let oneIndent = '';
let newLine = '';

if (__DEV__) {
  oneIndent = '  ';
  newLine = '\n';
}

/**
 * @internal
 *
 * `printRelayOSSQuery(query)` returns a string representation of the query. The
 * supplied `node` must be flattened (and not contain fragments).
 */
function printRelayOSSQuery(node: RelayQuery.Node): PrintedQuery {
  const fragmentTexts = [];
  const variableMap = new Map();
  const printerState = {
    fragmentCount: 0,
    fragmentNameByHash: {},
    fragmentNameByText: {},
    fragmentTexts,
    variableCount: 0,
    variableMap,
  };
  let queryText = null;
  if (node instanceof RelayQuery.Root) {
    queryText = printRoot(node, printerState);
  } else if (node instanceof RelayQuery.Mutation) {
    queryText = printMutation(node, printerState);
  } else if (node instanceof RelayQuery.Fragment) {
    queryText = printFragment(node, printerState);
  }
  invariant(
    queryText,
    'printRelayOSSQuery(): Unsupported node type.'
  );
  const variables = {};
  variableMap.forEach(variablesForType => {
    variablesForType.forEach(({value, variableID}) => {
      variables[variableID] = value;
    });
  });

  return {
    text: [queryText, ...fragmentTexts].join(newLine.length ? newLine : ' '),
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
  const children = printChildren(node, printerState, oneIndent);
  const queryString = node.getName() + printVariableDefinitions(printerState);
  fieldName += printDirectives(node);

  return 'query ' + queryString + ' {' + newLine +
    oneIndent + fieldName + children + newLine + '}';
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
  const children = printChildren(node, printerState, oneIndent);
  const mutationString =
    node.getName() + printVariableDefinitions(printerState);
  const fieldName = call.name + '(' + inputString + ')';

  return 'mutation ' + mutationString + ' {' + newLine +
    oneIndent + fieldName + children + newLine + '}';
}

function printVariableDefinitions({variableMap}: PrinterState): string {
  let argStrings = null;
  variableMap.forEach((variablesForType, type) => {
    variablesForType.forEach(({variableID}) => {
      argStrings = argStrings || [];
      argStrings.push('$' + variableID + ':' + type);
    });
  });
  if (argStrings) {
    return '(' + argStrings.join(',') + ')';
  }
  return '';
}

function printNonNullType(type: string): string {
  if (type.endsWith('!')) {
    return type;
  }
  return type + '!';
}

function printFragment(
  node: RelayQuery.Fragment,
  printerState: PrinterState
): string {
  const directives = printDirectives(node);
  return 'fragment ' + node.getDebugName() + ' on ' +
    node.getType() + directives + printChildren(node, printerState, '');
}

function printChildren(
  node: RelayQuery.Node,
  printerState: PrinterState,
  indent: string
): string {
  const childrenText = [];
  const children = node.getChildren();
  let fragments;
  for (let ii = 0; ii < children.length; ii++) {
    const child = children[ii];
    if (child instanceof RelayQuery.Field) {
      let fieldText = child.getSchemaName();
      const fieldCalls = child.getCallsWithValues();
      if (fieldCalls.length) {
        fieldText = child.getSerializationKey() + ':' + fieldText;
        const argTexts = [];
        for (let jj = 0; jj < fieldCalls.length; jj++) {
          const {name, value} = fieldCalls[jj];
          const argText = printArgument(
            name,
            value,
            child.getCallType(name),
            printerState
          );
          if (argText) {
            argTexts.push(argText);
          }
        }
        if (argTexts.length) {
          fieldText += '(' + argTexts.join(',') + ')';
        }
      }
      fieldText += printDirectives(child);
      if (child.getChildren().length) {
        fieldText += printChildren(child, printerState, indent + oneIndent);
      }
      childrenText.push(fieldText);
    } else if (child instanceof RelayQuery.Fragment) {
      if (child.getChildren().length) {
        const {
          fragmentNameByHash,
          fragmentNameByText,
          fragmentTexts,
        } = printerState;

        // Avoid walking fragments if we have printed the same one before.
        const fragmentHash = child.getCompositeHash();

        let fragmentName;
        if (fragmentNameByHash.hasOwnProperty(fragmentHash)) {
          fragmentName = fragmentNameByHash[fragmentHash];
        } else {
          // Avoid reprinting a fragment that is identical to another fragment.
          const fragmentText =
            child.getType() +
            printDirectives(child) +
            printChildren(child, printerState, '');
          if (fragmentNameByText.hasOwnProperty(fragmentText)) {
            fragmentName = fragmentNameByText[fragmentText];
          } else {
            fragmentName = 'F' + base62(printerState.fragmentCount++);
            fragmentNameByHash[fragmentHash] = fragmentName;
            fragmentNameByText[fragmentText] = fragmentName;
            fragmentTexts.push(
              'fragment ' + fragmentName + ' on ' + fragmentText
            );
          }
        }
        if (!fragments || !fragments.hasOwnProperty(fragmentName)) {
          fragments = fragments || {};
          fragments[fragmentName] = true;
          childrenText.push('...' + fragmentName);
        }
      }
    } else {
      invariant(
        false,
        'printRelayOSSQuery(): Expected a field or fragment, got `%s`.',
        child.constructor.name
      );
    }
  }
  if (!childrenText) {
    return '';
  }
  return childrenText.length ? ' {' + newLine + indent + oneIndent +
    childrenText.join(',' + newLine + indent + oneIndent) + newLine +
    indent + '}' : '';
}

function printDirectives(node) {
  let directiveStrings;
  node.getDirectives().forEach(directive => {
    let dirString = '@' + directive.name;
    if (directive.args.length) {
      dirString +=
        '(' + directive.args.map(printDirective).join(',') + ')';
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
  invariant(
    value != null,
    'printRelayOSSQuery: Expected a non-null value for variable `%s`.',
    name
  );
  const valueKey = JSON.stringify(value);
  const nonNullType = printNonNullType(type);
  let variablesForType = printerState.variableMap.get(nonNullType);
  if (!variablesForType) {
    variablesForType = new Map();
    printerState.variableMap.set(nonNullType, variablesForType);
  }
  const existingVariable = variablesForType.get(valueKey);
  if (existingVariable) {
    return existingVariable.variableID;
  } else {
    const variableID = name + '_' + base62(printerState.variableCount++);
    variablesForType.set(valueKey, {
      value,
      variableID,
    });
    return variableID;
  }
}

module.exports = RelayProfiler.instrument(
  'printRelayQuery',
  printRelayOSSQuery
);
