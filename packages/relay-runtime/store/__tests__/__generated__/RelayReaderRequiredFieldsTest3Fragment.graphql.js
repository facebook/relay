/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ab750f04d686654bea31f1f64489650>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest3Fragment$ref: FragmentReference;
declare export opaque type RelayReaderRequiredFieldsTest3Fragment$fragmentType: RelayReaderRequiredFieldsTest3Fragment$ref;
export type RelayReaderRequiredFieldsTest3Fragment = ?{|
  +me: {|
    +lastName: string,
  |},
  +$refType: RelayReaderRequiredFieldsTest3Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest3Fragment$data = RelayReaderRequiredFieldsTest3Fragment;
export type RelayReaderRequiredFieldsTest3Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest3Fragment$data,
  +$fragmentRefs: RelayReaderRequiredFieldsTest3Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest3Fragment",
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
  (node/*: any*/).hash = "d4ab0530862820fe6aff8595b3700bd9";
}

module.exports = node;
