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

jest.mock('ReactDOM', () => ({}));

const React = require('React');
const RelayClassic = require('RelayClassic');
const ReactTestRenderer = require('ReactTestRenderer');
const RelayMockRenderer = require('RelayMockRenderer');

describe('RelayMockRenderer', () => {
  it('renders a container with mock data', () => {
    class Component extends React.Component {
      render() {
        return (
          <h1>
            {this.props.viewer.actor.name}
          </h1>
        );
      }
    }
    const Container = RelayClassic.createContainer(Component, {
      fragments: {
        viewer: () => RelayClassic.QL`
          fragment on Viewer {
            actor {
              name
            }
          }
        `,
      },
    });
    const mockViewer = {actor: {name: 'Zuck'}};
    const instance = ReactTestRenderer.create(
      <RelayMockRenderer render={() => <Container viewer={mockViewer} />} />,
    );
    expect(instance.toJSON()).toMatchSnapshot();
  });
});
