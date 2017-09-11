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

const React = require('React');
const RelayClassic = require('RelayClassic');

describe('isRelayContainer', function() {
  let MockComponent;
  let MockContainer;

  beforeEach(function() {
    jest.resetModules();

    MockComponent = class extends React.Component {
      render() {
        return <div />;
      }
    };

    MockContainer = RelayClassic.createContainer(MockComponent, {
      fragments: {},
    });
  });

  it('identifies RelayClassic containers correctly', () => {
    expect(RelayClassic.isContainer(MockContainer)).toBe(true);

    expect(RelayClassic.isContainer(MockComponent)).toBe(false);
  });
});
