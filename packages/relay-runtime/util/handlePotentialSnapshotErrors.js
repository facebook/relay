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
  ErrorResponseFields,
  IEnvironment,
  MissingRequiredFields,
  RelayResolverErrors,
} from '../store/RelayStoreTypes';

import {RelayFieldError} from '../store/RelayErrorTrie';
import RelayFeatureFlags from './RelayFeatureFlags';

function handleResolverErrors(
  environment: IEnvironment,
  relayResolverErrors: RelayResolverErrors,
  throwOnFieldError: boolean,
) {
  for (const resolverError of relayResolverErrors) {
    environment.relayFieldLogger({
      kind: 'relay_resolver.error',
      owner: resolverError.field.owner,
      fieldPath: resolverError.field.path,
      error: resolverError.error,
    });
  }

  if (
    RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_THROW_BY_DEFAULT ||
    throwOnFieldError
  ) {
    throw new RelayFieldError(
      `Relay: Unexpected resolver exception`,
      relayResolverErrors.map(e => ({message: e.error.message})),
    );
  }
}

function handleFieldErrors(
  environment: IEnvironment,
  errorResponseFields: ErrorResponseFields,
  throwOnFieldError: boolean,
) {
  for (const fieldError of errorResponseFields) {
    const {path, owner, error} = fieldError;
    environment.relayFieldLogger({
      kind: 'relay_field_payload.error',
      owner: owner,
      fieldPath: path,
      error,
    });
  }

  // when a user adds the throwOnFieldError flag, they opt into also throwing on missing fields.
  if (
    RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_THROW_BY_DEFAULT ||
    throwOnFieldError
  ) {
    throw new RelayFieldError(
      `Relay: Unexpected response payload - this object includes an errors property in which you can access the underlying errors`,
      errorResponseFields.map(({error}) => error),
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
        kind: 'missing_field.throw',
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
          kind: 'missing_field.log',
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
  relayResolverErrors: RelayResolverErrors,
  errorResponseFields: ?ErrorResponseFields,
  throwOnFieldError: boolean,
) {
  const onlyHasMissingDataErrors = Boolean(
    errorResponseFields?.every(field => field.type === 'MISSING_DATA'),
  );

  if (relayResolverErrors.length > 0) {
    handleResolverErrors(environment, relayResolverErrors, throwOnFieldError);
  }

  if (missingRequiredFields != null) {
    handleMissingRequiredFields(environment, missingRequiredFields);
  }

  /* inside handleFieldErrors, we check for throwOnFieldError - but this fn logs the error anyway by default
   * which is why this still should run in any case there's errors.
   */
  if (errorResponseFields != null && !onlyHasMissingDataErrors) {
    handleFieldErrors(environment, errorResponseFields, throwOnFieldError);
  }
}

module.exports = handlePotentialSnapshotErrors;
