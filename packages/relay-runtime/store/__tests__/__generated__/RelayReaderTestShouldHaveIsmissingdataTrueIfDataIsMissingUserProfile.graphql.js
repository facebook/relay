/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f76d0306a8c9ac68e3c40ad6cbfb03f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$ref;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile = {|
  +id: string,
  +username: ?string,
  +$refType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$ref,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data,
  +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e02035b1843ef7dc76c90e27f2d7e190";
}

module.exports = node;
