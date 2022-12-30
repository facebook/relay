/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<edd504f8cd7ec03106683ae307f27406>>
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
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType,
|};
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
  (node/*: any*/).hash = "3df3db2448c30de963aa83a02a7c8fb4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$data,
>*/);
