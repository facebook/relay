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

import type {
  ConcreteField,
  ConcreteFragment,
  ConcreteMutation,
  ConcreteNode,
  ConcreteQuery,
  ConcreteSelection,
} from 'ConcreteQuery';
var QueryBuilder = require('QueryBuilder');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayFragmentReference = require('RelayFragmentReference');
import type {Call, Directive}  from 'RelayInternalTypes';
var RelayMetaRoute = require('RelayMetaRoute');
var RelayProfiler = require('RelayProfiler');
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
type FragmentMetadata = {
  isDeferred: boolean;
  isContainerFragment: boolean;
  isTypeConditional: boolean;
};
type FragmentNames = {[key: string]: string};
// TODO: replace once #6525923 is resolved
type NextChildren = Array<any>;

// conditional field calls/values
const IF = 'if';
const UNLESS = 'unless';
const TRUE = 'true';
const FALSE = 'false';
const SKIP = 'skip';
const INCLUDE = 'include';

const QUERY_ID_PREFIX = 'q';
const REF_PARAM_PREFIX = 'ref_';

let _nextQueryID = 0;

const DEFAULT_FRAGMENT_METADATA = {
  isDeferred: false,
  isContainerFragment: false,
  isTypeConditional: false,
};
const EMPTY_DIRECTIVES = [];
const EMPTY_CALLS = [];

if (__DEV__) {
  Object.freeze(EMPTY_CALLS);
  Object.freeze(EMPTY_DIRECTIVES);
}

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
 */
class RelayQueryNode {
  constructor: Function; // for flow
  __calls__: ?Array<Call>;
  __children__: ?Array<RelayQueryNode>;
  __concreteNode__: any;
  __fieldMap__: ?{[key: string]: RelayQueryField};
  __hasDeferredDescendant__: ?boolean;
  __hasValidatedConnectionCalls__: ?boolean;
  __route__: RelayMetaRoute;
  __serializationKey__: ?string;
  __storageKey__: ?string;
  __variables__: Variables;

  static create(
    concreteNode: mixed,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQueryNode {
    var node = createNode(concreteNode, route, variables);
    invariant(
      node instanceof RelayQueryNode,
      'RelayQueryNode.create(): ' +
      'Expected a GraphQL fragment, mutation, or query.'
    );
    return node;
  }

  /**
   * @private
   *
   * Base class for all node types, must not be directly instantiated.
   */
  constructor(
    concreteNode: any,
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
        'RelayQueryNode: Cannot add children to scalar field `%s`.',
        this instanceof RelayQueryField ? this.getSchemaName() : null
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
    let children = this.__children__;
    if (!children) {
      const nextChildren = [];
      const concreteChildren = (this.__concreteNode__: ConcreteNode).children;
      if (concreteChildren) {
        concreteChildren.forEach(concreteChild => {
          if (concreteChild == null) {
            return;
          }
          var node = createNode(
            concreteChild,
            this.__route__,
            this.__variables__
          );
          if (node && node.isIncluded()) {
            nextChildren.push(node);
          }
        });
      }
      this.__children__ = nextChildren;
      children = nextChildren;
    }
    return children;
  }

  isIncluded(): boolean {
    // Bail out early since most nodes won't have directives
    if (!(this.__concreteNode__.directives: ConcreteNode)) {
      return true;
    }
    return this.getDirectives().every(directive => {
      if (directive.name === SKIP) {
        return !directive.arguments.some(arg => arg.name === IF && !!arg.value);
      } else if (directive.name === INCLUDE) {
        return !directive.arguments.some(arg => arg.name === IF && !arg.value);
      }
      return true;
    });
  }

  getDirectives(): Array<Directive> {
    const concreteDirectives = (this.__concreteNode__: ConcreteNode).directives;
    if (concreteDirectives) {
      return this.__concreteNode__.directives.map(directive => ({
        name: directive.name,
        arguments: callsFromGraphQL(directive.arguments, this.__variables__),
      }));
    }
    return EMPTY_DIRECTIVES;
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

  createNode(concreteNode: any): RelayQueryNode {
    return RelayQueryNode.create(
      concreteNode,
      this.__route__,
      this.__variables__
    );
  }

  getConcreteQueryNode(): any {
    return this.__concreteNode__;
  }

  __toJSONChildren__(): Array<?ConcreteSelection> {
    return this.getChildren().map(child => {
      invariant(
        child instanceof RelayQueryFragment
        || child instanceof RelayQueryField,
        'RelayQueryNode.__toJSONChildren__(): Invalid node.'
      );
      return child.toJSON();
    });
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
    name: string,
    fieldName: string,
    value: mixed,
    children: ?Array<RelayQueryNode>,
    metadata: ?{[key: string]: mixed}
  ): RelayQueryRoot {
    const nextChildren = children ? children.filter(child => !!child) : [];
    const batchCallVariable = QueryBuilder.getBatchCallVariable(value);
    let identifyingArgValue;
    if (batchCallVariable) {
      identifyingArgValue = batchCallVariable;
    } else if (Array.isArray(value)) {
      identifyingArgValue = value.map(QueryBuilder.createCallValue);
    } else if (value) {
      identifyingArgValue = QueryBuilder.createCallValue(value);
    }
    const concreteRoot = QueryBuilder.createQuery({
      fieldName,
      identifyingArgValue,
      metadata,
      name,
    });
    var root = new RelayQueryRoot(
      concreteRoot,
      RelayMetaRoute.get('$RelayQuery'),
      {}
    );
    root.__children__ = nextChildren;
    return root;
  }

  static create(
    concreteNode: mixed,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQueryRoot {
    const query = QueryBuilder.getQuery(concreteNode);
    invariant(
      query,
      'RelayQueryRoot.create(): Expected a GraphQL `query { ... }`, got: %s',
      concreteNode
    );
    return new RelayQueryRoot(
      query,
      route,
      variables
    );
  }

  constructor(
    concreteNode: ConcreteQuery,
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
    let name = (this.__concreteNode__: ConcreteQuery).name;
    if (!name) {
      name = this.getID();
      (this.__concreteNode__: ConcreteQuery).name = name;
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
    let batchCall = this.__batchCall__;
    if (batchCall === undefined) {
      const concreteCalls = (this.__concreteNode__: ConcreteQuery).calls;
      if (concreteCalls) {
        var callArg = concreteCalls[0] && concreteCalls[0].value;
        if (
          callArg != null &&
          !Array.isArray(callArg) &&
          callArg.kind === 'BatchCallVariable'
        ) {
          batchCall = {
            refParamName: REF_PARAM_PREFIX + callArg.sourceQueryID,
            sourceQueryID: callArg.sourceQueryID,
            sourceQueryPath: callArg.jsonPath,
          };
        }
      }
      batchCall = batchCall || null;
      this.__batchCall__ = batchCall;
    }
    return batchCall;
  }

  getCallsWithValues(): Array<Call> {
    let calls = this.__calls__;
    if (!calls) {
      const concreteCalls = (this.__concreteNode__: ConcreteQuery).calls;
      if (concreteCalls) {
        calls = callsFromGraphQL(concreteCalls, this.__variables__);
      } else {
        calls = EMPTY_CALLS;
      }
      this.__calls__ = calls;
    }
    return calls;
  }

  getFieldName(): string {
    return (this.__concreteNode__: ConcreteQuery).fieldName;
  }

  getIdentifyingArg(): ?Call {
    let identifyingArg = this.__identifyingArg__;
    if (!identifyingArg) {
      const metadata = (this.__concreteNode__: ConcreteQuery).metadata;
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
        null
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
    return !!(this.__concreteNode__: ConcreteQuery).isDeferred;
  }

  isPlural(): boolean {
    return !!(this.__concreteNode__: ConcreteQuery).metadata.isPlural;
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

  static fromJSON(json: ConcreteQuery): RelayQueryRoot {
    return RelayQueryRoot.create(json, RelayMetaRoute.get('$fromJSON'), {});
  }

  toJSON(): ConcreteQuery {
    const getIdentifyingArgValue = () => {
      const batchCall = this.getBatchCall();
      if (batchCall) {
        return QueryBuilder.createBatchCallVariable(
          batchCall.sourceQueryID,
          batchCall.sourceQueryPath
        );
      } else {
        const identifyingArg = this.getIdentifyingArg();
        if (identifyingArg) {
          if (Array.isArray(identifyingArg.value)) {
            return identifyingArg.value.map(
              QueryBuilder.createCallValue
            );
          } else {
            return QueryBuilder.createCallValue(
              identifyingArg.value
            );
          }
        }
      }
    };

    // Use `QueryBuilder` to generate the correct calls from the
    // identifying argument & metadata.
    return QueryBuilder.createQuery({
      children: this.__toJSONChildren__(),
      fieldName: this.getFieldName(),
      identifyingArgValue: getIdentifyingArgValue(),
      isDeferred: this.isDeferred(),
      metadata: this.getConcreteQueryNode().metadata,
      name: this.getName(),
    });
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
    concreteNode: any,
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
    return (this.__concreteNode__: ConcreteMutation).name;
  }

  getResponseType(): string {
    return (this.__concreteNode__: ConcreteMutation).responseType;
  }

  getInputType(): string {
    const inputType =
      (this.__concreteNode__: ConcreteMutation).metadata.inputType;
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
    let calls = this.__calls__;
    if (!calls) {
      const concreteCalls = (this.__concreteNode__: ConcreteMutation).calls;
      if (concreteCalls) {
        calls = callsFromGraphQL(concreteCalls, this.__variables__);
      } else {
        calls = EMPTY_CALLS;
      }
      this.__calls__ = calls;
    }
    return calls[0];
  }

  getCallVariableName(): string {
    if (!this.__callVariableName__) {
      const concreteCalls = (this.__concreteNode__: ConcreteMutation).calls;
      const callVariable =
        concreteCalls && QueryBuilder.getCallVariable(concreteCalls[0].value);
      invariant(
        callVariable,
        'RelayQuery: Expected mutation to have a single argument.'
      );
      this.__callVariableName__ = callVariable.callVariableName;
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
    name: string,
    responseType: string,
    callName: string,
    callValue?: ?mixed,
    children?: ?Array<RelayQueryNode>,
    metadata?: ?{[key: string]: mixed}
  ): RelayQueryMutation {
    var nextChildren = children ? children.filter(child => !!child) : [];
    var concreteMutation = QueryBuilder.createMutation({
      calls: [QueryBuilder.createCall(
        callName,
        QueryBuilder.createCallVariable('input')
      )],
      metadata,
      name,
      responseType,
    });
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
    concreteNode: mixed,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQuerySubscription {
    const subscription = QueryBuilder.getSubscription(concreteNode);
    invariant(
      subscription,
      'RelayQuerySubscription.create(): ' +
      'Expected a GraphQL `subscription { ... }`, got: %s',
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
 */
class RelayQueryFragment extends RelayQueryNode {
  __fragmentID__: ?string;
  __hash__: ?string;
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
    var concreteFragment = QueryBuilder.createFragment({
      name,
      type,
      metadata,
    });
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
    concreteNode: mixed,
    route: RelayMetaRoute,
    variables: Variables,
    metadata?: ?FragmentMetadata
  ): RelayQueryFragment {
    const fragment = QueryBuilder.getFragment(concreteNode);
    invariant(
      fragment,
      'RelayQueryFragment.create(): ' +
      'Expected a GraphQL `fragment { ... }`, got: %s',
      concreteNode
    );
    return createMemoizedFragment(
      fragment,
      route,
      variables,
      metadata || DEFAULT_FRAGMENT_METADATA
    );
  }

  constructor(
    concreteNode: ConcreteFragment,
    route: RelayMetaRoute,
    variables: Variables,
    metadata?: FragmentMetadata
  ) {
    super(concreteNode, route, variables);
    this.__fragmentID__ = null;
    // NOTE: `this.__hash__` gets set to null when cloning.
    this.__hash__ = concreteNode.hash || null;
    this.__metadata__ = metadata || DEFAULT_FRAGMENT_METADATA;
  }

  getDebugName(): string {
    return (this.__concreteNode__: ConcreteFragment).name;
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

  /**
   * Returns the hash for a fragment that is generated by the code transform.
   * Fragments that are generated on the client do not have a hash.
   */
  getHash(): ?string {
    return this.__hash__;
  }

  getType(): string {
    return (this.__concreteNode__: ConcreteFragment).type;
  }

  isConcrete(): boolean {
    const concreteNode = (this.__concreteNode__: ConcreteFragment);
    return !!concreteNode.metadata.isConcrete;
  }

  isDeferred(): boolean {
    return this.__metadata__.isDeferred;
  }

  isPlural(): boolean {
    const metadata = (this.__concreteNode__: ConcreteFragment).metadata;
    return !!(
      metadata.isPlural ||  // FB Printer
      metadata.plural       // OSS Printer from `@relay`
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
    if (clone !== this &&
        clone instanceof RelayQueryFragment) {
      clone.__hash__ = null;
      clone.__metadata__ = {
        ...this.__metadata__,
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

  static fromJSON(json: ConcreteFragment): RelayQueryFragment {
    return RelayQueryFragment.create(json, RelayMetaRoute.get('$fromJSON'), {});
  }

  toJSON(): ConcreteFragment {
    return {
      children: this.__toJSONChildren__(),
      kind: 'Fragment',
      hash: this.getHash(),
      metadata: {
        isConcrete: this.isConcrete(),
        plural: this.isPlural(),
      },
      name: this.getDebugName(),
      type: this.getType(),
    };
  }
}

/**
 * @internal
 *
 * Wraps access to query fields.
 */
class RelayQueryField extends RelayQueryNode {
  __debugName__: ?string;
  __isRefQueryDependency__: boolean;
  __rangeBehaviorKey__: ?string;

  static create(
    concreteNode: mixed,
    route: RelayMetaRoute,
    variables: Variables
  ): RelayQueryField {
    const field = QueryBuilder.getField(concreteNode);
    invariant(
      field,
      'RelayQueryField.create(): Expected a GraphQL field, got: %s',
      concreteNode
    );
    return new RelayQueryField(
      field,
      route,
      variables
    );
  }

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
    var concreteField = QueryBuilder.createField({
      alias,
      calls: calls ? callsToGraphQL(calls) : null,
      fieldName,
      metadata,
    });
    var field = new RelayQueryField(
      concreteField,
      RelayMetaRoute.get('$RelayQuery'),
      {}
    );
    field.__children__ = nextChildren;
    return field;
  }

  constructor(
    concreteNode: ConcreteField,
    route: RelayMetaRoute,
    variables: Variables
  ) {
    super(concreteNode, route, variables);
    this.__debugName__ = undefined;
    this.__isRefQueryDependency__ = false;
    this.__rangeBehaviorKey__ = undefined;
  }

  isRequisite(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isRequisite;
  }

  isFindable(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isFindable;
  }

  isGenerated(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isGenerated;
  }

  isConnection(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isConnection;
  }

  isPlural(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isPlural;
  }

  isRefQueryDependency(): boolean {
    return this.__isRefQueryDependency__;
  }

  isScalar(): boolean {
    const concreteChildren = (this.__concreteNode__: ConcreteField).children;
    return (
      (!this.__children__ || this.__children__.length === 0) &&
      (!concreteChildren || concreteChildren.length === 0)
    );
  }

  isUnionOrInterface(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isUnionOrInterface;
  }

  getDebugName(): string {
    let debugName = this.__debugName__;
    if (!debugName) {
      debugName = this.getSchemaName();
      let printedCoreArgs;
      this.getCallsWithValues().forEach(arg => {
        if (this._isCoreArg(arg)) {
          printedCoreArgs = printedCoreArgs || [];
          printedCoreArgs.push(printRelayQueryCall(arg));
        }
      });
      if (printedCoreArgs) {
        debugName += printedCoreArgs.sort().join('');
      }
      this.__debugName__ = debugName;
    }
    return debugName;
  }

  getParentType(): string {
    var parentType = (this.__concreteNode__: ConcreteField).metadata.parentType;
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
    return (this.__concreteNode__: ConcreteField).fieldName;
  }

  /**
   * A string representing the range behavior eligible arguments associated with
   * this field. Arguments will be sorted.
   *
   * Non-core arguments (like connection and identifying arguments) are dropped.
   *   `field(first: 10, foo: "bar", baz: "bat")` => `'baz(bat).foo(bar)'`
   *   `username(name: "steve")`                  => `''`
   */
  getRangeBehaviorKey(): string {
    invariant(
      this.isConnection(),
      'RelayQueryField: Range behavior keys are associated exclusively with ' +
      'connection fields. `getRangeBehaviorKey()` was called on the ' +
      'non-connection field `%s`.',
      this.getSchemaName()
    );
    let rangeBehaviorKey = this.__rangeBehaviorKey__;
    if (rangeBehaviorKey == null) {
      const printedCoreArgs = [];
      this.getCallsWithValues().forEach(arg => {
        if (this._isCoreArg(arg)) {
          printedCoreArgs.push(printRelayQueryCall(arg));
        }
      });
      rangeBehaviorKey = printedCoreArgs.sort().join('').slice(1);
      this.__rangeBehaviorKey__ = rangeBehaviorKey;
    }
    return rangeBehaviorKey;
  }

  /**
   * The name for the field when serializing the query or interpreting query
   * responses from the server. The serialization key is derived from
   * all calls/values and hashed for compactness.
   *
   * Given the GraphQL
   *   `field(first: 10, foo: "bar", baz: "bat")`, or
   *   `field(baz: "bat", foo: "bar", first: 10)`
   *
   * ...the following serialization key will be produced:
   *   `generateRQLFieldAlias('field.bar(bat).first(10).foo(bar)')`
   */
  getSerializationKey(): string {
    let serializationKey = this.__serializationKey__;
    if (!serializationKey) {
      serializationKey = generateRQLFieldAlias(
        this.getSchemaName() +
        this.getCallsWithValues()
          .map(printRelayQueryCall)
          .sort()
          .join('')
      );
      this.__serializationKey__ = serializationKey;
    }
    return serializationKey;
  }

  /**
   * The name which Relay internals can use to reference this field, without
   * collisions.
   *
   * Given the GraphQL
   *   `field(first: 10, foo: "bar", baz: "bat")`, or
   *   `field(baz: "bat", foo: "bar", first: 10)`
   *
   * ...the following storage key will be produced:
   *   `'field{bar:"bat",foo:"bar"}'`
   */
  getStorageKey(): string {
    let storageKey = this.__storageKey__;
    if (!storageKey) {
      storageKey = this.getSchemaName();
      let coreArgsObj;
      this.getCallsWithValues().forEach(arg => {
        if (this._isCoreArg(arg)) {
          coreArgsObj = coreArgsObj || {};
          coreArgsObj[arg.name] = arg.value;
        }
      });
      if (coreArgsObj) {
        storageKey += stableStringify(coreArgsObj);
      }
      this.__storageKey__ = storageKey;
    }
    return storageKey;
  }

  /**
   * The name by which this field's results should be made available to the
   * application.
   */
  getApplicationName(): string {
    const concreteNode = (this.__concreteNode__: ConcreteField);
    return concreteNode.alias || concreteNode.fieldName;
  }

  getInferredRootCallName(): ?string {
    return (this.__concreteNode__: ConcreteField).metadata.inferredRootCallName;
  }

  getInferredPrimaryKey(): ?string {
    return (this.__concreteNode__: ConcreteField).metadata.inferredPrimaryKey;
  }

  getCallsWithValues(): Array<Call> {
    let calls = this.__calls__;
    if (!calls) {
      const concreteCalls = (this.__concreteNode__: ConcreteField).calls;
      if (concreteCalls) {
        calls = callsFromGraphQL(concreteCalls, this.__variables__);
      } else {
        calls = EMPTY_CALLS;
      }
      this.__calls__ = calls;
    }
    return calls;
  }

  getCallType(callName: string): ?string {
    const concreteCalls = (this.__concreteNode__: ConcreteField).calls;
    const concreteCall = concreteCalls && concreteCalls.filter(
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

  static fromJSON(json: ConcreteField): RelayQueryField {
    return RelayQueryField.create(json, RelayMetaRoute.get('$fromJSON'), {});
  }

  toJSON(): ConcreteField {
    return {
      alias: this.getConcreteQueryNode().alias,
      calls: callsToGraphQL(this.getCallsWithValues()),
      children: this.__toJSONChildren__(),
      fieldName: this.getSchemaName(),
      kind: 'Field',
      metadata: this.getConcreteQueryNode().metadata,
    };
  }

  /**
   * The following types of arguments are non-core:
   * - Range calls such as `first` or `find` on connections.
   * - Conditionals when the field is present.
   */
  _isCoreArg(arg: Call): boolean {
    return (
      // `name(if:true)`, `name(unless:false)`, and `name` are equivalent.
      !(arg.name === IF && (String(arg.value) === TRUE)) &&
      !(arg.name === UNLESS && (String(arg.value) === FALSE)) &&
      // Connection arguments can be stripped out.
      !(this.isConnection() && RelayConnectionInterface.isConnectionCall(arg))
    );
  }
}

function createNode(
  concreteNode: mixed,
  route: RelayMetaRoute,
  variables: Variables
): ?RelayQueryNode {
  invariant(
    typeof concreteNode === 'object' &&
    concreteNode !== null,
    'RelayQueryNode: Expected a GraphQL object created with `Relay.QL`, got' +
    '`%s`.',
    concreteNode
  );
  const kind = concreteNode.kind;
  let type = RelayQueryNode;
  if (kind === 'Field') {
    type = RelayQueryField;
  } else if (kind === 'Fragment') {
    type = RelayQueryFragment;
  } else if (kind === 'Query') {
    type = RelayQueryRoot;
  } else if (kind === 'Mutation') {
    type = RelayQueryMutation;
  } else if (kind === 'Subscription') {
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
  }
  return new type(
    (concreteNode: any),
    route,
    variables
  );
}

/**
 * Memoizes the `RelayQueryFragment` equivalent of a given GraphQL fragment
 * for the given route, variables, and deferred status.
 */
function createMemoizedFragment(
  concreteFragment: ConcreteFragment,
  route: RelayMetaRoute,
  variables: Variables,
  metadata: FragmentMetadata
): RelayQueryFragment {
  var cacheKey = route.name + ':' + stableStringify(variables) + ':' +
    stableStringify(metadata);
  var fragment = (concreteFragment: any).__cachedFragment__;
  var fragmentCacheKey = (concreteFragment: any).__cacheKey__;
  if (!fragment || fragmentCacheKey !== cacheKey) {
    fragment = new RelayQueryFragment(
      concreteFragment,
      route,
      variables,
      metadata
    );
    (concreteFragment: any).__cachedFragment__ = fragment;
    (concreteFragment: any).__cacheKey__ = cacheKey;
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

RelayProfiler.instrumentMethods(RelayQueryNode.prototype, {
  clone: '@RelayQueryNode.prototype.clone',
  equals: '@RelayQueryNode.prototype.equals',
  getChildren: '@RelayQueryNode.prototype.getChildren',
  getDirectives: '@RelayQueryNode.prototype.getDirectives',
  hasDeferredDescendant: '@RelayQueryNode.prototype.hasDeferredDescendant',
  getFieldByStorageKey: '@RelayQueryNode.prototype.getFieldByStorageKey',
});

RelayProfiler.instrumentMethods(RelayQueryField.prototype, {
  getStorageKey: '@RelayQueryField.prototype.getStorageKey',
  getSerializationKey: '@RelayQueryField.prototype.getSerializationKey',
});

module.exports = {
  Field: RelayQueryField,
  Fragment: RelayQueryFragment,
  Mutation: RelayQueryMutation,
  Node: RelayQueryNode,
  Operation: RelayQueryOperation,
  Root: RelayQueryRoot,
  Subscription: RelayQuerySubscription,
};
