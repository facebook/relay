/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7bcca97f5fecd77ca0fd030d6b6e376f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest8Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest8Fragment$fragmentType: RelayResponseNormalizerTest8Fragment$ref;
export type RelayResponseNormalizerTest8Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayResponseNormalizerTest8Fragment$ref,
|};
export type RelayResponseNormalizerTest8Fragment$data = RelayResponseNormalizerTest8Fragment;
export type RelayResponseNormalizerTest8Fragment$key = {
  +$data?: RelayResponseNormalizerTest8Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest8Fragment$ref,
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

module.exports = node;
