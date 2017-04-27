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
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer.hasOptimisticUpdate', () => {
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

  it('throws for invalid records', () => {
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment
    );

    expect(() => {
      instance.hasOptimisticUpdate({});
    }).toFailInvariant(
      'RelayContainer.hasOptimisticUpdate(): Expected a record in ' +
      '`MockComponent`.',
    );
  });

  it('is only true for queued records', () => {
    const storeData = environment.getStoreData();
    const recordWriter =
      storeData.getRecordWriterForOptimisticMutation('mutation');
    recordWriter.putRecord('123', 'Type');
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment
    );

    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(true);
  });

  it('is false for non-queued records', () => {
    environment.getStoreData().getRecordWriter()
      .putRecord('123', 'Type');

    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment
    );
    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(false);
  });
});
