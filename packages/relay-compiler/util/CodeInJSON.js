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

/**
 * Marks a string of code as code to be replaced later.
 */
function mark(code: string): string {
  return `@@CODE_START@@${code}@@CODE_END@@`;
}

/**
 * After JSON.stringify'ing some code that contained parts marked with `mark()`,
 * this post-processes the JSON to convert the marked code strings to raw code.
 *
 * Example:
 *   CodeInJSON.postProcess(
 *     JSON.stringify({code: CodeInJSON.mark('alert(1)')})
 *   )
 */
function postProcess(json: string): string {
  return json.replace(/"@@CODE_START@@(.*?)@@CODE_END@@"/g, '$1');
}

module.exports = {
  mark,
  postProcess,
};
