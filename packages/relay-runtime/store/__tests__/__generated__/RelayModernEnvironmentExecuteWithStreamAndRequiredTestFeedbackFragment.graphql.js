/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4fbc44eae1fc772b7d455b80dc0a92fa>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$data = ?{|
  +actors: ReadonlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Stream",
      "selections": [
        {
          "kind": "RequiredField",
          "field": {
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
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          "action": "LOG"
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "eafa3357931703c738a27fca219e0e48";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$data,
>*/);
