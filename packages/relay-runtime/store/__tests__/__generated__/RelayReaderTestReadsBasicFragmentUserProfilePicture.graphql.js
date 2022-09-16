/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f244131391701cb2c2e92325cc84061c>>
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
  (node/*: any*/).hash = "80278b4c399cdd3b1d8aa66610fe163f";
}

module.exports = ((node/*: any*/)/*: InlineFragment<
  RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType,
  RelayReaderTestReadsBasicFragmentUserProfilePicture$data,
>*/);
