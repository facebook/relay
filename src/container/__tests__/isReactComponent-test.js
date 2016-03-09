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
const isReactComponent = require('isReactComponent');

describe('isReactComponent', function() {
  it('identifies components that extends React.Component', function() {
    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    expect(isReactComponent(MockComponent)).toBe(true);
  });

  it('identifies components created by React.createClass()', function() {
    const MockComponent = React.createClass({
      render: () => <div />,
    });
    expect(isReactComponent(MockComponent)).toBe(true);
  });

  it('does not identify function components', function() {
    const MockComponent = () => <div />;
    expect(isReactComponent(MockComponent)).toBe(false);
  });
});
