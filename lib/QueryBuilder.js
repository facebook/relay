/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule QueryBuilder
 * 
 * @typechecks
 */

'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

var RelayNodeInterface = require('./RelayNodeInterface');

var generateConcreteFragmentID = require('./generateConcreteFragmentID');
var invariant = require('fbjs/lib/invariant');

var EMPTY_CALLS = [];
var EMPTY_CHILDREN = [];
var EMPTY_DIRECTIVES = [];
var EMPTY_METADATA = {};

if (process.env.NODE_ENV !== 'production') {
  _Object$freeze(EMPTY_CALLS);
  _Object$freeze(EMPTY_CHILDREN);
  _Object$freeze(EMPTY_DIRECTIVES);
  _Object$freeze(EMPTY_METADATA);
}

/**
 * @internal
 *
 * Helper methods for constructing concrete query objects.
 */
var QueryBuilder = {
  createBatchCallVariable: function createBatchCallVariable(sourceQueryID, jsonPath) {
    return {
      kind: 'BatchCallVariable',
      sourceQueryID: sourceQueryID,
      jsonPath: jsonPath
    };
  },

  createCall: function createCall(name, value, type) {
    return {
      kind: 'Call',
      name: name,
      metadata: {
        type: type || null
      },
      value: value
    };
  },

  createCallValue: function createCallValue(callValue) {
    return {
      kind: 'CallValue',
      callValue: callValue
    };
  },

  createCallVariable: function createCallVariable(callVariableName) {
    return {
      kind: 'CallVariable',
      callVariableName: callVariableName
    };
  },

  createDirective: function createDirective(name, args) {
    return {
      args: args,
      kind: 'Directive',
      name: name
    };
  },

  createDirectiveArgument: function createDirectiveArgument(name, value) {
    return {
      name: name,
      value: value
    };
  },

  createField: function createField(partialField) {
    var partialMetadata = partialField.metadata || EMPTY_METADATA;
    return {
      alias: partialField.alias,
      calls: partialField.calls || EMPTY_CALLS,
      children: partialField.children || EMPTY_CHILDREN,
      directives: partialField.directives || EMPTY_DIRECTIVES,
      fieldName: partialField.fieldName,
      kind: 'Field',
      metadata: {
        canHaveSubselections: !!partialMetadata.canHaveSubselections,
        inferredRootCallName: partialMetadata.inferredRootCallName,
        inferredPrimaryKey: partialMetadata.inferredPrimaryKey,
        isConnection: !!partialMetadata.isConnection,
        isFindable: !!partialMetadata.isFindable,
        isGenerated: !!partialMetadata.isGenerated,
        isPlural: !!partialMetadata.isPlural,
        isRequisite: !!partialMetadata.isRequisite,
        isAbstract: !!partialMetadata.isAbstract
      },
      type: partialField.type
    };
  },

  createFragment: function createFragment(partialFragment) {
    var metadata = partialFragment.metadata || EMPTY_METADATA;
    return {
      children: partialFragment.children || EMPTY_CHILDREN,
      directives: partialFragment.directives || EMPTY_DIRECTIVES,
      id: generateConcreteFragmentID(),
      kind: 'Fragment',
      metadata: {
        isAbstract: !!metadata.isAbstract,
        pattern: !!metadata.pattern,
        plural: !!metadata.plural },
      // match the `@relay` argument name
      name: partialFragment.name,
      type: partialFragment.type
    };
  },

  createFragmentReference: function createFragmentReference(fragment) {
    return {
      kind: 'FragmentReference',
      fragment: fragment
    };
  },

  createMutation: function createMutation(partialMutation) {
    var metadata = partialMutation.metadata || EMPTY_METADATA;
    return {
      calls: partialMutation.calls || EMPTY_CALLS,
      children: partialMutation.children || EMPTY_CHILDREN,
      directives: partialMutation.directives || EMPTY_DIRECTIVES,
      kind: 'Mutation',
      metadata: {
        inputType: metadata.inputType
      },
      name: partialMutation.name,
      responseType: partialMutation.responseType
    };
  },

  createQuery: function createQuery(partialQuery) {
    var metadata = partialQuery.metadata || EMPTY_METADATA;
    var calls = [];
    var identifyingArgName = metadata.identifyingArgName;
    if (identifyingArgName == null && RelayNodeInterface.isNodeRootCall(partialQuery.fieldName)) {
      identifyingArgName = RelayNodeInterface.ID;
    }
    if (identifyingArgName != null) {
      !(partialQuery.identifyingArgValue != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'QueryBuilder.createQuery(): An argument value is required for ' + 'query `%s(%s: ???)`.', partialQuery.fieldName, identifyingArgName) : invariant(false) : undefined;
      calls = [QueryBuilder.createCall(identifyingArgName, partialQuery.identifyingArgValue)];
    }
    return {
      calls: calls,
      children: partialQuery.children || EMPTY_CHILDREN,
      directives: partialQuery.directives || EMPTY_DIRECTIVES,
      fieldName: partialQuery.fieldName,
      isDeferred: !!(partialQuery.isDeferred || metadata.isDeferred),
      kind: 'Query',
      metadata: {
        identifyingArgName: identifyingArgName,
        identifyingArgType: metadata.identifyingArgType,
        isAbstract: !!metadata.isAbstract,
        isPlural: !!metadata.isPlural
      },
      name: partialQuery.name,
      type: partialQuery.type
    };
  },

  createSubscription: function createSubscription(partialSubscription) {
    var metadata = partialSubscription.metadata || EMPTY_METADATA;
    return {
      calls: partialSubscription.calls || EMPTY_CALLS,
      children: partialSubscription.children || EMPTY_CHILDREN,
      directives: partialSubscription.directives || EMPTY_DIRECTIVES,
      kind: 'Subscription',
      metadata: {
        inputType: metadata.inputType
      },
      name: partialSubscription.name,
      responseType: partialSubscription.responseType
    };
  },

  getBatchCallVariable: function getBatchCallVariable(node) {
    if (isConcreteKind(node, 'BatchCallVariable')) {
      return node;
    }
  },

  getCallVariable: function getCallVariable(node) {
    if (isConcreteKind(node, 'CallVariable')) {
      return node;
    }
  },

  getField: function getField(node) {
    if (isConcreteKind(node, 'Field')) {
      return node;
    }
  },

  getFragment: function getFragment(node) {
    if (isConcreteKind(node, 'Fragment')) {
      return node;
    }
  },

  getFragmentReference: function getFragmentReference(node) {
    if (isConcreteKind(node, 'FragmentReference')) {
      return node;
    }
  },

  getMutation: function getMutation(node) {
    if (isConcreteKind(node, 'Mutation')) {
      return node;
    }
  },

  getQuery: function getQuery(node) {
    if (isConcreteKind(node, 'Query')) {
      return node;
    }
  },

  getSubscription: function getSubscription(node) {
    if (isConcreteKind(node, 'Subscription')) {
      return node;
    }
  }
};

function isConcreteKind(node, kind) {
  return typeof node === 'object' && node !== null && node.kind === kind;
}

module.exports = QueryBuilder;