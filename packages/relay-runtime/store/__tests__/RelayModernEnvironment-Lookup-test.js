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

const RelayNetwork = require('../../network/RelayNetwork');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('lookup()', () => {
  let ParentQuery;
  let environment;
  let operation;

  beforeEach(() => {
    ParentQuery = getRequest(graphql`
      query RelayModernEnvironmentLookupTestParentQuery {
        me {
          id
          name
          ...RelayModernEnvironmentLookupTestChildFragment
        }
      }
    `);
    graphql`
      fragment RelayModernEnvironmentLookupTestChildFragment on User {
        id
        name
      }
    `;
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    operation = createOperationDescriptor(ParentQuery, {});
    environment.commitPayload(operation, {
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
  });

  it('returns the results of executing a query', () => {
    const snapshot = environment.lookup(
      createReaderSelector(
        ParentQuery.fragment,
        ROOT_ID,
        {},
        operation.request,
      ),
    );
    expect(snapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {RelayModernEnvironmentLookupTestChildFragment: {}},
        __fragmentOwner: operation.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
    });
  });

  it('includes fragment owner in result when owner is provided', () => {
    const queryNode = getRequest(ParentQuery);
    const owner = createOperationDescriptor(queryNode, {});
    const snapshot = environment.lookup(
      createReaderSelector(ParentQuery.fragment, ROOT_ID, {}, owner.request),
    );
    expect(snapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {RelayModernEnvironmentLookupTestChildFragment: {}},
        __fragmentOwner: owner.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
    });
    // $FlowFixMe[incompatible-use]
    expect(snapshot.data?.me?.__fragmentOwner).toBe(owner.request);
  });

  it('reads __id fields', () => {
    const TestQuery = getRequest(graphql`
      query RelayModernEnvironmentLookupTestQuery($id: ID!) {
        __id # ok on query type
        me {
          __id # ok on object type with 'id'
          __typename
          id
        }
        node(id: $id) {
          __id # ok on interface type
          __typename
          id
          ... on Comment {
            commentBody(supported: ["PlainCommentBody"]) {
              __id # ok on union type
              __typename
              ... on PlainCommentBody {
                __id # ok on object type w/o 'id'
                text {
                  __id # ok on object type w/o 'id'
                  __typename
                  text
                }
              }
            }
          }
        }
      }
    `);
    operation = createOperationDescriptor(TestQuery, {id: 'comment:1'});
    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
      },
      node: {
        id: 'comment:1',
        __typename: 'Comment',
        commentBody: {
          __typename: 'PlainCommentBody',
          text: {
            __typename: 'Text',
            text: 'A comment!',
          },
        },
      },
    });
    const snapshot = environment.lookup(operation.fragment);
    expect(snapshot.data).toEqual({
      __id: 'client:root',
      me: {
        __id: '4',
        __typename: 'User',
        id: '4',
      },
      node: {
        __id: 'comment:1',
        __typename: 'Comment',
        id: 'comment:1',
        commentBody: {
          __id: 'client:comment:1:commentBody(supported:["PlainCommentBody"])',
          __typename: 'PlainCommentBody',
          text: {
            __id: 'client:comment:1:commentBody(supported:["PlainCommentBody"]):text',
            __typename: 'Text',
            text: 'A comment!',
          },
        },
      },
    });
  });
});
