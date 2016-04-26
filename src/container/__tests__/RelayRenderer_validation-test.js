/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

jest.unmock('RelayRenderer');

const React = require('React');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayRenderer.validation', () => {
  let MockComponent;
  let MockContainer;
  let ShallowRenderer;

  let queryConfig;
  let environment;
  const {error} = console;

  beforeEach(() => {
    jest.resetModuleRegistry();
    jasmine.addMatchers(RelayTestUtils.matchers);

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
    ShallowRenderer = ReactTestUtils.createRenderer();

    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();

    console.error = jest.fn(message => {
      throw new Error(message.replace(/Composite propType/, 'propType'));
    });
  });

  afterEach(() => {
    console.error = error;
  });

  it('requires a valid `Container` prop', () => {
    expect(() => ShallowRenderer.render(
      <RelayRenderer queryConfig={queryConfig} environment={environment} />
    )).toThrowError(
      'Warning: Failed propType: Required prop `Container` was not specified ' +
      'in `RelayRenderer`.'
    );

    expect(() => ShallowRenderer.render(
      <RelayRenderer
        Container={MockComponent}
        queryConfig={queryConfig}
        environment={environment}
      />
    )).toThrowError(
      'Warning: Failed propType: Invalid prop `Container` supplied to ' +
      '`RelayRenderer`, expected a RelayContainer.'
    );
  });

  it('requires a valid `queryConfig` prop', () => {
    expect(() => ShallowRenderer.render(
      <RelayRenderer Container={MockContainer} environment={environment} />
    )).toThrowError(
      'Warning: Failed propType: Required prop `queryConfig` was not ' +
      'specified in `RelayRenderer`.'
    );

    expect(() => ShallowRenderer.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={{}}
        environment={environment}
      />
    )).toThrowError(
      'Warning: Failed propType: Required prop `queryConfig.name` was not ' +
      'specified in `RelayRenderer`.'
    );
  });

  it('requires a valid `environment` prop', () => {
    expect(() => ShallowRenderer.render(
      <RelayRenderer Container={MockContainer} queryConfig={queryConfig} />
    )).toThrowError(
      'Warning: Failed propType: Invalid prop/context `environment` ' +
      'supplied to `RelayRenderer`, expected `undefined` to be an object ' +
      'conforming to the `RelayEnvironment` interface.'
    );

    expect(() => ShallowRenderer.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={{}}
      />
    )).toThrowError(
      'Warning: Failed propType: Invalid prop/context `environment` ' +
      'supplied to `RelayRenderer`, expected `[object Object]` to be an ' +
      'object conforming to the `RelayEnvironment` interface.'
    );
  });

});
