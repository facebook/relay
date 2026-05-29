/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5cc6f116a6d5f8f733872e0ae9847360>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType } from "./ResolverFragmentSpreadsTestInlineFragmentSpread.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type ResolverFragmentSpreadsTestInlineFragment$fragmentType: FragmentType;
export type ResolverFragmentSpreadsTestInlineFragment$data = {
  readonly me: {
    readonly name: string,
    readonly $fragmentSpreads: ResolverFragmentSpreadsTestInlineFragmentSpread$fragmentType,
  },
  readonly $fragmentType: ResolverFragmentSpreadsTestInlineFragment$fragmentType,
};
export type ResolverFragmentSpreadsTestInlineFragment$key = {
  readonly $data?: ResolverFragmentSpreadsTestInlineFragment$data,
  readonly $fragmentSpreads: ResolverFragmentSpreadsTestInlineFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResolverFragmentSpreadsTestInlineFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            "action": "THROW"
          },
          {
            "kind": "InlineDataFragmentSpread",
            "name": "ResolverFragmentSpreadsTestInlineFragmentSpread",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StreetAddress",
                "kind": "LinkedField",
                "name": "address",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "street",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "city",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "args": null,
            "argumentDefinitions": []
          }
        ],
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "f70f83953e35182d89c857c901bacec4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ResolverFragmentSpreadsTestInlineFragment$fragmentType,
  ResolverFragmentSpreadsTestInlineFragment$data,
>*/);
