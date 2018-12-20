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

function getAnnotatedName(name: string, annotation: string): string {
  return `${name}$${annotation}`;
}

function getOriginalName(annotatedName: string): string {
  return annotatedName.replace(/\$.*/, '');
}

module.exports = {
  getAnnotatedName,
  getOriginalName,
};
