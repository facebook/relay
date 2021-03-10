/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<35feb4833b6d2fac9ff5e94c9b08d415>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$ref;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$ref,
  +$refType: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data = RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$ref,
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
  "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment",
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
    },
    {
      "kind": "Defer",
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment"
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "aa95f24c1b87abaaa8da5bc4f20bed07";
}

module.exports = node;
