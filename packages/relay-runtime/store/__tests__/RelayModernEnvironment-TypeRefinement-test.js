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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayRecordSource = require('../RelayRecordSource');

const nullthrows = require('nullthrows');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('missing data detection with feature ENABLE_PRECISE_TYPE_REFINEMENT', () => {
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
    jest.resetModules();
    ({
      ParentQuery,
      AbstractQuery,
      ConcreteQuery,
      ConcreteUserFragment,
      ConcreteInlineRefinementFragment,
      AbstractActorFragment,
      AbstractInlineRefinementFragment,
    } = generateAndCompile(`
        query ParentQuery {
          userOrPage(id: "abc") {
            ...ConcreteUserFragment
            ...ConcreteInlineRefinementFragment
            ...AbstractActorFragment
            ...AbstractInlineRefinementFragment
          }
        }

        # version of the query with only concrete refinements
        query ConcreteQuery {
          userOrPage(id: "abc") {
            ...ConcreteUserFragment
            ...ConcreteInlineRefinementFragment
          }
        }

        # version of the query with only abstract refinements
        query AbstractQuery {
          userOrPage(id: "abc") {
            ...AbstractActorFragment
            ...AbstractInlineRefinementFragment
          }
        }

        # identical fragments except for User (concrete) / Actor (interface)
        fragment ConcreteUserFragment on User {
          id
          name
          missing: lastName
        }
        fragment AbstractActorFragment on Actor {
          id
          name
          missing: lastName
        }

        # identical except for inline fragments on User / Actor
        # note fragment type is Node in both cases to avoid any
        # flattening
        fragment ConcreteInlineRefinementFragment on Node {
          ... on User {
            id
            name
            missing: lastName
          }
        }
        fragment AbstractInlineRefinementFragment on Node {
          ... on Actor {
            id
            name
            missing: lastName
          }
        }
      `));
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

  beforeEach(() => {
    RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT = true;
  });
  afterEach(() => {
    RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT = false;
  });

  it('concrete spread on matching concrete type reads data and counts missing user fields as missing', () => {
    // with missing value
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
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
    // with missing value
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
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
    // with missing value
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
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
    // with missing value
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
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
    // with missing value
    environment.commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        // __isActor: 'User, // no value: on server, User no longer implements Actor
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
  it('abstract spread missing only the discriminator reads data and does not count data as missing', () => {
    environment.commitPayload(operation, {
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
      const record = nullthrows(store.get('abc'));
      expect(record.getValue('__isActor')).toBe(true);
      record.setValue(undefined, '__isActor');
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
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });

  it('abstract inline fragment on implementing type reads data and counts missing user fields as missing', () => {
    // with missing value
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
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
    environment.commitPayload(operation, {
      userOrPage: {
        id: 'abc',
        // __isActor: 'User', // no value: on server, User no longer implements Actor
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

  it('abstract inline fragment missing only the discriminator reads data but does not count data as missing', () => {
    environment.commitPayload(operation, {
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
      const record = nullthrows(store.get('abc'));
      expect(record.getValue('__isActor')).toBe(true);
      record.setValue(undefined, '__isActor');
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
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });

  it('abstract inline fragment missing the discriminator and user fields: reader treats data as not missing, but check() treats data as missing', () => {
    environment.commitPayload(operation, {
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
      const record = nullthrows(store.get('abc'));
      expect(record.getValue('__isActor')).toBe(true);
      record.setValue(undefined, '__isActor');
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
    expect(environment.check(abstractOperation).status).toBe('missing');
    expect(environment.check(concreteOperation).status).toBe('missing');
    expect(environment.check(operation).status).toBe('missing');
  });

  it('nested abstract spreads within a field of matching abstract type reads data and reports nothing missing', () => {
    const {Query, Fragment, InnerFragment} = generateAndCompile(`
      query Query {
        node(id: "abc") {
          ...Fragment
        }
      }
      fragment Fragment on Node {
        id
        ...InnerFragment
      }
      fragment InnerFragment on Node {
        id
      }
    `);
    operation = createOperationDescriptor(Query, {});

    environment.commitPayload(operation, {
      node: {
        __typename: 'User',
        // __isNode: true, // not returned from server since the abstract refinement is flattened away
        id: 'abc',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(getSingularSelector(Fragment, parentSnapshot.data.node)),
    );
    expect(fragmentSnapshot.data).toEqual({
      __fragmentOwner: operation.request,
      __fragments: {InnerFragment: {}},
      __id: 'abc',
      id: 'abc',
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    const innerFragmentSnapshot = environment.lookup(
      nullthrows(getSingularSelector(InnerFragment, fragmentSnapshot.data)),
    );
    expect(innerFragmentSnapshot.data).toEqual({
      id: 'abc',
    });
    expect(innerFragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });

  it('different nested abstract spreads within a field of matching abstract type reads data and reports nothing missing', () => {
    const {Query, Fragment, InnerFragment} = generateAndCompile(`
      query Query {
        node(id: "abc") {
          ...Fragment
        }
      }
      fragment Fragment on Node {
        id
        ... on Actor {
          ...InnerFragment
        }
      }
      fragment InnerFragment on Node {
        id
      }
    `);
    operation = createOperationDescriptor(Query, {});

    environment.commitPayload(operation, {
      node: {
        __typename: 'User',
        // __isNode: true, // not returned from server since the abstract refinement is flattened away
        __isActor: true,
        id: 'abc',
      },
    });
    const parentSnapshot: $FlowFixMe = environment.lookup(operation.fragment);
    const fragmentSnapshot = environment.lookup(
      nullthrows(getSingularSelector(Fragment, parentSnapshot.data.node)),
    );
    expect(fragmentSnapshot.data).toEqual({
      __fragmentOwner: operation.request,
      __fragments: {InnerFragment: {}},
      __id: 'abc',
      id: 'abc',
    });
    expect(fragmentSnapshot.isMissingData).toBe(false);
    const innerFragmentSnapshot = environment.lookup(
      nullthrows(getSingularSelector(InnerFragment, fragmentSnapshot.data)),
    );
    expect(innerFragmentSnapshot.data).toEqual({
      id: 'abc',
    });
    expect(innerFragmentSnapshot.isMissingData).toBe(false);
    expect(environment.check(operation).status).toBe('available');
  });
});
