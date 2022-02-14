/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {loadQuery} = require('../loadQuery');
const preloadQuery_DEPRECATED = require('../preloadQuery_DEPRECATED');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useFragment = require('../useFragment');
const usePreloadedQuery = require('../usePreloadedQuery');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  PreloadableQueryRegistry,
  RecordSource,
  Store,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {disallowWarnings, expectToWarn} = require('relay-test-utils-internal');

disallowWarnings();

const fragmentPV = getFragment(graphql`
  fragment usePreloadedQueryProvidedVariablesTest_Fragment on User
  @argumentDefinitions(
    includeName: {type: "Boolean!", provider: "../RelayProvider_returnsTrue"}
    includeFirstName: {
      type: "Boolean!"
      provider: "../RelayProvider_returnsFalse"
    }
    skipLastName: {type: "Boolean!", provider: "../RelayProvider_returnsFalse"}
    skipUsername: {type: "Boolean!", provider: "../RelayProvider_returnsTrue"}
  ) {
    name @include(if: $includeName)
    firstName @include(if: $includeFirstName)
    lastName @skip(if: $skipLastName)
    username @skip(if: $skipUsername)
  }
`);

const queryPV = getRequest(graphql`
  query usePreloadedQueryProvidedVariablesTest_Query($id: ID!) {
    node(id: $id) {
      id
      ...usePreloadedQueryProvidedVariablesTest_Fragment
    }
  }
`);

const preloadableConcreteRequestPV = {
  kind: 'PreloadableConcreteRequest',
  params: queryPV.params,
};

// Only queries with an ID are preloadable
const IdPV = 'providedVariables12346';
(queryPV.params: $FlowFixMe).id = IdPV;

const responsePV = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
      name: 'testName',
      firstName: 'testLastName',
      lastName: 'testLastName',
      username: 'testUsername',
    },
  },
  extensions: {
    is_final: true,
  },
};

describe('provided variables', () => {
  let data;
  let dataSource;
  let environment;
  let fetch;
  const Component = function (props) {
    const queryData = usePreloadedQuery(queryPV, props.prefetched);
    data = useFragment(fragmentPV, queryData.node);
    return [
      data?.name ?? 'MISSING NAME',
      data?.firstName ?? 'skipped firstName',
      data?.lastName ?? 'MISSING LASTNAME',
      data?.username ?? 'skipped username',
    ].join(', ');
  };
  beforeEach(() => {
    dataSource = undefined;
    fetch = jest.fn((_query, _variables, _cacheConfig) =>
      Observable.create(sink => {
        dataSource = sink;
      }),
    );
    environment = new Environment({
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
    });
  });

  describe('using preloadQuery_DEPRECATED', () => {
    it('renders synchronously with provided variables', () => {
      const prefetched = preloadQuery_DEPRECATED(
        environment,
        preloadableConcreteRequestPV,
        {
          id: '4',
        },
      );

      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.next(responsePV);
      }

      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual(
        'testName, skipped firstName, testLastName, skipped username',
      );
      expect(data).toEqual({
        name: 'testName',
        lastName: 'testLastName',
      });
    });
  });
  describe('using loadQuery', () => {
    it('renders synchronously when passed a preloadableConcreteRequest', () => {
      const prefetched = loadQuery(environment, preloadableConcreteRequestPV, {
        id: '4',
      });

      PreloadableQueryRegistry.set(IdPV, queryPV);

      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.next(responsePV);
      }
      TestRenderer.act(() => jest.runAllImmediates());

      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      TestRenderer.act(() => jest.runAllImmediates());

      expect(renderer.toJSON()).toEqual(
        'testName, skipped firstName, testLastName, skipped username',
      );
      expect(data).toEqual({
        name: 'testName',
        lastName: 'testLastName',
      });
    });

    it('renders synchronously when passed a query AST', () => {
      const prefetched = loadQuery(environment, queryPV, {
        id: '4',
      });
      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.next(responsePV);
      }
      TestRenderer.act(() => jest.runAllImmediates());

      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );

      expect(renderer.toJSON()).toEqual(
        'testName, skipped firstName, testLastName, skipped username',
      );
      expect(data).toEqual({
        name: 'testName',
        lastName: 'testLastName',
      });
    });
  });

  it('warns when variable provider is an impure function', () => {
    graphql`
      fragment usePreloadedQueryProvidedVariablesTest_badFragment on User
      @argumentDefinitions(
        impureProvider: {type: "Float!", provider: "../RelayProvider_impure"}
      ) {
        profile_picture(scale: $impureProvider) {
          uri
        }
      }
    `;
    const queryPVBad = graphql`
      query usePreloadedQueryProvidedVariablesTest_badQuery($id: ID!) {
        node(id: $id) {
          ...usePreloadedQueryProvidedVariablesTest_badFragment
        }
      }
    `;

    const preloadWithFetchKey = (fetchKey: string | number) => {
      return preloadQuery_DEPRECATED(
        environment,
        {
          kind: 'PreloadableConcreteRequest',
          params: queryPVBad.params,
        },
        {
          id: '4',
        },
        {
          fetchKey,
        },
      );
    };
    preloadWithFetchKey('fetchKey0');

    expectToWarn(
      'Relay: Expected function `get` for provider `__relay_internal__pv__RelayProvider_impure` ' +
        'to be a pure function, but got conflicting return values `1` and `0`',
      () => {
        preloadWithFetchKey('fetchKey1');
      },
    );
  });
});
