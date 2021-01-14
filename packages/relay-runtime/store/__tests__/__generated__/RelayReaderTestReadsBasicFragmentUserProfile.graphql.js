/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5fc4e702d77d99686582ef09a7ded1d7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayReaderTestReadsBasicFragmentUserProfilePicture$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestReadsBasicFragmentUserProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestReadsBasicFragmentUserProfile$fragmentType: RelayReaderTestReadsBasicFragmentUserProfile$ref;
export type RelayReaderTestReadsBasicFragmentUserProfile = {|
  +id: string,
  +$fragmentRefs: RelayReaderTestReadsBasicFragmentUserProfilePicture$ref,
  +$refType: RelayReaderTestReadsBasicFragmentUserProfile$ref,
|};
export type RelayReaderTestReadsBasicFragmentUserProfile$data = RelayReaderTestReadsBasicFragmentUserProfile;
export type RelayReaderTestReadsBasicFragmentUserProfile$key = {
  +$data?: RelayReaderTestReadsBasicFragmentUserProfile$data,
  +$fragmentRefs: RelayReaderTestReadsBasicFragmentUserProfile$ref,
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
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8d1b7989c67d3231e4ebdef30d598249";
}

module.exports = node;
