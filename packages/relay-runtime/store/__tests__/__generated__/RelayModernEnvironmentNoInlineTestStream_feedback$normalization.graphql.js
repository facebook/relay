/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4a3f3f024f1b59c9a01ade24ebdae249>>
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
      "metadata": null,
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
      ],
      "useCustomizedBatch": null
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "bdd5b05983f66ac33ad0d5b7cbf1179c";
}

module.exports = node;
