/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createTransformError
 * @format
 */

'use strict';

const RelayTransformError = require('./RelayTransformError');

const computeLocation = require('./computeLocation');
const util = require('util');

/**
 * In case of an error during transform, determine if it should be logged
 * to the console and/or printed in the source.
 */
function createTransformError(t, error, quasi, state) {
  const opts = state.opts || {};
  const warning = opts.suppressWarnings
    ? function() {}
    : console.warn.bind(console);

  var basename = state.file.opts.basename || 'UnknownFile';
  var filename = state.file.opts.filename || 'UnknownFile';
  var errorMessages = [];

  if (error instanceof RelayTransformError) {
    errorMessages.push(error.message);
    warning('\n-- Relay Transform Error -- %s --\n', basename);
    const sourceLine = quasi.loc && quasi.loc.start.line;
    const relativeLocation = error.loc && computeLocation(error.loc);
    if (sourceLine && relativeLocation) {
      warning(
        [
          'Within RelayQLDocument ' + filename + ':' + sourceLine,
          '> ',
          '> line ' + relativeLocation.line + ' (approximate)',
          '> ' + relativeLocation.source,
          '> ' + ' '.repeat(relativeLocation.column - 1) + '^^^',
          'Error: ' + error.message,
          'Stack: ' + error.stack,
        ].join('\n'),
      );
    } else {
      warning(error.message);
    }
  } else {
    // Print a console warning and replace the code with a function
    // that will immediately throw an error in the browser.
    var {sourceText, validationErrors} = error;
    var isValidationError = !!(validationErrors && sourceText);
    if (isValidationError) {
      var sourceLines = sourceText.split('\n');
      validationErrors.forEach(({message, locations}) => {
        errorMessages.push(message);
        warning('\n-- GraphQL Validation Error -- %s --\n', basename);
        warning(
          ['File:  ' + filename, 'Error: ' + message, 'Source:'].join('\n'),
        );
        locations.forEach(location => {
          var preview = sourceLines[location.line - 1];
          if (preview) {
            warning(
              [
                '> ',
                '> ' + preview,
                '> ' + ' '.repeat(location.column - 1) + '^^^',
              ].join('\n'),
            );
          }
        });
      });
    } else {
      errorMessages.push(error.message);
      warning('\n-- Relay Transform Error -- %s --\n', basename);
      warning(['File:  ' + filename, 'Error: ' + error.stack].join('\n'));
    }
  }
  var runtimeMessage = util.format(
    '%s error ``%s`` in file `%s`. Try updating your GraphQL ' +
      'schema if an argument/field/type was recently added.',
    isValidationError ? 'GraphQL validation' : 'Relay transform',
    errorMessages.join(' '),
    filename,
  );

  if (opts.enforceSchema) {
    throw new Error(
      util.format(
        errorMessages.length
          ? 'Aborting due to a %s error:\n\n%s\n'
          : 'Aborting due to %s errors:\n\n%s\n',
        isValidationError ? 'GraphQL validation' : 'Relay transform',
        errorMessages.map(errorMessage => '  - ' + errorMessage).join('\n'),
      ),
    );
  } else if (opts.debug) {
    console.error(error.stack);
  }

  return t.callExpression(
    t.functionExpression(
      null,
      [],
      t.blockStatement([
        t.throwStatement(
          t.newExpression(t.identifier('Error'), [
            t.valueToNode(runtimeMessage),
          ]),
        ),
      ]),
    ),
    [],
  );
}

module.exports = createTransformError;
