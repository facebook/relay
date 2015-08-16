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

var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');

var invariant = require('invariant');

type FragmentMap = {[key: string]: string};

/**
 * @internal
 *
 * `printRelayQuery(query)` returns a string representation of the query. The
 * supplied `node` must be flattened (and not contain fragments).
 */
function printRelayQuery(node: RelayQuery.Node): string {
  var fragmentMap = {};
  var queryText = null;
  if (node instanceof RelayQuery.Root) {
    queryText = printRoot(node, fragmentMap);
  } else if (node instanceof RelayQuery.Fragment) {
    queryText = printFragment(node, fragmentMap);
  } else if (node instanceof RelayQuery.Field) {
    queryText = printField(node, fragmentMap);
  } else if (node instanceof RelayQuery.Mutation) {
    queryText = printMutation(node, fragmentMap);
  }
  invariant(
    queryText,
    'printRelayQuery(): Unsupported node type.'
  );
  // Reassign to preserve Flow type refinement within closure.
  var query = queryText;
  Object.keys(fragmentMap).forEach(fragmentID => {
    var fragmentText = fragmentMap[fragmentID];
    if (fragmentText) {
      query = query + ' ' + fragmentText;
    }
  });
  return query;
}

function printRoot(
  node: RelayQuery.Root,
  fragmentMap: FragmentMap
): string {
  invariant(
    !node.getBatchCall(),
    'printRelayQuery(): Deferred queries are not supported.'
  );

  var rootCall = node.getRootCall();
  var rootArgumentName = node.getRootCallArgument();
  var rootFieldString = rootCall.name;
  if (rootCall.value != null) {
    invariant(
      rootArgumentName,
      'printRelayQuery(): Expected an argument name for root field `%s`.',
      rootCall.name
    );
    var rootArgString =
      printArgument(rootArgumentName, rootCall.value, node.getCallType());
    if (rootArgString) {
      rootFieldString += '(' + rootArgString + ')';
    }
  }

  return 'query ' + node.getName() + '{' +
    rootFieldString + printChildren(node, fragmentMap) + '}';
}

function printMutation(
  node: RelayQuery.Mutation,
  fragmentMap: FragmentMap
): string {
  var inputName = node.getCallVariableName();
  var call = '(' + inputName + ':$' + inputName + ')';
  return 'mutation ' + node.getName() + '($' + inputName + ':' +
    node.getInputType() + ')' + '{' +
    node.getCall().name + call +
    printChildren(node, fragmentMap) + '}';
}

function printFragment(
  node: RelayQuery.Fragment,
  fragmentMap: FragmentMap
): string {
  return 'fragment ' + node.getDebugName() + ' on ' +
    node.getType() + printChildren(node, fragmentMap);
}

function printInlineFragment(
  node: RelayQuery.Fragment,
  fragmentMap: FragmentMap
): string {
  var fragmentID = node.getFragmentID();
  if (!(fragmentID in fragmentMap)) {
    fragmentMap[fragmentID] = 'fragment ' + fragmentID + ' on ' +
      node.getType() + printChildren(node, fragmentMap);
  }
  return '...' + fragmentID;
}

function printField(
  node: RelayQuery.Field,
  fragmentMap: FragmentMap
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
      var argString = printArgument(name, value, node.getCallType(name));
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
    fieldString + printChildren(node, fragmentMap);
}

function printChildren(
  node: RelayQuery.Node,
  fragmentMap: FragmentMap
): string {
  var children = node.getChildren().map(node => {
    if (node instanceof RelayQuery.Field) {
      return printField(node, fragmentMap);
    } else {
      invariant(
        node instanceof RelayQuery.Fragment,
        'printRelayQuery(): expected child node to be a `Field` or ' +
        '`Fragment`, got `%s`.',
        node.constructor.name
      );
      return printInlineFragment(node, fragmentMap);
    }
  });
  if (!children.length) {
    return '';
  }
  return '{' + children.join(',') + '}';
}

function printArgument(name: string, value: mixed, type: ?string): ?string {
  var stringValue;
  if (value == null) {
    return value;
  }
  if (type === 'enum') {
    invariant(
      typeof value === 'string',
      'RelayQuery: Expected enum argument `%s` to be a string, got `%s`.',
      name,
      value
    );
    stringValue = value;
  } else if (type === 'object') {
    invariant(
      typeof value === 'object' && !Array.isArray(value) && value !== null,
      'RelayQuery: Expected object argument `%s` to be an object, got `%s`.',
      name,
      value
    );
    stringValue = stringifyInputObject(name, value);
  } else {
    stringValue = JSON.stringify(value);
  }
  return name + ':' + stringValue;
}

function stringifyInputObject(name: string, value: mixed): string {
  invariant(
    value != null,
    'RelayQuery: Expected input object `%s` to have non-null values.',
    name
  );
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' +
      value.map(stringifyInputObject.bind(null, name)).join(',') + ']';
  }
  // Reassign to preserve Flow type refinement within closure.
  var objectValue: Object = (value: $FlowIssue); // non-null object
  return '{' + Object.keys(objectValue).map(key => {
    return key + ':' + stringifyInputObject(name, objectValue[key]);
  }).join(',') + '}';
}

module.exports = RelayProfiler.instrument(
  'printRelayQuery',
  printRelayQuery
);
