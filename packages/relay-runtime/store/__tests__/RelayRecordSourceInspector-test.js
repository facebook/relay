/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.autoMockOff();

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayRecordSourceInspector = require('RelayRecordSourceInspector');
const RelayStoreUtils = require('RelayStoreUtils');

const {ID_KEY, REF_KEY, ROOT_ID, ROOT_TYPE, TYPENAME_KEY} = RelayStoreUtils;

describe('RelayRecordSourceInspector', () => {
  let data;
  let source;
  let inspector;

  beforeEach(() => {
    const viewerID = 'client:root:viewer';
    data = {
      '4': {
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
        id: '4',
        name: 'Zuck',
        'profilePicture{"size":32}': {[REF_KEY]: 'client:1'},
      },
      'client:1': {
        [ID_KEY]: 'client:1',
        [TYPENAME_KEY]: 'Image',
        uri: 'https://photo1.jpg',
      },
      [ROOT_ID]: {
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
        viewer: {[REF_KEY]: viewerID},
      },
      [viewerID]: {
        [ID_KEY]: viewerID,
        [TYPENAME_KEY]: 'Viewer',
        actor: {[REF_KEY]: '4'},
      },
    };
    source = new RelayInMemoryRecordSource(data);
    inspector = new RelayRecordSourceInspector(source);
  });

  describe('source inspector', () => {
    it('returns the root', () => {
      const root = inspector.getRoot();
      expect(root.getDataID()).toBe(ROOT_ID);
      expect(root.getType()).toBe(ROOT_TYPE);
    });

    it('returns nodes', () => {
      const zuck = inspector.get('4');
      expect(zuck.getValue('name')).toBe('Zuck');
    });
  });

  describe('record inspector', () => {
    it('inspect() returns the record', () => {
      const zuck = inspector.get('4');
      expect(zuck.inspect()).toEqual(data['4']);
    });

    it('returns the fetched fields', () => {
      const root = inspector.getRoot();
      expect(root.getFields()).toEqual([ID_KEY, TYPENAME_KEY, 'viewer']);
    });

    it('returns scalar values with getValue or getter', () => {
      const zuck = inspector.get('4');
      expect(zuck.getValue('name')).toBe('Zuck');
      expect(zuck.name).toBe('Zuck');
    });

    it('returns linked records with getValue or getter', () => {
      const zuck = inspector.get('4');
      expect(
        zuck.getLinkedRecord('profilePicture', {size: 32}).getDataID(),
      ).toBe('client:1');
      expect(zuck.profilePicture__size__32_.getDataID()).toBe('client:1');
    });
  });
});
