/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

/**
 * Prints a JSON AST similar to JSON.stringify(ast, null, 2) with some changes:
 * - Adds trailing commas to simplify diffs.
 * - Prints `undefined` as `undefined`.
 * - Errors on unhandled types instead of skipping keys.
 * - If an object has a key `kind` with a string value, prints the object as:
 *   SomeKind {
 *     prop: value,
 *   }
 */
function printAST(ast: unknown): string {
  return printASTImpl(ast, '');
}

function printASTImpl(ast: unknown, indent: string): string {
  switch (typeof ast) {
    case 'undefined':
      return 'undefined';
    case 'object': {
      if (ast === null) {
        return 'null';
      } else if (Array.isArray(ast)) {
        /* $FlowFixMe[invalid-compare] Error discovered during Constant
         * Condition roll out. See https://fburl.com/workplace/4oq3zi07. */
        if (ast.length === 0) {
          return '[]';
        }
        let result = '[\n';
        const itemIndent = indent + '  ';
        for (const item of ast) {
          result += itemIndent + printASTImpl(item, itemIndent) + ',\n';
        }
        result += indent + ']';
        return result;
      } else if (typeof ast.kind === 'string') {
        let result = `${ast.kind} {\n`;
        const keyIndent = indent + '  ';
        for (const [key, value] of Object.entries(ast)) {
          if (key === 'kind') {
            continue;
          }
          result += `${keyIndent}${key}: ${printASTImpl(value, keyIndent)},\n`;
        }
        result += indent + '}';
        return result;
      } else if (typeof ast.toJSON === 'function') {
        return printASTImpl(
          // $FlowFixMe[incompatible-use] - we have to unsafely assume no arguments here
          ast.toJSON(),
          indent,
        );
      } else {
        let result = '{\n';
        const keyIndent = indent + '  ';
        for (const [key, value] of Object.entries(ast)) {
          result += `${keyIndent}${JSON.stringify(key)}: ${printASTImpl(
            value,
            keyIndent,
          )},\n`;
        }
        result += indent + '}';
        return result;
      }
    }
    case 'string':
    case 'number':
    case 'boolean':
      return JSON.stringify(ast, null, 2).replace('\n', '\n' + indent);
    default:
      throw new Error(
        "printAST doesn't handle values where " +
          `typeof value === '${typeof ast}'.`,
      );
  }
}

module.exports = printAST;
