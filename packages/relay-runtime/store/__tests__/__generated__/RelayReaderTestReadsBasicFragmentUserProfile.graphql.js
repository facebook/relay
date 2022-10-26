/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<12afcd92f37095de874b5df4df5a5c45>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType } from "./RelayReaderTestReadsBasicFragmentUserProfilePicture.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadsBasicFragmentUserProfile$fragmentType: FragmentType;
export type RelayReaderTestReadsBasicFragmentUserProfile$data = {|
  +id: string,
  +$fragmentSpreads: RelayReaderTestReadsBasicFragmentUserProfilePicture$fragmentType,
  +$fragmentType: RelayReaderTestReadsBasicFragmentUserProfile$fragmentType,
|};
export type RelayReaderTestReadsBasicFragmentUserProfile$key = {
  +$data?: RelayReaderTestReadsBasicFragmentUserProfile$data,
  +$fragmentSpreads: RelayReaderTestReadsBasicFragmentUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestReadsBasicFragmentUserProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineDataFragmentSpread",
      "name": "RelayReaderTestReadsBasicFragmentUserProfilePicture",
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "size",
              "value": 32
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": "profilePicture(size:32)"
        }
      ],
      "args": null,
      "argumentDefinitions": []
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8d1b7989c67d3231e4ebdef30d598249";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestReadsBasicFragmentUserProfile$fragmentType,
  RelayReaderTestReadsBasicFragmentUserProfile$data,
>*/);
