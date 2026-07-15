/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<20e1a6ba9a032997df9d5ab8e97892f3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

import type { ShadowWeakAlpha } from "../ShadowWeakAlphaResolvers.js";
import type { ShadowWeakBeta } from "../ShadowWeakBetaResolvers.js";
export type Query__shadow_weak_duo$normalization = {
  readonly __typename: "ShadowWeakAlpha",
  readonly __relay_model_instance: ShadowWeakAlpha,
} | {
  readonly __typename: "ShadowWeakBeta",
  readonly __relay_model_instance: ShadowWeakBeta,
};

*/

var node/*: NormalizationSplitOperation*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__relay_model_instance",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__typename",
    "storageKey": null
  }
];
return {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "Query__shadow_weak_duo$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": (v0/*:: as any*/),
          "type": "ShadowWeakAlpha",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*:: as any*/),
          "type": "ShadowWeakBeta",
          "abstractKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;
