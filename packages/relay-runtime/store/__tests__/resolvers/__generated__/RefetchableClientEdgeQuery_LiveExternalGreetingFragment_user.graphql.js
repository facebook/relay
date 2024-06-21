/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<28f257fe1aeac1511dcfef10e4fdcaf8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$fragmentType: FragmentType;
type ClientEdgeQuery_LiveExternalGreetingFragment_user$variables = any;
export type RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$fragmentType,
|};
export type RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$key = {
  +$data?: RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$fragmentType,
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
        "node"
      ],
      "operation": require('./ClientEdgeQuery_LiveExternalGreetingFragment_user.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d99958d995a71b9db58b73932515179f";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$fragmentType,
  RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$data,
  ClientEdgeQuery_LiveExternalGreetingFragment_user$variables,
>*/);
