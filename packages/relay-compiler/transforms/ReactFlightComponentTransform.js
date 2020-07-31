/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const IRTransformer = require('../core/IRTransformer');

import type CompilerContext from '../core/CompilerContext';
import type {ScalarField} from '../core/IR';

const FLIGHT_FIELD_SCALAR_NAME = 'ReactFlightComponent';

/**
 * Experimental transform for React Flight.
 */
function reactFlightComponentTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(context, {
    ScalarField: visitScalarField,
  });
}

function visitScalarField(field: ScalarField): ScalarField {
  const transformedField = this.traverse(field);
  if (transformedField.type.name !== FLIGHT_FIELD_SCALAR_NAME) {
    return transformedField;
  }
  return {
    ...transformedField,
    metadata: {
      ...(transformedField.metadata || {}),
      flight: true,
    },
  };
}

module.exports = {
  transform: reactFlightComponentTransform,
};
