/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<31ebd6afd93f7af65bca297ff5ced8f9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest10Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest10Fragment$fragmentType: RelayResponseNormalizerTest10Fragment$ref;
export type RelayResponseNormalizerTest10Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name?: ?string,
    +actors?: ?$ReadOnlyArray<?{|
      +name: ?string,
    |}>,
  |}>,
  +$refType: RelayResponseNormalizerTest10Fragment$ref,
|};
export type RelayResponseNormalizerTest10Fragment$data = RelayResponseNormalizerTest10Fragment;
export type RelayResponseNormalizerTest10Fragment$key = {
  +$data?: RelayResponseNormalizerTest10Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest10Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest10Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actors",
      "plural": true,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
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
                    (v0/*: any*/)
                  ],
                  "storageKey": null
                }
              ]
            }
          ],
          "type": "User",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8c389e04433fbf8aaa29700855a45351";
}

module.exports = node;
