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
import type {Snapshot} from '../RelayStoreTypes';
import type {
  RelayModernEnvironmentTypeRefinementTest1Query$data,
  RelayModernEnvironmentTypeRefinementTest1Query$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTest1Query.graphql';
import type {
  RelayModernEnvironmentTypeRefinementTest2Query$data,
  RelayModernEnvironmentTypeRefinementTest2Query$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTest2Query.graphql';
import type {
  RelayModernEnvironmentTypeRefinementTest3Query$data,
  RelayModernEnvironmentTypeRefinementTest3Query$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTest3Query.graphql';
import type {
  RelayModernEnvironmentTypeRefinementTest4Query$data,
  RelayModernEnvironmentTypeRefinementTest4Query$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTest4Query.graphql';
import type {
  RelayModernEnvironmentTypeRefinementTest5Query$data,
  RelayModernEnvironmentTypeRefinementTest5Query$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTest5Query.graphql';
import type {
  RelayModernEnvironmentTypeRefinementTest6Query$data,
  RelayModernEnvironmentTypeRefinementTest6Query$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTest6Query.graphql';
import type {
  RelayModernEnvironmentTypeRefinementTestParentQuery$data,
  RelayModernEnvironmentTypeRefinementTestParentQuery$variables,
} from './__generated__/RelayModernEnvironmentTypeRefinementTestParentQuery.graphql';
import type {OperationDescriptor} from 'relay-runtime/store/RelayStoreTypes';
import type {Query} from 'relay-runtime/util/RelayRuntimeTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateTypeID} = require('../TypeID');
const nullthrows = require('nullthrows');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

describe('missing data detection', () => {
  let ParentQuery:
    | Query<
        RelayModernEnvironmentTypeRefinementTest1Query$variables,
        RelayModernEnvironmentTypeRefinementTest1Query$data,
      >
    | Query<
        RelayModernEnvironmentTypeRefinementTest2Query$variables,
        RelayModernEnvironmentTypeRefinementTest2Query$data,
      >
    | Query<
        RelayModernEnvironmentTypeRefinementTest3Query$variables,
        RelayModernEnvironmentTypeRefinementTest3Query$data,
      >
    | Query<
        RelayModernEnvironmentTypeRefinementTest4Query$variables,
        RelayModernEnvironmentTypeRefinementTest4Query$data,
      >
    | Query<
        RelayModernEnvironmentTypeRefinementTest5Query$variables,
        RelayModernEnvironmentTypeRefinementTest5Query$data,
      >
    | Query<
        RelayModernEnvironmentTypeRefinementTest6Query$variables,
        RelayModernEnvironmentTypeRefinementTest6Query$data,
      >
    | Query<
        RelayModernEnvironmentTypeRefinementTestParentQuery$variables,
        RelayModernEnvironmentTypeRefinementTestParentQuery$data,
      >;
  let AbstractQuery;
  let AbstractClientQuery;
  let ConcreteQuery;
  let ConcreteUserFragment;
  let ConcreteInlineRefinementFragment;
  let AbstractActorFragment;
  let AbstractInlineRefinementFragment;
  let AbstractClientInterfaceFragment;
  let environment;
  let operation;
  let concreteOperation;
  let abstractOperation;

  beforeEach(() => {
    ParentQuery = graphql`
      query RelayModernEnvironmentTypeRefinementTestParentQuery {
        userOrPage(id: "abc") {
          ...RelayModernEnvironmentTypeRefinementTestConcreteUserFragment
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentTypeRefinementTestAbstractActorFragment
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment
            @dangerously_unaliased_fixme
        }
      }
    `;

    // version of the query with only concrete refinements
    ConcreteQuery = graphql`
      query RelayModernEnvironmentTypeRefinementTestConcreteQuery {
        userOrPage(id: "abc") {
          ...RelayModernEnvironmentTypeRefinementTestConcreteUserFragment
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment
            @dangerously_unaliased_fixme
        }
      }
    `;

    // version of the query with only abstract refinements
    AbstractQuery = graphql`
      query RelayModernEnvironmentTypeRefinementTestAbstractQuery {
        userOrPage(id: "abc") {
          ...RelayModernEnvironmentTypeRefinementTestAbstractActorFragment
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment
            @dangerously_unaliased_fixme
        }
      }
    `;

    // version of the query with only abstract refinements
    AbstractClientQuery = graphql`
      query RelayModernEnvironmentTypeRefinementTestClientAbstractQuery {
        client_interface {
          ...RelayModernEnvironmentTypeRefinementTestClientInterface
        }
      }
    `;

    // identical fragments except for User (concrete) / Actor (interface)
    ConcreteUserFragment = graphql`
      fragment RelayModernEnvironmentTypeRefinementTestConcreteUserFragment on User {
        id
        name
        missing: lastName
      }
    `;

    AbstractActorFragment = graphql`
      fragment RelayModernEnvironmentTypeRefinementTestAbstractActorFragment on Actor {
        id
        name
        missing: lastName
      }
    `;

    AbstractClientInterfaceFragment = graphql`
      fragment RelayModernEnvironmentTypeRefinementTestClientInterface on ClientInterface {
        description
      }
    `;

    // identical except for inline fragments on User / Actor
    // note fragment type is Node in both cases to avoid any
    // flattening
    ConcreteInlineRefinementFragment = graphql`
      fragment RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment on Node {
        ... on User {
          id
          name
          missing: lastName
        }
      }
    `;

    AbstractInlineRefinementFragment = graphql`
      fragment RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment on Node {
        ... on Actor {
          id
          name
          missing: lastName
        }
      }
    `;

    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    operation = createOperationDescriptor(ParentQuery, {});
    concreteOperation = createOperationDescriptor(ConcreteQuery, {});
    abstractOperation = createOperationDescriptor(AbstractQuery, {});
  });

  // Commit the given payload, immediately running GC to prune any data
  // that wouldn't be retained by the query
  // eslint-disable-next-line no-shadow
  function commitPayload(operation: OperationDescriptor, payload: $FlowFixMe) {
    environment.retain(operation);
    environment.commitPayload(operation, payload);
    (environment.getStore() as $FlowFixMe).scheduleGC();
    jest.runAllTimers();
  }

  it('concrete spread on matching concrete type reads data and counts missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    // with missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test User',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteUserFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: 'Test',
        name: 'Test User',
      },
    });
    const fragmentSnapshot2 = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteUserFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot2.data).toEqual({
      id: 'abc',
      missing: 'Test',
      name: 'Test User',
    });
    expect(fragmentSnapshot2.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });

  it('concrete spread on non-matching concrete type reads data but does not count missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );

    // with missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'Page', // not User
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test Page',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteUserFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test Page',
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(concreteOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing from conforming interface (Actor)

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'Page',
        id: 'abc',
        missing: 'Test',
        name: 'Test Page',
      },
    });
    const fragmentSnapshot2 = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteUserFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot2.data).toEqual({
      id: 'abc',
      missing: 'Test',
      name: 'Test Page',
    });
    expect(fragmentSnapshot2.isMissingData).toBe(false);
    expect(environment.check(concreteOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('available');
  });

  it('concrete inline fragment on matching concrete type reads data and counts missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    // with missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test User',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: 'Test',
        name: 'Test User',
      },
    });
    const fragmentSnapshot2 = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot2.data).toEqual({
      id: 'abc',
      missing: 'Test',
      name: 'Test User',
    });
    expect(fragmentSnapshot2.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });
  it('concrete inline fragment on non-matching concrete type does not read data or count data as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'Page', // not User
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test Page',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          ConcreteInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({});
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(concreteOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing from conforming interface (Actor)
  });

  it('abstract spread on implementing type reads data and counts missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    // with missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test User',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractActorFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: 'Test',
        name: 'Test User',
      },
    });
    const fragmentSnapshot2 = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractActorFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot2.data).toEqual({
      id: 'abc',
      missing: 'Test',
      name: 'Test User',
    });
    expect(fragmentSnapshot2.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });
  it('abstract spread on non-implementing type reads data but does not count missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    // with missing value
    commitPayload(operation, {
      userOrPage: {
        // __isActor: 'User', // no value: means that on server, User no longer implements Actor
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test User',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractActorFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(abstractOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing on concrete type
  });
  it('abstract spread missing only the discriminator reads data and counts data as missing', () => {
    commitPayload(operation, {
      userOrPage: {
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: 'nope not missing!',
        name: 'Test User',
      },
    });
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(true);
      typeRecord.setValue(undefined, '__isActor');
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractActorFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: 'nope not missing!',
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn<[Snapshot], void>();
    environment.subscribe(fragmentSnapshot, callback);
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(undefined);
      typeRecord.setValue(false, '__isActor');
    });
    expect(callback).toBeCalledTimes(0);
  });

  it('abstract spread missing the discriminator and user fields: reads data and counts data as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    commitPayload(operation, {
      userOrPage: {
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // user field is missing too
        name: 'Test User',
      },
    });
    // delete the discriminator field to simulate a consistency update that causes the field
    // to be missing for a record
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(true);
      typeRecord.setValue(undefined, '__isActor');
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(abstractOperation).status).toBe('missing');
    expect(environment.check(concreteOperation).status).toBe('missing');
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn<[Snapshot], void>();
    environment.subscribe(fragmentSnapshot, callback);
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(undefined);
      typeRecord.setValue(false, '__isActor');
    });
    expect(callback).toBeCalledTimes(0);
  });

  it('abstract inline fragment on implementing type reads data and counts missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    // with missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test User',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: 'Test',
        name: 'Test User',
      },
    });
    const fragmentSnapshot2 = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot2.data).toEqual({
      id: 'abc',
      missing: 'Test',
      name: 'Test User',
    });
    expect(fragmentSnapshot2.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });

  it('abstract inline fragment on non-implementing type reads data but does not count missing user fields as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    commitPayload(operation, {
      userOrPage: {
        // __isActor: 'User', // no value: means that on server, User no longer implements Actor
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // explicitly set to missing value
        name: 'Test User',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(abstractOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing on concrete type
  });

  it('abstract inline fragment missing only the discriminator reads data and counts data as missing', () => {
    commitPayload(operation, {
      userOrPage: {
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: 'nope not missing!',
        name: 'Test User',
      },
    });
    // delete the discriminator field to simulate a consistency update that causes the field
    // to be missing for a record
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(true);
      typeRecord.setValue(undefined, '__isActor');
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: 'nope not missing!',
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn<[Snapshot], void>();
    environment.subscribe(fragmentSnapshot, callback);
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(undefined);
      typeRecord.setValue(false, '__isActor');
    });
    expect(callback).toBeCalledTimes(0);
  });

  it('abstract inline fragment missing the discriminator and user fields: reads data and counts data as missing', () => {
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    expectWarningWillFire(
      'RelayResponseNormalizer: Payload did not contain a value for field `missing: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
    );
    commitPayload(operation, {
      userOrPage: {
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        id: 'abc',
        missing: undefined, // user field is missing too
        name: 'Test User',
      },
    });
    // delete the discriminator field to simulate a consistency update that causes the field
    // to be missing for a record
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(true);
      typeRecord.setValue(undefined, '__isActor');
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(
        getSingularSelector(
          AbstractInlineRefinementFragment,
          parentSnapshot.data.userOrPage,
        ),
      ),
    );
    expect(fragmentSnapshot.data).toEqual({
      id: 'abc',
      missing: undefined,
      name: 'Test User',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(abstractOperation).status).toBe('missing');
    expect(environment.check(concreteOperation).status).toBe('missing');
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn<[Snapshot], void>();
    environment.subscribe(fragmentSnapshot, callback);
    environment.commitUpdate(store => {
      const typeRecord = nullthrows(store.get(generateTypeID('User')));
      expect(typeRecord.getValue('__isActor')).toBe(undefined);
      typeRecord.setValue(false, '__isActor');
    });
    expect(callback).toBeCalledTimes(0);
  });

  describe('abstract spreads within a field of matching abstract type', () => {
    let ActorFragment;
    let NestedActorFragment;

    beforeEach(() => {
      ParentQuery = graphql`
        query RelayModernEnvironmentTypeRefinementTest1Query {
          viewer {
            actor {
              ...RelayModernEnvironmentTypeRefinementTest1Fragment
            }
          }
        }
      `;
      ActorFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest1Fragment on Actor {
          id
          name
          ...RelayModernEnvironmentTypeRefinementTest2Fragment
        }
      `;
      NestedActorFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest2Fragment on Actor {
          lastName
        }
      `;
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads and reports missing data if only user fields are missing', () => {
      expectWarningWillFire(
        'RelayResponseNormalizer: Payload did not contain a value for field `name: name`. Check that you are parsing with the same query that was used to fetch the payload.',
      );
      expectWarningWillFire(
        'RelayResponseNormalizer: Payload did not contain a value for field `lastName: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
      );
      commitPayload(operation, {
        viewer: {
          actor: {
            __isActor: 'User',
            __typename: 'User',
            id: 'abc',
            lastName: undefined, // missing
            name: undefined, // missing
          },
        },
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.viewer.actor),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest2Fragment: {}},
        __id: 'abc',
        id: 'abc',
        name: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(true);
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedActorFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        lastName: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(true);
      expect(environment.check(operation).status).toBe('missing');
    });

    it('reads and reports missing data if only the discriminator is missing', () => {
      commitPayload(operation, {
        viewer: {
          actor: {
            __isActor: 'User',
            __typename: 'User',
            id: 'abc',
            lastName: 'Zuck',
            name: 'Mark',
          },
        },
      });
      // delete the discriminator field to simulate a consistency update that causes the field
      // to be missing for a record
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isActor')).toBe(true);
        typeRecord.setValue(undefined, '__isActor');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.viewer.actor),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest2Fragment: {}},
        __id: 'abc',
        id: 'abc',
        name: 'Mark',
      });
      expect(fragmentSnapshot.isMissingData).toBe(true);
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedActorFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        lastName: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(true);
      expect(environment.check(operation).status).toBe('missing');
    });

    it('reads and reports missing data if the discriminator and user fields are missing', () => {
      expectWarningWillFire(
        'RelayResponseNormalizer: Payload did not contain a value for field `name: name`. Check that you are parsing with the same query that was used to fetch the payload.',
      );
      expectWarningWillFire(
        'RelayResponseNormalizer: Payload did not contain a value for field `lastName: lastName`. Check that you are parsing with the same query that was used to fetch the payload.',
      );
      commitPayload(operation, {
        viewer: {
          actor: {
            __isActor: 'User',
            __typename: 'User',
            id: 'abc',
            lastName: undefined, // missing
            name: undefined, // missing
          },
        },
      });
      // delete the discriminator field to simulate a consistency update that causes the field
      // to be missing for a record
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isActor')).toBe(true);
        typeRecord.setValue(undefined, '__isActor');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.viewer.actor),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest2Fragment: {}},
        __id: 'abc',
        id: 'abc',
        name: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(true);
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedActorFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        lastName: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(true);
      expect(environment.check(operation).status).toBe('missing');
    });
  });

  describe('abstract spreads within a non-matching concrete spread', () => {
    let PageFragment;
    let NestedEntityFragment;

    beforeEach(() => {
      ParentQuery = graphql`
        query RelayModernEnvironmentTypeRefinementTest2Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest3Fragment
              @dangerously_unaliased_fixme
          }
        }
      `;
      PageFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest3Fragment on Page {
          id
          lastName
          ...RelayModernEnvironmentTypeRefinementTest4Fragment
        }
      `;
      NestedEntityFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest4Fragment on Entity {
          url
        }
      `;

      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if the type discriminator and user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // lastName: undefined, // not evaluated
          // url: undefined, // not evaluated
        },
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(PageFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest4Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedEntityFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        url: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if only user fields are missing', () => {
      // similar case, we know somehow that the record implements the nested abstract type, but
      // the fields are missing since the server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // lastName: undefined, // not evaluated
          // url: undefined, // not evaluated
        },
      });
      // consistency update that provides the discriminator
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isEntity')).toBe(undefined);
        typeRecord.setValue(true, '__isEntity');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(PageFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest4Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedEntityFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        url: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if only the type discriminator is missing', () => {
      // the fields from the nested spread were fetched elsewhere in the query, but we're missing the refinement
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // lastName: undefined, // not evaluated
          // url: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isEntity')).toBe(undefined);
        const record = nullthrows(store.get('abc'));
        record.setValue('https://...', 'url');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(PageFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest4Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedEntityFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        url: 'https://...',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if the discriminator and all fields are present', () => {
      // somehow we have all the data
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // lastName: undefined, // not evaluated
          // url: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field *and* discriminator
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isEntity')).toBe(undefined);
        typeRecord.setValue(true, '__isEntity');
        const record = nullthrows(store.get('abc'));
        record.setValue('https://...', 'url');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(PageFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest4Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedEntityFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        url: 'https://...',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });
  });

  describe('abstract spreads within a non-matching abstract spread', () => {
    let ActorFragment;
    let NestedNamedFragment;

    beforeEach(() => {
      ParentQuery = graphql`
        query RelayModernEnvironmentTypeRefinementTest3Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest5Fragment
              @dangerously_unaliased_fixme
          }
        }
      `;
      ActorFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest5Fragment on Actor {
          id
          lastName
          ...RelayModernEnvironmentTypeRefinementTest6Fragment
            @dangerously_unaliased_fixme
        }
      `;
      NestedNamedFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest6Fragment on Named {
          name
        }
      `;
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if the type discriminator and user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest6Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if only user fields are missing', () => {
      // similar case, we know somehow that the record implements the nested abstract type, but
      // the fields are missing since the server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the discriminator
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isNamed')).toBe(undefined);
        typeRecord.setValue(true, '__isNamed');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest6Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if only the type discriminator is missing', () => {
      // the fields from the nested spread were fetched elsewhere in the query, but we're missing the refinement
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isNamed')).toBe(undefined);
        const record = nullthrows(store.get('abc'));
        record.setValue('Zuck', 'name');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest6Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if the discriminator and all fields are present', () => {
      // somehow we have all the data
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field *and* discriminator
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isNamed')).toBe(undefined);
        typeRecord.setValue(true, '__isNamed');
        const record = nullthrows(store.get('abc'));
        record.setValue('Zuck', 'name');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest6Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });
  });

  describe('abstract spreads within a non-matching abstract inline fragment', () => {
    let UserFragment;
    let NestedNamedFragment;

    beforeEach(() => {
      ParentQuery = graphql`
        query RelayModernEnvironmentTypeRefinementTest4Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest7Fragment
              @dangerously_unaliased_fixme
          }
        }
      `;
      UserFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest7Fragment on User {
          ... on Actor {
            id
            lastName
            ...RelayModernEnvironmentTypeRefinementTest8Fragment
          }
        }
      `;
      NestedNamedFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest8Fragment on Named {
          name
        }
      `;
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if the type discriminator and user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(UserFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest8Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if only user fields are missing', () => {
      // similar case, we know somehow that the record implements the nested abstract type, but
      // the fields are missing since the server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the discriminator
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isNamed')).toBe(undefined);
        typeRecord.setValue(true, '__isNamed');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(UserFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest8Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if only the type discriminator is missing', () => {
      // the fields from the nested spread were fetched elsewhere in the query, but we're missing the refinement
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isNamed')).toBe(undefined);
        const record = nullthrows(store.get('abc'));
        record.setValue('Zuck', 'name');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(UserFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest8Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if the discriminator and all fields are present', () => {
      // somehow we have all the data
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field *and* discriminator
      environment.commitUpdate(store => {
        const typeRecord = nullthrows(store.get(generateTypeID('User')));
        expect(typeRecord.getValue('__isNamed')).toBe(undefined);
        typeRecord.setValue(true, '__isNamed');
        const record = nullthrows(store.get('abc'));
        record.setValue('Zuck', 'name');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(UserFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest8Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedNamedFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });
  });

  describe('concrete spreads within a non-matching abstract spread', () => {
    let ActorFragment;
    let NestedUserFragment;

    beforeEach(() => {
      ParentQuery = graphql`
        query RelayModernEnvironmentTypeRefinementTest5Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest9Fragment
              @dangerously_unaliased_fixme
          }
        }
      `;
      ActorFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest9Fragment on Actor {
          id
          lastName
          ...RelayModernEnvironmentTypeRefinementTest10Fragment
            @dangerously_unaliased_fixme
        }
      `;
      NestedUserFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest10Fragment on User {
          name
        }
      `;
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest10Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedUserFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if all fields are present', () => {
      // somehow we have all the data
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field *and* discriminator
      environment.commitUpdate(store => {
        const record = nullthrows(store.get('abc'));
        record.setValue('Zuck', 'name');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(ActorFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest10Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedUserFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });
  });

  describe('concrete spreads within a non-matching abstract inline fragment', () => {
    let UserFragment;
    let NestedUserFragment;

    beforeEach(() => {
      ParentQuery = graphql`
        query RelayModernEnvironmentTypeRefinementTest6Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest11Fragment
              @dangerously_unaliased_fixme
          }
        }
      `;
      UserFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest11Fragment on User {
          ... on Actor {
            id
            lastName
            ...RelayModernEnvironmentTypeRefinementTest12Fragment
          }
        }
      `;
      NestedUserFragment = graphql`
        fragment RelayModernEnvironmentTypeRefinementTest12Fragment on User {
          name
        }
      `;
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(UserFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest12Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedUserFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: undefined,
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });

    it('reads data and reports nothing missing if all fields are present', () => {
      // somehow we have all the data
      commitPayload(operation, {
        userOrPage: {
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
          __typename: 'User',
          id: 'abc', // selected by the auto-generated `... on Node { id }` fragment
          // __isActor: 'User', // on server, User no longer implements Actor
          // lastName: undefined, // not evaluated
          // name: undefined, // not evaluated
        },
      });
      // consistency update that provides the missing user field *and* discriminator
      environment.commitUpdate(store => {
        const record = nullthrows(store.get('abc'));
        record.setValue('Zuck', 'name');
      });
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(UserFragment, parentSnapshot.data.userOrPage),
        ),
      );
      expect(fragmentSnapshot.data).toEqual({
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentTypeRefinementTest12Fragment: {
            $isWithinUnmatchedTypeRefinement: true,
          },
        },
        __id: 'abc',
        id: 'abc',
        lastName: undefined,
      });
      expect(fragmentSnapshot.isMissingData).toBe(false); // known to not impl Actor
      const innerFragmentSnapshot = environment.lookup(
        nullthrows(
          getSingularSelector(NestedUserFragment, fragmentSnapshot.data),
        ),
      );
      expect(innerFragmentSnapshot.data).toEqual({
        name: 'Zuck',
      });
      expect(innerFragmentSnapshot.isMissingData).toBe(false);
      expect(environment.check(operation).status).toBe('available');
    });
  });

  describe('Abstract types defined in client schema extension', () => {
    it('knows when concrete types match abstract types by metadata attached to normalizaiton AST', () => {
      operation = createOperationDescriptor(AbstractClientQuery, {});
      environment.commitUpdate(store => {
        const rootRecord = nullthrows(store.get(ROOT_ID));
        const clientObj = store.create(
          '4',
          'OtherClientTypeImplementingClientInterface',
        );
        clientObj.setValue('4', 'id');
        clientObj.setValue('My Description', 'description');
        rootRecord.setLinkedRecord(clientObj, 'client_interface');
      });
      environment.commitPayload(operation, {});
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSelector = nullthrows(
        getSingularSelector(
          AbstractClientInterfaceFragment,
          parentSnapshot.data.client_interface,
        ),
      );
      const fragmentSnapshot = environment.lookup(fragmentSelector);
      expect(fragmentSnapshot.data).toEqual({
        description: 'My Description',
      });
      expect(fragmentSnapshot.isMissingData).toBe(false);
    });

    it('knows when concrete types match abstract types by metadata attached to normalizaiton AST (without committing payloads)', () => {
      operation = createOperationDescriptor(AbstractClientQuery, {});
      environment.commitUpdate(store => {
        const rootRecord = nullthrows(store.get(ROOT_ID));
        const clientObj = store.create(
          '4',
          'OtherClientTypeImplementingClientInterface',
        );
        clientObj.setValue('4', 'id');
        clientObj.setValue('My Description', 'description');
        rootRecord.setLinkedRecord(clientObj, 'client_interface');
      });
      // DataChecker similar to normalizer will put abstract type information to the record source.
      // In the previouse test we use `commitPayload(...)` so the normalizer can assign these `abstract types`.
      environment.check(operation);
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSelector = nullthrows(
        getSingularSelector(
          AbstractClientInterfaceFragment,
          parentSnapshot.data.client_interface,
        ),
      );
      const fragmentSnapshot = environment.lookup(fragmentSelector);
      expect(fragmentSnapshot.data).toEqual({
        description: 'My Description',
      });
      expect(fragmentSnapshot.isMissingData).toBe(false);
    });

    it('knows when concrete types match abstract types by metadata attached to normalizaiton AST: check after commited payload', () => {
      operation = createOperationDescriptor(AbstractClientQuery, {});
      environment.commitUpdate(store => {
        const rootRecord = nullthrows(store.get(ROOT_ID));
        const clientObj = store.create(
          '4',
          'OtherClientTypeImplementingClientInterface',
        );
        clientObj.setValue('4', 'id');
        clientObj.setValue('My Description', 'description');
        rootRecord.setLinkedRecord(clientObj, 'client_interface');
      });
      environment.commitPayload(operation, {});

      // DataChecker similar to normalizer will put abstract type information to the record source.
      // In the previouse test we use `commitPayload(...)` so the normalizer can assign these `abstract types`.
      environment.check(operation);
      const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
      const fragmentSelector = nullthrows(
        getSingularSelector(
          AbstractClientInterfaceFragment,
          parentSnapshot.data.client_interface,
        ),
      );
      const fragmentSnapshot = environment.lookup(fragmentSelector);
      expect(fragmentSnapshot.data).toEqual({
        description: 'My Description',
      });
      expect(fragmentSnapshot.isMissingData).toBe(false);
    });
  });
});
