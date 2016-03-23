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

require('configureForRelayOSS');

const React = require('React');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer', () => {
  describe('hasFragmentData()', () => {
    let mockContainerInstance;
    let mockFragmentReference;
    let mockPointer;
    let pendingQueryTracker;
    let store;

    beforeEach(() => {
      jest.resetModuleRegistry();
      const MockComponent = React.createClass({render: () => <div />});
      const MockContainer = Relay.createContainer(MockComponent, {
        fragments: {
          foo: () => Relay.QL`fragment on Node{id}`,
        },
      });
      const environment = new RelayEnvironment();
      const RelayTestRenderer = RelayTestUtils.createRenderer();
      mockContainerInstance = RelayTestRenderer.render(
        genMockPointer => <MockContainer foo={genMockPointer('42')} />,
        environment
      );
      mockFragmentReference = MockContainer.getFragment('foo');
      mockPointer = {__dataID__: '42'};
      const storeData = environment.getStoreData();
      pendingQueryTracker = storeData.getPendingQueryTracker();
      store = storeData.getCachedStore();
    });

    it('returns true when there are pending queries, but the fragment we are ' +
       'interested in has resolved', () => {
      pendingQueryTracker.hasPendingQueries =
        jest.genMockFn().mockImplementation(() => true);
      store.hasDeferredFragmentData =
        jest.genMockFn().mockReturnValue(true);
      const hasData = mockContainerInstance.hasFragmentData(
        mockFragmentReference,
        mockPointer
      );
      expect(hasData).toBe(true);
      expect(store.hasDeferredFragmentData.mock.calls[0][0]).toBe('42');
      // FIXME: If you can get the fragment ID, implement this expectation!
      // expect(store.hasDeferredFragmentData.mock.calls[0][1]).toBe('???');
    });

    it('returns false when there are pending queries, but the fragment we ' +
       'are interested in has not resolved', () => {
      pendingQueryTracker.hasPendingQueries =
        jest.genMockFn().mockImplementation(() => true);
      store.hasDeferredFragmentData =
        jest.genMockFn().mockReturnValue(false);
      const hasData = mockContainerInstance.hasFragmentData(
       mockFragmentReference,
       mockPointer
      );
      expect(hasData).toBe(false);
      expect(store.hasDeferredFragmentData.mock.calls[0][0]).toBe('42');
      // FIXME: If you can get the fragment ID, implement this expectation!
      // expect(store.hasDeferredFragmentData.mock.calls[0][1]).toBe('???');
    });
  });
});
