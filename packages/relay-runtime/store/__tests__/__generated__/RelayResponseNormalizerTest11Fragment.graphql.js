/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e491078e589ff04ac41171bd43979aa8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest11Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest11Fragment$ref = RelayResponseNormalizerTest11Fragment$fragmentType;
export type RelayResponseNormalizerTest11Fragment$data = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentType: RelayResponseNormalizerTest11Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest11Fragment = RelayResponseNormalizerTest11Fragment$data;
export type RelayResponseNormalizerTest11Fragment$key = {
  +$data?: RelayResponseNormalizerTest11Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest11Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest11Fragment",
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
  (node/*: any*/).hash = "7e79f0491ae7de39d3dbabc52e6f0de1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest11Fragment$fragmentType,
  RelayResponseNormalizerTest11Fragment$data,
>*/);
