/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import handlePotentialSnapshotErrors from '../handlePotentialSnapshotErrors';
import RelayFeatureFlags from '../RelayFeatureFlags';
import {createMockEnvironment} from 'relay-test-utils-internal';

describe('handlePotentialSnapshotErrors', () => {
  let environment;
  let relayFieldLogger;

  beforeEach(() => {
    relayFieldLogger = jest.fn();
    environment = createMockEnvironment({relayFieldLogger});
    RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = false; // default
  });

  it('should not throw in default case', () => {
    handlePotentialSnapshotErrors(environment, null, [], null, false);
  });

  describe('missing required field handling', () => {
    it('throws', () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          {
            action: 'THROW',
            field: {owner: 'testOwner', path: 'testPath'},
          },
          [],
          null,
          false /* throwOnFieldError */,
        );
      }).toThrowError(
        /^Relay: Missing @required value at path 'testPath' in 'testOwner'./,
      );
    });

    it('logs', () => {
      handlePotentialSnapshotErrors(
        environment,
        {
          action: 'LOG',
          fields: [{owner: 'testOwner', path: 'testPath'}],
        },
        [],
        null,
        false /* throwOnFieldError */,
      );

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldPath: 'testPath',
        kind: 'missing_field.log',
        owner: 'testOwner',
      });
    });
  });

  describe('field error handling', () => {
    it('does nothing when explicit error handling disabled', () => {
      handlePotentialSnapshotErrors(
        environment,
        null,
        [],
        [
          {
            owner: 'testOwner',
            path: 'testPath',
            error: {
              message: 'testMessage',
              path: ['testPath'],
              severity: 'CRITICAL',
            },
          },
        ],
        false /* throwOnFieldError */,
      );

      expect(relayFieldLogger).not.toHaveBeenCalled();
    });

    it('logs when ENABLE_FIELD_ERROR_HANDLING enabled', () => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = true;

      handlePotentialSnapshotErrors(
        environment,
        null,
        [],
        [
          {
            owner: 'testOwner',
            path: 'testPath',
            error: {
              message: 'testMessage',
              path: ['testPath'],
              severity: 'CRITICAL',
            },
          },
        ],
        false /* throwOnFieldError */,
      );

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: {
          message: 'testMessage',
          path: ['testPath'],
          severity: 'CRITICAL',
        },
        fieldPath: 'testPath',
        kind: 'relay_field_payload.error',
        owner: 'testOwner',
      });
    });

    it('throws when throwOnFieldError enabled', () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          null,
          [],
          [
            {
              owner: 'testOwner',
              path: 'testPath',
              error: {
                message: 'testMessage',
                path: ['testPath'],
                severity: 'CRITICAL',
              },
            },
          ],
          true /* throwOnFieldError */,
        );
      }).toThrowError(
        /^Relay: Unexpected response payload - this object includes an errors property in which you can access the underlying errors/,
      );

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: {
          message: 'testMessage',
          path: ['testPath'],
          severity: 'CRITICAL',
        },
        fieldPath: 'testPath',
        kind: 'relay_field_payload.error',
        owner: 'testOwner',
      });
    });
  });

  describe('resolver error handling', () => {
    it('logs when explicit error handling disabled', () => {
      handlePotentialSnapshotErrors(
        environment,
        null,
        [
          {
            field: {owner: 'testOwner', path: 'testPath'},
            error: Error('testError'),
          },
        ],
        null,
        false /* throwOnFieldError */,
      );

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: expect.any(Error),
        fieldPath: 'testPath',
        kind: 'relay_resolver.error',
        owner: 'testOwner',
      });
    });

    it('throws when explicit error handling enabled', () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          null,
          [
            {
              field: {owner: 'testOwner', path: 'testPath'},
              error: Error('testError'),
            },
          ],
          null,
          true /* throwOnFieldError */,
        );
      }).toThrowError(/^Relay: Unexpected resolver exception/);

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: expect.any(Error),
        fieldPath: 'testPath',
        kind: 'relay_resolver.error',
        owner: 'testOwner',
      });
    });
  });
});
