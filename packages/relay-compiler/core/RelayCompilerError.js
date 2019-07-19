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

const {GraphQLError, getLocation, printSourceLocation} = require('graphql');

import type {Location} from './GraphQLIR';
import type {ASTNode, Source, SourceLocation} from 'graphql';

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
  locations?: ?$ReadOnlyArray<Location>,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): UserError {
  let messageWithLocations = message;
  if (locations != null) {
    const printedLocations = printLocations(locations);
    messageWithLocations =
      printedLocations.length === 0
        ? message
        : [message, ...printedLocations].join('\n\n') + '\n';
  }
  return new GraphQLError(messageWithLocations, nodes ?? []);
}

/**
 * Similar to createUserError but for errors that are *not* recoverable:
 * the compiler should not continue to process other inputs because their
 * validity can't be determined.
 */
function createNonRecoverableUserError(
  message: string,
  locations?: ?$ReadOnlyArray<Location>,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): NonRecoverableUserError {
  let messageWithLocations = message;
  if (locations != null) {
    const printedLocations = printLocations(locations);
    messageWithLocations =
      printedLocations.length === 0
        ? message
        : [message, ...printedLocations].join('\n\n') + '\n';
  }
  const error = new GraphQLError(messageWithLocations, nodes ?? []);
  return new Error(error.message);
}

/**
 * Creates an error describing a problem with the compiler itself - such
 * as a broken invariant - that must be fixed within the compiler.
 */
function createCompilerError(
  message: string,
  locations?: ?$ReadOnlyArray<Location>,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): CompilerError {
  let messageWithLocations = message;
  if (locations != null) {
    const printedLocations = printLocations(locations);
    messageWithLocations =
      printedLocations.length === 0
        ? message
        : [message, ...printedLocations].join('\n\n') + '\n';
  }
  const error = new GraphQLError(
    `Internal Error: ${messageWithLocations}`,
    nodes ?? [],
  );
  return new Error(error.message);
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

function printLocations(locations: $ReadOnlyArray<Location>): Array<string> {
  const printedLocations = [];
  for (const location of locations) {
    let sourceLocation = location;
    while (sourceLocation.kind === 'Derived') {
      sourceLocation = sourceLocation.source;
    }
    switch (sourceLocation.kind) {
      case 'Source': {
        // source location
        const prefix =
          sourceLocation === location ? 'Source: ' : 'Source (derived): ';
        printedLocations.push(
          prefix +
            printSourceLocation(
              sourceLocation.source,
              getLocation(sourceLocation.source, sourceLocation.start),
            ),
        );
        break;
      }
      case 'Generated': {
        printedLocations.push('Source: (generated)');
        break;
      }
      case 'Unknown': {
        printedLocations.push('Source: (unknown)');
        break;
      }
      default: {
        (sourceLocation: empty);
        throw createCompilerError(
          `RelayCompilerError: cannot print location '${String(
            sourceLocation,
          )}'.`,
        );
      }
    }
  }
  return printedLocations;
}

module.exports = {
  createCombinedError,
  createCompilerError,
  createNonRecoverableUserError,
  createUserError,
  eachWithErrors,
};
