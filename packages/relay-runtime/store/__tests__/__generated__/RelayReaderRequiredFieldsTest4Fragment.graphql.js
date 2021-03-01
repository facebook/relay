/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7a6a146b48959f8790b8922bde8d4195>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest4Fragment$ref: FragmentReference;
declare export opaque type RelayReaderRequiredFieldsTest4Fragment$fragmentType: RelayReaderRequiredFieldsTest4Fragment$ref;
export type RelayReaderRequiredFieldsTest4Fragment = ?{|
  +me: {|
    +lastName: string,
  |},
  +$refType: RelayReaderRequiredFieldsTest4Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest4Fragment$data = RelayReaderRequiredFieldsTest4Fragment;
export type RelayReaderRequiredFieldsTest4Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest4Fragment$data,
  +$fragmentRefs: RelayReaderRequiredFieldsTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest4Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lastName",
              "storageKey": null
            },
            "action": "LOG",
            "path": "me.lastName"
          }
        ],
        "storageKey": null
      },
      "action": "LOG",
      "path": "me"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d7f205cf08433933dc07eab03eb39cee";
}

module.exports = node;
