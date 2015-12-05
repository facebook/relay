/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var React = require('React');
var Relay = require('Relay');
var RelayStoreData = require('RelayStoreData');

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
      const RelayTestRenderer = RelayTestUtils.createRenderer();
      mockContainerInstance = RelayTestRenderer.render(genMockPointer => {
        return <MockContainer foo={genMockPointer('42')} />;
      });
      mockFragmentReference = MockContainer.getFragment('foo');
      mockPointer = {__dataID__: '42'};
      const storeData = RelayStoreData.getDefaultInstance();
      pendingQueryTracker = storeData.getPendingQueryTracker();
      store = storeData.getCachedStore();
    });

    it('returns true when there are no pending queries', () => {
      spyOn(pendingQueryTracker, 'hasPendingQueries').andReturn(false);
      const hasData = mockContainerInstance.hasFragmentData(
        mockFragmentReference,
        mockPointer
      );
      expect(hasData).toBe(true);
    });

    it('returns true when there are pending queries, but the fragment we are ' +
       'interested in has resolved', () => {
      spyOn(pendingQueryTracker, 'hasPendingQueries').andReturn(true);
      store.hasDeferredFragmentData =
        jest.genMockFunction().mockReturnValue(true);
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
      spyOn(pendingQueryTracker, 'hasPendingQueries').andReturn(true);
      store.hasDeferredFragmentData =
        jest.genMockFunction().mockReturnValue(false);
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
