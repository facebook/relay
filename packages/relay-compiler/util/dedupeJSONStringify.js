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
 * This function works similar to JSON.stringify except that for the case there
 * are multiple common subtrees, it generates a string for a IIFE that re-uses
 * the same objects for the duplicate subtrees.
 */
function dedupeJSONStringify(jsonValue: mixed): string {
  // Clone the object to convert references to the same object instance into
  // copies. This is needed for the WeakMap/Map to recognize them as duplicates.
  jsonValue = JSON.parse(JSON.stringify(jsonValue));
  const metadataForHash = new Map();
  const metadataForVal = new WeakMap();
  const varDefs = [];
  collectMetadata(jsonValue);
  collectDuplicates(jsonValue);
  const code = printJSCode(false, '', jsonValue);
  return varDefs.length === 0
    ? code
    : `(function(){\nvar ${varDefs.join(',\n')};\nreturn ${code};\n})()`;

  // Collect common metadata for each object in the value tree, ensuring that
  // equivalent values have the *same reference* to the same metadata. Note that
  // the hashes generated are not exactly JSON, but still identify equivalent
  // values. Runs in linear time due to hashing in a bottom-up recursion.
  function collectMetadata(value) {
    if (value == null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    let hash;
    if (Array.isArray(value)) {
      hash = '[';
      for (let i = 0; i < value.length; i++) {
        hash += collectMetadata(value[i]) + ',';
      }
    } else {
      hash = '{';
      for (const k in value) {
        if (value.hasOwnProperty(k) && value[k] !== undefined) {
          hash += k + ':' + collectMetadata(value[k]) + ',';
        }
      }
    }
    let metadata = metadataForHash.get(hash);
    if (!metadata) {
      metadata = {value, hash, isDuplicate: false};
      metadataForHash.set(hash, metadata);
    }
    metadataForVal.set(value, metadata);
    return hash;
  }

  // Using top-down recursion, linearly scan the JSON tree to determine which
  // values should be deduplicated.
  function collectDuplicates(value) {
    if (value == null || typeof value !== 'object') {
      return;
    }
    const metadata = metadataForVal.get(value);
    // Only consider duplicates with hashes longer than 2 (excludes [] and {}).
    if (metadata && metadata.value !== value && metadata.hash.length > 2) {
      metadata.isDuplicate = true;
      return;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        collectDuplicates(value[i]);
      }
    } else {
      for (const k in value) {
        if (value.hasOwnProperty(k) && value[k] !== undefined) {
          collectDuplicates(value[k]);
        }
      }
    }
  }

  // Stringify JS, replacing duplicates with variable references.
  function printJSCode(isDupedVar, depth, value) {
    if (value == null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    // Only use variable references at depth beyond the top level.
    if (depth !== '') {
      const metadata = metadataForVal.get(value);
      if (metadata && metadata.isDuplicate) {
        if (!metadata.varName) {
          const refCode = printJSCode(true, '', value);
          metadata.varName = 'v' + varDefs.length;
          varDefs.push(metadata.varName + ' = ' + refCode);
        }
        return metadata.varName;
      }
    }
    let str;
    let isEmpty = true;
    const depth2 = depth + '  ';
    if (Array.isArray(value)) {
      // Empty arrays can only have one inferred flow type and then conflict if
      // used in different places, this is unsound if we would write to them but
      // this whole module is based on the idea of a read only JSON tree.
      if (isDupedVar && value.length === 0) {
        return '([]/*: any*/)';
      }
      str = '[';
      for (let i = 0; i < value.length; i++) {
        str +=
          (isEmpty ? '\n' : ',\n') +
          depth2 +
          printJSCode(isDupedVar, depth2, value[i]);
        isEmpty = false;
      }
      str += isEmpty ? ']' : `\n${depth}]`;
    } else {
      str = '{';
      for (const k in value) {
        if (value.hasOwnProperty(k) && value[k] !== undefined) {
          str +=
            (isEmpty ? '\n' : ',\n') +
            depth2 +
            JSON.stringify(k) +
            ': ' +
            printJSCode(isDupedVar, depth2, value[k]);
          isEmpty = false;
        }
      }
      str += isEmpty ? '}' : `\n${depth}}`;
    }
    return str;
  }
}

module.exports = dedupeJSONStringify;
