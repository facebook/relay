/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 * @flow strict-local
 */

'use strict';

import type {readUpdatableFragmentEXPERIMENTALTestRegularQuery} from './__generated__/readUpdatableFragmentEXPERIMENTALTestRegularQuery.graphql';

const RelayNetwork = require('../../network/RelayNetwork');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayReader = require('../../store/RelayReader');
const RelayRecordSource = require('../../store/RelayRecordSource');
const commitLocalUpdate = require('../commitLocalUpdate');
const regularQuery = graphql`
  query readUpdatableFragmentEXPERIMENTALTestRegularQuery(
    $if2: Boolean
    $if3: Boolean
  ) {
    me {
      ...readUpdatableFragmentEXPERIMENTALTest_user
      ...readUpdatableFragmentEXPERIMENTALTest_2_user
      firstName
      firstName2: firstName(if: $if2)
      firstName3: firstName(if: $if3)
    }
  }
`;

const updatableFragment = graphql`
  fragment readUpdatableFragmentEXPERIMENTALTest_user on User @updatable {
    firstName
    firstName2: firstName(if: $if2)
  }
`;

const updatableFragment2 = graphql`
  fragment readUpdatableFragmentEXPERIMENTALTest_2_user on User @updatable {
    firstName2: firstName(if: $if2)
    firstName3: firstName(if: $if3)
  }
`;

describe('readUpdatableFragment', () => {
  let environment;
  let operation;
  let rootRequest;

  beforeEach(() => {
    rootRequest = getRequest(regularQuery);
    operation = createOperationDescriptor(rootRequest, {if2: true, if3: false});
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);

    const fetch = jest.fn();
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  it('handles variables correctly', () => {
    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        firstName: 'Mark',
        firstName2: 'Twain',
        firstName3: null,
      },
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableFragmentEXPERIMENTALTestRegularQuery['response']);

    const me = readOnlyData.me;
    if (me == null) {
      throw new Error('me should not be null');
    }
    expect(me.firstName).toBe('Mark');
    expect(me.firstName2).toBe('Twain');

    commitLocalUpdate(environment, store => {
      const updatableData = store.readUpdatableFragment_EXPERIMENTAL(
        updatableFragment,
        me,
      );

      expect(updatableData.firstName).toEqual('Mark');
      expect(updatableData.firstName2).toEqual('Twain');

      updatableData.firstName = 'Rita';
      updatableData.firstName2 = 'Repulsa';

      expect(updatableData.firstName).toEqual('Rita');
      expect(updatableData.firstName2).toEqual('Repulsa');
    });

    const readOnlyData2 = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableFragmentEXPERIMENTALTestRegularQuery['response']);
    expect(readOnlyData2?.me?.firstName).toBe('Rita');
    expect(readOnlyData2?.me?.firstName2).toBe('Repulsa');
  });

  it('correctly handles multiple aliased fields that use different variables', () => {
    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        firstName: null,
        firstName2: 'Twain',
        firstName3: 'Wahlburg',
      },
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableFragmentEXPERIMENTALTestRegularQuery['response']);

    const me = readOnlyData.me;
    if (me == null) {
      throw new Error('me should not be null');
    }
    expect(me.firstName2).toBe('Twain');
    expect(me.firstName3).toBe('Wahlburg');

    commitLocalUpdate(environment, store => {
      const updatableData = store.readUpdatableFragment_EXPERIMENTAL(
        updatableFragment2,
        me,
      );

      expect(updatableData.firstName2).toEqual('Twain');
      expect(updatableData.firstName3).toEqual('Wahlburg');

      updatableData.firstName2 = 'Lord';
      updatableData.firstName3 = 'Zedd';

      expect(updatableData.firstName2).toEqual('Lord');
      expect(updatableData.firstName3).toEqual('Zedd');
    });

    const readOnlyData2 = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableFragmentEXPERIMENTALTestRegularQuery['response']);
    expect(readOnlyData2?.me?.firstName2).toBe('Lord');
    expect(readOnlyData2?.me?.firstName3).toBe('Zedd');
  });
});
