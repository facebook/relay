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
const ReactDOMServer = require('ReactDOMServer');
const Relay = require('Relay');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');
const RelayStore = require('RelayStore');

describe('RelayRenderer', function() {
  let MockComponent;
  let MockContainer;

  let queryConfig;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    queryConfig = RelayQueryConfig.genMockInstance();
  });

  it('does not run queries on the server', () => {
    ReactDOMServer.renderToString(
      <RelayRenderer Container={MockContainer} queryConfig={queryConfig} />
    );
    expect(RelayStore.forceFetch).not.toBeCalled();
    expect(RelayStore.primeCache).not.toBeCalled();
  });
});
