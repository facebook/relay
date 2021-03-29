/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<71d8014e2c421ccc82615cabaee2fa8b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest11Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest11Fragment$fragmentType: RelayResponseNormalizerTest11Fragment$ref;
export type RelayResponseNormalizerTest11Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayResponseNormalizerTest11Fragment$ref,
|};
export type RelayResponseNormalizerTest11Fragment$data = RelayResponseNormalizerTest11Fragment;
export type RelayResponseNormalizerTest11Fragment$key = {
  +$data?: RelayResponseNormalizerTest11Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest11Fragment$ref,
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

module.exports = node;
