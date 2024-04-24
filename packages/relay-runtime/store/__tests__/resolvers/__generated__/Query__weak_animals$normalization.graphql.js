/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<782803abb3250f42d9b6fe3b8055e3db>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

import type { Octopus } from "../OctopusResolvers.js";
import type { PurpleOctopus } from "../PurpleOctopusResolvers.js";
export type Query__weak_animals$normalization = {|
  +__typename: "Octopus",
  +__relay_model_instance: Octopus,
|} | {|
  +__typename: "PurpleOctopus",
  +__relay_model_instance: PurpleOctopus,
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
  "name": "Query__weak_animals$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "Octopus",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "PurpleOctopus",
          "abstractKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;
