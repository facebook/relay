/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * @description
 * RelayShallowMock allows testing Relay components in isolation.
 * Every Relay container will only render the name of the component it contains.
 * Adds `unwrap` to the container that returns the component to test.
 *
 * @example
 * jest.mock('Relay', () => require('./RelayShallowMock'));
 * const renderer = require('ReactTestRenderer');
 * const MyContainer = require('MyContainer');
 *
 * test('the wrapped component', () => {
 *   const MyComponent = MyContainer.unwrap();
 *   // Here I can test the component by passing the properties I want to test
 *   // any containers inside the component will render as:
 *   // <RelayContainer>Component Name</RelayContainer>
 *   expect(
 *     renderer.create(
 *       <MyComponent myProp={{}} myOtherProp={{}} />
 *     ).toMatchSnapshot()
 *   );
 * });
 *
 */

'use strict';

const React = require('React');
const Relay = (require: any).requireActual('../RelayPublic');

import type {
  RelayContainerSpec,
  RelayLazyContainer,
} from '../container/RelayContainer';

const RelayShallowMock = {
  createContainer: (
    component: React.ComponentType<any>,
    spec: RelayContainerSpec,
  ): RelayLazyContainer => {
    return class extends React.Component<{}> {
      render() {
        return React.createElement(
          /* $FlowFixMe(>=0.53.0) This comment suppresses
           * an error when upgrading Flow's support for React. Common errors
           * found when upgrading Flow's React support are documented at
           * https://fburl.com/eq7bs81w */
          `Relay(${component.displayName || component.name || 'Unknown'})`,
        );
      }

      static unwrap(): React.ComponentType<any> {
        return component;
      }
    };
  },
};

module.exports = {
  ...Relay,
  ...RelayShallowMock,
};
