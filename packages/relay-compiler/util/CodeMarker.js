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
function moduleDependency(code: string): string {
  return `@@MODULE_START@@${code}@@MODULE_END@@`;
}

/**
 * After JSON.stringify'ing some code that contained parts marked with `mark()`,
 * this post-processes the JSON to convert the marked code strings to raw code.
 *
 * Example:
 *   CodeMarker.postProcess(
 *     JSON.stringify({code: CodeMarker.mark('alert(1)')})
 *   )
 */
function postProcess(json: string, printModule: string => string): string {
  return json.replace(
    /"@@MODULE_START@@(.*?)@@MODULE_END@@"/g,
    (_, moduleName) => printModule(moduleName),
  );
}

module.exports = {
  moduleDependency,
  postProcess,
};
