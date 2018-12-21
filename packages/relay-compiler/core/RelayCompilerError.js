/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const {GraphQLError} = require('graphql');

import type {ASTNode} from 'graphql';

// Combined results of multiple user errors
export opaque type CombinedUserError: Error = Error;

// Error describing invalid application code from which the compiler
// can recover, ie which does not prevent processing of other inputs.
export opaque type UserError: Error = GraphQLError;

// Error describing invalid application code from which the compiler
// *cannot* recover, ie where the validity of subsequent inputs cannot
// be determined. Try to avoid these errors.
export opaque type NonRecoverableUserError: Error = Error;

// Error describing a bug in the compiler
export opaque type CompilerError: Error = Error;

/**
 * Creates an error describing invalid application code (GraphQL/Schema)
 * that must be fixed by the end developer. This should only be used
 * for local errors that don't affect processing of other user code.
 */
function createUserError(
  message: string,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): UserError {
  return new GraphQLError(message, nodes ?? []);
}

/**
 * Similar to createUserError but for errors that are *not* recoverable:
 * the compiler should not continue to process other inputs because their
 * validity can't be determined.
 */
function createNonRecoverableUserError(
  message: string,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): NonRecoverableUserError {
  // Use GraphQLError to format the source of the error, but return a
  // plain Error to indicate that this is not an expected condition.
  const error = new GraphQLError(message, nodes ?? []);
  return new Error(String(error));
}

/**
 * Creates an error describing a problem with the compiler itself - such
 * as a broken invariant - that must be fixed within the compiler.
 */
function createCompilerError(
  message: string,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): CompilerError {
  // Use GraphQLError to format the source of the error, but return a
  // plain Error to indicate that this is not an expected condition.
  const error = new GraphQLError(message, nodes ?? []);
  return new Error(`Internal Error: ${String(error)}`);
}

/**
 * Merges the results of multiple user errors into one so that they
 * can be reported in bulk.
 */
function createCombinedError(
  errors: $ReadOnlyArray<UserError>,
  maybePrefix?: ?string,
): CombinedUserError {
  const prefix = maybePrefix != null ? `${maybePrefix}: ` : '';
  return new Error(
    `${prefix}Encountered ${errors.length} error(s):\n` +
      errors
        .map(error =>
          String(error)
            .split('\n')
            .map((line, index) => (index === 0 ? `- ${line}` : `  ${line}`))
            .join('\n'),
        )
        .join('\n'),
  );
}

/**
 * Iterates over the elements of some iterable value, calling the
 * supplied callback for each item with a guard for user errors.
 * Returns null if the iteration completed without errors, otherwise
 * returns an array of all the user errors encountered.
 *
 * Note that non-user errors are rethrown since they are
 * non-recoverable.
 */
function eachWithErrors<T, T2>(
  iterable: Iterable<T>,
  fn: T => T2,
): $ReadOnlyArray<UserError> | null {
  const errors: Array<UserError> = [];
  for (const item of iterable) {
    try {
      fn(item);
    } catch (error) {
      if (error instanceof GraphQLError) {
        errors.push(error);
      } else {
        throw error;
      }
    }
  }
  if (errors.length !== 0) {
    return errors;
  }
  return null;
}

module.exports = {
  createCombinedError,
  createCompilerError,
  createNonRecoverableUserError,
  createUserError,
  eachWithErrors,
};
