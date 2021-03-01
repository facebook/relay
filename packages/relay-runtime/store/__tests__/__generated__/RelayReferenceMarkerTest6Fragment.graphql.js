/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f9891789ea5d7dc36aa405c68685ec42>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest6Fragment$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTest6Fragment$fragmentType: RelayReferenceMarkerTest6Fragment$ref;
export type RelayReferenceMarkerTest6Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayReferenceMarkerTest6Fragment$ref,
|};
export type RelayReferenceMarkerTest6Fragment$data = RelayReferenceMarkerTest6Fragment;
export type RelayReferenceMarkerTest6Fragment$key = {
  +$data?: RelayReferenceMarkerTest6Fragment$data,
  +$fragmentRefs: RelayReferenceMarkerTest6Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Stream",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "42c1c3d08a6628aeb1e110098093ad2a";
}

module.exports = node;
