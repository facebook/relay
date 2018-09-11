/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  ConcreteRequest,
  ConcreteSelection,
  ConcreteField,
} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';

type ValidationContext = {
  operationName: string,
  visitedPaths: Set<string>,
  path: string,
  variables: Variables,
};
const warning = require('warning');

let validateMutation = () => {};
if (__DEV__) {
  validateMutation = (
    optimisticResponse: Object,
    mutation: ConcreteRequest,
    variables: ?Object,
  ) => {
    const operationName = mutation.operation.name;
    const context: ValidationContext = {
      operationName,
      path: 'ROOT',
      visitedPaths: new Set(),
      variables: variables || {},
    };
    validateSelections(
      optimisticResponse,
      mutation.operation.selections,
      context,
    );
    validateOptimisticResponse(optimisticResponse, context);
  };

  const validateSelections = (
    optimisticResponse: Object,
    selections: Array<ConcreteSelection>,
    context: ValidationContext,
  ) => {
    selections.forEach(selection =>
      validateSelection(optimisticResponse, selection, context),
    );
  };

  const validateSelection = (
    optimisticResponse: Object,
    selection: ConcreteSelection,
    context: ValidationContext,
  ) => {
    switch (selection.kind) {
      case 'Condition':
        if (selection.passingValue === context.variables[selection.condition]) {
          validateSelections(optimisticResponse, selection.selections, context);
        }
        return;
      case 'ScalarField':
      case 'LinkedField':
        return validateField(optimisticResponse, selection, context);
      case 'InlineFragment':
        const type = selection.type;
        selection.selections.forEach(subselection => {
          if (optimisticResponse.__typename !== type) {
            return;
          }
          validateSelection(optimisticResponse, subselection, context);
        });
        return;
    }
  };

  const validateField = (
    optimisticResponse: Object,
    field: ConcreteField,
    context: ValidationContext,
  ) => {
    const fieldName = field.alias || field.name;
    const path = `${context.path}.${fieldName}`;
    context.visitedPaths.add(path);
    switch (field.kind) {
      case 'ScalarField':
        if (optimisticResponse[fieldName] === undefined) {
          warning(
            false,
            'validateMutation: Expected `optimisticResponse` to match structure of server response for mutation `%s`, field %s is undefined',
            context.operationName,
            path,
          );
        }
        return;
      case 'LinkedField':
        if (optimisticResponse[fieldName] === null) {
          return;
        }
        if (!(optimisticResponse[fieldName] instanceof Object)) {
          warning(
            false,
            'validateMutation: Expected `optimisticResponse` to match structure of server response for mutation `%s`, field %s is not an object',
            context.operationName,
            path,
          );
          return;
        }
        validateSelections(optimisticResponse[fieldName], field.selections, {
          ...context,
          path,
        });
        return;
    }
  };

  const validateOptimisticResponse = (
    optimisticResponse: Object,
    context: ValidationContext,
  ) => {
    Object.keys(optimisticResponse).forEach((key: string) => {
      const value = optimisticResponse[key];
      const path = `${context.path}.${key}`;
      if (!context.visitedPaths.has(path)) {
        warning(
          false,
          'validateMutation: `optimisticResponse` for mutation `%s`, contains an unused field %s',
          context.operationName,
          path,
        );
        return;
      }
      if (value instanceof Object) {
        validateOptimisticResponse(value, {
          ...context,
          path,
        });
      }
    });
  };
}

module.exports = (validateMutation: (Object, ConcreteRequest, ?Object) => void);
