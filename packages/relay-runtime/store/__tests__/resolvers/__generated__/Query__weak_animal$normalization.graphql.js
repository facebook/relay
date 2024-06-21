/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<31d6ff1e0c9d59015ae3c217b6c8de59>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

import type { PurpleOctopus } from "../PurpleOctopusResolvers.js";
import type { RedOctopus } from "../RedOctopusResolvers.js";
export type Query__weak_animal$normalization = {|
  +__typename: "PurpleOctopus",
  +__relay_model_instance: PurpleOctopus,
|} | {|
  +__typename: "RedOctopus",
  +__relay_model_instance: RedOctopus,
|};

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
  "name": "Query__weak_animal$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "PurpleOctopus",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "RedOctopus",
          "abstractKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;
