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
const ReactRelayContext = require('./ReactRelayContext');

const {useEffect, useState, useRef, useMemo} = React;
const {deepFreeze} = require('relay-runtime');
// flowlint-next-line untyped-import:off
const warning = require('warning');

const areEqual = require('areEqual');
const TIMEOUT = 30000;

import type {GraphQLTaggedNode, IEnvironment, Variables} from 'relay-runtime';

type Props = {
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  // $FlowFixMe
  render: ({props: ?Object}) => React.Node,
  variables: Variables,
};

function useDeepCompare<T: {}>(value: T): T {
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
    const {
      getRequest,
      createOperationDescriptor,
    } = environment.unstable_internal;
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [environment.unstable_internal, query, latestVariables]);

  const relayContext = useMemo(
    () => ({
      environment,
      variables: {},
    }),
    [environment],
  );

  // Use a ref to prevent rendering twice when data changes
  // because of props change
  const dataRef = useRef(null);
  const [, forceUpdate] = useState(null);
  const cleanupFnRef = useRef(null);

  const snapshot = useMemo(() => {
    environment.check(operation.root);
    const res = environment.lookup(operation.fragment, operation);
    dataRef.current = res.data;

    // Run effects here so that the data can be retained
    // and subscribed before the component commits
    const retainDisposable = environment.retain(operation.root);
    const subscribeDisposable = environment.subscribe(res, newSnapshot => {
      if (dataRef.current !== newSnapshot.data) {
        dataRef.current = newSnapshot.data;
        forceUpdate(dataRef.current);
      }
    });
    const handle = setTimeout(nextCleanupFn, TIMEOUT);
    let disposed = false;
    function nextCleanupFn() {
      if (!disposed) {
        disposed = true;
        cleanupFnRef.current = null;
        clearTimeout(handle);
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

  useEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    if (!cleanupFn) {
      warning(
        false,
        'ReactRelayLocalQueryRenderer: Component took too long to render. ' +
          'Data could have already been deleted by garbage collection',
      );
    }
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return (
    <ReactRelayContext.Provider value={relayContext}>
      {render({props: dataRef.current})}
    </ReactRelayContext.Provider>
  );
}

module.exports = ReactRelayLocalQueryRenderer;
