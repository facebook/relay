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

const React = require('React');
const Relay = require('Relay');

describe('isRelayContainer', function() {
  var MockComponent;
  var MockContainer;

  beforeEach(function() {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({
      render: () => <div />,
    });

    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
  });

  it('identifies Relay containers correctly', () => {
    expect(Relay.isContainer(MockContainer)).toBe(true);

    expect(Relay.isContainer(MockComponent)).toBe(false);
  });
});
