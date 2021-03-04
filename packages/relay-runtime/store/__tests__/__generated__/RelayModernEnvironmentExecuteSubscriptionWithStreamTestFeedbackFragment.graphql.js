/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0df3e56778fe4e2d673f7168b60007b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$ref;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$ref,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$data = RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$ref,
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

module.exports = node;
