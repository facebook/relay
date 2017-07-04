/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createTransformError
 * @flow
 * @format
 */

'use strict';

const RelayTransformError = require('./RelayTransformError');

const util = require('util');

/**
 * In case of an error during transform, determine if it should be logged
 * to the console and/or printed in the source.
 */
function createTransformError(error: any): string {
  if (error instanceof RelayTransformError) {
    return `Relay Transform Error: ${error.message}`;
  }

  const {sourceText, validationErrors} = error;
  if (validationErrors && sourceText) {
    const sourceLines = sourceText.split('\n');
    return validationErrors
      .map(({message, locations}) => {
        return (
          'GraphQL Validation Error: ' +
          message +
          '\n' +
          locations
            .map(location => {
              const preview = sourceLines[location.line - 1];
              return (
                preview &&
                [
                  '>',
                  '> ' + preview,
                  '> ' + ' '.repeat(location.column - 1) + '^^^',
                ].join('\n')
              );
            })
            .filter(Boolean)
            .join('\n')
        );
      })
      .join('\n');
  }

  return util.format(
    'Relay Transform Error: %s\n\n%s',
    error.message,
    error.stack,
  );
}

module.exports = createTransformError;
