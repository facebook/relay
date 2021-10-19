/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b18b11ddb6e343acad7e5b82840fb6c8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$ref;
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment = ?{|
  +id: string,
  +actors: $ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$data = RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment;
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$ref,
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
          "action": "LOG",
          "path": "actors"
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "eafa3357931703c738a27fca219e0e48";
}

module.exports = node;
