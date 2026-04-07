/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<76204556ed71c142221c2d4dc5b3d6b1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType: FragmentType;
export type RelayReaderTestReadsBasicFragmentUserProfilePicture$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType,
|};
export type RelayReaderTestReadsBasicFragmentUserProfilePicture$key = {
  +$data?: RelayReaderTestReadsBasicFragmentUserProfilePicture$data,
  +$fragmentSpreads: RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType,
  ...
};
*/

var node/*: ReaderInlineDataFragment*/ = {
  "kind": "InlineDataFragment",
  "name": "RelayReaderTestReadsBasicFragmentUserProfilePicture"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "80278b4c399cdd3b1d8aa66610fe163f";
}

module.exports = ((node/*:: as any*/)/*:: as InlineFragment<
  RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType,
  RelayReaderTestReadsBasicFragmentUserProfilePicture$data,
>*/);
