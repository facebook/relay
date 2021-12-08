/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<620bba960d772c0e7ef61e2864f38b06>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$ref = RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment = RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data,
>*/);
