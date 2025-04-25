/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7ee97a7492fdfb892ba011e0510d4533>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ClientEdgeToClientObjectTestClientRootFragment$fragmentType: FragmentType;
export type ClientEdgeToClientObjectTestClientRootFragment$data = {|
  +id: string,
  +$fragmentType: ClientEdgeToClientObjectTestClientRootFragment$fragmentType,
|};
export type ClientEdgeToClientObjectTestClientRootFragment$key = {
  +$data?: ClientEdgeToClientObjectTestClientRootFragment$data,
  +$fragmentSpreads: ClientEdgeToClientObjectTestClientRootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientEdgeToClientObjectTestClientRootFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "RequiredField",
          "field": {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          "action": "THROW"
        }
      ]
    }
  ],
  "type": "ClientAccount",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "fc0607064767927b602ce35d27d276db";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ClientEdgeToClientObjectTestClientRootFragment$fragmentType,
  ClientEdgeToClientObjectTestClientRootFragment$data,
>*/);
