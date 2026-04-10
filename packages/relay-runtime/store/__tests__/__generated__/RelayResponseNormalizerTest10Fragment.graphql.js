/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<70f0e62e1672e31ef3e540af2839563b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest10Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest10Fragment$data = {|
  +actors: ?ReadonlyArray<?({|
    +__typename: "User",
    +actors: ?ReadonlyArray<?{|
      +name: ?string,
    |}>,
    +name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |})>,
  +id: string,
  +$fragmentType: RelayResponseNormalizerTest10Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest10Fragment$key = {
  +$data?: RelayResponseNormalizerTest10Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest10Fragment$fragmentType,
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
            (v0/*:: as any*/),
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
                    (v0/*:: as any*/)
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
  (node/*:: as any*/).hash = "8c389e04433fbf8aaa29700855a45351";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest10Fragment$fragmentType,
  RelayResponseNormalizerTest10Fragment$data,
>*/);
