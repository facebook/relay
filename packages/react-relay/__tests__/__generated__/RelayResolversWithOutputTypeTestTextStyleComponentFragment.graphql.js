/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<829b65ed118d17272f9729571395ec55>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayResolversWithOutputTypeTestTextColorComponentFragment$fragmentType } from "./RelayResolversWithOutputTypeTestTextColorComponentFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolversWithOutputTypeTestTextStyleComponentFragment$fragmentType: FragmentType;
export type RelayResolversWithOutputTypeTestTextStyleComponentFragment$data = {|
  +color: ?{|
    +$fragmentSpreads: RelayResolversWithOutputTypeTestTextColorComponentFragment$fragmentType,
  |},
  +font_style: ?string,
  +$fragmentType: RelayResolversWithOutputTypeTestTextStyleComponentFragment$fragmentType,
|};
export type RelayResolversWithOutputTypeTestTextStyleComponentFragment$key = {
  +$data?: RelayResolversWithOutputTypeTestTextStyleComponentFragment$data,
  +$fragmentSpreads: RelayResolversWithOutputTypeTestTextStyleComponentFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolversWithOutputTypeTestTextStyleComponentFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "font_style",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "TodoTextColor",
          "kind": "LinkedField",
          "name": "color",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolversWithOutputTypeTestTextColorComponentFragment"
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "TodoTextStyle",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9f15dca0d6df64fa652a4dc5b48244fa";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolversWithOutputTypeTestTextStyleComponentFragment$fragmentType,
  RelayResolversWithOutputTypeTestTextStyleComponentFragment$data,
>*/);
