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

jest.dontMock('RelayContainer');

var GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
var React = require('React');
var Relay = require('Relay');
var RelayContext = require('RelayContext');
var RelayStoreData = require('RelayStoreData');

describe('RelayContainer.hasOptimisticUpdate', () => {
  var relayContext;
  var storeData;

  var MockContainer;
  var RelayTestRenderer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    storeData = new RelayStoreData();
    relayContext = new RelayContext(storeData);

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {foo: () => Relay.QL`fragment on Node{id}`}
    });
    RelayTestRenderer = RelayTestUtils.createRenderer();

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation(pointer => {
      return {__dataID__: pointer.getDataID(), id: pointer.getDataID()};
    });

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('throws for invalid records', () => {
    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    }, null, relayContext);

    expect(() => {
      instance.hasOptimisticUpdate({});
    }).toFailInvariant(
      'RelayContainer.hasOptimisticUpdate(): Expected a record in ' +
      '`MockComponent`.',
    );
  });

  it('is only true for queued records', () => {
    var recordStore = storeData.getRecordStoreForOptimisticMutation('mutation');
    recordStore.putRecord('123', 'Type');
    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    }, null, relayContext);

    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(true);
  });

  it('is false for non-queued records', () => {
    storeData.getRecordStore().putRecord('123', 'Type');

    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    }, null, relayContext);
    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(false);
  });
});
