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

jest.autoMockOff();

const Relay = require('Relay');
const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const RelayEnvironment = require('RelayEnvironment');
const RelayMutation = require('RelayMutation');
const RelayMutationType = require('RelayMutationType');

describe('RelayMutation', () => {
  let bodyID;
  let environment;
  let feedbackID;
  let storeData;
  let query;

  beforeEach(() => {
    jest.resetModuleRegistry();

    environment = new RelayEnvironment();
    storeData = environment.getStoreData();
    feedbackID = '123';

    query = Relay.createQuery(
        Relay.QL`
        query CreateFeedbackQuery($id: ID!) {
          node(id: $id) {
            ... on Feedback {
              __typename
              id
              doesViewerLike
              body {
                text
              }
            }
          }
        }
      `,
      {
        id: feedbackID,
      }
    );
    storeData.handleQueryPayload(
      query,
      {
        node: {
          id: feedbackID,
          __typename: 'Feedback',
          doesViewerLike: false,
          body: {
            text: 'Give Relay',
          },
        },
      }
    );
    bodyID = storeData.getCachedStore().getLinkedRecordID(feedbackID, 'body');
  });

  class FeedbackLikeMutation extends RelayMutation {
    getMutation() {
      return Relay.QL`mutation { feedbackLike }`;
    }
    getVariables() {
      return {
        feedbackId: this.props.feedbackID,
      };
    }
    getFatQuery() {
      return Relay.QL`
        fragment on FeedbackLikeResponsePayload @relay(pattern: true) {
          clientMutationId
          feedback {
            id
            doesViewerLike
            body {
              text
            }
          }
        }
      `;
    }
    getConfigs() {
      return [];
    }
    getOptimisticResponse() {
      const payload = {
        feedback: {
          id: this.props.feedbackID,
        },
      };
      if (this.props.doesViewerLike !== undefined) {
        payload.feedback.doesViewerLike = this.props.doesViewerLike;
      }
      if (this.props.text !== undefined) {
        payload.feedback.body = {
          text: this.props.text,
        };
      }
      return payload;
    }
  }

  it('starts with the story unliked', () => {
    const data = environment.readQuery(query)[0];
    expect(data).toEqual({
      __dataID__: feedbackID,
      __typename: 'Feedback',
      id: feedbackID,
      doesViewerLike: false,
      body: {
        __dataID__: bodyID,
        text: 'Give Relay',
      },
    });
  });

  it('applies optimistic payloads', () => {
    const mutation = new FeedbackLikeMutation({
      feedbackID,
      doesViewerLike: true,
    });
    const callbacks = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    };
    environment.applyUpdate(mutation, callbacks);

    const data = environment.readQuery(query)[0];
    expect(data).toEqual({
      __dataID__: feedbackID,
      __mutationStatus__: '0:UNCOMMITTED',
      __status__: 1,
      __typename: 'Feedback',
      id: feedbackID,
      doesViewerLike: true,
      body: {
        __dataID__: bodyID,
        text: 'Give Relay',
      },
    });

    // Callbacks don't fire for optimistic updates.
    expect(callbacks.onFailure).not.toBeCalled();
    expect(callbacks.onSuccess).not.toBeCalled();
  });

  it('reverts optimistic payloads asynchronously', () => {
    const mutation = new FeedbackLikeMutation({
      feedbackID,
      doesViewerLike: true,
    });
    const transaction = environment.applyUpdate(mutation);
    transaction.rollback();

    let data = environment.readQuery(query)[0];
    expect(data).toEqual({
      __dataID__: feedbackID,
      // transaction already rolled back, no status to show:
      __mutationStatus__: '',
      // but optimistic data still applies:
      __status__: 1,
      __typename: 'Feedback',
      id: feedbackID,
      doesViewerLike: true,
      body: {
        __dataID__: bodyID,
        text: 'Give Relay',
      },
    });

    jest.runAllTimers();
    data = environment.readQuery(query)[0];
    expect(data).toEqual({
      __dataID__: feedbackID,
      __typename: 'Feedback',
      id: feedbackID,
      doesViewerLike: false,
      body: {
        __dataID__: bodyID,
        text: 'Give Relay',
      },
    });
  });

  it('reverts and applies optimistic payloads', () => {
    const mutation1 = new FeedbackLikeMutation({
      feedbackID,
      doesViewerLike: true,
    });
    const transaction1 = environment.applyUpdate(mutation1);
    transaction1.rollback();

    const mutation2 = new FeedbackLikeMutation({
      feedbackID,
      text: 'Gave Relay!',
    });
    environment.applyUpdate(mutation2);

    let data = environment.readQuery(query)[0];
    expect(data).toEqual({
      __dataID__: feedbackID,
      // first transaction rolled back so only second status appears
      __mutationStatus__: '1:UNCOMMITTED',
      // has optimistic data:
      __status__: 1,
      __typename: 'Feedback',
      id: feedbackID,
      // first transaction's payload still applies
      doesViewerLike: true,
      body: {
        __dataID__: bodyID,
        __mutationStatus__: '1:UNCOMMITTED',
        __status__: 1,
        text: 'Gave Relay!',
      },
    });

    jest.runAllTimers();
    data = environment.readQuery(query)[0];
    expect(data).toEqual({
      __dataID__: feedbackID,
      __mutationStatus__: '1:UNCOMMITTED',
      __status__: 1,
      __typename: 'Feedback',
      id: feedbackID,
      // first transaction's payload reverted
      doesViewerLike: false,
      body: {
        __dataID__: bodyID,
        __mutationStatus__: '1:UNCOMMITTED',
        __status__: 1,
        text: 'Gave Relay!',
      },
    });
  });
});

describe('RelayMutation list mutations', () => {
  let environment;
  let feedbackID;
  let storeData;
  let query;
  let comment1;
  let comment2;

  beforeEach(() => {
    jest.resetModuleRegistry();

    environment = new RelayEnvironment();
    storeData = environment.getStoreData();
    feedbackID = '123';

    query = Relay.createQuery(
        Relay.QL`
        query CreateFeedbackQuery($id: ID!) {
          node(id: $id) {
            ... on Feedback {
              __typename
              id
              topLevelComments(first:"10") {
                count
                edges {
                  node {
                    id
                    body {
                      text
                    }
                  }
                }
              }
              simpleTopLevelComments {
                id
                body {
                  text
                }
              }
            }
          }
        }
      `,
      {
        id: feedbackID,
      }
    );

    comment1 = {
      id: 'comment1',
      body: {
        id: 'body1',
        text: 'First comment'
      }
    };

    comment2 = {
      id: 'comment2',
      body: {
        id: 'body2',
        text: 'Another great comment'
      }
    };
    const transformRelayQueryPayload = require('transformRelayQueryPayload');
    const payload = {
      node: {
        id: feedbackID,
        __typename: 'Feedback',
        topLevelComments: {
          count: '2',
          edges: [{
            cursor: comment1.id + ':cursor',
            node: comment1
          }, {
            cursor: comment2.id + ':cursor',
            node: comment2
          }]
        },
        simpleTopLevelComments: [comment1, comment2]
      },
    };

    storeData.handleQueryPayload(query, transformRelayQueryPayload(query, payload));
    // bodyID = storeData.getCachedStore().getLinkedRecordID(feedbackID, 'body');
  });

  class NewCommentMutation extends RelayMutation {
    getMutation() {
      return Relay.QL`mutation { commentCreate }`;
    }
    getVariables() {
      return {
        input: '',
      };
    }
    getFatQuery() {
      return Relay.QL`
        fragment on CommentCreateResponsePayload {
          clientMutationId
          comment
        }
      `;
    }

    getConfigs() {
      if (this.props.connectionMutation) {
        console.log('we are in here getConfigs!');
        return [
          {
            type: RelayMutationType.RANGE_ADD,
            connectionName: 'topLevelComments',
            edgeName: 'feedbackCommentEdge',
            rangeBehaviors: () => GraphQLMutatorConstants.APPEND,
          }
        ];
      } else {
        return [
          {
            type: RelayMutationType.RANGE_ADD,
            parentID: feedbackID,
            listName: 'simpleTopLevelComments',
            newElementName: 'comment',
            rangeBehaviors: () => GraphQLMutatorConstants.APPEND,
          },
        ];
      }
    }
    getOptimisticResponse() {
      console.log('we have', this.props);
      if (this.props.connectionMutation) {
        console.log('we are in here optimsitict!');
        return {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: 'comment3:cursor',
            node: {
              // id: 'comment3',
              body: {
                text: 'I am an optimistic edge comment.',
              },
            },
            source: {
              id: feedbackID,
            },
          },
        };
      } else {
        return {
          comment: {
            // id: 'comment3',
            // id: 'client:-12736066694',
            body: {
              id: 'body3',
              text: 'I am an optimistic comment.'
            }
          },
        };
      }
    }
  }

  it('optimistically appends a new edge to the connection', () => {
    const mutation = new NewCommentMutation({connectionMutation: true});
    environment.applyUpdate(mutation);

    const data = environment.readQuery(query)[0];
    // are not interested in simpleTopLevelComments in this test
    delete data['simpleTopLevelComments'];
    const expectedData = {
      __dataID__: feedbackID,
      __status__: 1,
      __mutationStatus__: '0:UNCOMMITTED',
      __typename: 'Feedback',
      id: feedbackID,
      topLevelComments: {
        edges: [{
          node: {
            __dataID__: comment1.id,
            id: comment1.id,
            body: {
              __dataID__: comment1.body.id,
              text: comment1.body.text
            }
          }
        }, {
          node: {
            __dataID__: comment2.id,
            id: comment2.id,
            body: {
              __dataID__: comment2.body.id,
              text: comment2.body.text
            }
          }
        }, {
          node: {
            __dataID__: 'comment3',
            id: 'comment3',
            __mutationStatus__: '0:UNCOMMITTED',
            __status__: 1,
            body: {
              __dataID__: 'body3',
              text: 'I am an optimistic comment.',
              __status__: 1,
              __mutationStatus__: '0:UNCOMMITTED'
            }
          }
        },
      ]},
    };
    console.log('---------> printing data in test:');
    console.log(JSON.stringify(data, null, 2));
    console.log('--------------------');
    console.log(JSON.stringify(expectedData, null, 2));
    expect(data).toEqual(expectedData);
    console.log('DONE WITH FIRST FIT TEST!!!!');
  });

  fit('optimistically appends a new element to the list', () => {
    const mutation = new NewCommentMutation();
    environment.applyUpdate(mutation);

    const data = environment.readQuery(query)[0];
    delete data['topLevelComments'];
    const expectedData = {
      __dataID__: feedbackID,
      __status__: 1,
      __mutationStatus__: '0:UNCOMMITTED',
      __typename: 'Feedback',
      id: feedbackID,
      simpleTopLevelComments: [
        {
          __dataID__: comment1.id,
          id: comment1.id,
          body: {
            __dataID__: comment1.body.id,
            text: comment1.body.text
          }
        },
        {
          __dataID__: comment2.id,
          id: comment2.id,
          body: {
            __dataID__: comment2.body.id,
            text: comment2.body.text
          }
        },
        {
          __dataID__: 'comment3',
          id: 'comment3',
          __mutationStatus__: '0:UNCOMMITTED',
          __status__: 1,
          body: {
            __dataID__: 'body3',
            text: 'I am an optimistic comment.',
            __status__: 1,
            __mutationStatus__: '0:UNCOMMITTED'
          }
        },
      ],
    };
    console.log('**************');
    console.log(JSON.stringify(data, null, 2));
    console.log('******************');
    console.log(JSON.stringify(expectedData, null, 2));
    console.log('******************');



    expect(data).toEqual(expectedData);
  });
});
