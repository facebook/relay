/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<389a4bbc5d675d03a80c8e0815b91668>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

import type { WeakModel } from "../RelayResolverNullableModelClientEdge-test.js";
export type Query__edge_to_null_weak_model$normalization = {|
  +__relay_model_instance: WeakModel,
|};

*/

var node/*: NormalizationSplitOperation*/ = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "Query__edge_to_null_weak_model$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__relay_model_instance",
          "storageKey": null
        }
      ]
    }
  ]
};

module.exports = node;
