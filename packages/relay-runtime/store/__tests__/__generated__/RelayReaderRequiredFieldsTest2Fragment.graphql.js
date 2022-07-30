/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<43a49095188f6d8e9eae4e749c128c19>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest2Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest2Fragment$data = ?{|
  +backgroundImage: {|
    +uri: string,
  |},
  +$fragmentType: RelayReaderRequiredFieldsTest2Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest2Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest2Fragment$data,
  +$fragmentSpreads: RelayReaderRequiredFieldsTest2Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderRequiredFieldsTest2Fragment$fragmentType,
  RelayReaderRequiredFieldsTest2Fragment$data,
>*/);
