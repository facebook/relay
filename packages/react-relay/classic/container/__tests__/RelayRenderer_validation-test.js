/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest
  .mock('../../query-config/RelayQueryConfig')
  .mock('../../store/RelayEnvironment');

require('configureForRelayOSS');

const React = require('React');
const Relay = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayQueryConfig = require('../../query-config/RelayQueryConfig');
const RelayRenderer = require('../RelayRenderer');
const RelayTestUtils = require('RelayTestUtils');
const ShallowRenderer = require('react-test-renderer/shallow');

describe('RelayRenderer.validation', () => {
  let MockComponent;
  let MockContainer;

  let queryConfig;
  let environment;
  let shallowRenderer;

  const {error} = console;

  beforeEach(() => {
    jest.resetModules();
    expect.extend(RelayTestUtils.matchers);

    MockComponent = class extends React.Component {
      render() {
        return <div />;
      }
    };
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    shallowRenderer = new ShallowRenderer();

    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();

    console.error = jest.fn(message => {
      throw new Error(
        message
          // React 15.2 changes the wording to "prop type" and adds stack traces
          // (which we'll ignore for now)
          .replace(/Failed propType/, 'Failed prop type')
          .replace(/\n {4}in .*/, ''),
      );
    });
  });

  afterEach(() => {
    console.error = error;
  });

  it('requires a valid `Container` prop', () => {
    expect(() =>
      shallowRenderer.render(
        <RelayRenderer queryConfig={queryConfig} environment={environment} />,
      ),
    ).toThrowError(
      'Warning: Failed prop type: Required prop `Container` was not ' +
        'specified in `RelayRenderer`.',
    );

    expect(() =>
      shallowRenderer.render(
        <RelayRenderer
          Container={MockComponent}
          queryConfig={queryConfig}
          environment={environment}
        />,
      ),
    ).toThrowError(
      'Warning: Failed prop type: Invalid prop `Container` supplied to ' +
        '`RelayRenderer`, expected a RelayContainer.',
    );
  });

  it('requires a valid `queryConfig` prop', () => {
    expect(() =>
      shallowRenderer.render(
        <RelayRenderer Container={MockContainer} environment={environment} />,
      ),
    ).toThrowError(
      'Warning: Failed prop type: The prop `queryConfig` is marked as ' +
        'required in `RelayRenderer`, but its value is `undefined`.',
    );

    expect(() =>
      shallowRenderer.render(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={{}}
          environment={environment}
        />,
      ),
    ).toThrowError(
      'Warning: Failed prop type: The prop `queryConfig.name` is marked as ' +
        'required in `RelayRenderer`, but its value is `undefined`.',
    );
  });

  it('requires a valid `environment` prop', () => {
    expect(() =>
      shallowRenderer.render(
        <RelayRenderer Container={MockContainer} queryConfig={queryConfig} />,
      ),
    ).toThrowError(
      'Warning: Failed prop type: Invalid prop/context `environment` ' +
        'supplied to `RelayRenderer`, expected `undefined` to be an object ' +
        'conforming to the `RelayEnvironment` interface.',
    );

    expect(() =>
      shallowRenderer.render(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={queryConfig}
          environment={{}}
        />,
      ),
    ).toThrowError(
      'Warning: Failed prop type: Invalid prop/context `environment` ' +
        'supplied to `RelayRenderer`, expected `[object Object]` to be an ' +
        'object conforming to the `RelayEnvironment` interface.',
    );
  });
});
