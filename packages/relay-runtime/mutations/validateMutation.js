/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {
  NormalizationSelection,
  NormalizationField,
} from '../util/NormalizationNode';
import type {ConcreteRequest} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';

type ValidationContext = {
  visitedPaths: Set<string>,
  path: string,
  variables: Variables,
  missingDiff: Object,
  extraDiff: Object,
  ...
};
const warning = require('warning');

let validateMutation = () => {};
if (__DEV__) {
  const addFieldToDiff = (path: string, diff: Object, isScalar) => {
    let deepLoc = diff;
    path.split('.').forEach((key, index, arr) => {
      if (deepLoc[key] == null) {
        deepLoc[key] = {};
      }
      if (isScalar && index === arr.length - 1) {
        deepLoc[key] = '<scalar>';
      }
      deepLoc = deepLoc[key];
    });
  };
  validateMutation = (
    optimisticResponse: Object,
    mutation: ConcreteRequest,
    variables: ?Object,
  ) => {
    const operationName = mutation.operation.name;
    const context: ValidationContext = {
      path: 'ROOT',
      visitedPaths: new Set(),
      variables: variables || {},
      missingDiff: {},
      extraDiff: {},
    };
    validateSelections(
      optimisticResponse,
      mutation.operation.selections,
      context,
    );
    validateOptimisticResponse(optimisticResponse, context);
    warning(
      context.missingDiff.ROOT == null,
      'Expected `optimisticResponse` to match structure of server response for mutation `%s`, please define fields for all of\n%s',
      operationName,
      JSON.stringify(context.missingDiff.ROOT, null, 2),
    );
    warning(
      context.extraDiff.ROOT == null,
      'Expected `optimisticResponse` to match structure of server response for mutation `%s`, please remove all fields of\n%s',
      operationName,
      JSON.stringify(context.extraDiff.ROOT, null, 2),
    );
  };

  const validateSelections = (
    optimisticResponse: Object,
    selections: $ReadOnlyArray<NormalizationSelection>,
    context: ValidationContext,
  ) => {
    selections.forEach(selection =>
      validateSelection(optimisticResponse, selection, context),
    );
  };

  const validateSelection = (
    optimisticResponse: Object,
    selection: NormalizationSelection,
    context: ValidationContext,
  ) => {
    switch (selection.kind) {
      case 'Condition':
        validateSelections(optimisticResponse, selection.selections, context);
        return;
      case 'ScalarField':
      case 'LinkedField':
        return validateField(optimisticResponse, selection, context);
      case 'InlineFragment':
        const type = selection.type;
        const isConcreteType = selection.abstractKey == null;
        selection.selections.forEach(subselection => {
          if (isConcreteType && optimisticResponse.__typename !== type) {
            return;
          }
          validateSelection(optimisticResponse, subselection, context);
        });
        return;
      case 'ClientExtension':
        selection.selections.forEach(subselection => {
          validateSelection(optimisticResponse, subselection, context);
        });
        return;
      case 'ModuleImport':
      case 'LinkedHandle':
      case 'ScalarHandle':
      case 'Defer':
      case 'Stream':
      case 'TypeDiscriminator': {
        // TODO(T35864292) - Add missing validations for these types
        return;
      }
      default:
        (selection: empty);
        return;
    }
  };

  const validateField = (
    optimisticResponse: Object,
    field: NormalizationField,
    context: ValidationContext,
  ) => {
    const fieldName = field.alias || field.name;
    const path = `${context.path}.${fieldName}`;
    context.visitedPaths.add(path);
    switch (field.kind) {
      case 'ScalarField':
        if (optimisticResponse.hasOwnProperty(fieldName) === false) {
          addFieldToDiff(path, context.missingDiff, true);
        }
        return;
      case 'LinkedField':
        const selections = field.selections;
        if (
          optimisticResponse[fieldName] === null ||
          (Object.hasOwnProperty(fieldName) &&
            optimisticResponse[fieldName] === undefined)
        ) {
          return;
        }
        if (field.plural) {
          if (Array.isArray(optimisticResponse[fieldName])) {
            optimisticResponse[fieldName].forEach(r => {
              if (r !== null) {
                validateSelections(r, selections, {
                  ...context,
                  path,
                });
              }
            });
            return;
          } else {
            addFieldToDiff(path, context.missingDiff);
            return;
          }
        } else {
          if (optimisticResponse[fieldName] instanceof Object) {
            validateSelections(optimisticResponse[fieldName], selections, {
              ...context,
              path,
            });
            return;
          } else {
            addFieldToDiff(path, context.missingDiff);
            return;
          }
        }
    }
  };

  const validateOptimisticResponse = (
    optimisticResponse: Object,
    context: ValidationContext,
  ) => {
    if (Array.isArray(optimisticResponse)) {
      optimisticResponse.forEach(r => {
        if (r instanceof Object) {
          validateOptimisticResponse(r, context);
        }
      });
      return;
    }
    Object.keys(optimisticResponse).forEach((key: string) => {
      const value = optimisticResponse[key];
      const path = `${context.path}.${key}`;
      if (!context.visitedPaths.has(path)) {
        addFieldToDiff(path, context.extraDiff);
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
