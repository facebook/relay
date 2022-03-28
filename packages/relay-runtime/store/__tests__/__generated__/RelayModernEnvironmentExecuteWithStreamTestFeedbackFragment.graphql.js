/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<22032f002831b475eae28fbf7e9280d7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType,
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
  "name": "RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment",
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
  (node/*: any*/).hash = "75614aa8afc63b7f8aa69d720053bded";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$data,
>*/);
