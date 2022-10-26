/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4212623dc4cde667972034eaecf0e6e3>>
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
  "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "66782037b8711299a7b744a9ff2840c5";
}

module.exports = node;
