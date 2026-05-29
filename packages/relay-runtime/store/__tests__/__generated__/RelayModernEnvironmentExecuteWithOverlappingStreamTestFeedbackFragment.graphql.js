/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f63c1c2c580a2f20ca68a1300616b3fd>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data = {
  readonly actors: ?ReadonlyArray<?{
    readonly name: ?string,
  }>,
  readonly id: string,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
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
  (node/*:: as any*/).hash = "aa95f24c1b87abaaa8da5bc4f20bed07";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$data,
>*/);
