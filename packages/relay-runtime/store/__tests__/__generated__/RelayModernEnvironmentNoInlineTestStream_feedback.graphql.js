/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<48cf47a24bdcca8c39a58719285f0f42>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestStream_feedback$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType: RelayModernEnvironmentNoInlineTestStream_feedback$ref;
export type RelayModernEnvironmentNoInlineTestStream_feedback = {|
  +actors: ?$ReadOnlyArray<?{|
    +name?: ?string,
  |}>,
  +$refType: RelayModernEnvironmentNoInlineTestStream_feedback$ref,
|};
export type RelayModernEnvironmentNoInlineTestStream_feedback$data = RelayModernEnvironmentNoInlineTestStream_feedback;
export type RelayModernEnvironmentNoInlineTestStream_feedback$key = {
  +$data?: RelayModernEnvironmentNoInlineTestStream_feedback$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTestStream_feedback$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTestStream_feedback",
  "selections": [
    {
      "kind": "Stream",
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
              "condition": "cond",
              "kind": "Condition",
              "passingValue": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ]
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "bdd5b05983f66ac33ad0d5b7cbf1179c";
}

module.exports = node;
