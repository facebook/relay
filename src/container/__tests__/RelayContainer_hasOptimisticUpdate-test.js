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

var React = require('React');
var Relay = require('Relay');
var RelayRecordStatusMap = require('RelayRecordStatusMap');
var RelayStoreData = require('RelayStoreData');

describe('RelayContainer.hasOptimisticUpdate', () => {
  var MockContainer;
  var RelayTestRenderer;
  var storeData;

  beforeEach(() => {
    jest.resetModuleRegistry();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {foo: () => Relay.QL`fragment on Node{id}`}
    });
    RelayTestRenderer = RelayTestUtils.createRenderer();

    storeData = RelayStoreData.getDefaultInstance();
    storeData.readFragmentPointer.mockImplementation(pointer => {
      return {__dataID__: pointer.getDataID(), id: pointer.getDataID()};
    });

    jest.addMatchers(RelayTestUtils.matchers);
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
    storeData.readFragmentPointer.mockImplementation(pointer => {
      return {
        __dataID__: pointer.getDataID(),
        id: pointer.getDataID(),
        __status__: RelayRecordStatusMap.setOptimisticStatus(0, true),
      };
    });

    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    });

    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(true);
  });

  it('is false for non-queued records', () => {
    var instance = RelayTestRenderer.render(genMockPointer => {
      return <MockContainer foo={genMockPointer('123')} />;
    });
    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(false);
  });
});
