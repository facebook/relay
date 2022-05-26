/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a62e10102a2a5b1e0aeab4e4e5ae3b41>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ThrowBeforeReadResolver$fragmentType: FragmentType;
export type ThrowBeforeReadResolver$data = {|
  +me: ?{|
    +__id: string,
  |},
  +$fragmentType: ThrowBeforeReadResolver$fragmentType,
|};
export type ThrowBeforeReadResolver$key = {
  +$data?: ThrowBeforeReadResolver$data,
  +$fragmentSpreads: ThrowBeforeReadResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ThrowBeforeReadResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__id",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "37a575504decdabf92954b0254e47d35";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ThrowBeforeReadResolver$fragmentType,
  ThrowBeforeReadResolver$data,
>*/);
