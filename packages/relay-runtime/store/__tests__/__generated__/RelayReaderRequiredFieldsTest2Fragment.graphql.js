/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2c019f207cc9bebea039cb9467b4cbca>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest2Fragment$ref: FragmentReference;
declare export opaque type RelayReaderRequiredFieldsTest2Fragment$fragmentType: RelayReaderRequiredFieldsTest2Fragment$ref;
export type RelayReaderRequiredFieldsTest2Fragment = ?{|
  +backgroundImage: {|
    +uri: string,
  |},
  +$refType: RelayReaderRequiredFieldsTest2Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest2Fragment$data = RelayReaderRequiredFieldsTest2Fragment;
export type RelayReaderRequiredFieldsTest2Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest2Fragment$data,
  +$fragmentRefs: RelayReaderRequiredFieldsTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest2Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "Image",
        "kind": "LinkedField",
        "name": "backgroundImage",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            },
            "action": "LOG",
            "path": "backgroundImage.uri"
          }
        ],
        "storageKey": null
      },
      "action": "LOG",
      "path": "backgroundImage"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "954d425661b99194d67a6b78d317d7fc";
}

module.exports = node;
