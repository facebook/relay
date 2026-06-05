/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {LogEvent} from '../../../relay-runtime/store/RelayStoreTypes';

const {loadQuery} = require('../loadQuery');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useLazyLoadQuery = require('../useLazyLoadQuery');
const usePreloadedQuery = require('../usePreloadedQuery');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  RecordSource,
  Store,
  graphql,
} = require('relay-runtime');
const RelayFeatureFlags = require('relay-runtime/util/RelayFeatureFlags');

const {disallowConsoleErrors, disallowWarnings} = jest.requireActual(
  'relay-test-utils-internal',
) as $FlowFixMe;

disallowWarnings();
disallowConsoleErrors();

describe('useLazyLoadQuery with empty query', () => {
  let environment;
  let logs: Array<LogEvent>;
  let originalFlagValue;

  beforeEach(() => {
    originalFlagValue = RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK;
    RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK = true;

    logs = [];
    environment = new Environment({
      network: Network.create(() => {
        throw new Error('Network should not be called for empty queries');
      }),
      store: new Store(new RecordSource(), {gcReleaseBufferSize: 0}),
      log: event => {
        logs.push(event);
      },
    });
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK = originalFlagValue;
  });

  it('does not suspend when query is empty due to @skip', () => {
    const query = graphql`
      query emptyQueriesAvoidSuspenseTestSkipQuery($skip: Boolean!) {
        me @skip(if: $skip) {
          id
          name
        }
      }
    `;

    function Renderer() {
      const data = useLazyLoadQuery(
        query,
        {skip: true},
        {fetchPolicy: 'network-only'},
      );
      return `Data: ${JSON.stringify(data)}`;
    }

    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Loading...">{<Renderer />}</React.Suspense>
        </RelayEnvironmentProvider>,
      );
    });

    // Should not suspend - render should complete immediately
    expect(instance?.toJSON()).toEqual('Data: {}');

    // Should have logged the empty query skip
    expect(logs).toContainEqual(
      expect.objectContaining({
        name: 'execute.skipped',
        reason: 'empty',
      }),
    );
  });

  it('does not make network request when using usePreloadedQuery with empty query', () => {
    const query = graphql`
      query emptyQueriesAvoidSuspenseTestPreloadedQuery($skip: Boolean!) {
        me @skip(if: $skip) {
          id
          name
        }
      }
    `;

    const preloadedQuery = loadQuery(
      environment,
      query,
      {skip: true},
      {fetchPolicy: 'network-only'},
    );

    // Load query skips the request, so no logs here.
    expect(logs.length).toBe(0);

    function Renderer() {
      const data = usePreloadedQuery(query, preloadedQuery);
      return `Data: ${JSON.stringify(data)}`;
    }

    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Loading...">{<Renderer />}</React.Suspense>
        </RelayEnvironmentProvider>,
      );
    });

    // Should not suspend - render should complete immediately
    expect(instance?.toJSON()).toEqual('Data: {}');

    // On render we find there was no request, so we try to fetch lazily and
    // find/report that it was empty.
    expect(logs).toContainEqual(
      expect.objectContaining({
        name: 'execute.skipped',
        reason: 'empty',
      }),
    );

    // Dispose the preloaded query
    preloadedQuery.dispose();
  });
});
