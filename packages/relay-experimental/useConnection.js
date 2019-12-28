/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const areEqual = require('areEqual');
const useRelayEnvironment = require('./useRelayEnvironment');

const {useEffect, useState} = require('react');

import type {
  ConnectionReference,
  ConnectionReferenceObject,
  ConnectionResolver,
  ConnectionSnapshot,
  IEnvironment,
} from 'relay-runtime';

type State<TEdge, TState> = {|
  environment: IEnvironment,
  generation: number,
  reference: ?ConnectionReference<TEdge>,
  resolver: ConnectionResolver<TEdge, TState>,
  snapshot: ?ConnectionSnapshot<TEdge, TState>,
|};

// Return non-null when the input ref is non-null
declare function useConnection<TEdge, TState>(
  resolver: ConnectionResolver<TEdge, TState>,
  ref: ConnectionReferenceObject<TEdge>,
): TState;

// Return nullable when ref is nullable
declare function useConnection<TEdge, TState>(
  resolver: ConnectionResolver<TEdge, TState>,
  ref: ?ConnectionReferenceObject<TEdge>,
): ?TState;

/**
 * Public hook for consuming the results of `@connection_resolver` and
 * `@stream_connection_resolver`. Given a resolver and a reference to a
 * connection, returns the latest results for that connection as derived by
 * that resolver.
 */
function useConnection<TEdge, TState>(
  resolver: ConnectionResolver<TEdge, TState>,
  ref: ?ConnectionReferenceObject<TEdge>,
): ?TState {
  const environment = useRelayEnvironment();
  const reference = ref?.__connection;
  // Lazily initialize state, resetting if the inputs change
  const [connectionState, setConnectionState] = useState<State<TEdge, TState>>(
    () => {
      return buildConnectionState(environment, resolver, reference, null);
    },
  );
  if (
    connectionState.environment !== environment ||
    connectionState.reference?.id !== reference?.id ||
    connectionState.resolver !== resolver
  ) {
    setConnectionState(
      buildConnectionState(environment, resolver, reference, connectionState),
    );
  }
  const connectionSnapshot = connectionState.snapshot;

  useEffect(() => {
    if (connectionSnapshot == null) {
      return;
    }
    const latestState = buildConnectionState(
      environment,
      resolver,
      reference,
      connectionState,
    );
    if (
      latestState.snapshot != null &&
      !areEqual(latestState.snapshot.state, connectionSnapshot.state)
    ) {
      setConnectionState(latestState);
      // as an optimization, avoid subscribing until a render with fresh data
      return;
    }
    const store = environment.getStore();
    const disposable = store.subscribeConnection_UNSTABLE(
      connectionSnapshot,
      resolver,
      updatedSnapshot => {
        setConnectionState(currentConnectionState => {
          if (
            currentConnectionState.generation !== connectionState.generation
          ) {
            // When the connection generation changes there can be a gap where
            // the previous generation is still subscribed (between rendering
            // w the new identity and the effect cleanup). Ignore these updates.
            return currentConnectionState;
          }
          return {
            ...currentConnectionState,
            snapshot: updatedSnapshot,
          };
        });
      },
    );
    return () => disposable.dispose();
    // State.generation changes whenever environment/resolver/reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState.generation]);

  return connectionSnapshot != null
    ? connectionSnapshot.state
    : connectionSnapshot;
}

function buildConnectionState<TEdge, TState>(
  environment: IEnvironment,
  resolver: ConnectionResolver<TEdge, TState>,
  reference: ?ConnectionReference<TEdge>,
  previousState: ?State<TEdge, TState>,
): State<TEdge, TState> {
  const store = environment.getStore();
  const snapshot =
    reference != null
      ? store.lookupConnection_UNSTABLE(reference, resolver)
      : null;
  return {
    environment,
    generation: previousState != null ? previousState.generation + 1 : 0,
    reference,
    resolver,
    snapshot,
  };
}

module.exports = useConnection;
