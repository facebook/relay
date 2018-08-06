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

const React = require('React');

const createReactClass = require('create-react-class');

const {getReactComponent} = require('../RelayClassicContainerUtils');

const CreateClassComponent = createReactClass({
  displayName: 'CreateClassComponent',
  render: () => <div />,
});

class ReactComponentSubclass extends React.Component {
  render() {
    return <div />;
  }
}

const FunctionalComponent = () => <div />;

describe('RelayClassicContainerUtils', () => {
  describe('getReactComponent', () => {
    it('returns a component that extends React.Component', () => {
      expect(getReactComponent(ReactComponentSubclass)).toBe(
        ReactComponentSubclass,
      );
    });

    it('returns a component created by React.createClass()', () => {
      expect(getReactComponent(CreateClassComponent)).toBe(
        CreateClassComponent,
      );
    });

    it('returns null for functional components', () => {
      expect(getReactComponent(FunctionalComponent)).toBe(null);
    });
  });
});
