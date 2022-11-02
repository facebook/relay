/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {Destination} from 'ReactFlightDOMRelayServerIntegration';
import type {Pending, Result} from 'RelayFlightRenderer.server';
import type {OperationDescriptor} from 'relay-runtime';

import ReactFlightDOMRelayServer from 'ReactFlightDOMRelayServer';
import * as ReactFlightDOMRelayServerIntegration from 'ReactFlightDOMRelayServerIntegration';
import * as OperationMap from 'RelayFlightOperationMap.server';

import err from 'err';
import gkx from 'gkx';
import ix from 'ix';
import * as React from 'react';

type ServerComponent<T> = () => T;

export default class RelayFlightTask<T: React$MixedElement | string | null> {
  +destination: Destination;
  hasRendered: boolean;
  +taskId: string;
  +serverComponent: ServerComponent<T>;
  +modules: Array<string>;

  constructor(taskId: string, serverComponent: ServerComponent<T>) {
    this.taskId = taskId;
    this.destination = {
      complete: false,
      rows: [],
    };
    this.hasRendered = false;
    this.serverComponent = serverComponent;
    this.modules = [];
  }

  render() {
    if (this.hasRendered) {
      return;
    }
    this.hasRendered = true;
    const ServerComponentRoot = this.serverComponent;
    ReactFlightDOMRelayServer.render(
      <ServerComponentRoot />,
      this.destination,
      this.modules,
    );
  }

  poll(): Result {
    if (this.destination.complete) {
      return {
        kind: 'complete',
        value: {
          tree: this.destination.rows,
          modules: ReactFlightDOMRelayServerIntegration.takeModuleReferences(),
          queries: OperationMap.getPendingClientOperations(),
          gkLogs: gkx.getLogged() || [],
          ixPaths: ix.getUsedPaths_ONLY_FOR_REACT_FLIGHT(),
        },
      };
    } else {
      const pendingQueries = OperationMap.getPendingOperations();
      if (pendingQueries.length > 0) {
        return createQueryResult(this.taskId, pendingQueries);
      } else {
        throw err(
          `Expected execution to be 'complete' if there are no pending operations.`,
        );
      }
    }
  }
}

function createQueryResult(
  taskId: string,
  operations: $ReadOnlyArray<OperationDescriptor>,
): Pending {
  return {
    kind: 'pending',
    taskId,
    value: operations.map(operation => {
      const id = operation.request.node.params.id;
      if (id == null) {
        throw err(
          `Expected query '${operation.request.node.params.name}' to have a persisted id.`,
        );
      }
      return {
        operationKey: OperationMap.getOperationKey(operation),
        id,
        variables: operation.request.variables,
      };
    }),
  };
}
