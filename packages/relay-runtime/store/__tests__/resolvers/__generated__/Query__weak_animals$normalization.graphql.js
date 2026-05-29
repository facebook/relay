/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ab941fd3cc38bd0dea3418e5b15de110>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

import type { PurpleOctopus } from "../PurpleOctopusResolvers.js";
import type { RedOctopus } from "../RedOctopusResolvers.js";
export type Query__weak_animals$normalization = {
  readonly __typename: "PurpleOctopus",
  readonly __relay_model_instance: PurpleOctopus,
} | {
  readonly __typename: "RedOctopus",
  readonly __relay_model_instance: RedOctopus,
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
  "name": "Query__weak_animals$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": (v0/*:: as any*/),
          "type": "PurpleOctopus",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*:: as any*/),
          "type": "RedOctopus",
          "abstractKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;
