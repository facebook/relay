/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<971b7697dd65c677b1cefa1ce1816c4b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestUserFragment$fragmentType: FragmentType;
export type readInlineDataTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: readInlineDataTestUserFragment$fragmentType,
|};
export type readInlineDataTestUserFragment$key = {
  +$data?: readInlineDataTestUserFragment$data,
  +$fragmentSpreads: readInlineDataTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "readInlineDataTestUserFragment"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "ba453fc5b1f337b3ed0db8680df627f5";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  readInlineDataTestUserFragment$fragmentType,
  readInlineDataTestUserFragment$data,
>*/);
