/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<53b3b22d71f7629f39c4f4603c4586ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryTest_node$fragmentType: FragmentType;
*/

module.exports.validate = function validate(value/*: {
  +__id: string,
  +__isreadUpdatableQueryTest_node?: string,
  +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
  ...
}*/)/*: false | {
  +__id: string,
  +__isreadUpdatableQueryTest_node: string,
  +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
  ...
}*/ {
  return value.__isreadUpdatableQueryTest_node != null ? (value/*: any*/) : false;
};
