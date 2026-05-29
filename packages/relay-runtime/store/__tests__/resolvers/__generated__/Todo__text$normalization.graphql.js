/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<252759b3d872bb5a0b907dc88fe21d02>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type Todo__text$normalization = {
  readonly content: string,
  readonly style: ?{
    readonly color: ?{
      readonly hex: ?string,
    },
    readonly font_style: ?string,
  },
};

*/

var node/*: NormalizationSplitOperation*/ = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "Todo__text$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TodoTextStyle",
          "kind": "LinkedField",
          "name": "style",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "font_style",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "TodoTextColor",
              "kind": "LinkedField",
              "name": "color",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "hex",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "content",
          "storageKey": null
        }
      ]
    }
  ]
};

module.exports = node;
