/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c8fa703ec6ffc5b3ce2e675c85e5f1d0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest10Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest10Fragment$data = {
  readonly actors: ?ReadonlyArray<?({
    readonly __typename: "User",
    readonly actors: ?ReadonlyArray<?{
      readonly name: ?string,
    }>,
    readonly name: ?string,
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other",
  })>,
  readonly id: string,
  readonly $fragmentType: RelayResponseNormalizerTest10Fragment$fragmentType,
};
export type RelayResponseNormalizerTest10Fragment$key = {
  readonly $data?: RelayResponseNormalizerTest10Fragment$data,
  readonly $fragmentSpreads: RelayResponseNormalizerTest10Fragment$fragmentType,
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
