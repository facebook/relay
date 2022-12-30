/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5247ebf727422404227e47202b3c6fdf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest8Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest8Fragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayResponseNormalizerTest8Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest8Fragment$key = {
  +$data?: RelayResponseNormalizerTest8Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest8Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest8Fragment",
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
  (node/*: any*/).hash = "f869887798abd703516db8fdfe9b5bd8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest8Fragment$fragmentType,
  RelayResponseNormalizerTest8Fragment$data,
>*/);
