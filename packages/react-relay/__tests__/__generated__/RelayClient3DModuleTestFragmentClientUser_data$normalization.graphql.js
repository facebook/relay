/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4d5e372ccabdc7786f02978552ec4326>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayClient3DModuleTestFragmentClientUser_data$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "name": "data",
          "args": null,
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "name": "__relay_model_instance",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "id",
                      "storageKey": null
                    }
                  ],
                  "type": "ClientUser",
                  "abstractKey": null
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": false
              }
            ],
            "type": "ClientUser",
            "abstractKey": null
          },
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "adbab56e5ede85b3aa2d238188eef45e";
}

module.exports = node;
