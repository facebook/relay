/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule toGraphQL
 * 
 */

'use strict';

var QueryBuilder = require('./QueryBuilder');
var RelayQuery = require('./RelayQuery');

var callsToGraphQL = require('./callsToGraphQL');
var generateConcreteFragmentID = require('./generateConcreteFragmentID');
var invariant = require('fbjs/lib/invariant');

/**
 * @internal
 *
 * Converts a RelayQuery.Node into a plain object representation. This is
 * equivalent to the AST produced by `babel-relay-plugin` and is intended for
 * use in serializing RelayQuery nodes.
 *
 * NOTE: This is used by external open source projects.
 */
var toGraphQL = {
  Query: function Query(node) {
    var batchCall = node.getBatchCall();
    var identifyingArgValue = undefined;
    if (batchCall) {
      identifyingArgValue = QueryBuilder.createBatchCallVariable(batchCall.sourceQueryID, batchCall.sourceQueryPath);
    } else {
      var identifyingArg = node.getIdentifyingArg();
      if (identifyingArg) {
        if (Array.isArray(identifyingArg.value)) {
          identifyingArgValue = identifyingArg.value.map(QueryBuilder.createCallValue);
        } else {
          identifyingArgValue = QueryBuilder.createCallValue(identifyingArg.value);
        }
      }
    }

    var children = node.getChildren().map(toGraphQLSelection);
    // Use `QueryBuilder` to generate the correct calls from the
    // identifying argument & metadata.
    return QueryBuilder.createQuery({
      children: children,
      fieldName: node.getFieldName(),
      identifyingArgValue: identifyingArgValue,
      isDeferred: node.isDeferred(),
      metadata: node.getConcreteQueryNode().metadata,
      name: node.getName(),
      type: node.getType()
    });
  },
  Fragment: (function (_Fragment) {
    function Fragment(_x) {
      return _Fragment.apply(this, arguments);
    }

    Fragment.toString = function () {
      return _Fragment.toString();
    };

    return Fragment;
  })(function (node) {
    var children = node.getChildren().map(toGraphQLSelection);
    var fragment = {
      children: children,
      id: generateConcreteFragmentID(),
      kind: 'Fragment',
      metadata: {
        isAbstract: node.isAbstract(),
        plural: node.isPlural()
      },
      name: node.getDebugName(),
      type: node.getType()
    };
    return fragment;
  }),
  Field: (function (_Field) {
    function Field(_x2) {
      return _Field.apply(this, arguments);
    }

    Field.toString = function () {
      return _Field.toString();
    };

    return Field;
  })(function (node) {
    var calls = callsToGraphQL(node.getCallsWithValues());
    var children = node.getChildren().map(toGraphQLSelection);
    var field = {
      alias: node.getConcreteQueryNode().alias,
      calls: calls,
      children: children,
      fieldName: node.getSchemaName(),
      kind: 'Field',
      metadata: node.getConcreteQueryNode().metadata,
      type: node.getType()
    };
    return field;
  })
};

function toGraphQLSelection(node) {
  if (node instanceof RelayQuery.Fragment) {
    return toGraphQL.Fragment(node);
  } else {
    !(node instanceof RelayQuery.Field) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toGraphQL: Invalid node.') : invariant(false) : undefined;
    return toGraphQL.Field(node);
  }
}

module.exports = toGraphQL;