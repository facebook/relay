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

import type {TRelayFieldErrorForDisplay} from '../store/RelayErrorTrie';
import type {
  ErrorResponseFields,
  IEnvironment,
  MissingRequiredFields,
} from '../store/RelayStoreTypes';

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
      errorResponseFields.map((event): TRelayFieldErrorForDisplay => {
        switch (event.kind) {
          case 'relay_field_payload.error':
            //TODO: [relay] Provide a payloadErrorResolver to allow exposing custom error shape.
            const {message, ...displayError} = event.error;
            return displayError;
          case 'missing_expected_data.throw':
            return {path: event.fieldPath.split('.')};
          case 'missing_expected_data.log':
            return {path: event.fieldPath.split('.')};
          case 'relay_resolver.error':
            return {path: event.fieldPath.split('.')};
          default:
            (event.kind: empty);
            throw new Error('Relay: Unexpected event kind');
        }
      }),
    );
  }
}

function handleMissingRequiredFields(
  environment: IEnvironment,
  missingRequiredFields: MissingRequiredFields,
) {
  switch (missingRequiredFields.action) {
    case 'THROW': {
      const {path, owner} = missingRequiredFields.field;
      // This gives the consumer the chance to throw their own error if they so wish.
      environment.relayFieldLogger({
        kind: 'missing_required_field.throw',
        owner,
        fieldPath: path,
      });
      throw new Error(
        `Relay: Missing @required value at path '${path}' in '${owner}'.`,
      );
    }
    case 'LOG':
      missingRequiredFields.fields.forEach(({path, owner}) => {
        environment.relayFieldLogger({
          kind: 'missing_required_field.log',
          owner,
          fieldPath: path,
        });
      });
      break;
    default: {
      (missingRequiredFields.action: empty);
    }
  }
}

function handlePotentialSnapshotErrors(
  environment: IEnvironment,
  missingRequiredFields: ?MissingRequiredFields,
  errorResponseFields: ?ErrorResponseFields,
  throwOnFieldError: boolean,
) {
  if (missingRequiredFields != null) {
    handleMissingRequiredFields(environment, missingRequiredFields);
  }

  /**
   * Inside handleFieldErrors, we check for throwOnFieldError - but this fn logs the error anyway by default
   * which is why this still should run in any case there's errors.
   */
  if (errorResponseFields != null) {
    handleFieldErrors(environment, errorResponseFields, throwOnFieldError);
  }
}

module.exports = handlePotentialSnapshotErrors;
