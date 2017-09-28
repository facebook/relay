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

require('configureForRelayOSS');

jest.useFakeTimers().mock('relayUnstableBatchedUpdates');

const RelayClassic = require('RelayClassic');
const RelayEnvironment = require('RelayEnvironment');
const RelayMutation = require('RelayMutation');

describe('RelayMutation', () => {
  let bodyID;
  let environment;
  let feedbackID;
  let storeData;
  let query;

  beforeEach(() => {
    jest.resetModules();

    environment = new RelayEnvironment();
    storeData = environment.getStoreData();
    feedbackID = '123';

    query = RelayClassic.createQuery(
      RelayClassic.QL`
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
      },
    );
    storeData.handleQueryPayload(query, {
      node: {
        id: feedbackID,
        __typename: 'Feedback',
        doesViewerLike: false,
        body: {
          text: 'Give RelayClassic',
        },
      },
    });
    bodyID = storeData.getCachedStore().getLinkedRecordID(feedbackID, 'body');
  });

  class FeedbackLikeMutation extends RelayMutation {
    getMutation() {
      return RelayClassic.QL`mutation { feedbackLike }`;
    }
    getVariables() {
      return {
        feedbackId: this.props.feedbackID,
      };
    }
    getFatQuery() {
      return RelayClassic.QL`
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
        text: 'Give RelayClassic',
      },
    });
  });

  it('applies optimistic payloads', () => {
    const mutation = new FeedbackLikeMutation({
      feedbackID,
      doesViewerLike: true,
    });
    environment.applyUpdate(mutation);

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
        text: 'Give RelayClassic',
      },
    });
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
        text: 'Give RelayClassic',
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
        text: 'Give RelayClassic',
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
      text: 'Gave RelayClassic!',
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
        text: 'Gave RelayClassic!',
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
        text: 'Gave RelayClassic!',
      },
    });
  });
});
