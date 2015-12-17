/**
 * Copyright 2013-2015, Facebook, Inc.
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

jest.dontMock('RelayRenderer');

const React = require('React');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.validation', () => {
  let MockComponent;
  let MockContainer;
  let ShallowRenderer;

  let queryConfig;
  const {error} = console;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
    ShallowRenderer = ReactTestUtils.createRenderer();

    queryConfig = RelayQueryConfig.genMockInstance();

    console.error = jest.genMockFunction().mockImplementation(message => {
      throw new Error(message.replace(/Composite propType/, 'propType'));
    });
  });

  afterEach(() => {
    console.error = error;
  });

  it('requires a valid `Component` prop', () => {
    expect(() => ShallowRenderer.render(
      <RelayRenderer queryConfig={queryConfig} />
    )).toThrowError(
      'Warning: Failed propType: Required prop `Component` was not specified ' +
      'in `RelayRenderer`.'
    );

    expect(() => ShallowRenderer.render(
      <RelayRenderer Component={MockComponent} queryConfig={queryConfig} />
    )).toThrowError(
      'Warning: Failed propType: Invalid prop `Component` supplied to ' +
      '`RelayRenderer`, expected a RelayContainer.'
    );
  });

  it('requires a valid `queryConfig` prop', () => {
    expect(() => ShallowRenderer.render(
      <RelayRenderer Component={MockContainer} />
    )).toThrowError(
      'Warning: Failed propType: Required prop `queryConfig` was not ' +
      'specified in `RelayRenderer`.'
    );

    expect(() => ShallowRenderer.render(
      <RelayRenderer Component={MockContainer} queryConfig={{}} />
    )).toThrowError(
      'Warning: Failed propType: Required prop `queryConfig.name` was not ' +
      'specified in `RelayRenderer`.'
    );
  });

});
