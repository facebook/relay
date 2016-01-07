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

require('configureForRelayOSS');

jest.dontMock('RelayContainer');

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const React = require('React');
const Relay = require('Relay');
const RelayContext = require('RelayContext');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer.hasOptimisticUpdate', () => {
  var MockContainer;
  var RelayTestRenderer;
  var relayContext;

  beforeEach(() => {
    jest.resetModuleRegistry();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {foo: () => Relay.QL`fragment on Node{id}`},
    });
    RelayTestRenderer = RelayTestUtils.createRenderer();

    relayContext = new RelayContext();

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation(pointer => {
      return {__dataID__: pointer.getDataID(), id: pointer.getDataID()};
    });

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('throws for invalid records', () => {
    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    });

    expect(() => {
      instance.hasOptimisticUpdate({});
    }).toFailInvariant(
      'RelayContainer.hasOptimisticUpdate(): Expected a record in ' +
      '`MockComponent`.',
    );
  });

  it('is only true for queued records', () => {
    var storeData = relayContext.getStoreData();
    var recordStore = storeData.getRecordStoreForOptimisticMutation('mutation');
    recordStore.putRecord('123', 'Type');
    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    }, relayContext);

    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(true);
  });

  it('is false for non-queued records', () => {
    relayContext.getStoreData().getRecordStore()
      .putRecord('123', 'Type');

    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    }, relayContext);
    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(false);
  });
});
