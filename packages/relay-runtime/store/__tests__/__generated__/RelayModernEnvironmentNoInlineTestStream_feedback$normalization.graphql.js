/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f6bbc35ac9c16ec8d19b13c9b014290d>>
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
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "RelayModernEnvironmentNoInlineTestStream_feedback$cond"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentNoInlineTestStream_feedback$normalization",
  "selections": [
    {
      "if": null,
      "kind": "Stream",
      "label": "RelayModernEnvironmentNoInlineTestStream_feedback$stream$actors",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            {
              "condition": "RelayModernEnvironmentNoInlineTestStream_feedback$cond",
              "kind": "Condition",
              "passingValue": true,
              "selections": [
                {
                  "kind": "TypeDiscriminator",
                  "abstractKey": "__isActor"
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ]
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
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "a7b8f535cc74b4b0582563a2e68be921";
}

module.exports = node;
