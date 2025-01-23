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

import {handlePotentialSnapshotErrors} from '../handlePotentialSnapshotErrors';
import {createMockEnvironment} from 'relay-test-utils-internal';

describe('handlePotentialSnapshotErrors', () => {
  let environment;
  let relayFieldLogger;

  beforeEach(() => {
    relayFieldLogger = jest.fn();
    environment = createMockEnvironment({relayFieldLogger});
  });

  it('should not throw in default case', () => {
    expect(() => {
      handlePotentialSnapshotErrors(environment, null);
    }).not.toThrow();
  });

  describe('missing required field handling', () => {
    it('throws', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            handled: false,
          },
        ]);
      }).toThrowError(
        /^Relay: Missing @required value at path 'testPath' in 'testOwner'./,
      );
    });

    it('throws required even when missingData exists in errors array', () => {
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,

          [
            {
              kind: 'missing_required_field.throw',
              owner: 'testOwner',
              fieldPath: 'testPath',
              handled: false,
            },
            {
              kind: 'missing_expected_data.log',
              owner: 'RelayModernStoreSubscriptionsTest1Fragment',
              fieldPath: '',
            },
          ],
        );
      }).toThrowError(
        /^Relay: Missing @required value at path 'testPath' in 'testOwner'./,
      );
    });

    it('throws required even when missingData exists in errors array', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            handled: false,
          },
          {
            kind: 'missing_expected_data.log',
            owner: 'RelayModernStoreSubscriptionsTest1Fragment',
            fieldPath: '',
          },
          {
            kind: 'relay_field_payload.error',
            owner: 'testOwner',
            fieldPath: 'testPath',
            error: {
              message: 'testMessage',
              path: ['testPath'],
              severity: 'CRITICAL',
            },
            shouldThrow: false,
            handled: false,
          },
        ]);
      }).toThrowError(
        /^Relay: Missing @required value at path 'testPath' in 'testOwner'./,
      );
    });

    it('logs', () => {
      handlePotentialSnapshotErrors(environment, [
        {
          kind: 'missing_required_field.log',
          owner: 'testOwner',
          fieldPath: 'testPath',
        },
      ]);

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldPath: 'testPath',
        kind: 'missing_required_field.log',
        owner: 'testOwner',
      });
    });
  });

  describe('isMissingData field handling', () => {
    it('throws on throwOnFieldError true', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_expected_data.throw',
            owner: '',
            fieldPath: '',
            handled: false,
          },
        ]);
      }).toThrowError(/^Relay: Missing expected data at path '' in ''./);

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldPath: '',
        kind: 'missing_expected_data.throw',
        owner: '',
        handled: false,
      });
    });

    it("logs missing data but doesn't throw when throwOnFieldError is false", () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_expected_data.log',
            owner: '',
            fieldPath: '',
          },
        ]);
      }).not.toThrow();

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldPath: '',
        kind: 'missing_expected_data.log',
        owner: '',
      });
    });

    it("logs missing data but doesn't throw when throwOnFieldError is false", () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_expected_data.log',
            owner: '',
            fieldPath: '',
          },
        ]);
      }).not.toThrow();

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldPath: '',
        kind: 'missing_expected_data.log',
        owner: '',
      });
    });
  });

  describe('field error handling', () => {
    it("doesn't throw even when MISSING_DATA exists in errors array", () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_expected_data.log',
            owner: '',
            fieldPath: '',
          },
        ]);
      }).not.toThrow();
    });

    it("only logs but doesn't throw when explicit error handling disabled", () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'relay_field_payload.error',
            owner: 'testOwner',
            fieldPath: 'testPath',
            error: {
              message: 'testMessage',
              path: ['testPath'],
              severity: 'CRITICAL',
            },
            shouldThrow: false,
            handled: false,
          },
        ]);
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
        shouldThrow: false,
        handled: false,
      });
    });

    it("only logs twice but doesn't throw when explicit error handling disabled - and missing data", () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'relay_field_payload.error',
            owner: 'testOwner',
            fieldPath: 'testPath',
            error: {
              message: 'testMessage',
              path: ['testPath'],
              severity: 'CRITICAL',
            },
            shouldThrow: false,
            handled: false,
          },
          {
            kind: 'missing_expected_data.log',
            owner: '',
            fieldPath: '',
          },
        ]);
      }).not.toThrow();

      expect(relayFieldLogger).toHaveBeenCalledTimes(2);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: {
          message: 'testMessage',
          path: ['testPath'],
          severity: 'CRITICAL',
        },
        fieldPath: 'testPath',
        kind: 'relay_field_payload.error',
        owner: 'testOwner',
        shouldThrow: false,
        handled: false,
      });
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldPath: '',
        kind: 'missing_expected_data.log',
        owner: '',
      });
    });

    it('logs', () => {
      handlePotentialSnapshotErrors(environment, [
        {
          kind: 'relay_field_payload.error',
          owner: 'testOwner',
          fieldPath: 'testPath',
          error: {
            message: 'testMessage',
            path: ['testPath'],
            severity: 'CRITICAL',
          },
          shouldThrow: false,
          handled: false,
        },
      ]);

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
        shouldThrow: false,
        handled: false,
      });
    });

    it('throws when throwOnFieldError enabled', () => {
      expect(() => {
        // in this case, the MISSING_DATA error is thrown *with* the others
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'relay_field_payload.error',
            owner: 'testOwner',
            fieldPath: 'testPath',
            error: {
              message: 'testMessage',
              path: ['testPath'],
              severity: 'CRITICAL',
            },
            shouldThrow: true,
            handled: false,
          },
          {
            kind: 'missing_expected_data.log',
            owner: 'RelayModernStoreSubscriptionsTest1Fragment',
            fieldPath: '',
          },
        ]);
      }).toThrowError(
        /^Relay: Unexpected response payload - check server logs for details./,
      );

      const eventsLogged = relayFieldLogger.mock.calls.map(call => call[0]);

      expect(eventsLogged).toEqual([
        {
          error: {
            message: 'testMessage',
            path: ['testPath'],
            severity: 'CRITICAL',
          },
          fieldPath: 'testPath',
          kind: 'relay_field_payload.error',
          owner: 'testOwner',
          shouldThrow: true,
          handled: false,
        },
        {
          fieldPath: '',
          kind: 'missing_expected_data.log',
          owner: 'RelayModernStoreSubscriptionsTest1Fragment',
        },
      ]);
    });
  });

  describe('resolver error handling', () => {
    it('logs when explicit error handling disabled', () => {
      handlePotentialSnapshotErrors(environment, [
        {
          kind: 'relay_resolver.error',
          fieldPath: 'testPath',
          owner: 'testOwner',
          error: Error('testError'),
          shouldThrow: false,
          handled: false,
        },
      ]);

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: expect.any(Error),
        fieldPath: 'testPath',
        kind: 'relay_resolver.error',
        owner: 'testOwner',
        shouldThrow: false,
        handled: false,
      });
    });

    it('throws when explicit error handling enabled', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'relay_resolver.error',
            fieldPath: 'testPath',
            owner: 'testOwner',
            error: Error('testError'),
            shouldThrow: true,
            handled: false,
          },
        ]);
      }).toThrowError(
        /^Relay: Resolver error at path 'testPath' in 'testOwner'/,
      );

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        error: expect.any(Error),
        fieldPath: 'testPath',
        kind: 'relay_resolver.error',
        owner: 'testOwner',
        shouldThrow: true,
        handled: false,
      });
    });
  });
});
