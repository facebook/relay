/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

/**
 * Given a object of nested properties, return JavaScript text that would merge
 * in an object named `objectName` by a series of individual assignments.
 */
function deepMergeAssignments(objectName: string, properties: Object): string {
  const assignments = [];
  collectAssignmentsInto(assignments, [], properties);
  const jsAssignments = assignments.map(({path, value}) =>
    formatJSAssignment(objectName, path, value),
  );
  return jsAssignments.length === 0 ? '' : jsAssignments.join('\n');
}

// Recursively collect assignments
function collectAssignmentsInto(
  assignments: Array<{path: Array<string | number>, value: mixed}>,
  parentPath: Array<string | number>,
  parentValue: Object,
): void {
  // Iterate over the entries in the array or object.
  forEach(parentValue, (value, key) => {
    // The "path" is the sequence of keys to arrive at this assignment.
    const path = parentPath.concat(key);
    // For each entry, either add an assignment or recurse.
    if (typeof value === 'object' && value !== null) {
      collectAssignmentsInto(assignments, path, value);
    } else {
      assignments.push({path, value});
    }
  });
}

// Print a path/value pair as a JS assignment expression.
function formatJSAssignment(
  objectName: string,
  path: Array<string | number>,
  value: mixed,
): string {
  const assignmentPath = path
    .map(p => (typeof p === 'string' ? `.${p}` : `[${p}]`))
    .join('');
  const jsValue = value === undefined ? 'undefined' : JSON.stringify(value);
  return `${objectName}${assignmentPath} = ${jsValue};`;
}

// Utility for looping over entries in both Arrays and Objects.
function forEach<T>(
  value: Array<T> | {[string]: T},
  fn: (T, number | string) => void,
) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      fn(value[i], i);
    }
  } else {
    for (const k in value) {
      if (value.hasOwnProperty(k)) {
        fn(value[k], k);
      }
    }
  }
}

module.exports = deepMergeAssignments;
