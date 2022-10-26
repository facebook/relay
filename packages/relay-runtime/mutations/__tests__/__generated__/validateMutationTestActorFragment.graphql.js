/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<40535150cdc92d9429aa8b262a6a1e17>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type validateMutationTestActorFragment$fragmentType: FragmentType;
export type validateMutationTestActorFragment$data = {|
  +birthdate?: ?{|
    +day: ?number,
    +month: ?number,
    +year: ?number,
  |},
  +username?: ?string,
  +$fragmentType: validateMutationTestActorFragment$fragmentType,
|};
export type validateMutationTestActorFragment$key = {
  +$data?: validateMutationTestActorFragment$data,
  +$fragmentSpreads: validateMutationTestActorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "validateMutationTestActorFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Date",
          "kind": "LinkedField",
          "name": "birthdate",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "day",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "month",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "year",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "User",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        }
      ],
      "type": "Page",
      "abstractKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "873cc2cdc37ef1f99fed218a8b9caf0f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  validateMutationTestActorFragment$fragmentType,
  validateMutationTestActorFragment$data,
>*/);
