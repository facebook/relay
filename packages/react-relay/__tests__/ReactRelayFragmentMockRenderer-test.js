/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const ReactRelayFragmentContainer = require('../ReactRelayFragmentContainer');
const ReactRelayFragmentMockRenderer = require('../ReactRelayFragmentMockRenderer');
const ReactRelayRefetchContainer = require('../ReactRelayRefetchContainer');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('ReactRelayFragmentMockRenderer', () => {
  it('renders fragment containers with mock data as supplied as props', () => {
    class ChildComponent extends React.Component {
      render() {
        return <h2>{this.props.viewer.actor.id}</h2>;
      }
    }

    const ChildContainer = ReactRelayRefetchContainer.createContainer(
      ChildComponent,
      {} /* skip queries */,
    );

    class ParentComponent extends React.Component {
      render() {
        return (
          <div>
            <h1>{this.props.viewer.actor.name}</h1>
            <ChildContainer viewer={this.props.viewer} />
          </div>
        );
      }
    }

    const ParentContainer = ReactRelayFragmentContainer.createContainer(
      ParentComponent,
      {} /* skip queries */,
    );

    const mockViewer = {
      actor: {
        name: 'Mark',
        id: '4',
      },
    };

    const instance = ReactTestRenderer.create(
      <ReactRelayFragmentMockRenderer
        environment={createMockEnvironment()}
        render={() => <ParentContainer viewer={mockViewer} />}
      />,
    );
    expect(instance.toJSON()).toMatchSnapshot();
  });
});
