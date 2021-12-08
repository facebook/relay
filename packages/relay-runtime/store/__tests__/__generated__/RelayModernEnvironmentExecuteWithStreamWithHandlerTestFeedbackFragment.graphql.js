/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<53a41069c275f0a8e72ea1d84f4ec8d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$ref = RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$data = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentType: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment = RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$data;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType,
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
  "name": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment",
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
          "alias": "actors",
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "__actors_actors_handler",
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
  (node/*: any*/).hash = "14e1d47e0efd1ccd53087601db2ad368";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$data,
>*/);
