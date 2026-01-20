/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';
import type {
  GraphQLResponse,
  LogRequestInfoFunction,
  UploadableMap,
} from '../../network/RelayNetworkTypes';
import type {ObservableFromValue} from '../../network/RelayObservable';
import type {RequestParameters} from '../../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../../util/RelayRuntimeTypes';
import type {readUpdatableFragmentTestRegularQuery} from './__generated__/readUpdatableFragmentTestRegularQuery.graphql';

const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayReader = require('../../store/RelayReader');
const RelayRecordSource = require('../../store/RelayRecordSource');
const commitLocalUpdate = require('../commitLocalUpdate');

const regularQuery = graphql`
  query readUpdatableFragmentTestRegularQuery($if2: Boolean, $if3: Boolean) {
    me {
      ...readUpdatableFragmentTest_user
      ...readUpdatableFragmentTest_2_user
      firstName
      firstName2: firstName(if: $if2)
      firstName3: firstName(if: $if3)
    }
  }
`;

const updatableFragment = graphql`
  fragment readUpdatableFragmentTest_user on User @updatable {
    firstName
    firstName2: firstName(if: $if2)
  }
`;

const updatableFragment2 = graphql`
  fragment readUpdatableFragmentTest_2_user on User @updatable {
    firstName2: firstName(if: $if2)
    firstName3: firstName(if: $if3)
  }
`;

describe('readUpdatableFragment', () => {
  let environment;
  let operation;
  let rootRequest;

  beforeEach(() => {
    rootRequest = regularQuery;
    operation = createOperationDescriptor(rootRequest, {if2: true, if3: false});
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);

    const fetch = jest.fn<
      [
        RequestParameters,
        Variables,
        CacheConfig,
        ?UploadableMap,
        ?LogRequestInfoFunction,
      ],
      ObservableFromValue<GraphQLResponse>,
    >();
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  it('handles variables correctly', () => {
    environment.commitPayload(operation, {
      me: {
        __typename: 'User',
        firstName: 'Mark',
        firstName2: 'Twain',
        firstName3: null,
        id: '4',
      },
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData: readUpdatableFragmentTestRegularQuery['response'] =
      // $FlowFixMe[incompatible-type]
      // $FlowFixMe[incompatible-indexer]
      RelayReader.read(source, selector, null, undefined, undefined)
        .data as readUpdatableFragmentTestRegularQuery['response'];

    const me = readOnlyData.me;
    if (me == null) {
      throw new Error('me should not be null');
    }
    expect(me.firstName).toBe('Mark');
    expect(me.firstName2).toBe('Twain');

    commitLocalUpdate(environment, store => {
      const updatableData = store.readUpdatableFragment(
        updatableFragment,
        me,
      ).updatableData;

      expect(updatableData.firstName).toEqual('Mark');
      expect(updatableData.firstName2).toEqual('Twain');

      updatableData.firstName = 'Rita';
      updatableData.firstName2 = 'Repulsa';

      expect(updatableData.firstName).toEqual('Rita');
      expect(updatableData.firstName2).toEqual('Repulsa');
    });

    const readOnlyData2: readUpdatableFragmentTestRegularQuery['response'] =
      // $FlowFixMe[incompatible-type]
      // $FlowFixMe[incompatible-indexer]
      RelayReader.read(source, selector, null, undefined, undefined)
        .data as readUpdatableFragmentTestRegularQuery['response'];
    expect(readOnlyData2?.me?.firstName).toBe('Rita');
    expect(readOnlyData2?.me?.firstName2).toBe('Repulsa');
  });

  it('correctly handles multiple aliased fields that use different variables', () => {
    environment.commitPayload(operation, {
      me: {
        __typename: 'User',
        firstName: null,
        firstName2: 'Twain',
        firstName3: 'Wahlburg',
        id: '4',
      },
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData: readUpdatableFragmentTestRegularQuery['response'] =
      // $FlowFixMe[incompatible-type]
      // $FlowFixMe[incompatible-indexer]
      RelayReader.read(source, selector, null, undefined, undefined)
        .data as readUpdatableFragmentTestRegularQuery['response'];

    const me = readOnlyData.me;
    if (me == null) {
      throw new Error('me should not be null');
    }
    expect(me.firstName2).toBe('Twain');
    expect(me.firstName3).toBe('Wahlburg');

    commitLocalUpdate(environment, store => {
      const updatableData = store.readUpdatableFragment(
        updatableFragment2,
        me,
      ).updatableData;

      expect(updatableData.firstName2).toEqual('Twain');
      expect(updatableData.firstName3).toEqual('Wahlburg');

      updatableData.firstName2 = 'Lord';
      updatableData.firstName3 = 'Zedd';

      expect(updatableData.firstName2).toEqual('Lord');
      expect(updatableData.firstName3).toEqual('Zedd');
    });

    const readOnlyData2: readUpdatableFragmentTestRegularQuery['response'] =
      // $FlowFixMe[incompatible-type]
      // $FlowFixMe[incompatible-indexer]
      RelayReader.read(source, selector, null, undefined, undefined)
        .data as readUpdatableFragmentTestRegularQuery['response'];
    expect(readOnlyData2?.me?.firstName2).toBe('Lord');
    expect(readOnlyData2?.me?.firstName3).toBe('Zedd');
  });
});
