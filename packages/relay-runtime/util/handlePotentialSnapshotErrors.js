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

import type {TRelayFieldError} from '../store/RelayErrorTrie';
import type {ErrorResponseFields, IEnvironment} from '../store/RelayStoreTypes';

const {RelayFieldError} = require('../store/RelayErrorTrie');

function handleFieldErrors(
  environment: IEnvironment,
  errorResponseFields: ErrorResponseFields,
  shouldThrow: boolean,
) {
  for (const fieldError of errorResponseFields) {
    // First we log all events. Note that the logger may opt to throw its own
    // error here if it wants to throw an error that is better integrated into
    // site's error handling infrastructure.
    environment.relayFieldLogger(fieldError);
  }

  // when a user adds the throwOnFieldError flag, they opt into also throwing on missing fields.
  if (shouldThrow) {
    throw new RelayFieldError(
      `Relay: Unexpected response payload - this object includes an errors property in which you can access the underlying errors`,
      errorResponseFields.map((event): TRelayFieldError => {
        switch (event.kind) {
          case 'relay_field_payload.error':
            return event.error;
          case 'missing_expected_data.throw':
            return {message: 'Missing expected data'};
          case 'missing_expected_data.log':
            return {message: 'Missing expected data'};
          case 'relay_resolver.error':
            return {
              message: `Relay: Unexpected resolver exception: ${event.error.message}`,
            };
          case 'missing_required_field.throw':
            return {
              message: `Missing required field with THROW at path '${event.fieldPath}' in '${event.owner}'`,
            };

          // TODO: Avoid throwing
          case 'missing_required_field.log':
            return {
              message: `Missing required field with LOG at path '${event.fieldPath}' in '${event.owner}'`,
            };
          default:
            (event.kind: empty);
            throw new Error('Relay: Unexpected event kind');
        }
      }),
    );
  }
}

function handlePotentialSnapshotErrors(
  environment: IEnvironment,
  errorResponseFields: ?ErrorResponseFields,
  throwOnFieldError: boolean,
) {
  /**
   * Inside handleFieldErrors, we check for throwOnFieldError - but this fn logs the error anyway by default
   * which is why this still should run in any case there's errors.
   */
  if (errorResponseFields != null) {
    handleFieldErrors(environment, errorResponseFields, throwOnFieldError);
  }
}

module.exports = handlePotentialSnapshotErrors;
