/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f115443d08bdd268bdfd9157a154eddd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTestStream_feedback$ref = RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType;
export type RelayModernEnvironmentNoInlineTestStream_feedback$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name?: ?string,
  |}>,
  +$fragmentType: RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTestStream_feedback = RelayModernEnvironmentNoInlineTestStream_feedback$data;
export type RelayModernEnvironmentNoInlineTestStream_feedback$key = {
  +$data?: RelayModernEnvironmentNoInlineTestStream_feedback$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
  RelayModernEnvironmentNoInlineTestStream_feedback$data,
>*/);
