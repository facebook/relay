/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7d1bc9111660cb67690c116b1478212e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$ref;
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$data = RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment;
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$ref,
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

module.exports = node;
