/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5d84f0889b5e2421f0b2bdc8f7f20484>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
|};
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
  (node/*: any*/).hash = "dd84cef826e37f8fbe7f857d65daad48";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data,
>*/);
