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

var invariant = require('invariant');

var EMPTY_OBJECT = {};
var EMPTY_ARRAY = [];

if (__DEV__) {
  Object.freeze(EMPTY_OBJECT);
  Object.freeze(EMPTY_ARRAY);
}

var BATCH_CALL_VARIABLE = 'BatchCallVariable';
var CALL = 'Call';
var CALL_VALUE = 'CallValue';
var CALL_VARIABLE = 'CallVariable';
var FIELD = 'Field';
var FRAGMENT = 'Fragment';
var MUTATION = 'Mutation';
var QUERY = 'Query';
var QUERY_WITH_VALUES = 'QueryWithValues';
var SUBSCRIPTION = 'Subscription';

var JSON_TYPES = {
  QUERY: 1,
  FRAGMENT: 2,
  FIELD: 3,
  CALL: 4,
  CALL_VALUE: 5,
  CALL_VARIABLE: 6,
  BATCH_VARIABLE: 7,
  MUTATION: 8,
  QUERY_WITH_VALUES: 9,
  SUBSCRIPTION: 10,
};

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

  /**
   * @param {?array<GraphQLFieldNode>} fields
   * @param {?array<GraphQLQueryFragment|RelayRouteFragment|RelayFragmentReference>} fragments
   */
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
  /**
   * @param {string} name
   * @param {*} value (array or scalar)
   * @param {?object} metadata
   */
  constructor(name, value, metadata) {
    this.kind = CALL;
    this.value = map(value, castArg) || null;
    this.name = name;
    this.metadata = metadata || EMPTY_OBJECT;
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLCallvNode}
   */
  static fromJSON(descriptor) {
    var [type, name, value, metadata] = descriptor;
    invariant(type === JSON_TYPES.CALL, 'Expected call descriptor');
    return new GraphQLCallvNode(
      name,
      callArgsFromJSON(value),
      metadata
    );
  }

  toJSON() {
    return trimArray([
      JSON_TYPES.CALL,
      this.name,
      this.value,
      this.metadata === EMPTY_OBJECT ? null : this.metadata
    ]);
  }
}

/**
 * Represents a value passed to a GraphQL call (for example, the value 5 passed
 * in a call like `first(5)`).
 */
class GraphQLCallValue {
  /**
   * @param {*} value
   */
  constructor(value) {
    this.kind = CALL_VALUE;
    this.callValue = value;
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLCallValue}
   */
  static fromJSON(descriptor) {
    var [type, value] = descriptor;
    invariant(type === JSON_TYPES.CALL_VALUE, 'Expected value descriptor');
    return new GraphQLCallValue(value);
  }

  toJSON() {
    return [
      JSON_TYPES.CALL_VALUE,
      this.callValue
    ];
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
  /**
   * @param {string} sourceQueryID
   * @param {string} jsonPath
   */
  constructor(sourceQueryID, jsonPath) {
    this.kind = BATCH_CALL_VARIABLE;
    this.sourceQueryID = sourceQueryID;
    this.jsonPath = jsonPath;
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLBatchCallVariable}
   */
  static fromJSON(descriptor) {
    var [type, sourceQueryID, jsonPath] = descriptor;
    invariant(
      type === JSON_TYPES.BATCH_VARIABLE,
      'Expected batch variable descriptor'
    );
    return new GraphQLBatchCallVariable(sourceQueryID, jsonPath);
  }

  toJSON() {
    return [
      JSON_TYPES.BATCH_VARIABLE,
      this.sourceQueryID,
      this.jsonPath
    ];
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
  /**
   * @param {string} variableName
   */
  constructor(variableName) {
    this.kind = CALL_VARIABLE;
    this.callVariableName = variableName;
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLCallVariable}
   */
  static fromJSON(descriptor) {
    var [type, name] = descriptor;
    invariant(
      type === JSON_TYPES.CALL_VARIABLE,
      'Expected variable descriptor'
    );
    return new GraphQLCallVariable(name);
  }

  toJSON() {
    return [
      JSON_TYPES.CALL_VARIABLE,
      this.callVariableName
    ];
  }
}

/**
 * Represents a field in a GraphQL query.
 *
 * A field may be simple or arbitrarily complex, including calls, and containing
 * subfields, nested fragments.
 */
class GraphQLFieldNode extends GraphQLNode {
  /**
   * @param {string} fieldName
   * @param {?array<GraphQLFieldNode>} fields
   * @param {?array<GraphQLQueryFragment|RelayRouteFragment|RelayFragmentReference>} fragments
   * @param {?array<GraphQLCallvNode>} calls
   * @param {?string} alias
   * @param {?string} condition
   * @param {?object} metadata
   * @param {?array} directives
   */
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

  /**
   * @param {array} descriptor
   * @return {GraphQLFieldNode}
   */
  static fromJSON(descriptor) {
    var [
      type,
      fieldName,
      fields,
      fragments,
      calls,
      alias,
      condition,
      metadata,
      directives
    ] = descriptor;
    invariant(type === JSON_TYPES.FIELD, 'Expected field descriptor');
    return new GraphQLFieldNode(
      fieldName,
      fields ? fields.map(GraphQLFieldNode.fromJSON) : null,
      fragments ? fragments.map(GraphQLQueryFragment.fromJSON) : null,
      calls ? calls.map(GraphQLCallvNode.fromJSON) : null,
      alias,
      condition,
      metadata,
      directives
    );
  }

  toJSON() {
    return trimArray([
      JSON_TYPES.FIELD,
      this.fieldName,
      this.fields.length ? this.fields : null,
      this.fragments.length ? this.fragments : null,
      this.calls.length ? this._calls : null,
      this.alias,
      this.condition,
      this.__metadata__ === EMPTY_OBJECT ? null : this.__metadata__,
      this.directives === EMPTY_ARRAY ? null : this.directives,
    ]);
  }
}

/**
 * Represents a query fragment in a GraphQL query.
 *
 * A fragment may contain zero or more fields and/or additional fragments.
 */
class GraphQLQueryFragment extends GraphQLNode {
  /**
   * @param {string} name
   * @param {string} type
   * @param {?array<GraphQLFieldNode>} fields
   * @param {?array<GraphQLQueryFragment|RelayRouteFragment|RelayFragmentReference>} fragments
   */
  constructor(name, type, fields, fragments, metadata, directives) {
    super(fields, fragments);
    this.kind = FRAGMENT;
    this.name = name;
    this.type = type;
    this.metadata = this.__metadata__ = metadata || EMPTY_OBJECT;
    this.directives = directives || EMPTY_ARRAY;
    this.isPlural = !!this.metadata.isPlural;
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLQueryFragment}
   */
  static fromJSON(descriptor) {
    var [type, name, fragmentType, fields, fragments, metadata, directives] =
      descriptor;
    invariant(type === JSON_TYPES.FRAGMENT, 'Expected fragment descriptor');
    var frag = new GraphQLQueryFragment(
      name,
      fragmentType,
      fields ? fields.map(GraphQLFieldNode.fromJSON) : null,
      fragments ? fragments.map(GraphQLQueryFragment.fromJSON) : null,
      metadata,
      directives
    );
    return frag;
  }

  toJSON() {
    return trimArray([
      JSON_TYPES.FRAGMENT,
      this.name,
      this.type,
      this.fields.length ? this.fields : null,
      this.fragments.length ? this.fragments : null,
      this.metadata,
      this.directives === EMPTY_ARRAY ? null : this.directives,
    ]);
  }
}

/**
 * Represents a root GraphQL query such as `viewer() { ... }` or `me() { ... }`.
 *
 * Queries may contain zero or more fields, and/or subfragments.
 */
class GraphQLQuery extends GraphQLNode {
  /**
   * @param {string} rootCall
   * @param {*} value
   * @param {?array<GraphQLFieldNode>} fields
   * @param {?array<GraphQLQueryFragment|RelayRouteFragment|RelayFragmentReference>} fragments
   * @param {?object} metadata
   * @param {?string} queryName
   * @param {?array} directives
   */
  constructor(rootCall, value, fields, fragments, metadata, queryName, directives) {
    super(fields, fragments);
    this.__metadata__ = metadata || EMPTY_OBJECT;
    var rootArg = this.__metadata__.rootArg;
    if (rootArg == null && RelayNodeInterface.isNodeRootCall(rootCall)) {
      rootArg = RelayNodeInterface.ID;
    }
    this.kind = QUERY;
    this.metadata = {
      ...this.__metadata__,
      rootArg,
    };
    this.directives = directives || EMPTY_ARRAY;
    this.name = queryName;
    this.fieldName = rootCall;
    this.isDeferred = !!this.__metadata__.isDeferred;

    var callMetadata = this.__metadata__.varargs ?
      {varargs: this.__metadata__.varargs} :
      null;
    this.calls = [new GraphQLCallvNode(rootCall, value, callMetadata)];
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLQuery}
   */
  static fromJSON(descriptor) {
    var [type, name, value, fields, fragments, metadata, queryName, directives]
      = descriptor;
    invariant(type === JSON_TYPES.QUERY, 'Expected query descriptor');
    return new GraphQLQuery(
      name,
      callArgsFromJSON(value),
      fields ? fields.map(GraphQLFieldNode.fromJSON) : null,
      fragments ? fragments.map(GraphQLQueryFragment.fromJSON) : null,
      metadata,
      queryName,
      directives
    );
  }

  toJSON() {
    return trimArray([
      JSON_TYPES.QUERY,
      this.fieldName,
      this.calls[0].value,
      this.fields.length ? this.fields : null,
      this.fragments.length ? this.fragments : null,
      this.__metadata__ === EMPTY_OBJECT ? null: this.__metadata__,
      this.name || null,
      this.directives === EMPTY_ARRAY ? null : this.directives,
    ]);
  }
}

/**
 * Comprises a GraphQL query (see `GraphQLQuery`) and a set of values.
 *
 * In practice, we're don't currently make use of the values anywhere in Dlite,
 * but we use `GraphQLQueryWithValues` widely within Dlite as a type.
 */
class GraphQLQueryWithValues {
  /**
   * @param {GraphQLQuery} query
   * @param {*} values
   */
  constructor(query, values) {
    this.kind = QUERY_WITH_VALUES;
    this.query = query;
    this.values = values;
  }

  getQuery() {
    return this.query;
  }

  /**
   * @param {array} descriptor
   * @return {GraphQLQueryWithValues}
   */
  static fromJSON(descriptor) {
    var [type, query, values] = descriptor;
    invariant(
      type === JSON_TYPES.QUERY_WITH_VALUES,
      'Expected query descriptor'
    );
    return new GraphQLQueryWithValues(
      GraphQLQuery.fromJSON(query),
      values
    );
  }

  toJSON() {
    return trimArray([
      JSON_TYPES.QUERY_WITH_VALUES,
      this.query,
      this.values
    ]);
  }
}

/**
 * Base class from which GraphQLMutation and GraphQLSubscription extend.
 */
class GraphQLOperation extends GraphQLNode {
  /**
   * @param {string} name
   * @param {string} responseType
   * @param {GraphQLCallvNode} call
   */
  constructor(name, responseType, call, fields, fragments, metadata) {
    super(fields, fragments);
    this.name = name;
    this.responseType = responseType;
    this.calls = [call];
    this.metadata = metadata || EMPTY_OBJECT;
  }

  toJSON() {
    return trimArray([
      this.getJSONType(),
      this.name,
      this.responseType,
      this.calls[0],
      this.fields.length ? this.fields : null,
      this.fragments.length ? this.fragments : null,
      this.metadata === EMPTY_OBJECT ? null : this.metadata,
    ]);
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

  /**
   * @param {array} descriptor
   * @return {GraphQLMutation}
   */
  static fromJSON(descriptor) {
    var [
      type,
      name,
      responseType,
      mutationCall,
      fields,
      fragments,
      metadata
    ] = descriptor;
    invariant(type === JSON_TYPES.MUTATION, 'Expected mutation descriptor');
    return new GraphQLMutation(
      name,
      responseType,
      GraphQLCallvNode.fromJSON(mutationCall),
      fields ? fields.map(GraphQLFieldNode.fromJSON) : null,
      fragments ? fragments.map(GraphQLQueryFragment.fromJSON) : null,
      metadata
    );
  }

  /**
   * @return {number}
   */
  getJSONType()  {
    return JSON_TYPES.MUTATION;
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

  /**
   * @param {array} descriptor
   * @return {GraphQLSubscription}
   */
  static fromJSON(descriptor) {
    var [
      type,
      name,
      responseType,
      subscriptionCall,
      fields,
      fragments,
      metadata
    ] = descriptor;
    invariant(
      type === JSON_TYPES.SUBSCRIPTION,
      'Expected subscription descriptor'
    );
    return new GraphQLSubscription(
      name,
      responseType,
      GraphQLCallvNode.fromJSON(subscriptionCall),
      fields ? fields.map(GraphQLFieldNode.fromJSON) : null,
      fragments ? fragments.map(GraphQLQueryFragment.fromJSON) : null,
      metadata
    );
  }

  /**
   * @return {number}
   */
  getJSONType()  {
    return JSON_TYPES.SUBSCRIPTION;
  }
}

/**
 * @param {*} thing
 * @return {boolean}
 */
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

/**
 * @param {*} arg
 *
 * TODO: Stop casting args once internal plugin prints call values.
 */
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

function trimArray(arr) {
  var lastIndex = -1;
  for (var ii = arr.length - 1; ii >= 0; ii--) {
    if (arr[ii] !== null) {
      lastIndex = ii;
      break;
    }
  }
  arr.length = lastIndex + 1;
  return arr;
}


function callArgsFromJSON(value) {
  if (Array.isArray(value) && Array.isArray(value[0])) {
    return value.map(callArgFromJSON);
  } else if (value) {
    return callArgFromJSON(value);
  }
  return value;
}

/**
 * @param {array} descriptor
 * @return {GraphQLCallValue|GraphQLCallVariable|GraphQLBatchCallVariable}
 */
function callArgFromJSON(descriptor) {
  var type = descriptor[0];
  switch (type) {
    case JSON_TYPES.CALL_VALUE:
      return GraphQLCallValue.fromJSON(descriptor);
    case JSON_TYPES.CALL_VARIABLE:
      return GraphQLCallVariable.fromJSON(descriptor);
    case JSON_TYPES.BATCH_VARIABLE:
      return GraphQLBatchCallVariable.fromJSON(descriptor);
    default:
      invariant(
        false,
        'GraphQL: Unexpected call type, got `%s` from `%s`.',
        type,
        descriptor
      );
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

function isQueryWithValues(node) {
  return isType(node, QUERY_WITH_VALUES);
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
var GraphQL = {
  BatchCallVariable: GraphQLBatchCallVariable,
  Callv: GraphQLCallvNode,
  CallValue: GraphQLCallValue,
  CallVariable: GraphQLCallVariable,
  Field: GraphQLFieldNode,
  Mutation: GraphQLMutation,
  Query: GraphQLQuery,
  QueryFragment: GraphQLQueryFragment,
  QueryWithValues: GraphQLQueryWithValues,
  Subscription: GraphQLSubscription,
  isBatchCallVariable,
  isCall,
  isCallValue,
  isCallVariable,
  isField,
  isFragment,
  isMutation,
  isQuery,
  isQueryWithValues,
  isSubscription,
};

module.exports = GraphQL;
