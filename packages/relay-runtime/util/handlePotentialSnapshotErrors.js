/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {TRelayFieldError} from '../store/RelayErrorTrie';
import type {
  ErrorResponseField,
  ErrorResponseFields,
  IEnvironment,
} from '../store/RelayStoreTypes';

const {RelayFieldError} = require('../store/RelayErrorTrie');
const invariant = require('invariant');

function fieldErrorShouldThrow(event: ErrorResponseField): boolean {
  switch (event.kind) {
    case 'missing_required_field.throw':
      return true;
    case 'missing_required_field.log':
      return false;
    case 'relay_field_payload.error':
      return event.shouldThrow;
    case 'missing_expected_data.throw':
      return true;
    case 'missing_expected_data.log':
      return false;
    case 'relay_resolver.error':
      return event.shouldThrow;
    default:
      (event.kind: empty);
      invariant(false, 'Relay: Unexpected event kind %s', event.kind);
  }
}

function handlePotentialSnapshotErrors(
  environment: IEnvironment,
  errorResponseFields: ?ErrorResponseFields,
) {
  if (errorResponseFields == null) {
    return;
  }
  for (const fieldError of errorResponseFields) {
    // First we log all events. Note that the logger may opt to throw its own
    // error here if it wants to throw an error that is better integrated into
    // site's error handling infrastructure.
    environment.relayFieldLogger(fieldError);
  }

  const throwAble = errorResponseFields.filter(fieldErrorShouldThrow);
  // when a user adds the throwOnFieldError flag, they opt into also throwing on missing fields.
  if (throwAble.length > 0) {
    throw new RelayFieldError(
      `Relay: Unexpected response payload - this object includes an errors property in which you can access the underlying errors`,
      throwAble.map((event): TRelayFieldError => {
        switch (event.kind) {
          case 'relay_field_payload.error':
            return event.error;
          case 'missing_expected_data.throw':
            return {message: 'Missing expected data'};
          case 'relay_resolver.error':
            return {
              message: `Relay: Unexpected resolver exception: ${event.error.message}`,
            };
          case 'missing_required_field.throw':
            return {
              message: `Missing required field with THROW at path '${event.fieldPath}' in '${event.owner}'`,
            };
          // TODO: Below should be impossible to ever reach
          case 'missing_required_field.log':
            return {
              message: `Missing required field with LOG at path '${event.fieldPath}' in '${event.owner}'`,
            };
          case 'missing_expected_data.log':
            return {message: 'Missing expected data'};
          default:
            (event.kind: empty);
            throw new Error('Relay: Unexpected event kind');
        }
      }),
    );
  }
}

module.exports = {
  handlePotentialSnapshotErrors,
  fieldErrorShouldThrow,
};
