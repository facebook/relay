/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  CacheConfig,
  DataID,
  Disposable,
  Observable,
  SelectorStoreUpdater,
  Variables,
} from 'RelayRuntime';

/**
 * Arbitrary data e.g. received by a container as props.
 */
export type Props = {[key: string]: mixed};

/*
 * An individual cached graph object.
 */
export type Record = {[key: string]: mixed};

/**
 * A collection of records keyed by id.
 */
export type RecordMap = {[dataID: DataID]: ?Record};

/**
 * A selector defines the starting point for a traversal into the graph for the
 * purposes of targeting a subgraph.
 */
export type CSelector<TNode> = {
  dataID: DataID,
  node: TNode,
  variables: Variables,
};

/**
 * A representation of a selector and its results at a particular point in time.
 */
export type CSnapshot<TNode> = CSelector<TNode> & {
  data: ?SelectorData,
  seenRecords: RecordMap,
};

/**
 * The results of a selector given a store/RecordSource.
 */
export type SelectorData = {[key: string]: mixed};

/**
 * The results of reading the results of a FragmentMap given some input
 * `Props`.
 */
export type FragmentSpecResults = {[key: string]: mixed};

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
export interface FragmentSpecResolver {
  /**
   * Stop watching for changes to the results of the fragments.
   */
  dispose(): void;

  /**
   * Get the current results.
   */
  resolve(): FragmentSpecResults;

  /**
   * Update the resolver with new inputs. Call `resolve()` to get the updated
   * results.
   */
  setProps(props: Props): void;

  /**
   * Override the variables used to read the results of the fragments. Call
   * `resolve()` to get the updated results.
   */
  setVariables(variables: Variables): void;

  /**
   * Subscribe to resolver updates.
   * Overrides existing callback (if one has been specified).
   */
  setCallback(callback: () => void): void;

  isLoading(): boolean;
}

export type CFragmentMap<TFragment> = {[key: string]: TFragment};

/**
 * An operation selector describes a specific instance of a GraphQL operation
 * with variables applied.
 *
 * - `root`: a selector intended for processing server results or retaining
 *   response data in the store.
 * - `fragment`: a selector intended for use in reading or subscribing to
 *   the results of the the operation.
 */
export type COperationSelector<TNode, TRequest> = {
  fragment: CSelector<TNode>,
  node: TRequest,
  root: CSelector<TNode>,
  variables: Variables,
};

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface CEnvironment<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TNode,
  TRequest,
  TPayload,
  TOperation,
> {
  /**
   * Determine if the selector can be resolved with data in the store (i.e. no
   * fields are missing).
   *
   * Note that this operation effectively "executes" the selector against the
   * cache and therefore takes time proportional to the size/complexity of the
   * selector.
   */
  check(selector: CSelector<TNode>): boolean;

  /**
   * Read the results of a selector from in-memory records in the store.
   */
  lookup(selector: CSelector<TNode>): CSnapshot<TNode>;

  /**
   * Subscribe to changes to the results of a selector. The callback is called
   * when data has been committed to the store that would cause the results of
   * the snapshot's selector to change.
   */
  subscribe(
    snapshot: CSnapshot<TNode>,
    callback: (snapshot: CSnapshot<TNode>) => void,
  ): Disposable;

  /**
   * Ensure that all the records necessary to fulfill the given selector are
   * retained in-memory. The records will not be eligible for garbage collection
   * until the returned reference is disposed.
   *
   * Note: This is a no-op in the classic core.
   */
  retain(selector: CSelector<TNode>): Disposable;

  /**
   * Send a query to the server with Observer semantics: one or more
   * responses may be returned (via `next`) over time followed by either
   * the request completing (`completed`) or an error (`error`).
   *
   * Networks/servers that support subscriptions may choose to hold the
   * subscription open indefinitely such that `complete` is not called.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  execute(config: {|
    operation: COperationSelector<TNode, TRequest>,
    cacheConfig?: ?CacheConfig,
    updater?: ?SelectorStoreUpdater,
  |}): Observable<TPayload>;

  unstable_internal: CUnstableEnvironmentCore<
    TEnvironment,
    TFragment,
    TGraphQLTaggedNode,
    TNode,
    TRequest,
    TOperation,
  >;
}

export interface CUnstableEnvironmentCore<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TNode,
  TRequest,
  TOperation,
> {
  /**
   * Create an instance of a FragmentSpecResolver.
   *
   * TODO: The FragmentSpecResolver *can* be implemented via the other methods
   * defined here, so this could be moved out of core. It's convenient to have
   * separate implementations until the experimental core is in OSS.
   */
  createFragmentSpecResolver: (
    context: CRelayContext<TEnvironment>,
    containerName: string,
    fragments: CFragmentMap<TFragment>,
    props: Props,
    callback?: () => void,
  ) => FragmentSpecResolver;

  /**
   * Creates an instance of an OperationSelector given an operation definition
   * (see `getOperation`) and the variables to apply. The input variables are
   * filtered to exclude variables that do not matche defined arguments on the
   * operation, and default values are populated for null values.
   */
  createOperationSelector: (
    request: TRequest,
    variables: Variables,
    operation?: TOperation,
  ) => COperationSelector<TNode, TRequest>;

  /**
   * Given a graphql`...` tagged template, extract a fragment definition usable
   * by this version of Relay core. Throws if the value is not a fragment.
   */
  getFragment: (node: TGraphQLTaggedNode) => TFragment;

  /**
   * Given a graphql`...` tagged template, extract an operation definition
   * usable by this version of Relay core. Throws if the value is not an
   * operation (or batch request).
   */
  getRequest: (node: TGraphQLTaggedNode) => TRequest;

  /**
   * Determine if two selectors are equal (represent the same selection). Note
   * that this function returns `false` when the two queries/fragments are
   * different objects, even if they select the same fields.
   */
  areEqualSelectors: (a: CSelector<TNode>, b: CSelector<TNode>) => boolean;

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
    fragment: TFragment,
    prop: mixed,
  ) => ?CSelector<TNode>;

  /**
   * Given the result `items` from a parent that fetched `fragment`, creates a
   * selector that can be used to read the results of that fragment on those
   * items. This is similar to `getSelector` but for "plural" fragments that
   * expect an array of results and therefore return an array of selectors.
   */
  getSelectorList: (
    operationVariables: Variables,
    fragment: TFragment,
    props: Array<mixed>,
  ) => ?Array<CSelector<TNode>>;

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
    fragments: CFragmentMap<TFragment>,
    props: Props,
  ) => {[key: string]: ?(CSelector<TNode> | Array<CSelector<TNode>>)};

  /**
   * Given a mapping of keys -> results and a mapping of keys -> fragments,
   * extracts a mapping of keys -> id(s) of the results.
   *
   * Similar to `getSelectorsFromObject()`, this function can be useful in
   * determining the "identity" of the props passed to a component.
   */
  getDataIDsFromObject: (
    fragments: CFragmentMap<TFragment>,
    props: Props,
  ) => {[key: string]: ?(DataID | Array<DataID>)};

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
    fragments: CFragmentMap<TFragment>,
    props: Props,
  ) => Variables;
}

/**
 * The type of the `relay` property set on React context by the React/Relay
 * integration layer (e.g. QueryRenderer, FragmentContainer, etc).
 */
export type CRelayContext<TEnvironment> = {
  environment: TEnvironment,
  variables: Variables,
};
