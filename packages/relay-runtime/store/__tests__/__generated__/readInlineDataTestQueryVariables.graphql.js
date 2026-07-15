/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f3c8358cc0b02ccdbf81bd3ddd6fcecf>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestQueryVariables$fragmentType: FragmentType;
export type readInlineDataTestQueryVariables$data = {
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: readInlineDataTestQueryVariables$fragmentType,
};
export type readInlineDataTestQueryVariables$key = {
  readonly $data?: readInlineDataTestQueryVariables$data,
  readonly $fragmentSpreads: readInlineDataTestQueryVariables$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestQueryVariables"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "1377d31be0006404973e0320af72c9c4";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  readInlineDataTestQueryVariables$fragmentType,
  readInlineDataTestQueryVariables$data,
>*/);
