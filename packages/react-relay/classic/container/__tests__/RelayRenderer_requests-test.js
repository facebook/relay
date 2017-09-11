/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

jest.unmock('RelayRenderer');
jest.unmock('react-test-renderer');

const React = require('React');
const ReactTestRenderer = require('react-test-renderer');
const RelayClassic = require('RelayClassic');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

const getRelayQueries = require('getRelayQueries');

describe('RelayRenderer', function() {
  let MockContainer;

  let container;
  let queryConfig;
  let environment;

  beforeEach(() => {
    jest.resetModules();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = RelayClassic.createContainer(MockComponent, {
      fragments: {},
    });

    container = ReactTestRenderer.create();
    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
    );
  });

  it('primes queries created from `Component` and `queryConfig`', () => {
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(environment.primeCache).toBeCalled();
  });

  it('does nothing when `Component` and `queryConfig` are unchanged', () => {
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
    );
    expect(getRelayQueries.mock.calls).toEqual([[MockContainer, queryConfig]]);
    expect(environment.primeCache.mock.calls.length).toBe(1);
  });

  it('does nothing when `Component` and `queryConfig` are resolved', () => {
    environment.primeCache.mock.requests[0].succeed();

    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
    );
    expect(getRelayQueries.mock.calls[0]).toEqual([MockContainer, queryConfig]);
    expect(environment.primeCache.mock.calls.length).toBe(1);
  });

  it('primes new queries when `Component` changes', () => {
    class AnotherComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    const AnotherContainer = RelayClassic.createContainer(AnotherComponent, {
      fragments: {},
    });
    container.update(
      <RelayRenderer
        Container={AnotherContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [AnotherContainer, queryConfig],
    ]);
    expect(environment.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `queryConfig` changes', () => {
    const anotherQueryConfig = RelayQueryConfig.genMockInstance();
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={anotherQueryConfig}
        environment={environment}
      />,
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, anotherQueryConfig],
    ]);
    expect(environment.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `environment` changes', () => {
    const anotherRelayEnvironment = new RelayEnvironment();
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={anotherRelayEnvironment}
      />,
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, queryConfig],
    ]);
    expect(environment.primeCache.mock.calls.length).toBe(1);
    expect(anotherRelayEnvironment.primeCache.mock.calls.length).toBe(1);
  });

  it('force fetches when the `forceFetch` prop is true', () => {
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        forceFetch={true}
      />,
    );
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(environment.forceFetch).toBeCalled();
  });

  it('calls `onForceFetch` hook if supplied', () => {
    const onForceFetch = jest.fn();
    const onPrimeCache = jest.fn();

    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        forceFetch={true}
        onForceFetch={onForceFetch}
        onPrimeCache={onPrimeCache}
      />,
    );
    expect(onForceFetch).toBeCalled();
    expect(onPrimeCache).not.toBeCalled();
  });

  it('calls `onPrimeCache` hook if supplied', () => {
    const anotherQueryConfig = RelayQueryConfig.genMockInstance();
    const onForceFetch = jest.fn();
    const onPrimeCache = jest.fn();

    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={anotherQueryConfig}
        environment={environment}
        onForceFetch={onForceFetch}
        onPrimeCache={onPrimeCache}
      />,
    );
    expect(onForceFetch).not.toBeCalled();
    expect(onPrimeCache).toBeCalled();
  });
});
