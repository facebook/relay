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

jest.mock('warning');

require('configureForRelayOSS');

const React = require('React');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRecord = require('RelayRecord');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer', () => {
  const {getNode} = RelayTestUtils;

  const getFragmentCompositeHash = (fragmentReference, queryConfig) => {
    const variables = {};
    const concreteFragmentID = fragmentReference.getFragment(variables);
    const fragment = getNode(concreteFragmentID, variables, queryConfig);
    return fragment.getCompositeHash();
  };

  describe('hasFragmentData()', () => {
    let MockContainer;
    let container;
    let queryConfig;
    let store;

    beforeEach(() => {
      jest.resetModuleRegistry();

      class MockComponent extends React.Component {
        render() {
          return <div />;
        }
      }
      MockContainer = Relay.createContainer(MockComponent, {
        fragments: {
          foo: () => Relay.QL`fragment on Node{id}`,
        },
      });
      const RelayTestRenderer = RelayTestUtils.createRenderer();

      const environment = new RelayEnvironment();
      queryConfig = RelayQueryConfig.genMockInstance();
      container = RelayTestRenderer.render(
        genMockPointer => <MockContainer foo={genMockPointer('42')} />,
        environment,
        queryConfig
      );
      store = environment.getStoreData().getCachedStore();

      jasmine.addMatchers(RelayTestUtils.matchers);
    });

    it('returns true for deferred fragments with resolved data', () => {
      store.hasDeferredFragmentData = jest.fn(() => true);
      const hasData = container.hasFragmentData(
        MockContainer.getFragment('foo').defer(),
        RelayRecord.create('42')
      );
      expect(hasData).toBe(true);
      expect(store.hasDeferredFragmentData).toBeCalledWith(
        '42',
        getFragmentCompositeHash(MockContainer.getFragment('foo'), queryConfig)
      );
    });

    it('returns false for deferred fragments without resolved data', () => {
      store.hasDeferredFragmentData = jest.fn(() => false);
      const hasData = container.hasFragmentData(
       MockContainer.getFragment('foo').defer(),
       RelayRecord.create('42')
      );
      expect(hasData).toBe(false);
      expect(store.hasDeferredFragmentData).toBeCalledWith(
        '42',
        getFragmentCompositeHash(MockContainer.getFragment('foo'), queryConfig)
      );
    });
  });
});
