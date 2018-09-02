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

jest
  .mock('../../legacy/store/GraphQLStoreQueryResolver')
  .mock('../../route/RelayRoute');

require('configureForRelayOSS');

const GraphQLStoreQueryResolver = require('../../legacy/store/GraphQLStoreQueryResolver');
const React = require('React');
const RelayClassic = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
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
    MockContainer = RelayClassic.createContainer(MockComponent, {
      fragments: {foo: () => RelayClassic.QL`fragment on Node{id}`},
    });
    environment = new RelayEnvironment();
    RelayTestRenderer = RelayTestUtils.createRenderer();

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation((_, dataID) => {
      return {__dataID__: dataID, id: dataID};
    });

    expect.extend(RelayTestUtils.matchers);
  });

  it('throws for invalid records', () => {
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment,
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
    const recordWriter = storeData.getRecordWriterForOptimisticMutation(
      'mutation',
    );
    recordWriter.putRecord('123', 'Type');
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment,
    );

    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(true);
  });

  it('is false for non-queued records', () => {
    environment
      .getStoreData()
      .getRecordWriter()
      .putRecord('123', 'Type');

    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment,
    );
    expect(instance.hasOptimisticUpdate({__dataID__: '123'})).toBe(false);
  });
});
