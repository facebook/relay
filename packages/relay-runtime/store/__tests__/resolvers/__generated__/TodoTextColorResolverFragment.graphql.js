/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<684b34b051376b40f9f01eff2fdb0e61>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoTextColorResolverFragment$fragmentType: FragmentType;
export type TodoTextColorResolverFragment$data = {|
  +hex: ?string,
  +$fragmentType: TodoTextColorResolverFragment$fragmentType,
|};
export type TodoTextColorResolverFragment$key = {
  +$data?: TodoTextColorResolverFragment$data,
  +$fragmentSpreads: TodoTextColorResolverFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoTextColorResolverFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "hex",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "TodoTextColor",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "90827e6d949c570b97d48215981743dd";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoTextColorResolverFragment$fragmentType,
  TodoTextColorResolverFragment$data,
>*/);
