/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @emails oncall+relay
 * @format
 */

'use strict';

import type {
  IEnvironment,
  MissingRequiredFields,
  RelayResolverErrors,
} from '../store/RelayStoreTypes';

function handlePotentialSnapshotErrors(
  environment: IEnvironment,
  missingRequiredFields: ?MissingRequiredFields,
  relayResolverErrors: RelayResolverErrors,
) {
  for (const resolverError of relayResolverErrors) {
    environment.requiredFieldLogger({
      kind: 'relay_resolver.error',
      owner: resolverError.field.owner,
      fieldPath: resolverError.field.path,
      error: resolverError.error,
    });
  }
  if (missingRequiredFields != null) {
    switch (missingRequiredFields.action) {
      case 'THROW': {
        const {path, owner} = missingRequiredFields.field;
        // This gives the consumer the chance to throw their own error if they so wish.
        environment.requiredFieldLogger({
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
          environment.requiredFieldLogger({
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
