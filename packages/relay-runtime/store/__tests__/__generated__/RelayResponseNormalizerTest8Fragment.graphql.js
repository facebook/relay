/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2190a8df10fec747bbfd673a8f47b09d>>
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
export type RelayResponseNormalizerTest8Fragment$ref = RelayResponseNormalizerTest8Fragment$fragmentType;
export type RelayResponseNormalizerTest8Fragment$data = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayResponseNormalizerTest8Fragment$fragmentType,
  +$fragmentType: RelayResponseNormalizerTest8Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest8Fragment = RelayResponseNormalizerTest8Fragment$data;
export type RelayResponseNormalizerTest8Fragment$key = {
  +$data?: RelayResponseNormalizerTest8Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest8Fragment$fragmentType,
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
  (node/*: any*/).hash = "d5aed3c15317f147cd0c25e6b92a5d1f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest8Fragment$fragmentType,
  RelayResponseNormalizerTest8Fragment$data,
>*/);
