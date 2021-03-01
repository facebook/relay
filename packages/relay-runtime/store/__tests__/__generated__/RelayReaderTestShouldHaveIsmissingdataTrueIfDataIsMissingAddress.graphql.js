/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<93ebd20a5a80552061a0ab0f27b24484>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$ref;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress = {|
  +id: string,
  +address: ?{|
    +city: ?string,
  |},
  +$refType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$ref,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$data = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$data,
  +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingAddress",
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
      "concreteType": "StreetAddress",
      "kind": "LinkedField",
      "name": "address",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "city",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5b1311ee9c983b135f1bbe6eca618721";
}

module.exports = node;
