/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7c2c05ec0d836f9fab77060b8dc4447e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest1Fragment$fragmentType: FragmentType;
type useRefetchableFragmentNodeTest1FragmentRefetchQuery$variables = any;
export type useRefetchableFragmentNodeTest1Fragment$data = {|
  +__token: string,
  +actor: ?{|
    +name: ?string,
  |},
  +fetch_id: string,
  +$fragmentType: useRefetchableFragmentNodeTest1Fragment$fragmentType,
|};
export type useRefetchableFragmentNodeTest1Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest1Fragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "fetch__NonNodeStory"
      ],
      "operation": require('./useRefetchableFragmentNodeTest1FragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "fetch_id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "useRefetchableFragmentNodeTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
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
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fetch_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__token",
      "storageKey": null
    }
  ],
  "type": "NonNodeStory",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5edfb0ad9be0c72a1ba5d714bff331ae";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useRefetchableFragmentNodeTest1Fragment$fragmentType,
  useRefetchableFragmentNodeTest1Fragment$data,
  useRefetchableFragmentNodeTest1FragmentRefetchQuery$variables,
>*/);
