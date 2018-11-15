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
const readContext = require('react-relay/modern/readContext');

import type {RefetchFn} from './createSuspenseQueryRenderer';
import type {
  GeneratedNodeMap,
  RelayProp,
  $RelayProps,
} from 'react-relay/modern/ReactRelayTypes';
import type {GraphQLTaggedNode, OperationType} from 'relay-runtime';

function createSuspenseRefetchContainer<
  TQuery: OperationType,
  Props: {refetch: RefetchFn<TQuery>},
  TComponent: React.ComponentType<Props>,
  TFragmentSpec: GeneratedNodeMap,
>(
  Component: TComponent,
  fragmentSpecInput: TFragmentSpec,
  refetchQuery: GraphQLTaggedNode,
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
    refetchQuery,
    {fetchPolicy: 'store-or-network'},
  );
  const SuspenseFragmentContainer = createSuspenseFragmentContainer(
    Component,
    fragmentSpecInput,
  );

  const SuspenseRefetchContainer = (props, ref) => {
    // $FlowFixMe - TODO T35024201 unstable_read is not yet typed
    const relayContext = readContext(ReactRelayContext);
    if (relayContext == null) {
      throw new Error(
        `SuspenseRefetchContainer: ${containerName} tried to render with ` +
          `missing context. This means that ${containerName} was not rendered ` +
          'as a descendant of a QueryRenderer.',
      );
    }

    if (__DEV__) {
      const {isRelayModernEnvironment} = require('relay-runtime');
      if (!isRelayModernEnvironment(relayContext.environment)) {
        throw new Error(
          'SuspenseRefetchContainer: Can only use SuspenseRefetchContainer ' +
            `${containerName} in a Relay Modern environment!\n` +
            'When using Relay Modern and Relay Classic in the same ' +
            'application, ensure components use Relay Compat to work in ' +
            'both environments.\n' +
            'See: http://facebook.github.io/relay/docs/relay-compat.html',
        );
      }
    }
    return (
      <SuspenseQueryRenderer
        environment={relayContext.environment}
        variables={relayContext.variables}>
        {(data, {refetch}) => {
          const fragmentRefs = getFragmentRefsFromResponse(data);
          return (
            <SuspenseFragmentContainer
              {...props}
              {...fragmentRefs}
              refetch={refetch}
              ref={ref}
            />
          );
        }}
      </SuspenseQueryRenderer>
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
