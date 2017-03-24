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

jest.unmock('RelayContainer');

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const React = require('React');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayRecordStatusMap = require('RelayRecordStatusMap');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer.hasPartialData', () => {
  let MockContainer;
  let environment;
  let RelayTestRenderer;

  beforeEach(() => {
    jest.resetModules();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {foo: () => Relay.QL`fragment on Node{id}`},
    });
    environment = new RelayEnvironment();
    RelayTestRenderer = RelayTestUtils.createRenderer();

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation((_, dataID) => {
      return {__dataID__: dataID, id: dataID};
    });

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('returns true for records with partial data bit set', () => {
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment
    );
    const prop = {
      __dataID__: '123',
      __status__: RelayRecordStatusMap.setPartialStatus(0, true),
    };
    expect(instance.hasPartialData(prop)).toBe(true);
  });

  it('returns false for records without partial data bit set', () => {
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment
    );
    expect(instance.hasPartialData({__dataID__: '123'})).toBe(false);
  });
});
