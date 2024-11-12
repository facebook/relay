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

import type {
  ErrorResponseField,
  ErrorResponseFields,
  IEnvironment,
} from '../store/RelayStoreTypes';

const invariant = require('invariant');

function handleFieldErrors(
  environment: IEnvironment,
  errorResponseFields: ErrorResponseFields,
) {
  for (const fieldError of errorResponseFields) {
    // First we log all events. Note that the logger may opt to throw its own
    // error here if it wants to throw an error that is better integrated into
    // site's error handling infrastructure.
    environment.relayFieldLogger(fieldError);
  }

  for (const fieldError of errorResponseFields) {
    if (eventShouldThrow(fieldError)) {
      switch (fieldError.kind) {
        case 'relay_resolver.error':
          throw new Error(
            `Relay: Resolver error at path '${fieldError.fieldPath}' in '${fieldError.owner}'.`,
          );
        case 'relay_field_payload.error':
          throw new Error(
            `Relay: Unexpected response payload - check server logs for details.`,
          );
        case 'missing_expected_data.throw':
          throw new Error(
            `Relay: Missing expected data at path '${fieldError.fieldPath}' in '${fieldError.owner}'.`,
          );
        case 'missing_required_field.throw':
          throw new Error(
            `Relay: Missing @required value at path '${fieldError.fieldPath}' in '${fieldError.owner}'.`,
          );
        case 'missing_required_field.log':
        case 'missing_expected_data.log':
          // These should have already been filtered out. Sadly, Flow Type
          // Guards don't work well with refining discriminated unions, so we
          // can't assert this via types.
          break;
        default:
          (fieldError.kind: empty);
          invariant(false, 'Relay: Unexpected event kind: %s', fieldError.kind);
      }
    }
  }
}

function eventShouldThrow(event: ErrorResponseField): boolean {
  switch (event.kind) {
    case 'relay_resolver.error':
    case 'relay_field_payload.error':
      return event.shouldThrow && !event.handled;
    case 'missing_expected_data.throw':
    case 'missing_required_field.throw':
      return !event.handled;
    case 'missing_required_field.log':
    case 'missing_expected_data.log':
      return false;
    default:
      (event.kind: empty);
      throw new Error('Relay: Unexpected event kind');
  }
}

function handlePotentialSnapshotErrors(
  environment: IEnvironment,
  errorResponseFields: ?ErrorResponseFields,
) {
  /**
   * Inside handleFieldErrors, we check for throwOnFieldError - but this fn logs the error anyway by default
   * which is why this still should run in any case there's errors.
   */
  if (errorResponseFields != null) {
    handleFieldErrors(environment, errorResponseFields);
  }
}

module.exports = {
  handlePotentialSnapshotErrors,
  eventShouldThrow,
};
