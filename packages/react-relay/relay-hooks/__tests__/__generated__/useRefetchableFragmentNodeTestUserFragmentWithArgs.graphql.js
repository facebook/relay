/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7794d486d753cec98e1680f705d910b6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { useRefetchableFragmentNodeTestNestedUserFragment$fragmentType } from "./useRefetchableFragmentNodeTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType: FragmentType;
type useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery$variables = any;
export type useRefetchableFragmentNodeTestUserFragmentWithArgs$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useRefetchableFragmentNodeTestNestedUserFragment$fragmentType,
  +$fragmentType: useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType,
|};
export type useRefetchableFragmentNodeTestUserFragmentWithArgs$key = {
  +$data?: useRefetchableFragmentNodeTestUserFragmentWithArgs$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scaleLocal"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "useRefetchableFragmentNodeTestUserFragmentWithArgs",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scaleLocal"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useRefetchableFragmentNodeTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "66560c7839480e9e6d2891c5dbcd2039";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType,
  useRefetchableFragmentNodeTestUserFragmentWithArgs$data,
  useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery$variables,
>*/);
