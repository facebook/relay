/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayEnvironmentTypes
 * @flow
 */

'use strict';

import type {
  ConcreteFragment,
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'ConcreteQuery';
import type {GraphQLTaggedNode} from 'RelayGraphQLTag';
import type {DataID} from 'RelayInternalTypes';
import type {Variables, RelayMutationConfig} from 'RelayTypes';

/**
 * Settings for how a query response may be cached.
 */
export type CacheConfig = {
  force: boolean,
};

/**
 * Represents any resource that must be explicitly disposed of. The most common
 * use-case is as a return value for subscriptions, where calling `dispose()`
 * would cancel the subscription.
 */
export type Disposable = {
  dispose(): void,
};

/**
 * A selector defines the starting point for a traversal into the graph for the
 * purposes of targeting a subgraph.
 */
export type Selector = {
  dataID: DataID,
  node: ConcreteFragment,
  variables: Variables,
};

/**
 * A representation of a selector and its results at a particular point in time.
 */
export type Snapshot = Selector & {
  data: ?SelectorData,
  seenRecords: {[key: DataID]: mixed},
};

/**
 * The results of executing a selector against the store.
 */
export type SelectorData = {[key: string]: mixed};

/**
 * An operation selector describes a specific instance of a GraphQL operation
 * with variables applied.
 *
 * - `root`: a selector intended for processing server results or retaining
 *   response data in the store.
 * - `fragment`: a selector intended for use in reading or subscribing to
 *   the results of the the operation.
 */
export type OperationSelector = {
  fragment: Selector,
  node: ConcreteOperationDefinition,
  root: Selector,
  variables: Variables,
};

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface Environment {
  /**
   * Applies an optimistic mutation to the store without committing it to the
   * server. The returned Disposable can be used to revert this change at a
   * later time.
   */
  applyMutation(config: {|
     configs: Array<RelayMutationConfig>,
     operation: ConcreteOperationDefinition,
     optimisticResponse: Object,
     variables: Variables,
   |}): Disposable,

   /**
    * Applies an optimistic mutation if provided and commits the mutation to the
    * server. The returned Disposable can be used to bypass the `onCompleted`
    * and `onError` callbacks when the server response is returned.
    */
   sendMutation(config: {|
      configs: Array<RelayMutationConfig>,
      onCompleted?: ?(response: {[key: string]: Object}) => void,
      onError?: ?(error: Error) => void,
      operation: ConcreteOperationDefinition,
      optimisticOperation?: ?ConcreteOperationDefinition,
      optimisticResponse?: ?Object,
      variables: Variables,
    |}): Disposable,

  /**
   * Read the results of a selector from in-memory records in the store.
   */
  lookup(
    selector: Selector,
  ): Snapshot,

  /**
   * Subscribe to changes to the results of a selector. The callback is called
   * when data has been committed to the store that would cause the results of
   * the snapshot's selector to change.
   */
  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable,

  /**
   * Ensure that all the records necessary to fulfill the given selector are
   * retained in-memory. The records will not be eligible for garbage collection
   * until the returned reference is disposed.
   *
   * Note: This is a no-op in the legacy core.
   */
  retain(selector: Selector): Disposable,

  /**
   * Send a query to the server with request/response semantics: the query will
   * either complete successfully (calling `onNext` and `onCompleted`) or fail
   * (calling `onError`).
   *
   * Note: Most applications should use `sendQuerySubscription` in order to
   * optionally receive updated information over time, should that feature be
   * supported by the network/server. A good rule of thumb is to use this method
   * if you would otherwise immediately dispose the `sendQuerySubscription()`
   * after receving the first `onNext` result.
   */
  sendQuery(config: {|
    cacheConfig?: ?CacheConfig,
    onCompleted?: ?() => void,
    onError?: ?(error: Error) => void,
    onNext?: ?(selector: Selector) => void,
    operation: OperationSelector,
  |}): Disposable,

  /**
   * Send a query to the server with request/subscription semantics: one or more
   * responses may be returned (via `onNext`) over time followed by either
   * the request completing (`onCompleted`) or an error (`onError`).
   *
   * Networks/servers that support subscriptions may choose to hold the
   * subscription open indefinitely such that `onCompleted` is not called.
   */
  sendQuerySubscription(config: {|
    cacheConfig?: ?CacheConfig,
    onCompleted?: ?() => void,
    onError?: ?(error: Error) => void,
    onNext?: ?(selector: Selector) => void,
    operation: OperationSelector,
  |}): Disposable,

  unstable_internal: RelayCore,
}

export interface RelayCore {
  /**
   * Create an instance of a FragmentSpecResolver.
   *
   * TODO: The FragmentSpecResolver *can* be implemented via the other methods
   * defined here, so this could be moved out of core. It's convenient to have
   * separate implementations until the experimental core is in OSS.
   */
  createFragmentSpecResolver: (
    context: RelayContext,
    fragments: FragmentMap,
    props: Props,
    callback: () => void,
  ) => FragmentSpecResolver,

  /**
   * Creates an instance of an OperationSelector given an operation definition
   * (see `getOperation`) and the variables to apply. The input variables are
   * filtered to exclude variables that do not matche defined arguments on the
   * operation, and default values are populated for null values.
   */
  createOperationSelector: (
    operation: ConcreteOperationDefinition,
    variables: Variables,
  ) => OperationSelector,

  /**
   * Given a graphql`...` tagged template, extract a fragment definition usable
   * by this version of Relay core. Throws if the value is not a fragment.
   */
  getFragment: (node: GraphQLTaggedNode) => ConcreteFragmentDefinition,

  /**
   * Given a graphql`...` tagged template, extract an operation definition
   * usable by this version of Relay core. Throws if the value is not an
   * operation.
   */
  getOperation: (node: GraphQLTaggedNode) => ConcreteOperationDefinition,

  /**
   * Determine if two selectors are equal (represent the same selection). Note
   * that this function returns `false` when the two queries/fragments are
   * different objects, even if they select the same fields.
   */
  areEqualSelectors: (a: Selector, b: Selector) => boolean,

  /**
   * Given the result `item` from a parent that fetched `fragment`, creates a
   * selector that can be used to read the results of that fragment for that item.
   *
   * Example:
   *
   * Given two fragments as follows:
   *
   * ```
   * fragment Parent on User {
   *   id
   *   ...Child
   * }
   * fragment Child on User {
   *   name
   * }
   * ```
   *
   * And given some object `parent` that is the results of `Parent` for id "4",
   * the results of `Child` can be accessed by first getting a selector and then
   * using that selector to `lookup()` the results against the environment:
   *
   * ```
   * const childSelector = getSelector(queryVariables, Child, parent);
   * const childData = environment.lookup(childSelector).data;
   * ```
   */
  getSelector: (
    operationVariables: Variables,
    fragment: ConcreteFragmentDefinition,
    prop: mixed,
  ) => ?Selector,

  /**
   * Given the result `items` from a parent that fetched `fragment`, creates a
   * selector that can be used to read the results of that fragment on those
   * items. This is similar to `getSelector` but for "plural" fragments that
   * expect an array of results and therefore return an array of selectors.
   */
  getSelectorList: (
    operationVariables: Variables,
    fragment: ConcreteFragmentDefinition,
    props: Array<mixed>,
  ) => ?Array<Selector>,

  /**
   * Given a mapping of keys -> results and a mapping of keys -> fragments,
   * extracts the selectors for those fragments from the results.
   *
   * The canonical use-case for this function are Relay Containers, which
   * use this function to convert (props, fragments) into selectors so that they
   * can read the results to pass to the inner component.
   */
  getSelectorsFromObject: (
    operationVariables: Variables,
    fragments: FragmentMap,
    props: Props,
  ) => {[key: string]: ?(Selector | Array<Selector>)},

  /**
   * Given a mapping of keys -> results and a mapping of keys -> fragments,
   * extracts a mapping of keys -> id(s) of the results.
   *
   * Similar to `getSelectorsFromObject()`, this function can be useful in
   * determining the "identity" of the props passed to a component.
   */
  getDataIDsFromObject: (
    fragments: FragmentMap,
    props: Props,
  ) => {[key: string]: ?(DataID | Array<DataID>)},

  /**
   * Given a mapping of keys -> results and a mapping of keys -> fragments,
   * extracts the merged variables that would be in scope for those
   * fragments/results.
   *
   * This can be useful in determing what varaibles were used to fetch the data
   * for a Relay container, for example.
   */
  getVariablesFromObject: (
    operationVariables: Variables,
    fragments: FragmentMap,
    props: Props,
  ) => Variables,
}

/**
 * A utility for resolving and subscribing to the results of a fragment spec
 * (key -> fragment mapping) given some "props" that determine the root ID
 * and variables to use when reading each fragment. When props are changed via
 * `setProps()`, the resolver will update its results and subscriptions
 * accordingly. Internally, the resolver:
 * - Converts the fragment map & props map into a map of `Selector`s.
 * - Removes any resolvers for any props that became null.
 * - Creates resolvers for any props that became non-null.
 * - Updates resolvers with the latest props.
 */
export type FragmentSpecResolver = {
  /**
   * Stop watching for changes to the results of the fragments.
   */
  +dispose: () => void,

  /**
   * Get the current results.
   */
  +resolve: () => FragmentSpecResults,

  /**
   * Update the resolver with new inputs. Call `resolve()` to get the updated
   * results.
   */
  +setProps: (props: Props) => void,

  /**
   * Override the variables used to read the results of the fragments. Call
   * `resolve()` to get the updated results.
   */
  +setVariables: (variables: Variables) => void,
}

/**
 * The type of the `relay` property set on React context by the React/Relay
 * integration layer (e.g. QueryRenderer, FragmentContainer, etc).
 */
export type RelayContext = {
  environment: Environment,
  variables: Variables,
};

export type FragmentMap = {[key: string]: ConcreteFragmentDefinition};

/**
 * Arbitrary data e.g. received by a container as props.
 */
export type Props = {[key: string]: mixed};

/**
 * The results of reading the results of a FragmentMap given some input
 * `Props`.
 */
export type FragmentSpecResults = {[key: string]: mixed};
