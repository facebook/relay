/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<95b83bdc6bd0b02dcaf343e68c8e7782>>
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
export type Query__weak_animal$normalization = {|
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
  "name": "Query__weak_animal$normalization",
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
