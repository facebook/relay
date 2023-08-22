/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {CacheConfig, RequestParameters, Variables} from 'relay-runtime';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useLazyLoadQuery = require('../useLazyLoadQuery');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  graphql,
} = require('relay-runtime');

describe('useLazyLoadQuery with queryCacheExpirationTime', () => {
  let environment;
  let ParentQuery;
  let source;
  let store;
  let fetchTime;
  let fetch;
  let networkSource;
  let render;
  const QUERY_CACHE_EXPIRATION_TIME = 1000;
  const GC_RELEASE_BUFFER_SIZE = 1;

  beforeEach(() => {
    fetchTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

    ParentQuery = graphql`
      query useLazyLoadQueryQueryCacheExpirationTimeTestQuery {
        me {
          id
          name
        }
      }
    `;

    source = RecordSource.create();
    store = new Store(source, {
      queryCacheExpirationTime: QUERY_CACHE_EXPIRATION_TIME,
      gcReleaseBufferSize: GC_RELEASE_BUFFER_SIZE,
    });
    fetch = jest.fn(
      (
        _query: RequestParameters,
        _variables: Variables,
        _cacheConfig: CacheConfig,
      ) => {
        return Observable.create<$FlowFixMe>(sink => {
          networkSource = sink;
        });
      },
    );
    environment = new Environment({
      network: Network.create((fetch: $FlowFixMe)),
      store,
    });

    render = (env: Environment, children: React.Node) => {
      const instance = ReactTestRenderer.create(
        <RelayEnvironmentProvider environment={env}>
          <React.Suspense fallback="Fallback">{children}</React.Suspense>
        </RelayEnvironmentProvider>,
      );
      return [
        instance,
        (nextChildren: React.Node) => {
          instance.update(
            <RelayEnvironmentProvider environment={env}>
              <React.Suspense fallback="Fallback">
                {nextChildren}
              </React.Suspense>
            </RelayEnvironmentProvider>,
          );
        },
      ];
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not refetch if the previous query has not expired', () => {
    let data: string | void;
    function Component() {
      data = useLazyLoadQuery(
        ParentQuery,
        {},
        {
          fetchPolicy: 'store-or-network',
        },
      );
      return data.me.name;
    }
    const [instance, rerender] = render(environment, <Component />);
    expect(instance.toJSON()).toEqual('Fallback');
    expect(data).toEqual(undefined);

    ReactTestRenderer.act(() => {
      networkSource.next({
        data: {
          me: {
            id: '4',
            name: 'Zuck',
          },
        },
      });
      jest.runAllTimers();
    });
    expect(instance.toJSON()).toEqual('Zuck');
    expect(data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
    expect(fetch).toBeCalledTimes(1);
    ReactTestRenderer.act(() => {
      jest.runAllTimers();
      rerender(<div />); // unmount the component
      jest.runAllTimers();
    });

    // Advance time to just before query expiration
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => fetchTime + (QUERY_CACHE_EXPIRATION_TIME - 1));

    rerender(<Component />);
    expect(instance.toJSON()).toEqual('Zuck');
    expect(fetch).toBeCalledTimes(1);
    rerender(<div />); // unmount the component
    jest.runAllTimers();

    // Advance time to just after query expiration
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => fetchTime + (QUERY_CACHE_EXPIRATION_TIME + 1));

    rerender(<Component />);
    // TODO: This should suspend again and show the fallback.
    // The fetchQueryInternal instance is incorrectly reused when it should have
    // been cleared on unmount of the previous component.
    expect(instance.toJSON()).toEqual('Zuck');
    // TODO: This should fetch again, per above the previous cache entry should be
    // cleared and this should fetch again (call count 2, not 1)
    expect(fetch).toBeCalledTimes(1);
  });
});
