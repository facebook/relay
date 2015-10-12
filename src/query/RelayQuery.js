/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQuery
 * @flow
 * @typechecks
 */

'use strict';

var GraphQL = require('GraphQL');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayFragmentReference = require('RelayFragmentReference');
import type {Call, Directive}  from 'RelayInternalTypes';
var RelayMetaRoute = require('RelayMetaRoute');
var RelayRouteFragment = require('RelayRouteFragment');
import type {Variables} from 'RelayTypes';

var areEqual = require('areEqual');
var callsFromGraphQL = require('callsFromGraphQL');
var callsToGraphQL = require('callsToGraphQL');
var generateRQLFieldAlias = require('generateRQLFieldAlias');
var getWeakIdForObject = require('getWeakIdForObject');
var invariant = require('invariant');
var printRelayQueryCall = require('printRelayQueryCall');
var shallowEqual = require('shallowEqual');
var stableStringify = require('stableStringify');

type BatchCall = {
  refParamName: string;
  sourceQueryID: string;
  sourceQueryPath: string;
};
type ConcreteQueryObject = any;
type FragmentMetadata = {
  isDeferred: boolean;
  isContainerFragment: boolean;
  isTypeConditional: boolean;
};
type FragmentNames = {[key: string]: string};
type RootCallValue = string | GraphQL.BatchCallVariable;
// TODO: replace once #6525923 is resolved
type NextChildren = Array<any>;

// conditional field calls/values
var IF = 'if';
var UNLESS = 'unless';
var TRUE = 'true';
var FALSE = 'false';

var QUERY_ID_PREFIX = 'q';
var REF_PARAM_PREFIX = 'ref_';

var _nextQueryID = 0;

var DEFAULT_FRAGMENT_METADATA = {
  isDeferred: false,
  isContainerFragment: false,
  isTypeConditional: false,
};

/**
 * @internal
 *
 * Queries in Relay are represented as trees. Possible nodes include the root,
 * fields, and fragments. Fields can have children, or they can be leaf nodes.
 * Root and fragment nodes must always have children.
 *
 * `RelayQueryNode` provides access to information such as the field name,
 * generated alias, sub-fields, and call values.
 *
 * Nodes are immutable; query modification is supported via `clone`:
 *
 * ```
 * var next = prev.clone(prev.getChildren().filter(f => ...));
 * ```
 *
 * Note: Mediating access to actual query nodes is necessary so that we can
 * replace the current mutable GraphQL nodes with an immutable query
 * representation. This class *must not* mutate the underlying `concreteNode`.
 * Instead, use an instance variable (see `clone()`).
 *
 * TODO (#6937314): RelayQueryNode support for toJSON/fromJSON
 */
class RelayQueryNode {
  constructor: Function; // for flow
  __calls__: ?Array<Call>;
  __children__: ?Array<RelayQueryNode>;
  __concreteNode__: ConcreteQueryObject;
  __fieldMap__: ?{[key: string]: RelayQueryField};
  __hasDeferredDescendant__: ?boolean;
  __hasValidatedConnectionCalls__: ?boolean;
  __route__: RelayMetaRoute;
  __serializationKey__: ?string;
  __storageKey__: ?string;
  __variables__: Variables;

  // TODO(#7161070) Remove this once `toGraphQL` is no longer needed.
  __isConcreteNodeCached__: boolean;

  static create(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQueryNode {
    var node = createNode(concreteNode, route, variables);
    invariant(
      node instanceof RelayQueryNode,
      'RelayQueryNode.create(): Expected a node.'
    );
    return node;
  }

  /**
   * @private
   *
   * Base class for all node types, must not be directly instantiated.
   */
  constructor(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ) {
    invariant(
      this.constructor.name !== 'RelayQueryNode',
      'RelayQueryNode: Abstract class cannot be instantiated.'
    );
    this.__concreteNode__ = concreteNode;
    this.__route__ = route;
    this.__variables__ = variables;

    // lazily computed properties
    this.__calls__ = null;
    this.__children__ = null;
    this.__fieldMap__ = null;
    this.__hasDeferredDescendant__ = null;
    this.__hasValidatedConnectionCalls__ = null;
    this.__serializationKey__ = null;
    this.__storageKey__ = null;

    // TODO(#7161070) Remove this once `toGraphQL` is no longer needed.
    this.__isConcreteNodeCached__ = false;
  }

  isGenerated(): boolean {
    return false;
  }

  isRefQueryDependency(): boolean {
    return false;
  }

  isScalar(): boolean {
    return false;
  }

  clone(children: NextChildren): ?RelayQueryNode {
    if (this.isScalar()) {
      // Compact new children *after* this check, for consistency.
      invariant(
        children.length === 0,
        'RelayQueryNode: Cannot add children to scalar fields.'
      );
      return this;
    }

    var prevChildren = this.getChildren();
    var nextChildren = cloneChildren(prevChildren, children);

    if (!nextChildren.length) {
      return null;
    } else if (nextChildren === prevChildren) {
      return this;
    }

    var clone = RelayQueryNode.create(
      this.__concreteNode__,
      this.__route__,
      this.__variables__
    );
    clone.__children__ = nextChildren;
    clone.__calls__ = this.__calls__;
    clone.__serializationKey__ = this.__serializationKey__;
    clone.__storageKey__ = this.__storageKey__;

    return clone;
  }

  getChildren(): Array<RelayQueryNode> {
    var children = this.__children__;
    if (!children) {
      var nextChildren = [];
      this.__concreteNode__.children.forEach(concreteChild => {
        var node = createNode(
          concreteChild,
          this.__route__,
          this.__variables__
        );
        if (node) {
          nextChildren.push(node);
        }
      });
      this.__children__ = nextChildren;
      children = nextChildren;
    }
    return children;
  }

  getDirectives(): Array<Directive> {
    return this.__concreteNode__.directives.map(directive => ({
      name: directive.name,
      arguments: callsFromGraphQL(directive.arguments, this.__variables__),
    }));
  }

  getField(field: RelayQueryField): ?RelayQueryField {
    return this.getFieldByStorageKey(field.getStorageKey());
  }

  getFieldByStorageKey(storageKey: string): ?RelayQueryField {
    var fieldMap = this.__fieldMap__;
    if (!fieldMap) {
      fieldMap = {};
      var child;
      var children = this.getChildren();
      for (var ii = 0; ii < children.length; ii++) {
        child = children[ii];
        if (child instanceof RelayQueryField) {
          fieldMap[child.getStorageKey()] = child;
        }
      }
      this.__fieldMap__ = fieldMap;
    }
    return fieldMap[storageKey];
  }

  getRoute(): RelayMetaRoute {
    return this.__route__;
  }

  getVariables(): Variables {
    return this.__variables__;
  }

  hasDeferredDescendant(): boolean {
    var hasDeferredDescendant = this.__hasDeferredDescendant__;
    if (hasDeferredDescendant == null) {
      hasDeferredDescendant =
        !this.isScalar() &&
        this.getChildren().some(child => child.hasDeferredDescendant());
      this.__hasDeferredDescendant__ = hasDeferredDescendant;
    }
    return hasDeferredDescendant;
  }

  isRequisite(): boolean {
    return false;
  }

  /**
   * Determine if `this` and `that` are deeply equal.
   */
  equals(that: RelayQueryNode): boolean {
    var thisChildren = this.getChildren();
    var thatChildren = that.getChildren();

    return thisChildren === thatChildren || (
      thisChildren.length === thatChildren.length &&
      thisChildren.every((c, ii) => c.equals(thatChildren[ii]))
    );
  }

  /**
   * Performs a fast comparison of whether `this` and `that` represent identical
   * query nodes. Returns true only if the concrete nodes, routes, and variables
   * are all the same.
   *
   * Note that it is possible that this method can return false in cases where
   * `equals` would return true. This can happen when the concrete nodes are
   * different but structurally identical, or when the route/variables are
   * different but do not have an effect on the structure of the query.
   */
  isEquivalent(that: RelayQueryNode): boolean {
    return (
      this.__concreteNode__ === that.__concreteNode__ &&
      this.__route__ === that.__route__ &&
      shallowEqual(this.__variables__, that.__variables__)
    );
  }

  createNode(concreteNode: ConcreteQueryObject): RelayQueryNode {
    return RelayQueryNode.create(
      concreteNode,
      this.__route__,
      this.__variables__
    );
  }

  getConcreteQueryNode(
    onCacheMiss: () => ConcreteQueryObject
  ): ConcreteQueryObject {
    if (!this.__isConcreteNodeCached__) {
      this.__concreteNode__ = onCacheMiss();
      this.__isConcreteNodeCached__ = true;
    }
    return this.__concreteNode__;
  }
}

/**
 * @internal
 *
 * Wraps access to query root nodes.
 */
class RelayQueryRoot extends RelayQueryNode {
  __batchCall__: ?BatchCall;
  __deferredFragmentNames__: ?FragmentNames;
  __id__: ?string;
  __identifyingArg__: ?Call;
  __storageKey__: ?string;

  /**
   * Helper to construct a new root query with the given attributes and 'empty'
   * route/variables.
   */
  static build(
    fieldName: string,
    identifyingArgValue?: ?Array<RootCallValue> | ?RootCallValue,
    children?: ?Array<RelayQueryNode>,
    metadata?: ?{[key: string]: mixed},
    name?: ?string
  ): RelayQueryRoot {
    var nextChildren = children ? children.filter(child => !!child) : [];
    var concreteRoot = new GraphQL.Query(
      fieldName,
      identifyingArgValue || null,
      null,
      null,
      metadata,
      name
    );
    var root = new RelayQueryRoot(
      concreteRoot,
      RelayMetaRoute.get('$RelayQuery'),
      {}
    );
    root.__children__ = nextChildren;
    return root;
  }

  static create(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQueryRoot {
    invariant(
      GraphQL.isQuery(concreteNode),
      'RelayQueryRoot.create(): Expected a concrete query, got: %s',
      concreteNode
    );
    return new RelayQueryRoot(
      concreteNode,
      route,
      variables
    );
  }

  constructor(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ) {
    super(concreteNode, route, variables);
    this.__batchCall__ = undefined;
    this.__deferredFragmentNames__ = undefined;
    this.__id__ = undefined;
    this.__identifyingArg__ = undefined;
    this.__storageKey__ = undefined;

    // Ensure IDs are generated in the order that queries are created
    this.getID();
  }

  getName(): string {
    var name = this.__concreteNode__.name;
    if (!name) {
      name = this.getID();
      this.__concreteNode__.name = name;
    }
    return name;
  }

  getID(): string {
    var id = this.__id__;
    if (id == null) {
      id = QUERY_ID_PREFIX + _nextQueryID++;
      this.__id__ = id;
    }
    return id;
  }

  getBatchCall(): ?BatchCall {
    var batchCall = this.__batchCall__;
    if (batchCall === undefined) {
      var concreteCalls = this.__concreteNode__.calls;
      var callArg = concreteCalls[0] && concreteCalls[0].value;
      if (callArg != null && GraphQL.isBatchCallVariable(callArg)) {
        batchCall = {
          refParamName: REF_PARAM_PREFIX + callArg.sourceQueryID,
          sourceQueryID: callArg.sourceQueryID,
          sourceQueryPath: callArg.jsonPath,
        };
      } else {
        batchCall = null;
      }
      this.__batchCall__ = batchCall;
    }
    return batchCall;
  }

  getCallsWithValues(): Array<Call> {
    var calls = this.__calls__;
    if (!calls) {
      var concreteCalls = this.__concreteNode__.calls;
      calls = callsFromGraphQL(concreteCalls, this.__variables__);
      this.__calls__ = calls;
    }
    return calls;
  }

  getFieldName(): string {
    return this.__concreteNode__.fieldName;
  }

  getIdentifyingArg(): ?Call {
    let identifyingArg = this.__identifyingArg__;
    if (!identifyingArg) {
      const metadata = this.__concreteNode__.metadata;
      const identifyingArgName = metadata.identifyingArgName;
      if (identifyingArgName != null) {
        identifyingArg =
          this.getCallsWithValues().find(c => c.name === identifyingArgName);
        if (identifyingArg && metadata.identifyingArgType != null) {
          identifyingArg.type = metadata.identifyingArgType;
        }
        this.__identifyingArg__ = identifyingArg;
      }
    }
    return identifyingArg;
  }

  getStorageKey(): string {
    let storageKey = this.__storageKey__;
    if (!storageKey) {
      let args = this.getCallsWithValues();
      const identifyingArg = this.getIdentifyingArg();
      if (identifyingArg) {
        args = args.filter(arg => arg !== identifyingArg);
      }
      const field = RelayQueryField.build(
        this.getFieldName(),
        args,
        null,
        this.__concreteNode__.metadata
      );
      storageKey = field.getStorageKey();
      this.__storageKey__ = storageKey;
    }
    return storageKey;
  }

  hasDeferredDescendant(): boolean {
    return this.isDeferred() || super.hasDeferredDescendant();
  }

  isDeferred(): boolean {
    return this.__concreteNode__.isDeferred;
  }

  getDeferredFragmentNames(): FragmentNames {
    var fragmentNames = this.__deferredFragmentNames__;
    if (!fragmentNames) {
      fragmentNames = {};
      getDeferredFragmentNamesForField(this, fragmentNames);
      this.__deferredFragmentNames__ = fragmentNames;
    }
    return fragmentNames;
  }

  equals(that: RelayQueryNode): boolean {
    if (this === that) {
      return true;
    }
    if (!(that instanceof RelayQueryRoot)) {
      return false;
    }
    if (!areEqual(this.getBatchCall(), that.getBatchCall())) {
      return false;
    }
    if (
      this.getFieldName() !== that.getFieldName() ||
      !areEqual(this.getCallsWithValues(), that.getCallsWithValues())
    ) {
      return false;
    }
    return super.equals(that);
  }
}

/**
 * @internal
 *
 * Abstract base class for mutations and subscriptions.
 */
class RelayQueryOperation extends RelayQueryNode {
  __callVariableName__: string;

  constructor(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ) {
    super(concreteNode, route, variables);
    invariant(
      this.constructor.name !== 'RelayQueryOperation',
      'RelayQueryOperation: Abstract class cannot be instantiated.'
    );
  }

  getName(): string {
    return this.__concreteNode__.name;
  }

  getResponseType(): string {
    return this.__concreteNode__.responseType;
  }

  getInputType(): string {
    var inputType = this.__concreteNode__.metadata.inputType;
    invariant(
      inputType,
      'RelayQuery: Expected operation `%s` to be annotated with the type of ' +
      'its argument. Either the babel transform was configured incorrectly, ' +
      'or the schema failed to define an argument for this mutation.',
      this.getCall().name
    );
    return inputType;
  }

  getCall(): Call {
    var calls = this.__calls__;
    if (!calls) {
      var concreteCalls = this.__concreteNode__.calls;
      calls = callsFromGraphQL(concreteCalls, this.__variables__);
      this.__calls__ = calls;
    }
    return calls[0];
  }

  getCallVariableName(): string {
    if (!this.__callVariableName__) {
      var concreteCalls = this.__concreteNode__.calls;
      var callArg = concreteCalls[0].value;
      invariant(
        GraphQL.isCallVariable(callArg),
        'RelayQuery: Expected mutation to have a single argument.'
      );
      this.__callVariableName__ = callArg.callVariableName;
    }
    return this.__callVariableName__;
  }
}

/**
 * @internal
 *
 * Represents a GraphQL mutation.
 */
class RelayQueryMutation extends RelayQueryOperation {
  /**
   * Helper to construct a new mutation with the given attributes and 'empty'
   * route/variables.
   */
  static build(
    mutationName: string,
    responseType: string,
    callName: string,
    callValue?: ?mixed,
    children?: ?Array<RelayQueryNode>,
    metadata?: ?{[key: string]: mixed}
  ): RelayQueryMutation {
    var nextChildren = children ? children.filter(child => !!child) : [];
    var concreteMutation = new GraphQL.Mutation(
      mutationName,
      responseType,
      new GraphQL.Callv(callName, new GraphQL.CallVariable('input')),
      null,
      null,
      metadata
    );
    var mutation = new RelayQueryMutation(
      concreteMutation,
      RelayMetaRoute.get('$RelayQuery'),
      {input: callValue || ''}
    );
    mutation.__children__ = nextChildren;
    return mutation;
  }

  equals(that: RelayQueryNode): boolean {
    if (this === that) {
      return true;
    }
    if (!(that instanceof RelayQueryMutation)) {
      return false;
    }
    if (!areEqual(this.getResponseType(), that.getResponseType())) {
      return false;
    }
    if (!areEqual(this.getCall(), that.getCall())) {
      return false;
    }
    return super.equals(that);
  }
}

/**
 * @internal
 *
 * Represents a GraphQL subscription.
 */
class RelayQuerySubscription extends RelayQueryOperation {
  static create(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQuerySubscription {
    invariant(
      GraphQL.isSubscription(concreteNode),
      'RelayQuerySubscription.create(): ' +
      'Expected a concrete subscription, got: %s',
      concreteNode
    );
    return new RelayQuerySubscription(
      concreteNode,
      route,
      variables
    );
  }

  getPublishedPayloadType(): string {
    return this.getResponseType();
  }

  equals(that: RelayQueryNode): boolean {
    if (this === that) {
      return true;
    }
    if (!(that instanceof RelayQuerySubscription)) {
      return false;
    }
    if (
      !areEqual(this.getPublishedPayloadType(), that.getPublishedPayloadType())
    ) {
      return false;
    }
    if (!areEqual(this.getCall(), that.getCall())) {
      return false;
    }
    return super.equals(that);
  }
}

/**
 * @internal
 *
 * Wraps access to query fragments.
 *
 * Note: place proxy methods for `GraphQL.QueryFragment` here.
 */
class RelayQueryFragment extends RelayQueryNode {
  __fragmentID__: ?string;
  __metadata__: FragmentMetadata;

  /**
   * Helper to construct a new fragment with the given attributes and 'empty'
   * route/variables.
   */
  static build(
    name: string,
    type: string,
    children?: ?Array<RelayQueryNode>,
    metadata?: ?{[key: string]: mixed}
  ): RelayQueryFragment {
    var nextChildren = children ? children.filter(child => !!child) : [];
    var concreteFragment = new GraphQL.QueryFragment(
      name,
      type,
      null,
      null,
      metadata
    );
    var fragment = new RelayQueryFragment(
      concreteFragment,
      RelayMetaRoute.get('$RelayQuery'),
      {},
      {
        isDeferred: !!(metadata && metadata.isDeferred),
        isContainerFragment: !!(metadata && metadata.isContainerFragment),
        isTypeConditional: !!(metadata && metadata.isTypeConditional),
      }
    );
    fragment.__children__ = nextChildren;
    return fragment;
  }

  static create(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables,
    metadata?: ?FragmentMetadata
  ): RelayQueryFragment {
    invariant(
      GraphQL.isFragment(concreteNode),
      'RelayQueryFragment.create(): ' +
      'Expected a concrete query fragment, got: %s',
      concreteNode
    );
    return createMemoizedFragment(
      concreteNode,
      route,
      variables,
      metadata || DEFAULT_FRAGMENT_METADATA
    );
  }

  constructor(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables,
    metadata?: FragmentMetadata
  ) {
    super(concreteNode, route, variables);
    this.__fragmentID__ = null;
    this.__metadata__ = metadata || DEFAULT_FRAGMENT_METADATA;
  }

  getDebugName(): string {
    return this.__concreteNode__.name;
  }

  /**
   * Returns the weak ID for the concrete fragment. Unlike `getFragmentID`,
   * this value is identical for any `RelayQueryFragment` with the same concrete
   * fragment, regardless of params/route.
   */
  getConcreteFragmentID(): string {
    return '_RelayQueryFragment' + getWeakIdForObject(this.__concreteNode__);
  }

  /**
   * Returns an identifier for a fragment that is unique for any combination of
   * concrete fragment, route name, and variables.
   */
  getFragmentID(): string {
    var fragmentID = this.__fragmentID__;
    if (!fragmentID) {
      fragmentID = generateRQLFieldAlias(
        this.getConcreteFragmentID() + '.' +
        this.__route__.name + '.' +
        stableStringify(this.__variables__)
      );
      this.__fragmentID__ = fragmentID;
    }
    return fragmentID;
  }

  getType(): string {
    return this.__concreteNode__.type;
  }

  isDeferred(): boolean {
    return this.__metadata__.isDeferred;
  }

  isPlural(): boolean {
    return !!(
      (this.__concreteNode__.isPlural || // RQLPrinter
      this.__concreteNode__.metadata.plural) // GraphQLPrinter
    );
  }

  isContainerFragment(): boolean {
    return this.__metadata__.isContainerFragment;
  }

  isTypeConditional(): boolean {
    return this.__metadata__.isTypeConditional;
  }

  hasDeferredDescendant(): boolean {
    return this.isDeferred() || super.hasDeferredDescendant();
  }

  clone(children: NextChildren): ?RelayQueryNode {
    var clone = super.clone(children);
    if (clone instanceof RelayQueryFragment) {
      clone.__metadata__ = {
        ...this.__metadata__
      };
    }
    return clone;
  }

  equals(that: RelayQueryNode): boolean {
    if (this === that) {
      return true;
    }
    if (!(that instanceof RelayQueryFragment)) {
      return false;
    }
    if (this.getType() !== that.getType()) {
      return false;
    }
    return super.equals(that);
  }
}

/**
 * @internal
 *
 * Wraps access to query fields.
 *
 * Note: place proxy methods for `GraphQL.Field` here.
 */
class RelayQueryField extends RelayQueryNode {
  __isRefQueryDependency__: boolean;

  /**
   * Helper to construct a new field with the given attributes and 'empty'
   * route/variables.
   */
  static build(
    fieldName: string,
    calls?: ?Array<Call>,
    children?: ?NextChildren,
    metadata?: ?{[key: string]: mixed},
    alias?: ?string
  ): RelayQueryField {
    var nextChildren = children ? children.filter(child => !!child) : [];
    var concreteField = new GraphQL.Field(
      fieldName,
      null,
      null,
      calls ? callsToGraphQL(calls) : null,
      alias,
      null,
      metadata
    );
    var field = new RelayQueryField(
      concreteField,
      RelayMetaRoute.get('$RelayQuery'),
      {}
    );
    field.__children__ = nextChildren;
    return field;
  }

  constructor(
    concreteNode: ConcreteQueryObject,
    route: RelayMetaRoute,
    variables: Variables
  ) {
    super(concreteNode, route, variables);
    this.__isRefQueryDependency__ = false;
  }

  isRequisite(): boolean {
    return this.__concreteNode__.metadata.isRequisite;
  }

  isFindable(): boolean {
    return this.__concreteNode__.metadata.isFindable;
  }

  isGenerated(): boolean {
    return this.__concreteNode__.metadata.isGenerated;
  }

  isConnection(): boolean {
    return this.__concreteNode__.metadata.isConnection;
  }

  isPlural(): boolean {
    return this.__concreteNode__.metadata.isPlural;
  }

  isRefQueryDependency(): boolean {
    return this.__isRefQueryDependency__;
  }

  isScalar(): boolean {
    return (
      (!this.__children__ || this.__children__.length === 0) &&
      this.__concreteNode__.children.length === 0
    );
  }

  isUnionOrInterface(): boolean {
    return this.__concreteNode__.metadata.isUnionOrInterface;
  }

  getParentType(): string {
    var parentType = this.__concreteNode__.metadata.parentType;
    invariant(
      parentType,
      'RelayQueryField(): Expected field `%s` to be annotated with the ' +
      'type of the parent field.',
      this.getSchemaName()
    );
    return parentType;
  }

  /**
   * The canonical name for the referenced field in the schema.
   */
  getSchemaName(): string {
    return this.__concreteNode__.fieldName;
  }

  /**
   * The name for the field when serializing the query or interpreting query
   * responses from the server. The serialization key is derived from
   * all calls/values and hashed for compactness.
   *
   * Given the graphql
   * `news_feed.first(10).orderby(TOP_STORIES)`
   *
   * the serialization key is
   * `generateRQLFieldAlias('news_feed.first(10).orderby(TOP_STORIES')`
   */
  getSerializationKey(): string {
    var serializationKey = this.__serializationKey__;
    if (!serializationKey) {
      serializationKey = this.getSchemaName();
      var calls = this.getCallsWithValues();
      for (var ii = 0; ii < calls.length; ii++) {
        serializationKey += printRelayQueryCall(calls[ii]);
      }
      serializationKey = generateRQLFieldAlias(serializationKey);
      this.__serializationKey__ = serializationKey;
    }
    return serializationKey;
  }

  /**
   * The name which Relay internals can use to reference this field, without
   * collisions. The storage key is derived from arguments with the following
   * exclusions:
   *
   *  - Range calls such as `first` or `find` on connections.
   *  - Conditionals when the field is present.
   *
   * Given the graphql
   * `news_feed.first(10).orderby(TOP_STORIES).if(true)`
   *
   * the storage key is
   * `'news_feed.orderby(TOP_STORIES)'`
   */
  getStorageKey(): string {
    let storageKey = this.__storageKey__;
    if (!storageKey) {
      const isConnection = this.isConnection();
      const argsToPrint = [];
      const calls = this.getCallsWithValues();
      for (let i = 0; i < calls.length; i++) {
        const call = calls[i];
        if (isConnection && RelayConnectionInterface.isConnectionCall(call)) {
          continue;
        } else if (
          (call.name === IF && (String(call.value) === TRUE)) ||
          (call.name === UNLESS && (String(call.value) === FALSE))
        ) {
          // `name.if(true)`, `name.unless(false)`, and `name` are all
          // equivalent fields.
          continue;
        }
        argsToPrint.push(call);
      }
      storageKey =
        this.getSchemaName() +
        argsToPrint.map(printRelayQueryCall).sort().join('');
      this.__storageKey__ = storageKey;
    }
    // $FlowIssue #8688673 - The for loop above triggers a flow error
    return storageKey;
  }

  /**
   * The name by which this field's results should be made available to the
   * application.
   */
  getApplicationName(): string {
    return this.__concreteNode__.alias || this.__concreteNode__.fieldName;
  }

  getInferredRootCallName(): ?string {
    return this.__concreteNode__.metadata.inferredRootCallName;
  }

  getInferredPrimaryKey(): ?string {
    return this.__concreteNode__.metadata.inferredPrimaryKey;
  }

  getCallsWithValues(): Array<Call> {
    var calls = this.__calls__;
    if (!calls) {
      var concreteCalls = this.__concreteNode__.calls;
      calls = callsFromGraphQL(concreteCalls, this.__variables__);
      this.__calls__ = calls;
    }
    return calls;
  }

  getCallType(callName: string): ?string {
    var concreteCall = this.__concreteNode__.calls.filter(
      call => call.name === callName
    )[0];
    if (concreteCall) {
      return concreteCall.metadata.type;
    }
  }

  equals(that: RelayQueryNode): boolean {
    if (this === that) {
      return true;
    }
    if (!(that instanceof RelayQueryField)) {
      return false;
    }
    if (
      this.getSchemaName() !== that.getSchemaName() ||
      this.getApplicationName() !== that.getApplicationName() ||
      !areEqual(this.getCallsWithValues(), that.getCallsWithValues())
    ) {
      return false;
    }
    return super.equals(that);
  }

  cloneAsRefQueryDependency(): RelayQueryField {
    var field = new RelayQueryField(
      this.__concreteNode__,
      this.__route__,
      this.__variables__
    );
    field.__children__ = [];
    field.__isRefQueryDependency__ = true;
    return field;
  }

  cloneFieldWithCalls(
    children: NextChildren,
    calls: Array<Call>
  ): ?RelayQueryField {
    if (this.isScalar()) {
      // Compact new children *after* this check, for consistency.
      invariant(
        children.length === 0,
        'RelayQueryField: Cannot add children to scalar fields.'
      );
    }

    // use `clone()` if call values do not change
    if (areEqual(this.getCallsWithValues(), calls)) {
      var clone: RelayQueryField = (this.clone(children): any);
      return clone;
    }

    var nextChildren = cloneChildren(this.getChildren(), children);
    if (!nextChildren.length) {
      return null;
    }

    var field = new RelayQueryField(
      this.__concreteNode__,
      this.__route__,
      this.__variables__
    );
    field.__children__ = nextChildren;
    field.__calls__ = calls;

    return field;
  }
}

function createNode(
  concreteNode: ConcreteQueryObject,
  route: RelayMetaRoute,
  variables: Variables
): ?RelayQueryNode {
  // unused default value keeps flow happy
  var type = RelayQueryNode;
  if (GraphQL.isField(concreteNode)) {
    type = RelayQueryField;
  } else if (GraphQL.isFragment(concreteNode)) {
    type = RelayQueryFragment;
  } else if (GraphQL.isQuery(concreteNode)) {
    type = RelayQueryRoot;
  } else if (GraphQL.isQueryWithValues(concreteNode)) {
    concreteNode = (concreteNode: $FlowIssue).query;
    type = RelayQueryRoot;
  } else if (GraphQL.isMutation(concreteNode)) {
    type = RelayQueryMutation;
  } else if (GraphQL.isSubscription(concreteNode)) {
    type = RelayQuerySubscription;
  } else if (concreteNode instanceof RelayRouteFragment) {
    var routeFragment = concreteNode.getFragmentForRoute(route);
    if (routeFragment) {
      // may be null if no value was defined for this route.
      return createNode(
        routeFragment,
        route,
        variables
      );
    }
    return null;
  } else if (concreteNode instanceof RelayFragmentReference) {
    var fragment = concreteNode.getFragment(variables);
    var fragmentVariables = concreteNode.getVariables(route, variables);
    if (fragment) {
      // the fragment may be null when `if` or `unless` conditions are not met.
      invariant(
        GraphQL.isFragment(fragment),
        'RelayQuery: Invalid fragment reference, expected query fragment.'
      );
      return createMemoizedFragment(
        fragment,
        route,
        fragmentVariables,
        {
          isDeferred: concreteNode.isDeferred(),
          isContainerFragment: concreteNode.isContainerFragment(),
          isTypeConditional: concreteNode.isTypeConditional(),
        }
      );
    }
    return null;
  } else {
    invariant(false, 'RelayQueryNode: Invalid concrete node.');
  }
  return new type(
    concreteNode,
    route,
    variables
  );
}

/**
 * Memoizes the `RelayQueryFragment` equivalent of a given `GraphQL` fragment
 * for the given route, variables, and deferred status.
 */
function createMemoizedFragment(
  concreteFragment: GraphQL.QueryFragment,
  route: RelayMetaRoute,
  variables: Variables,
  metadata: FragmentMetadata
): RelayQueryFragment {
  var cacheKey = route.name + ':' + stableStringify(variables) + ':' +
    stableStringify(metadata);
  var fragment = concreteFragment.__cachedFragment__;
  var fragmentCacheKey = concreteFragment.__cacheKey__;
  if (!fragment || fragmentCacheKey !== cacheKey) {
    fragment = new RelayQueryFragment(
      concreteFragment,
      route,
      variables,
      metadata
    );
    concreteFragment.__cachedFragment__ = fragment;
    concreteFragment.__cacheKey__ = cacheKey;
  }
  return fragment;
}

/**
 * Compacts new children and compares them to the previous children.
 * - If all items are equal, returns previous array
 * - If any items differ, returns new array
 */
function cloneChildren(
  prevChildren: Array<RelayQueryNode>,
  nextChildren: NextChildren
): Array<RelayQueryNode> {
  var children = [];
  var isSameChildren = true;

  var prevIndex = 0;
  for (var ii = 0; ii < nextChildren.length; ii++) {
    var child = nextChildren[ii];
    if (child) {
      children.push(child);
      isSameChildren = isSameChildren && child === prevChildren[prevIndex++];
    }
  }

  if (isSameChildren && children.length === prevChildren.length) {
    return prevChildren;
  } else {
    return children;
  }
}

/**
 * Returns the names of the deferred fragments in the query. Does not return
 * nested deferred fragment names.
 */
function getDeferredFragmentNamesForField(
  node: RelayQueryNode,
  fragmentNames: FragmentNames
): void {
  if (node instanceof RelayQueryFragment && node.isDeferred()) {
    var fragmentID = node.getFragmentID();
    fragmentNames[fragmentID] = fragmentID;
    return;
  }
  node.getChildren().forEach(
    child => getDeferredFragmentNamesForField(child, fragmentNames)
  );
}

module.exports = {
  Field: RelayQueryField,
  Fragment: RelayQueryFragment,
  Mutation: RelayQueryMutation,
  Node: RelayQueryNode,
  Operation: RelayQueryOperation,
  Root: RelayQueryRoot,
  Subscription: RelayQuerySubscription,
};
