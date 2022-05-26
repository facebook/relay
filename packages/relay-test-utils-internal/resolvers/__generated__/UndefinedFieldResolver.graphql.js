/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0036a99300728976c162e04cabfbd15a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UndefinedFieldResolver$fragmentType: FragmentType;
export type UndefinedFieldResolver$data = {|
  +me: ?{|
    +__id: string,
  |},
  +$fragmentType: UndefinedFieldResolver$fragmentType,
|};
export type UndefinedFieldResolver$key = {
  +$data?: UndefinedFieldResolver$data,
  +$fragmentSpreads: UndefinedFieldResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UndefinedFieldResolver",
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
  (node/*: any*/).hash = "9f3068592a4c26f7ebac434bbd26a9e2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UndefinedFieldResolver$fragmentType,
  UndefinedFieldResolver$data,
>*/);
