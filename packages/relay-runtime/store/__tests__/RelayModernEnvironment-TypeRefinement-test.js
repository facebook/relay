/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';
import type {OperationDescriptor} from 'relay-runtime/store/RelayStoreTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {generateTypeID} = require('../TypeID');
const nullthrows = require('nullthrows');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

describe('missing data detection', () => {
  let ParentQuery;
  let AbstractQuery;
  let ConcreteQuery;
  let ConcreteUserFragment;
  let ConcreteInlineRefinementFragment;
  let AbstractActorFragment;
  let AbstractInlineRefinementFragment;
  let environment;
  let operation;
  let concreteOperation;
  let abstractOperation;

  beforeEach(() => {
    ParentQuery = getRequest(graphql`
      query RelayModernEnvironmentTypeRefinementTestParentQuery {
        userOrPage(id: "abc") {
          ...RelayModernEnvironmentTypeRefinementTestConcreteUserFragment
          ...RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment
          ...RelayModernEnvironmentTypeRefinementTestAbstractActorFragment
          ...RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment
        }
      }
    `);

    // version of the query with only concrete refinements
    ConcreteQuery = getRequest(graphql`
      query RelayModernEnvironmentTypeRefinementTestConcreteQuery {
        userOrPage(id: "abc") {
          ...RelayModernEnvironmentTypeRefinementTestConcreteUserFragment
          ...RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment
        }
      }
    `);

    // version of the query with only abstract refinements
    AbstractQuery = getRequest(graphql`
      query RelayModernEnvironmentTypeRefinementTestAbstractQuery {
        userOrPage(id: "abc") {
          ...RelayModernEnvironmentTypeRefinementTestAbstractActorFragment
          ...RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment
        }
      }
    `);

    // identical fragments except for User (concrete) / Actor (interface)
    ConcreteUserFragment = getFragment(graphql`
      fragment RelayModernEnvironmentTypeRefinementTestConcreteUserFragment on User {
        id
        name
        missing: lastName
      }
    `);

    AbstractActorFragment = getFragment(graphql`
      fragment RelayModernEnvironmentTypeRefinementTestAbstractActorFragment on Actor {
        id
        name
        missing: lastName
      }
    `);

    // identical except for inline fragments on User / Actor
    // note fragment type is Node in both cases to avoid any
    // flattening
    ConcreteInlineRefinementFragment = getFragment(graphql`
      fragment RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment on Node {
        ... on User {
          id
          name
          missing: lastName
        }
      }
    `);

    AbstractInlineRefinementFragment = getFragment(graphql`
      fragment RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment on Node {
        ... on Actor {
          id
          name
          missing: lastName
        }
      }
    `);

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
  function commitPayload(operation: OperationDescriptor, payload) {
    environment.retain(operation);
    environment.commitPayload(operation, payload);
    (environment.getStore(): $FlowFixMe).scheduleGC();
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
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: 'Test',
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
      name: 'Test User',
      missing: 'Test',
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
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'Page', // not User
        name: 'Test Page',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test Page',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(concreteOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing from conforming interface (Actor)

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'Page',
        name: 'Test Page',
        missing: 'Test',
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
      name: 'Test Page',
      missing: 'Test',
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
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: 'Test',
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
      name: 'Test User',
      missing: 'Test',
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
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'Page', // not User
        name: 'Test Page',
        missing: undefined, // explicitly set to missing value
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
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: 'Test',
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
      name: 'Test User',
      missing: 'Test',
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
        id: 'abc',
        // __isActor: 'User', // no value: means that on server, User no longer implements Actor
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(abstractOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing on concrete type
  });
  it('abstract spread missing only the discriminator reads data and counts data as missing', () => {
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: 'nope not missing!',
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
      name: 'Test User',
      missing: 'nope not missing!',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn();
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
        id: 'abc',
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // user field is missing too
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(abstractOperation).status).toBe('missing');
    expect(environment.check(concreteOperation).status).toBe('missing');
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn();
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
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // add missing value
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true,
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: 'Test',
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
      name: 'Test User',
      missing: 'Test',
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
        id: 'abc',
        // __isActor: 'User', // no value: means that on server, User no longer implements Actor
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // explicitly set to missing value
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(abstractOperation).status).toBe('available');
    expect(environment.check(operation).status).toBe('missing'); // fields missing on concrete type
  });

  it('abstract inline fragment missing only the discriminator reads data and counts data as missing', () => {
    commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: 'nope not missing!',
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
      name: 'Test User',
      missing: 'nope not missing!',
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn();
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
        id: 'abc',
        __isActor: true, // deleted from store below
        __isNode: true,
        __typename: 'User',
        name: 'Test User',
        missing: undefined, // user field is missing too
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
      name: 'Test User',
      missing: undefined,
    });
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(environment.check(abstractOperation).status).toBe('missing');
    expect(environment.check(concreteOperation).status).toBe('missing');
    expect(environment.check(operation).status).toBe('missing');

    // Subscriptions are not notified of discriminator-only changes
    const callback = jest.fn();
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
      ParentQuery = getRequest(graphql`
        query RelayModernEnvironmentTypeRefinementTest1Query {
          viewer {
            actor {
              ...RelayModernEnvironmentTypeRefinementTest1Fragment
            }
          }
        }
      `);
      ActorFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest1Fragment on Actor {
          id
          name
          ...RelayModernEnvironmentTypeRefinementTest2Fragment
        }
      `);
      NestedActorFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest2Fragment on Actor {
          lastName
        }
      `);
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
            __typename: 'User',
            __isActor: 'User',
            id: 'abc',
            name: undefined, // missing
            lastName: undefined, // missing
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
        id: 'abc',
        name: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest2Fragment: {}},
        __isWithinUnmatchedTypeRefinement: false,
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
            __typename: 'User',
            __isActor: 'User',
            id: 'abc',
            name: 'Mark',
            lastName: 'Zuck',
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
        id: 'abc',
        name: 'Mark',
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest2Fragment: {}},
        __isWithinUnmatchedTypeRefinement: false,
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
            __typename: 'User',
            __isActor: 'User',
            id: 'abc',
            name: undefined, // missing
            lastName: undefined, // missing
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
        id: 'abc',
        name: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest2Fragment: {}},
        __isWithinUnmatchedTypeRefinement: false,
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
      ParentQuery = getRequest(graphql`
        query RelayModernEnvironmentTypeRefinementTest2Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest3Fragment
          }
        }
      `);
      PageFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest3Fragment on Page {
          id
          lastName
          ...RelayModernEnvironmentTypeRefinementTest4Fragment
        }
      `);
      NestedEntityFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest4Fragment on Entity {
          url
        }
      `);

      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if the type discriminator and user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest4Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest4Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest4Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest4Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
      ParentQuery = getRequest(graphql`
        query RelayModernEnvironmentTypeRefinementTest3Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest5Fragment
          }
        }
      `);
      ActorFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest5Fragment on Actor {
          id
          lastName
          ...RelayModernEnvironmentTypeRefinementTest6Fragment
        }
      `);
      NestedNamedFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest6Fragment on Named {
          name
        }
      `);
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if the type discriminator and user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest6Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest6Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest6Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest6Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
      ParentQuery = getRequest(graphql`
        query RelayModernEnvironmentTypeRefinementTest4Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest7Fragment
          }
        }
      `);
      UserFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest7Fragment on User {
          ... on Actor {
            id
            lastName
            ...RelayModernEnvironmentTypeRefinementTest8Fragment
          }
        }
      `);
      NestedNamedFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest8Fragment on Named {
          name
        }
      `);
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if the type discriminator and user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest8Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest8Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest8Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest8Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
      ParentQuery = getRequest(graphql`
        query RelayModernEnvironmentTypeRefinementTest5Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest9Fragment
          }
        }
      `);
      ActorFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest9Fragment on Actor {
          id
          lastName
          ...RelayModernEnvironmentTypeRefinementTest10Fragment
        }
      `);
      NestedUserFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest10Fragment on User {
          name
        }
      `);
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest10Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest10Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
      ParentQuery = getRequest(graphql`
        query RelayModernEnvironmentTypeRefinementTest6Query {
          userOrPage(id: "abc") {
            ...RelayModernEnvironmentTypeRefinementTest11Fragment
          }
        }
      `);
      UserFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest11Fragment on User {
          ... on Actor {
            id
            lastName
            ...RelayModernEnvironmentTypeRefinementTest12Fragment
          }
        }
      `);
      NestedUserFragment = getFragment(graphql`
        fragment RelayModernEnvironmentTypeRefinementTest12Fragment on User {
          name
        }
      `);
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('reads data and reports nothing missing even if user fields are missing', () => {
      // typical case, server doesn't evaluate anything under the non-matched parent
      commitPayload(operation, {
        userOrPage: {
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest12Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
          __typename: 'User',
          __isNode: 'User', // selected by the auto-generated `... on Node { id }` fragment
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
        id: 'abc',
        lastName: undefined,
        __id: 'abc',
        __fragmentOwner: operation.request,
        __fragments: {RelayModernEnvironmentTypeRefinementTest12Fragment: {}},
        __isWithinUnmatchedTypeRefinement: true,
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
});
