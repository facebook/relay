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

require('configureForRelayOSS');

jest.mock('warning').mock('../../query-config/RelayQueryConfig');

const React = require('React');
const RelayClassic = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayQueryConfig = require('../../query-config/RelayQueryConfig');
const RelayRecord = require('../../store/RelayRecord');
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
      jest.resetModules();

      class MockComponent extends React.Component {
        render() {
          return <div />;
        }
      }
      MockContainer = RelayClassic.createContainer(MockComponent, {
        fragments: {
          foo: () => RelayClassic.QL`fragment on Node{id}`,
        },
      });
      const RelayTestRenderer = RelayTestUtils.createRenderer();

      const environment = new RelayEnvironment();
      queryConfig = RelayQueryConfig.genMockInstance();
      container = RelayTestRenderer.render(
        genMockPointer => <MockContainer foo={genMockPointer('42')} />,
        environment,
        queryConfig,
      );
      store = environment.getStoreData().getCachedStore();

      expect.extend(RelayTestUtils.matchers);
    });

    it('returns true for deferred fragments with resolved data', () => {
      store.hasFragmentData = jest.fn(() => true);
      const hasData = container.hasFragmentData(
        MockContainer.getFragment('foo').defer(),
        RelayRecord.create('42'),
      );
      expect(hasData).toBe(true);
      expect(store.hasFragmentData).toBeCalledWith(
        '42',
        getFragmentCompositeHash(MockContainer.getFragment('foo'), queryConfig),
      );
    });

    it('returns false for deferred fragments without resolved data', () => {
      store.hasFragmentData = jest.fn(() => false);
      const hasData = container.hasFragmentData(
        MockContainer.getFragment('foo').defer(),
        RelayRecord.create('42'),
      );
      expect(hasData).toBe(false);
      expect(store.hasFragmentData).toBeCalledWith(
        '42',
        getFragmentCompositeHash(MockContainer.getFragment('foo'), queryConfig),
      );
    });
  });
});
