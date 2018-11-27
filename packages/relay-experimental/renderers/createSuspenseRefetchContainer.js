/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('react-relay/modern/ReactRelayContext');

const createSuspenseFragmentContainer = require('./createSuspenseFragmentContainer');
const createSuspenseQueryRenderer = require('./createSuspenseQueryRenderer');
const invariant = require('invariant');
const readContext = require('react-relay/modern/readContext');

const {getPromiseForRequestInFlight} = require('../utils/fetchQueryUtils');
const {getRequest, createOperationSelector} = require('relay-runtime');

import type {FetchPolicy} from './DataResource';
import type {RefetchFn} from './createSuspenseQueryRenderer';
import type {
  GeneratedNodeMap,
  RelayProp,
  $RelayProps,
} from 'react-relay/modern/ReactRelayTypes';
import type {
  GraphQLTaggedNode,
  OperationType,
  OperationSelector,
  RelayContext,
} from 'relay-runtime';

function createSuspenseRefetchContainer<
  TQuery: OperationType,
  Props: {refetch: RefetchFn<TQuery>},
  TComponent: React.ComponentType<Props>,
  TFragmentSpec: GeneratedNodeMap,
>(
  Component: TComponent,
  fragmentSpecInput: TFragmentSpec,
  gqlRefetchQuery: GraphQLTaggedNode,
  opts: {|
    getFragmentRefsFromResponse: (
      data: $ElementType<TQuery, 'response'>,
    ) => $Shape<$Exact<$ObjMap<TFragmentSpec, () => mixed>>>,
  |},
): React.ComponentType<
  $Diff<
    $RelayProps<React.ElementConfig<TComponent>, RelayProp>,
    {refetch: RefetchFn<TQuery>},
  >,
> {
  const {getFragmentRefsFromResponse} = opts;
  const componentName =
    // $FlowExpectedError - Suppress lint: we actually want to do sketchy null check here
    Component.displayName || Component.displayName || 'Unknown';
  const containerName = `RelaySuspenseRefetchContainer(${componentName})`;

  const SuspenseQueryRenderer = createSuspenseQueryRenderer<TQuery>(
    gqlRefetchQuery,
  );
  const SuspenseFragmentContainer = createSuspenseFragmentContainer(
    Component,
    fragmentSpecInput,
  );
  const refetchQueryNode = getRequest(gqlRefetchQuery);

  type InternalContext = {|...$Exact<RelayContext>, query: OperationSelector|};

  type InternalProps = {|
    forwardedRef: React.Ref<TComponent>,
    fragmentRefs: {[string]: mixed},
    parentRelayContext: InternalContext,
  |};

  type InternalState = {|
    fetchPolicy: FetchPolicy,
    refetchVariables: $ElementType<TQuery, 'variables'> | null,
  |};

  function DownstreamContextProvider(props: {|
    children: React.Node,
    refetched: boolean,
    parentRelayContext: InternalContext,
  |}) {
    const {children, refetched, parentRelayContext} = props;
    const refetchRelayContext = readContext(ReactRelayContext);

    // For any renders before refetch is called, we want to skip the context set
    // by the QueryRenderer rendered by **this** container, and use the one from
    // our parent query, i.e. as if this component didn't render a QueryRenderer
    // at all.
    // This will allow child fragments to suspend correctly while the original
    // parent query is in flight. It is only until refetch is called that we
    // want to update the context for our childern with new refetch query/variables
    const downstreamContext = !refetched
      ? parentRelayContext
      : refetchRelayContext;
    return (
      <ReactRelayContext.Provider value={downstreamContext}>
        {children}
      </ReactRelayContext.Provider>
    );
  }

  class SuspenseRefetchRenderer extends React.Component<
    InternalProps,
    InternalState,
  > {
    static displayName = containerName;
    state = {fetchPolicy: 'store-or-network', refetchVariables: null};

    _refetch = (refetchVariables, options) => {
      const fetchPolicy = options?.fetchPolicy ?? 'store-or-network';
      const onRefetched = options?.onRefetched;
      this.setState({fetchPolicy, refetchVariables}, onRefetched);
    };

    render() {
      const {forwardedRef, fragmentRefs, parentRelayContext} = this.props;
      const {environment, query} = parentRelayContext;
      const {fetchPolicy} = this.state;
      const variables =
        this.state.refetchVariables ?? parentRelayContext.variables;
      const refetched = this.state.refetchVariables != null;

      if (!refetched) {
        const refetchQuery = createOperationSelector(
          refetchQueryNode,
          variables,
        );
        invariant(
          refetchQuery != null,
          'SuspenseRefetchContainer: Expected query %s to be a valid ' +
            'refetchQuery.',
          refetchQueryNode.name,
        );
        const canReadRefetchQuery = environment.check(refetchQuery.root);
        if (!canReadRefetchQuery) {
          const promiseForParentQuery = getPromiseForRequestInFlight({
            environment,
            query,
          });
          invariant(
            promiseForParentQuery != null &&
              typeof promiseForParentQuery.then === 'function',
            'SuspenseRefetchContainer: Expected refetchQuery %s to be a subset of ' +
              'parent query: %s. Make sure that the data queried by %s is ' +
              'also queried by %s.',
            refetchQueryNode.name ?? 'Unknown',
            query.node.name ?? 'Unknown',
            refetchQueryNode.name ?? 'Unknown',
            query.node.name ?? 'Unknown',
          );
          throw promiseForParentQuery;
        }
      }

      return (
        <SuspenseQueryRenderer
          environment={environment}
          fetchPolicy={fetchPolicy}
          variables={variables}>
          {data => {
            const refetchFragmentRefs = getFragmentRefsFromResponse(data);
            return (
              <DownstreamContextProvider
                refetched={refetched}
                parentRelayContext={parentRelayContext}>
                <SuspenseFragmentContainer
                  {...fragmentRefs}
                  {...refetchFragmentRefs}
                  refetch={this._refetch}
                  ref={forwardedRef}
                />
              </DownstreamContextProvider>
            );
          }}
        </SuspenseQueryRenderer>
      );
    }
  }

  const SuspenseRefetchContainer = (props, ref) => {
    // $FlowFixMe - TODO T36619782
    const relayContext: InternalContext = readContext(ReactRelayContext);
    invariant(
      relayContext != null,
      'SuspenseRefetchContainer: %s tried to render with ' +
        'missing context. This means that %s was not rendered ' +
        'as a descendant of a QueryRenderer.',
      containerName,
      containerName,
    );

    invariant(
      relayContext.query != null,
      'SuspenseRefetchContainer: %s tried to render as a descendant ' +
        'of a non-Suspense QueryRenderer. SuspenseRefetchContainer is ' +
        'only compatible with SuspenseQueryRenderer.',
      containerName,
    );

    if (__DEV__) {
      const {isRelayModernEnvironment} = require('relay-runtime');
      invariant(
        isRelayModernEnvironment(relayContext.environment),
        'SuspenseRefetchContainer: Can only use SuspenseRefetchContainer ' +
          '%s in a Relay Modern environment!\n' +
          'When using Relay Modern and Relay Classic in the same ' +
          'application, ensure components use Relay Compat to work in ' +
          'both environments.\n' +
          'See: http://facebook.github.io/relay/docs/relay-compat.html',
        containerName,
      );
    }
    return (
      <SuspenseRefetchRenderer
        fragmentRefs={props}
        forwardedRef={ref}
        parentRelayContext={relayContext}
      />
    );
  };
  SuspenseRefetchContainer.displayName = containerName;

  // $FlowFixMe - TODO T29156721 forwardRef isn't Flow typed yet
  const ForwardRefRefetchContainer = React.forwardRef(SuspenseRefetchContainer);

  if (__DEV__) {
    ForwardRefRefetchContainer.__ComponentClass = Component;
  }
  return ForwardRefRefetchContainer;
}

module.exports = createSuspenseRefetchContainer;
