/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQL
 * @typechecks
 */

'use strict';

var RelayNodeInterface = require('RelayNodeInterface');

const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

if (__DEV__) {
  Object.freeze(EMPTY_OBJECT);
  Object.freeze(EMPTY_ARRAY);
}

const BATCH_CALL_VARIABLE = 'BatchCallVariable';
const CALL = 'Call';
const CALL_VALUE = 'CallValue';
const CALL_VARIABLE = 'CallVariable';
const FIELD = 'Field';
const FRAGMENT = 'Fragment';
const MUTATION = 'Mutation';
const QUERY = 'Query';
const SUBSCRIPTION = 'Subscription';

/**
 * Represents a GraphQL node.
 *
 * A node may contain zero or more fields and/or query fragments.
 *
 * Note that we don't actually export this class (rather, we export subclasses
 * corresponding to fields, fragments, queries and mutations); we do, however,
 * use `GraphQLNode` as a type throughout Dlite.
 */
class GraphQLNode {
  constructor(fields, fragments) {
    this.fields = fields || EMPTY_ARRAY;
    this.fragments = fragments && fragments.length > 0 ?
      fragments.filter(isTruthy) :
      EMPTY_ARRAY;

    this.children = this.fields.concat(this.fragments);
  }
}

/**
 * Represents a GraphQL call such as `size(50, 50)` or `(size: 32)`.
 */
class GraphQLCallvNode {
  constructor(name, value, metadata) {
    this.kind = CALL;
    this.value = map(value, castArg) || null;
    this.name = name;
    this.metadata = metadata || EMPTY_OBJECT;
  }
}

/**
 * Represents a value passed to a GraphQL call (for example, the value 5 passed
 * in a call like `first(5)`).
 */
class GraphQLCallValue {
  constructor(value) {
    this.kind = CALL_VALUE;
    this.callValue = value;
  }
}

/**
 * Represents a GraphQL call variable for use with the GraphQL Batch API.
 *
 * For example, given a source query identified by "q0", we would make a batch
 * call variable "<ref_q0>" as follows:
 *
 *     new GraphQL.BatchCallVariable('q0', '$.*.actor.id');
 *
 * The batch API allows streaming responses to the client, re-using information
 * from previous queries via ref_params; the query identifier ("q0" in the
 * example above) combined with a JSONPath to the node to be extended
 * ("$.*.actor.id") allow us to define a supplementary query that retrieves
 * additional information (example: https://fburl.com/65122329) for that node.
 *
 * @see https://our.intern.facebook.com/intern/dex/graphql-batch-api
 */
class GraphQLBatchCallVariable {
  constructor(sourceQueryID, jsonPath) {
    this.kind = BATCH_CALL_VARIABLE;
    this.sourceQueryID = sourceQueryID;
    this.jsonPath = jsonPath;
  }
}

/**
 * Represents a variable used in a GraphQL call.
 *
 * For example:
 *
 *     new GraphQL.CallVariable('foo') // variable: <foo>
 */
class GraphQLCallVariable {
  constructor(variableName) {
    this.kind = CALL_VARIABLE;
    this.callVariableName = variableName;
  }
}

/**
 * Represents a field in a GraphQL query.
 *
 * A field may be simple or arbitrarily complex, including calls, and containing
 * subfields, nested fragments.
 */
class GraphQLFieldNode extends GraphQLNode {
  constructor(fieldName, fields, fragments, calls, alias, condition, metadata, directives) {
    super(fields, fragments);

    this.kind = FIELD;
    this.fieldName = fieldName;
    this.calls = calls || EMPTY_ARRAY;
    this.alias = alias || null;
    this.condition = condition || null;

    metadata = metadata || EMPTY_OBJECT;
    this.__metadata__ = metadata;
    this.metadata = {
      edgesID: metadata.edgesID,
      inferredRootCallName: metadata.rootCall,
      inferredPrimaryKey: metadata.pk,
      isConnection: !!metadata.connection,
      isFindable: !!metadata.connection && !metadata.nonFindable,
      isGenerated: !!metadata.generated,
      isPlural: !!metadata.plural,
      isRequisite: !!metadata.requisite,
      isUnionOrInterface: !!metadata.dynamic,
      parentType: metadata.parentType,
    };
    this.directives = directives || EMPTY_ARRAY;
  }
}

/**
 * Represents a query fragment in a GraphQL query.
 *
 * A fragment may contain zero or more fields and/or additional fragments.
 */
class GraphQLQueryFragment extends GraphQLNode {
  constructor(name, type, fields, fragments, metadata, directives) {
    super(fields, fragments);
    this.kind = FRAGMENT;
    this.name = name;
    this.type = type;
    this.metadata = this.__metadata__ = metadata || EMPTY_OBJECT;
    this.directives = directives || EMPTY_ARRAY;
  }
}

/**
 * Represents a root GraphQL query such as `viewer() { ... }` or `me() { ... }`.
 *
 * Queries may contain zero or more fields, and/or subfragments.
 */
class GraphQLQuery extends GraphQLNode {
  constructor(
    fieldName,
    value,
    fields,
    fragments,
    metadata,
    queryName,
    directives
  ) {
    super(fields, fragments);
    this.__metadata__ = metadata || EMPTY_OBJECT;
    var identifyingArgName = this.__metadata__.identifyingArgName;
    if (
      identifyingArgName == null &&
      RelayNodeInterface.isNodeRootCall(fieldName)
    ) {
      identifyingArgName = RelayNodeInterface.ID;
    }
    this.kind = QUERY;
    this.metadata = {...this.__metadata__};
    if (identifyingArgName !== undefined) {
      this.metadata.identifyingArgName = identifyingArgName;
    }
    this.directives = directives || EMPTY_ARRAY;
    this.name = queryName;
    this.fieldName = fieldName;
    this.isDeferred = !!this.__metadata__.isDeferred;

    this.calls = [];
    // In the future, the constructor for a `GraphQLQuery` will accept an
    // arbitrary number of `arguments` for the root field and pass them all
    // through to `this.calls`. In the meantime we synthesize an identifying
    // argument, if an `identifyingArgName` exists.
    if (identifyingArgName != null) {
      this.calls.push(new GraphQLCallvNode(identifyingArgName, value));
    }
  }
}

/**
 * Base class from which GraphQLMutation and GraphQLSubscription extend.
 */
class GraphQLOperation extends GraphQLNode {
  constructor(name, responseType, call, fields, fragments, metadata) {
    super(fields, fragments);
    this.name = name;
    this.responseType = responseType;
    this.calls = [call];
    this.metadata = metadata || EMPTY_OBJECT;
  }
}

/**
 * Represents a GraphQL mutation.
 */
class GraphQLMutation extends GraphQLOperation {
  constructor(...args) {
    super(...args);
    this.kind = MUTATION;
  }
}

/**
 * Represents a GraphQL subscription.
 */
class GraphQLSubscription extends GraphQLOperation {
  constructor(...args) {
    super(...args);
    this.kind = SUBSCRIPTION;
  }
}

function isTruthy(thing) {
  return !!thing;
}

/**
 * Map a singular/array value with the supplied function.
 */
function map(value, fn) {
  if (value == null) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(fn);
  } else {
    return fn(value);
  }
}

function castArg(arg) {
  if (
    arg instanceof GraphQLCallValue ||
    arg instanceof GraphQLCallVariable ||
    arg instanceof GraphQLBatchCallVariable
  ) {
    return arg;
  } else if (arg == null) {
    return new GraphQLCallVariable('__null__');
  } else {
    return new GraphQLCallValue(arg);
  }
}

function isType(node, type) {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.kind === type
  );
}

function isCall(node) {
  return isType(node, CALL);
}

function isCallValue(node) {
  return isType(node, CALL_VALUE);
}

function isCallVariable(node) {
  return isType(node, CALL_VARIABLE);
}

function isBatchCallVariable(node) {
  return isType(node, BATCH_CALL_VARIABLE);
}

function isField(node) {
  return isType(node, FIELD);
}

function isFragment(node) {
  return isType(node, FRAGMENT);
}

function isQuery(node) {
  return isType(node, QUERY);
}

function isMutation(node) {
  return isType(node, MUTATION);
}

function isSubscription(node) {
  return isType(node, SUBSCRIPTION);
}

/**
 * This module exports the building blocks for creating a structured
 * representation (ie. an AST) of GraphQL queries in JavaScript.
 *
 * @see https://our.intern.facebook.com/intern/dex/introduction-to-graphql/
 * @internal
 */
const GraphQL = {
  BatchCallVariable: GraphQLBatchCallVariable,
  Callv: GraphQLCallvNode,
  CallValue: GraphQLCallValue,
  CallVariable: GraphQLCallVariable,
  Field: GraphQLFieldNode,
  Mutation: GraphQLMutation,
  Query: GraphQLQuery,
  QueryFragment: GraphQLQueryFragment,
  Subscription: GraphQLSubscription,
  isBatchCallVariable,
  isCall,
  isCallValue,
  isCallVariable,
  isField,
  isFragment,
  isMutation,
  isQuery,
  isSubscription,
};

module.exports = GraphQL;
