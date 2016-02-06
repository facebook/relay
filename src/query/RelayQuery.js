/**
 * Copyright (c) 2013-present, Facebook, Inc.
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
  ConcreteFieldMetadata,
  ConcreteFragment,
  ConcreteMutation,
  ConcreteNode,
  ConcreteOperationMetadata,
  ConcreteQuery,
  ConcreteQueryMetadata,
} from 'ConcreteQuery';
const QueryBuilder = require('QueryBuilder');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayFragmentReference = require('RelayFragmentReference');
import type {Call, Directive}  from 'RelayInternalTypes';
const RelayMetaRoute = require('RelayMetaRoute');
const RelayProfiler = require('RelayProfiler');
const RelayRouteFragment = require('RelayRouteFragment');
import type {Variables} from 'RelayTypes';

const areEqual = require('areEqual');
const callsFromGraphQL = require('callsFromGraphQL');
const callsToGraphQL = require('callsToGraphQL');
const directivesToGraphQL = require('directivesToGraphQL');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const getConcreteFragmentHash = require('getConcreteFragmentHash');
const invariant = require('invariant');
const serializeRelayQueryCall = require('serializeRelayQueryCall');
const shallowEqual = require('shallowEqual');
const stableStringify = require('stableStringify');

type BatchCall = {
  refParamName: string;
  sourceQueryID: string;
  sourceQueryPath: string;
};
type FragmentMetadata = {
  isDeferred: boolean;
  isContainerFragment: boolean;
};
// TODO: replace once #6525923 is resolved
type NextChildren = Array<any>;

// conditional field calls/values
const IF = 'if';
const UNLESS = 'unless';
const TRUE = 'true';
const FALSE = 'false';
const SKIP = 'skip';
const INCLUDE = 'include';

let _nextQueryID = 0;

const DEFAULT_FRAGMENT_METADATA = {
  isDeferred: false,
  isContainerFragment: false,
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
 *
 * TODO (#6937314): RelayQueryNode support for toJSON/fromJSON
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

  canHaveSubselections(): boolean {
    return true;
  }

  isGenerated(): boolean {
    return false;
  }

  isRefQueryDependency(): boolean {
    return false;
  }

  clone(children: NextChildren): ?RelayQueryNode {
    if (!this.canHaveSubselections()) {
      // Compact new children *after* this check, for consistency.
      invariant(
        children.length === 0,
        'RelayQueryNode: Cannot add children to field `%s` because it does ' +
        'not support sub-selections (sub-fields).',
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
        return !directive.args.some(arg => arg.name === IF && !!arg.value);
      } else if (directive.name === INCLUDE) {
        return !directive.args.some(arg => arg.name === IF && !arg.value);
      }
      return true;
    });
  }

  getDirectives(): Array<Directive> {
    const concreteDirectives = (this.__concreteNode__: ConcreteNode).directives;
    if (concreteDirectives) {
      return this.__concreteNode__.directives.map(directive => {
        // FIXME Debugging #9934204
        // In cases where the concrete directive is missing the `args` property,
        // make the choice of the legacy `arguments` property.
        const args = directive.hasOwnProperty('args') ?
          directive.args :
          directive.arguments;
        return {
          args: callsFromGraphQL(args, this.__variables__),
          name: directive.name,
        };
      });
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

  getType(): string {
    return this.__concreteNode__.type;
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
        this.canHaveSubselections() &&
        this.getChildren().some(child => child.hasDeferredDescendant());
      this.__hasDeferredDescendant__ = hasDeferredDescendant;
    }
    return hasDeferredDescendant;
  }

  isAbstract(): boolean {
    throw new Error('RelayQueryNode: Abstract function cannot be called.');
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
}

/**
 * @internal
 *
 * Wraps access to query root nodes.
 */
class RelayQueryRoot extends RelayQueryNode {
  __batchCall__: ?BatchCall;
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
    metadata: ConcreteQueryMetadata,
    type: string
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
      type,
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
    this.__id__ = undefined;
    this.__identifyingArg__ = undefined;
    this.__storageKey__ = undefined;

    // Ensure IDs are generated in the order that queries are created
    this.getID();
  }

  canHaveSubselections(): boolean {
    return true;
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
      id = 'q' + _nextQueryID++;
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
            refParamName: 'ref_' + callArg.sourceQueryID,
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
      const field = RelayQueryField.build({
        fieldName: this.getFieldName(),
        calls: args,
        type: this.getType(),
      });
      storageKey = field.getStorageKey();
      this.__storageKey__ = storageKey;
    }
    return storageKey;
  }

  hasDeferredDescendant(): boolean {
    return this.isDeferred() || super.hasDeferredDescendant();
  }

  isAbstract(): boolean {
    return !!(this.__concreteNode__: ConcreteQuery).metadata.isAbstract;
  }

  isDeferred(): boolean {
    return !!(this.__concreteNode__: ConcreteQuery).isDeferred;
  }

  isPlural(): boolean {
    return !!(this.__concreteNode__: ConcreteQuery).metadata.isPlural;
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

  canHaveSubselections(): boolean {
    return true;
  }

  getName(): string {
    return (this.__concreteNode__: ConcreteMutation).name;
  }

  getResponseType(): string {
    return (this.__concreteNode__: ConcreteMutation).responseType;
  }

  getType(): string {
    return this.getResponseType();
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

  /**
   * Mutations and subscriptions must have a concrete type due to the need for
   * requisite top-level fields.
   */
  isAbstract(): boolean {
    return false;
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
    metadata?: ?ConcreteOperationMetadata
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
  __compositeHash__: ?string;
  __isCloned__: boolean;
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
    this.__compositeHash__ = null;
    this.__isCloned__ = false;
    this.__metadata__ = metadata || DEFAULT_FRAGMENT_METADATA;
  }

  canHaveSubselections(): boolean {
    return true;
  }

  getDebugName(): string {
    return (this.__concreteNode__: ConcreteFragment).name;
  }

  /**
   * Checks whether a fragment has been cloned such that the concrete node is no
   * longer representative of this instance. This will return true for fragments
   * that are the result of cloning with new children.
   */
  isCloned(): boolean {
    return this.__isCloned__;
  }

  /**
   * The "concrete node hash" of a fragment uniquely identifies the instance of
   * the concrete node. This method should be used with `isCloned()` if you may
   * be dealing with fragments that have been cloned with new children.
   *
   * This hash may change between runtime sessions (e.g. client and server).
   */
  getConcreteNodeHash(): string {
    return getConcreteFragmentHash((this.__concreteNode__: ConcreteFragment));
  }

  /**
   * The "composite hash" is similar to the concrete instance hash, but is also
   * uniquely differentiates between varying variable values or route names. It
   * should also be used with `isCloned()`.
   *
   * The composite hash is used to identify fragment pointers in records. It is
   * also used to store the status of fetching deferred fragments.
   */
  getCompositeHash(): string {
    let compositeHash = this.__compositeHash__;
    if (!compositeHash) {
      // TODO: Simplify this hash function, #9599170.
      compositeHash = generateRQLFieldAlias(
        this.getConcreteNodeHash() +
        '.' + this.__route__.name +
        '.' + stableStringify(this.__variables__)
      );
      this.__compositeHash__ = compositeHash;
    }
    return compositeHash;
  }

  isAbstract(): boolean {
    return !!(this.__concreteNode__: ConcreteFragment).metadata.isAbstract;
  }

  isDeferred(): boolean {
    return this.__metadata__.isDeferred;
  }

  isPattern(): boolean {
    return !!(this.__concreteNode__: ConcreteFragment).metadata.pattern;
  }

  isPlural(): boolean {
    const metadata = (this.__concreteNode__: ConcreteFragment).metadata;
    return !!(
      metadata.isPlural ||  // FB Printer
      metadata.plural       // OSS Printer from `@relay`
    );
  }

  cloneAsPlainFragment(): RelayQueryFragment {
    return createMemoizedFragment(
      this.__concreteNode__,
      this.__route__,
      this.__variables__,
      DEFAULT_FRAGMENT_METADATA
    );
  }

  isContainerFragment(): boolean {
    return this.__metadata__.isContainerFragment;
  }

  hasDeferredDescendant(): boolean {
    return this.isDeferred() || super.hasDeferredDescendant();
  }

  clone(children: NextChildren): ?RelayQueryNode {
    var clone = super.clone(children);
    if (clone !== this &&
        clone instanceof RelayQueryFragment) {
      clone.__isCloned__ = true;
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
  __shallowHash__: ?string;

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
  static build({
    alias,
    directives,
    calls,
    children,
    fieldName,
    metadata,
    type,
  }: {
    alias?: ?string;
    directives?: ?Array<Directive>;
    calls?: ?Array<Call>;
    children?: ?NextChildren;
    fieldName: string;
    metadata?: ?ConcreteFieldMetadata;
    type: string;
  }): RelayQueryField {
    var nextChildren = children ? children.filter(child => !!child) : [];
    var concreteField = QueryBuilder.createField({
      alias,
      calls: calls ? callsToGraphQL(calls) : null,
      directives: directives ? directivesToGraphQL(directives) : null,
      fieldName,
      metadata,
      type,
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
    this.__shallowHash__ = undefined;
  }

  canHaveSubselections(): boolean {
    return !!(
      (this.__concreteNode__: ConcreteField).metadata.canHaveSubselections
    );
  }

  isAbstract(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isAbstract;
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

  isConnectionWithoutNodeID(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata
      .isConnectionWithoutNodeID;
  }

  isPlural(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isPlural;
  }

  isRefQueryDependency(): boolean {
    return this.__isRefQueryDependency__;
  }

  isRequisite(): boolean {
    return !!(this.__concreteNode__: ConcreteField).metadata.isRequisite;
  }

  getDebugName(): string {
    let debugName = this.__debugName__;
    if (!debugName) {
      debugName = this.getSchemaName();
      let printedCoreArgs;
      this.getCallsWithValues().forEach(arg => {
        if (this._isCoreArg(arg)) {
          printedCoreArgs = printedCoreArgs || [];
          printedCoreArgs.push(serializeRelayQueryCall(arg));
        }
      });
      if (printedCoreArgs) {
        debugName += printedCoreArgs.sort().join('');
      }
      this.__debugName__ = debugName;
    }
    return debugName;
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
          printedCoreArgs.push(serializeRelayQueryCall(arg));
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
          .map(serializeRelayQueryCall)
          .sort()
          .join('')
      );
      this.__serializationKey__ = serializationKey;
    }
    return serializationKey;
  }

  /**
   * Returns a hash of the field name and all argument values.
   */
  getShallowHash(): string {
    let shallowHash = this.__shallowHash__;
    if (!shallowHash) {
      this.__shallowHash__ = shallowHash =
        this.getSchemaName() +
        serializeCalls(this.getCallsWithValues());
    }
    return shallowHash;
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
      this.__storageKey__ = storageKey =
        this.getSchemaName() +
        serializeCalls(
          this.getCallsWithValues().filter(call => this._isCoreArg(call))
        );
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
    if (!this.canHaveSubselections()) {
      // Compact new children *after* this check, for consistency.
      invariant(
        children.length === 0,
        'RelayQueryNode: Cannot add children to field `%s` because it does ' +
        'not support sub-selections (sub-fields).',
        this.getSchemaName()
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
  } else if (kind === 'FragmentReference') {
    type = RelayQueryFragment;
    const fragment = QueryBuilder.getFragment(concreteNode.fragment);
    // TODO #9171213: Reference directives should override fragment directives
    if (fragment) {
      return createMemoizedFragment(
        fragment,
        route,
        {},
        {
          isDeferred: false,
          isContainerFragment: true,
        }
      );
    }
  } else if (kind === 'Query') {
    type = RelayQueryRoot;
  } else if (kind === 'Mutation') {
    type = RelayQueryMutation;
  } else if (kind === 'Subscription') {
    type = RelayQuerySubscription;
  } else if (concreteNode instanceof RelayRouteFragment) {
    const fragment = concreteNode.getFragmentForRoute(route);
    if (fragment) {
      // may be null if no value was defined for this route.
      return createNode(
        fragment,
        route,
        variables
      );
    }
    return null;
  } else if (concreteNode instanceof RelayFragmentReference) {
    const fragment = concreteNode.getFragment(variables);
    const fragmentVariables = concreteNode.getVariables(route, variables);
    if (fragment) {
      // the fragment may be null when `if` or `unless` conditions are not met.
      return createMemoizedFragment(
        fragment,
        route,
        fragmentVariables,
        {
          isDeferred: concreteNode.isDeferred(),
          isContainerFragment: concreteNode.isContainerFragment(),
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
 * Creates an opaque serialization of calls.
 */
function serializeCalls(calls: Array<Call>): string {
  if (calls.length) {
    const callMap = {};
    calls.forEach(call => {
      callMap[call.name] = call.value;
    });
    return stableStringify(callMap);
  } else {
    return '';
  }
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
