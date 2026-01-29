/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<195acd937441a172e61fc12c102ef67a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest6Fragment$fragmentType: FragmentType;
export type RelayReferenceMarkerTest6Fragment$data = {|
  +actors: ?ReadonlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayReferenceMarkerTest6Fragment$fragmentType,
|};
export type RelayReferenceMarkerTest6Fragment$key = {
  +$data?: RelayReferenceMarkerTest6Fragment$data,
  +$fragmentSpreads: RelayReferenceMarkerTest6Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTest6Fragment$fragmentType,
  RelayReferenceMarkerTest6Fragment$data,
>*/);
