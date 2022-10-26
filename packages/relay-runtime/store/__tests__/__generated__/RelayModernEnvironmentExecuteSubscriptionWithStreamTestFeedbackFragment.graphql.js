/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ce1553e0067dab6e9a7387d660a178ec>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment",
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
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": "name",
              "args": null,
              "kind": "ScalarField",
              "name": "__name_name_handler",
              "storageKey": null
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
  (node/*: any*/).hash = "01fb16bc08c2b85ceba94ab5813c8d70";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$data,
>*/);
