/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<345f94584c1cd2da4619055bc053dd8c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest9Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest9Fragment$fragmentType: RelayResponseNormalizerTest9Fragment$ref;
export type RelayResponseNormalizerTest9Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayResponseNormalizerTest9Fragment$ref,
|};
export type RelayResponseNormalizerTest9Fragment$data = RelayResponseNormalizerTest9Fragment;
export type RelayResponseNormalizerTest9Fragment$key = {
  +$data?: RelayResponseNormalizerTest9Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest9Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest9Fragment",
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
  (node/*: any*/).hash = "b0cf187c649d10ea7929de096205c7cf";
}

module.exports = node;
