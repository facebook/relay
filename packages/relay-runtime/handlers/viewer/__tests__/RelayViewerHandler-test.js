/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayInMemoryRecordSource = require('../../../store/RelayInMemoryRecordSource');
const RelayModernRecord = require('../../../store/RelayModernRecord');
const RelayModernTestUtils = require('RelayModernTestUtils');
const RelayRecordSourceMutator = require('../../../mutations/RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('../../../mutations/RelayRecordSourceProxy');
const RelayStoreUtils = require('../../../store/RelayStoreUtils');
const RelayViewerHandler = require('../RelayViewerHandler');

const generateRelayClientID = require('../../../store/generateRelayClientID');
const getRelayHandleKey = require('../../../util/getRelayHandleKey');

const {ID_KEY, REF_KEY, ROOT_ID, ROOT_TYPE, TYPENAME_KEY} = RelayStoreUtils;

const VIEWER_ID = generateRelayClientID(ROOT_ID, 'viewer');

describe('RelayViewerHandler', () => {
  let baseData;
  let baseSource;
  let sinkData;
  let sinkSource;
  let mutator;
  let store;

  beforeEach(() => {
    jest.resetModules();
    expect.extend(RelayModernTestUtils.matchers);

    baseData = {
      [ROOT_ID]: {
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
      },
    };
    baseSource = new RelayInMemoryRecordSource(baseData);
    sinkData = {};
    sinkSource = new RelayInMemoryRecordSource(sinkData);
    mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
    store = new RelayRecordSourceProxy(mutator);
  });

  it('does nothing if the payload record does not exist', () => {
    const payload = {
      dataID: 'unfetched',
      fieldKey: 'viewer',
      handleKey: getRelayHandleKey('viewer', null, 'viewer'),
    };
    RelayViewerHandler.update(store, payload);
    expect(sinkData).toEqual({});
  });

  it('links the handle to the server viewer for query data', () => {
    const viewer = RelayModernRecord.create(VIEWER_ID, 'Viewer');
    baseSource.set(VIEWER_ID, viewer);
    RelayModernRecord.setLinkedRecordID(
      baseSource.get(ROOT_ID),
      'viewer',
      VIEWER_ID,
    );

    const payload = {
      dataID: ROOT_ID,
      fieldKey: 'viewer',
      handleKey: getRelayHandleKey('viewer', null, 'viewer'),
    };
    RelayViewerHandler.update(store, payload);
    expect(sinkData).toEqual({
      [ROOT_ID]: {
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
        viewer: null,
        [payload.handleKey]: {[REF_KEY]: VIEWER_ID},
      },
    });
  });

  it('links the handle to the server viewer when called multiple times', () => {
    const viewer = RelayModernRecord.create(VIEWER_ID, 'Viewer');
    baseSource.set(VIEWER_ID, viewer);
    RelayModernRecord.setLinkedRecordID(
      baseSource.get(ROOT_ID),
      'viewer',
      VIEWER_ID,
    );

    const payload = {
      dataID: ROOT_ID,
      fieldKey: 'viewer',
      handleKey: getRelayHandleKey('viewer', null, 'viewer'),
    };
    // called twice should not break
    RelayViewerHandler.update(store, payload);
    RelayViewerHandler.update(store, payload);
    expect(sinkData).toEqual({
      [ROOT_ID]: {
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
        viewer: null,
        [payload.handleKey]: {[REF_KEY]: VIEWER_ID},
      },
    });
  });

  it('copies the handle field from server viewer for mutation data', () => {
    const commentAlias = 'commentCreate{"input":{}}';
    const commentID = generateRelayClientID(ROOT_ID, commentAlias);
    const comment = RelayModernRecord.create(
      commentID,
      'CommentCreateResponsePayload',
    );
    baseSource.set(commentID, comment);
    const viewerID = generateRelayClientID(commentID, 'viewer');
    const viewer = RelayModernRecord.create(viewerID, 'Viewer');
    RelayModernRecord.setLinkedRecordID(viewer, 'actor', '842472');
    baseSource.set(viewerID, viewer);
    RelayModernRecord.setLinkedRecordID(comment, 'viewer', viewerID);
    RelayModernRecord.setLinkedRecordID(
      baseSource.get(ROOT_ID),
      commentAlias,
      commentID,
    );

    const payload = {
      dataID: commentID,
      fieldKey: 'viewer',
      handleKey: getRelayHandleKey('viewer', null, 'viewer'),
    };
    RelayViewerHandler.update(store, payload);
    expect(sinkData).toEqual({
      [ROOT_ID]: {
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
        [payload.handleKey]: {[REF_KEY]: VIEWER_ID},
      },
      [commentID]: {
        [ID_KEY]: commentID,
        [TYPENAME_KEY]: 'CommentCreateResponsePayload',
        viewer: null,
        [payload.handleKey]: {[REF_KEY]: VIEWER_ID},
      },
      [VIEWER_ID]: {
        [ID_KEY]: VIEWER_ID,
        [TYPENAME_KEY]: 'Viewer',
        actor: {[REF_KEY]: '842472'},
      },
    });
  });
});
