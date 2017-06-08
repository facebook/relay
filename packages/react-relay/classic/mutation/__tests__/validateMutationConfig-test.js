/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.disableAutomock();

const RelayTestUtils = require('RelayTestUtils');

const validateMutationConfig = require('validateMutationConfig');

describe('validateMutationConfig()', () => {
  let config;

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('validating a `FIELDS_CHANGE` config', () => {
    it('does nothing for a valid config', () => {
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
            fieldIDs: {},
          },
          'MyMutation',
        ),
      ).not.toThrow();
    });

    it('complains about missing keys', () => {
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: `FIELDS_CHANGE` config on `MyMutation` ' +
          'must have property `fieldIDs`.',
      );
    });

    it('complains about extraneous keys', () => {
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
            extraneous: '?',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `extraneous` in ' +
          '`FIELDS_CHANGE` config for `MyMutation`.',
      );
    });

    it('suggests an alternative when one is appropriate', () => {
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
            fieldIDS: {},
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `fieldIDS` in ' +
          '`FIELDS_CHANGE` config for `MyMutation`; did you mean `fieldIDs`?',
      );

      // Note that we keep getting warned as edit distance increases...
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
            feildIDS: {},
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `feildIDS` in ' +
          '`FIELDS_CHANGE` config for `MyMutation`; did you mean `fieldIDs`?',
      );

      // ...and increases...
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
            feildiDS: {},
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `feildiDS` in ' +
          '`FIELDS_CHANGE` config for `MyMutation`; did you mean `fieldIDs`?',
      );

      // ...until we go too far.
      expect(() =>
        validateMutationConfig(
          {
            type: 'FIELDS_CHANGE',
            feildidz: {},
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `feildidz` in ' +
          '`FIELDS_CHANGE` config for `MyMutation`.',
      );
    });
  });

  describe('validating a `RANGE_ADD` config', () => {
    beforeEach(() => {
      config = {
        type: 'RANGE_ADD',
        parentName: 'viewer',
        parentID: 4,
        connectionName: 'todos',
        edgeName: 'todoEdge',
        rangeBehaviors: {
          '': 'append',
        },
      };
    });

    it('does nothing for a valid config', () => {
      expect(() => validateMutationConfig(config, 'MyMutation')).not.toThrow();
    });

    it('complains about missing keys', () => {
      delete config.connectionName;
      expect(() =>
        validateMutationConfig(config, 'MyMutation'),
      ).toFailInvariant(
        'validateMutationConfig: `RANGE_ADD` config on `MyMutation` ' +
          'must have property `connectionName`.',
      );
    });

    it('does not complain if optional keys are missing', () => {
      delete config.parentName;
      expect(() =>
        validateMutationConfig(config, 'MyMutation'),
      ).not.toThrowError();
    });

    it('complains about extraneous keys', () => {
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            extraneous: '?',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `extraneous` in ' +
          '`RANGE_ADD` config for `MyMutation`.',
      );
    });

    it('suggests an alternative when one is appropriate', () => {
      delete config.connectionName;
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            connectoinname: 'todos',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `connectoinname` in ' +
          '`RANGE_ADD` config for `MyMutation`; did you mean ' +
          '`connectionName`?',
      );
    });

    it('suggests alternatives for optional keys', () => {
      delete config.parentName;
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            parentaNme: 'todos',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `parentaNme` in ' +
          '`RANGE_ADD` config for `MyMutation`; did you mean ' +
          '`parentName`?',
      );
    });
  });

  describe('validating a `NODE_DELETE` config', () => {
    beforeEach(() => {
      config = {
        type: 'NODE_DELETE',
        connectionName: 'todos',
        deletedIDFieldName: 'deletedTodoId',
        parentID: 4,
        parentName: 'viewer',
      };
    });

    it('does nothing for a valid config', () => {
      expect(() => validateMutationConfig(config, 'MyMutation')).not.toThrow();
    });

    it('complains about missing keys', () => {
      delete config.connectionName;
      expect(() =>
        validateMutationConfig(config, 'MyMutation'),
      ).toFailInvariant(
        'validateMutationConfig: `NODE_DELETE` config on `MyMutation` ' +
          'must have property `connectionName`.',
      );
    });

    it('complains about extraneous keys', () => {
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            extraneous: '?',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `extraneous` in ' +
          '`NODE_DELETE` config for `MyMutation`.',
      );
    });

    it('suggests an alternative when one is appropriate', () => {
      delete config.connectionName;
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            connectoinname: 'todos',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `connectoinname` in ' +
          '`NODE_DELETE` config for `MyMutation`; did you mean ' +
          '`connectionName`?',
      );
    });
  });

  describe('validating a `RANGE_DELETE` config', () => {
    beforeEach(() => {
      config = {
        type: 'RANGE_DELETE',
        connectionName: 'friends',
        deletedIDFieldName: ['formerFriend'],
        parentID: '4',
        parentName: 'actor',
        pathToConnection: ['actor', 'friends'],
      };
    });

    it('does nothing for a valid config', () => {
      expect(() => validateMutationConfig(config, 'MyMutation')).not.toThrow();
    });

    it('complains about missing keys', () => {
      delete config.connectionName;
      expect(() =>
        validateMutationConfig(config, 'MyMutation'),
      ).toFailInvariant(
        'validateMutationConfig: `RANGE_DELETE` config on `MyMutation` ' +
          'must have property `connectionName`.',
      );
    });

    it('complains about extraneous keys', () => {
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            extraneous: '?',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `extraneous` in ' +
          '`RANGE_DELETE` config for `MyMutation`.',
      );
    });

    it('suggests an alternative when one is appropriate', () => {
      delete config.connectionName;
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            connectoinname: 'todos',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `connectoinname` in ' +
          '`RANGE_DELETE` config for `MyMutation`; did you mean ' +
          '`connectionName`?',
      );
    });
  });

  describe('validating a `REQUIRED_CHILDREN` config', () => {
    beforeEach(() => {
      config = {
        type: 'REQUIRED_CHILDREN',
        children: [],
      };
    });

    it('does nothing for a valid config', () => {
      expect(() => validateMutationConfig(config, 'MyMutation')).not.toThrow();
    });

    it('complains about missing keys', () => {
      delete config.children;
      expect(() =>
        validateMutationConfig(config, 'MyMutation'),
      ).toFailInvariant(
        'validateMutationConfig: `REQUIRED_CHILDREN` config on `MyMutation` ' +
          'must have property `children`.',
      );
    });

    it('complains about extraneous keys', () => {
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            extraneous: '?',
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `extraneous` in ' +
          '`REQUIRED_CHILDREN` config for `MyMutation`.',
      );
    });

    it('suggests an alternative when one is appropriate', () => {
      delete config.children;
      expect(() =>
        validateMutationConfig(
          {
            ...config,
            Childan: [],
          },
          'MyMutation',
        ),
      ).toFailInvariant(
        'validateMutationConfig: Unexpected key `Childan` in ' +
          '`REQUIRED_CHILDREN` config for `MyMutation`; did you mean `children`?',
      );
    });
  });
});
