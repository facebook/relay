/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<477c4c9c1a168da4a84ae3c142fb4e7f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTestStream_feedback$data = {
  readonly actors: ?ReadonlyArray<?{
    readonly name?: ?string,
  }>,
  readonly $fragmentType: RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
};
export type RelayModernEnvironmentNoInlineTestStream_feedback$key = {
  readonly $data?: RelayModernEnvironmentNoInlineTestStream_feedback$data,
  readonly $fragmentSpreads: RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
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
  (node/*:: as any*/).hash = "bdd5b05983f66ac33ad0d5b7cbf1179c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
  RelayModernEnvironmentNoInlineTestStream_feedback$data,
>*/);
