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

import {RelayFeatureFlags} from '../..';
import {handlePotentialSnapshotErrors} from '../handlePotentialSnapshotErrors';
import {createMockEnvironment} from 'relay-test-utils-internal';

describe('handlePotentialSnapshotErrors', () => {
  let environment;
  let relayFieldLogger;

  beforeEach(() => {
    relayFieldLogger = jest.fn();
    environment = createMockEnvironment({relayFieldLogger});
    RelayFeatureFlags.ENABLE_UI_CONTEXT_ON_RELAY_LOGGER = false;
  });

  it('should not throw in default case', () => {
    expect(() => {
      handlePotentialSnapshotErrors(environment, null);
    }).not.toThrow();
  });

  describe('missing required field handling', () => {
    it('throws with "server returned null" reason when fieldValue is null and no field error', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            // null means the server returned null for this field
            fieldValue: null,
            fieldError: null,
            handled: false,
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Missing @required value at path 'testPath' in 'testOwner': the server returned null.",
      );
    });

    it('throws with server error message when fieldValue is null and server attached a field error', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            fieldValue: null,
            // the server attached an error explaining why the field was null
            fieldError: {message: 'Something went wrong on the server'},
            handled: false,
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Missing @required value at path 'testPath' in 'testOwner': the server returned null with an error: Something went wrong on the server.",
      );
    });

    it('throws with "missing in store" reason when fieldValue is undefined', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            // undefined means the field was absent from the store entirely
            fieldValue: undefined,
            fieldError: null,
            handled: false,
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Missing @required value at path 'testPath' in 'testOwner': the field was missing in the store (data may not have been fetched, or was removed by a graph relationship change: https://relay.dev/docs/next/debugging/why-null/#graph-relationship-change).",
      );
    });

    it('throws required even when missingData exists in errors array', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            fieldValue: null,
            fieldError: null,
            handled: false,
            uiContext: undefined,
          },
          {
            kind: 'missing_expected_data.log',
            owner: 'RelayModernStoreSubscriptionsTest1Fragment',
            fieldPath: '',
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Missing @required value at path 'testPath' in 'testOwner': the server returned null.",
      );
    });

    it('throws required even when missingData and field payload error exist in errors array', () => {
      expect(() => {
        handlePotentialSnapshotErrors(environment, [
          {
            kind: 'missing_required_field.throw',
            owner: 'testOwner',
            fieldPath: 'testPath',
            fieldValue: null,
            fieldError: null,
            handled: false,
            uiContext: undefined,
          },
          {
            kind: 'missing_expected_data.log',
            owner: 'RelayModernStoreSubscriptionsTest1Fragment',
            fieldPath: '',
            uiContext: undefined,
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
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Missing @required value at path 'testPath' in 'testOwner': the server returned null.",
      );
    });

    it('logs', () => {
      handlePotentialSnapshotErrors(environment, [
        {
          kind: 'missing_required_field.log',
          owner: 'testOwner',
          fieldPath: 'testPath',
          fieldValue: null,
          fieldError: null,
          uiContext: undefined,
        },
      ]);

      expect(relayFieldLogger).toHaveBeenCalledTimes(1);
      expect(relayFieldLogger).toHaveBeenCalledWith({
        fieldError: null,
        fieldPath: 'testPath',
        fieldValue: null,
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
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Missing expected data at path '' in ''. See https://relay.dev/docs/next/debugging/why-null/ for likely causes.",
      );

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
            uiContext: undefined,
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
            uiContext: undefined,
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
            uiContext: undefined,
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
            uiContext: undefined,
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

    it("only logs but doesn't throw when explicit error handling disabled - including a set uiContext when flag is on", () => {
      RelayFeatureFlags.ENABLE_UI_CONTEXT_ON_RELAY_LOGGER = true;
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          [
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
              // flag is on so this will be populated in the logger
              uiContext: undefined,
            },
          ],
          {arbitraryUIContextData: 'arbitraryUIContextDataValue'},
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
        shouldThrow: false,
        handled: false,
        // flag was true so uiContext is populated
        uiContext: {arbitraryUIContextData: 'arbitraryUIContextDataValue'},
      });
    });

    it("only logs but doesn't throw when explicit error handling disabled - without a set uiContext when flag is off", () => {
      RelayFeatureFlags.ENABLE_UI_CONTEXT_ON_RELAY_LOGGER = false;
      expect(() => {
        handlePotentialSnapshotErrors(
          environment,
          [
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
              // would have been overwritten with {arbitraryUIContextData: 'arbitraryUIContextDataValue'}
              // had the flag been true
              uiContext: undefined,
            },
          ],
          // when the flag is off, this will never have a value because the hook is never called
          undefined,
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
        shouldThrow: false,
        handled: false,
        // flag was false so this is undefined
        uiContext: undefined,
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
            uiContext: undefined,
          },
          {
            kind: 'missing_expected_data.log',
            owner: '',
            fieldPath: '',
            uiContext: undefined,
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
          uiContext: undefined,
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
            uiContext: undefined,
          },
          {
            kind: 'missing_expected_data.log',
            owner: 'RelayModernStoreSubscriptionsTest1Fragment',
            fieldPath: '',
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Received a field error in the server response for field 'testPath' in 'testOwner'. Message: testMessage",
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
          uiContext: undefined,
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
            uiContext: undefined,
          },
        ]);
      }).toThrowError(
        "Relay: Resolver error at path 'testPath' in 'testOwner'. Message: testError",
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
