/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule printRelayFBQuery
 * @typechecks
 * @flow
 */

'use strict';

import type {CallValue, PrintedQuery} from 'RelayInternalTypes';
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');

var invariant = require('invariant');
var printRelayQueryCall = require('printRelayQueryCall');

type FragmentMap = {[fragmentID: string]: string};

/**
 * @internal
 *
 * `printRelayFBQuery(query)` returns a string representation of the query `text`
 * along with an object representing any `variables` referenced in that text.
 */
function printRelayFBQuery(node: RelayQuery.Node): PrintedQuery {
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
  } else if (node instanceof RelayQuery.Subscription) {
    queryText = printSubscription(node, fragmentMap);
  }
  invariant(
    queryText,
    'printRelayFBQuery(): Unsupported node type.'
  );
  // Reassign to preserve Flow type refinement within closure.
  var text = queryText;
  Object.keys(fragmentMap).forEach(fragmentID => {
    var fragmentText = fragmentMap[fragmentID];
    if (fragmentText) {
      text = text + ' ' + fragmentText;
    }
  });
  return {
    text,
    variables: {},
  };
}

function printRoot(node: RelayQuery.Root, fragmentMap: FragmentMap): string {
  var rootCall = node.getRootCall();
  var batchCall = node.getBatchCall();
  var rootCallString;
  if (batchCall) {
    rootCallString = rootCall.name + '(<' + batchCall.refParamName + '>)';
  } else if (isEmpty(rootCall.value)) {
    rootCallString = rootCall.name + '()';
  } else {
    rootCallString = printRelayQueryCall(rootCall).slice(1);
  }

  return 'Query ' + node.getName() + '{' + rootCallString +
    printChildren(node, fragmentMap) + '}';
}

function printMutation(
  node: RelayQuery.Mutation,
  fragmentMap: FragmentMap
): string {
  return 'Mutation ' + node.getName() + ' : ' + node.getResponseType() + '{' +
    node.getCall().name + '(<' + node.getCallVariableName() + '>)' +
    printChildren(node, fragmentMap) + '}';
}

function printSubscription(
  node: RelayQuery.Subscription,
  fragmentMap: FragmentMap
): string {
  return 'Subscription ' + node.getName() + ' : ' + node.getResponseType() +
    '{' + node.getCall().name + '(<' + node.getCallVariableName() + '>)' +
    printChildren(node, fragmentMap) + '}';
}

function printFragment(
  node: RelayQuery.Fragment,
  fragmentMap: FragmentMap
): string {
  return 'QueryFragment ' + node.getDebugName() + ' : ' +
    node.getType() + printChildren(node, fragmentMap);
}

function printInlineFragment(
  node: RelayQuery.Fragment,
  fragmentMap: FragmentMap
): string {
  var fragmentID = node.getFragmentID();
  if (!fragmentMap.hasOwnProperty(fragmentID)) {
    fragmentMap[fragmentID] = 'QueryFragment ' + fragmentID + ' : ' +
      node.getType() + printChildren(node, fragmentMap);
  }
  var prefix = node.isTypeConditional() ? '?' : '';
  return prefix + '@' + fragmentID;
}

function printField(
  node: RelayQuery.Node,
  fragmentMap: FragmentMap
): string {
  invariant(
    node instanceof RelayQuery.Field,
    'printRelayFBQuery(): Query must be flattened before printing.'
  );
  var schemaName = node.getSchemaName();
  var serializationKey = node.getSerializationKey();
  return schemaName +
    node.getCallsWithValues().map(printRelayQueryCall).join('') +
    (serializationKey !== schemaName ? ' as ' + serializationKey : '') +
    printChildren(node, fragmentMap);
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
        'printRelayFBQuery(): expected child node to be a `Field` or ' +
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

function isEmpty(value: CallValue) {
  return (
    value == null ||
    value === '' ||
