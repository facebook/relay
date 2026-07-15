/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<335905263b4ef31b0e3f6456236a8dee>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestFragmentAndQueryVariables$fragmentType: FragmentType;
export type readInlineDataTestFragmentAndQueryVariables$data = {
  readonly defaultVariable: ?{
    readonly uri: ?string,
  },
  readonly fragmentVariable: ?{
    readonly uri: ?string,
  },
  readonly queryVariable: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: readInlineDataTestFragmentAndQueryVariables$fragmentType,
};
export type readInlineDataTestFragmentAndQueryVariables$key = {
  readonly $data?: readInlineDataTestFragmentAndQueryVariables$data,
  readonly $fragmentSpreads: readInlineDataTestFragmentAndQueryVariables$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestFragmentAndQueryVariables"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "a43776ab4d289e45902cda8bb9553018";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  readInlineDataTestFragmentAndQueryVariables$fragmentType,
  readInlineDataTestFragmentAndQueryVariables$data,
>*/);
