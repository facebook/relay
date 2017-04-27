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

const React = require('React');
const Relay = require('Relay');

describe('isRelayContainer', function() {
  let MockComponent;
  let MockContainer;

  beforeEach(function() {
    jest.resetModules();

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
