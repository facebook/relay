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

jest
  .disableAutomock()
  .mock('ReactDOM', () => ({}));

const React = require('React');
const ReactTestRenderer = require('ReactTestRenderer');
const ReactRelayRefetchContainer = require('ReactRelayRefetchContainer');
const ReactRelayFragmentMockRenderer = require('ReactRelayFragmentMockRenderer');
const ReactRelayFragmentContainer = require('ReactRelayFragmentContainer');
const RelayStaticMockEnvironment = require('RelayStaticMockEnvironment');

describe('ReactRelayFragmentMockRenderer', () => {
  it('renders fragment containers with mock data as supplied as props', () => {
    class ChildComponent extends React.Component {
      render() {
        return <h2>{this.props.viewer.actor.id}</h2>;
      }
    }

    const ChildContainer = ReactRelayRefetchContainer.createContainer(
      ChildComponent,
      {}, /* skip queries */
    );

    class ParentComponent extends React.Component {
      render() {
        return (
          <div>
            <h1>{this.props.viewer.actor.name}</h1>
            <ChildContainer viewer={this.props.viewer}/>
          </div>
        );
      }
    }

    const ParentContainer = ReactRelayFragmentContainer.createContainer(
      ParentComponent,
      {}, /* skip queries */
    );

    const mockViewer = {
      actor: {
        name: 'Mark',
        id: '4',
      },
    };

    const instance = ReactTestRenderer.create(
      <ReactRelayFragmentMockRenderer
        environment={RelayStaticMockEnvironment.createMockEnvironment()}
        render={() =>
          <ParentContainer viewer={mockViewer}/>
        }
      />
    );
    expect(instance.toJSON()).toMatchSnapshot();
  });
});
