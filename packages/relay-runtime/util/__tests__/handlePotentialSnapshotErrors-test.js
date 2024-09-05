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
import {createMockEnvironment} from 'relay-test-utils-internal';

describe('handlePotentialSnapshotErrors', () => {
  let environment;
  let relayFieldLogger;

  beforeEach(() => {
    relayFieldLogger = jest.fn();
    environment = createMockEnvironment({relayFieldLogger});
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

    it('throws required even when missingData exists in errors array', () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          {
            action: 'THROW',
            field: {owner: 'testOwner', path: 'testPath'},
          },
          [],
          [
            {
              error: {
                message:
                  'Relay: Missing data for one or more fields in RelayModernStoreSubscriptionsTest1Fragment',
              },
              owner: 'RelayModernStoreSubscriptionsTest1Fragment',
              type: 'MISSING_DATA',
              path: '',
            },
          ],
          false /* throwOnFieldError */,
        );
      }).toThrowError(
        /^Relay: Missing @required value at path 'testPath' in 'testOwner'./,
      );
    });

    it('throws required even when missingData exists in errors array', () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          {
            action: 'THROW',
            field: {owner: 'testOwner', path: 'testPath'},
          },
          [],
          [
            {
              error: {
                message:
                  'Relay: Missing data for one or more fields in RelayModernStoreSubscriptionsTest1Fragment',
              },
              owner: 'RelayModernStoreSubscriptionsTest1Fragment',
              type: 'MISSING_DATA',
              path: '',
            },
            {
              owner: 'testOwner',
              path: 'testPath',
              error: {
                message: 'testMessage',
                path: ['testPath'],
                severity: 'CRITICAL',
              },
              type: 'PAYLOAD_ERROR',
            },
          ],
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
    it("doesn't throw even when MISSING_DATA exists in errors array", () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          null,
          [],
          [
            {
              owner: '',
              path: '',
              type: 'MISSING_DATA',
              error: {
                message: 'Relay: Missing data for one or more fields',
              },
            },
          ],
          false /* throwOnFieldError */,
        );
      }).not.toThrow();
    });

    it("only logs but doesn't throw when explicit error handling disabled", () => {
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
              type: 'PAYLOAD_ERROR',
            },
          ],
          false /* throwOnFieldError */,
        );
      }).not.toThrow();

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

    it('logs', () => {
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
            type: 'PAYLOAD_ERROR',
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
              type: 'PAYLOAD_ERROR',
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
