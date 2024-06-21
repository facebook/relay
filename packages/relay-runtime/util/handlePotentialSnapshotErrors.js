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

function handlePotentialSnapshotErrors(
  environment: IEnvironment,
  missingRequiredFields: ?MissingRequiredFields,
  relayResolverErrors: RelayResolverErrors,
  errorResponseFields: ?ErrorResponseFields,
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
    relayResolverErrors.length > 0 &&
    (RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_THROW_BY_DEFAULT ||
      throwOnFieldError)
  ) {
    throw new RelayFieldError(
      `Relay: Unexpected resolver exception`,
      relayResolverErrors.map(e => ({message: e.error.message})),
    );
  }

  if (
    (RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING || throwOnFieldError) &&
    errorResponseFields != null
  ) {
    if (errorResponseFields != null) {
      for (const fieldError of errorResponseFields) {
        const {path, owner, error} = fieldError;

        environment.relayFieldLogger({
          kind: 'relay_field_payload.error',
          owner: owner,
          fieldPath: path,
          error,
        });
      }
    }

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

  if (missingRequiredFields != null) {
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
}

module.exports = handlePotentialSnapshotErrors;
