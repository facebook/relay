/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {ReactRelayQueryRendererContext as ReactRelayQueryRendererContextType} from './ReactRelayQueryRendererContext';
import type {GraphQLTaggedNode, IEnvironment, Variables} from 'relay-runtime';

const ReactRelayContext = require('./ReactRelayContext');
const ReactRelayQueryRendererContext = require('./ReactRelayQueryRendererContext');
const areEqual = require('areEqual');
const React = require('react');
const {
  createOperationDescriptor,
  deepFreeze,
  getRequest,
} = require('relay-runtime');

const {useLayoutEffect, useState, useRef, useMemo} = React;

type Props = {
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  // $FlowFixMe[unclear-type]
  render: ({props: ?Object, ...}) => React.Node,
  variables: Variables,
  ...
};

const queryRendererContext: ReactRelayQueryRendererContextType = {
  rootIsQueryRenderer: true,
};

function useDeepCompare<T: interface {}>(value: T): T {
  const latestValue = React.useRef(value);
  if (!areEqual(latestValue.current, value)) {
    if (__DEV__) {
      deepFreeze(value);
    }
    latestValue.current = value;
  }
  return latestValue.current;
}

function ReactRelayLocalQueryRenderer(props: Props): React.Node {
  const {environment, query, variables, render} = props;
  const latestVariables = useDeepCompare(variables);
  const operation = useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, latestVariables]);

  const relayContext = useMemo(() => ({environment}), [environment]);

  // Use a ref to prevent rendering twice when data changes
  // because of props change
  const dataRef = useRef(null);
  const [, forceUpdate] = useState(null);
  const cleanupFnRef = useRef(null);

  const snapshot = useMemo(() => {
    environment.check(operation);
    const res = environment.lookup(operation.fragment);
    dataRef.current = res.data;

    // Run effects here so that the data can be retained
    // and subscribed before the component commits
    const retainDisposable = environment.retain(operation);
    const subscribeDisposable = environment.subscribe(res, newSnapshot => {
      dataRef.current = newSnapshot.data;
      forceUpdate(dataRef.current);
    });
    let disposed = false;
    function nextCleanupFn() {
      if (!disposed) {
        disposed = true;
        cleanupFnRef.current = null;
        retainDisposable.dispose();
        subscribeDisposable.dispose();
      }
    }
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
    }
    cleanupFnRef.current = nextCleanupFn;
    return res;
  }, [environment, operation]);

  useLayoutEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return (
    <ReactRelayContext.Provider value={relayContext}>
      <ReactRelayQueryRendererContext.Provider value={queryRendererContext}>
        {render({props: dataRef.current})}
      </ReactRelayQueryRendererContext.Provider>
    </ReactRelayContext.Provider>
  );
}

module.exports = ReactRelayLocalQueryRenderer;
