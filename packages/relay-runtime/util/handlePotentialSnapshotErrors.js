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

const {RelayFieldError} = require('../store/RelayErrorTrie');
const RelayFeatureFlags = require('./RelayFeatureFlags');

function handleResolverErrors(
  environment: IEnvironment,
  relayResolverErrors: RelayResolverErrors,
  throwOnFieldError: boolean,
) {
  for (const resolverError of relayResolverErrors) {
    environment.relayFieldLogger(resolverError);
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
  shouldThrow: boolean,
) {
  for (const fieldError of errorResponseFields) {
    const {path, owner, error} = fieldError;
    if (fieldError.type === 'MISSING_DATA') {
      logMissingData(environment, shouldThrow);
    } else {
      environment.relayFieldLogger({
        kind: 'relay_field_payload.error',
        owner: owner,
        fieldPath: path,
        error,
      });
    }
  }

  // when a user adds the throwOnFieldError flag, they opt into also throwing on missing fields.
  if (shouldThrow) {
    throw new RelayFieldError(
      `Relay: Unexpected response payload - this object includes an errors property in which you can access the underlying errors`,
      errorResponseFields.map(({error}) => error),
    );
  }
}

function logMissingData(environment: IEnvironment, throwing: boolean) {
  if (!throwing) {
    environment.relayFieldLogger({
      kind: 'missing_expected_data.log',
      owner: '',
      fieldPath: '',
    });
    return;
  }

  environment.relayFieldLogger({
    kind: 'missing_expected_data.throw',
    owner: '',
    fieldPath: '',
  });
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

function handleMissingDataError(
  environment: IEnvironment,
  throwOnFieldErrorDirective: boolean,
) {
  logMissingData(environment, throwOnFieldErrorDirective);

  if (throwOnFieldErrorDirective) {
    throw new RelayFieldError(`Relay: Missing data for one or more fields`);
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

  // if isMissingData is the only error - we should throw that separately
  if (onlyHasMissingDataErrors) {
    handleMissingDataError(environment, throwOnFieldError);
  }

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
