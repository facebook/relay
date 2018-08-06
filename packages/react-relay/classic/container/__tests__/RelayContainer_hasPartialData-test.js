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
const RelayRecordStatusMap = require('../../store/RelayRecordStatusMap');
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

  it('returns true for records with partial data bit set', () => {
    const instance = RelayTestRenderer.render(
      genMockPointer => <MockContainer foo={genMockPointer('123')} />,
      environment,
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
      environment,
    );
    expect(instance.hasPartialData({__dataID__: '123'})).toBe(false);
  });
});
