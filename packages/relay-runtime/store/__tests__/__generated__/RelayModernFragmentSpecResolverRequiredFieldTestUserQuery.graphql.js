/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2a7442bc0bede3e4fb565ee2bb5e5aee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType = any;
export type RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernFragmentSpecResolverRequiredFieldTestUserQueryVariables = RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$variables;
export type RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType,
  |},
|};
export type RelayModernFragmentSpecResolverRequiredFieldTestUserQueryResponse = RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$data;
export type RelayModernFragmentSpecResolverRequiredFieldTestUserQuery = {|
  variables: RelayModernFragmentSpecResolverRequiredFieldTestUserQueryVariables,
  response: RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernFragmentSpecResolverRequiredFieldTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernFragmentSpecResolverRequiredFieldTestUserFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernFragmentSpecResolverRequiredFieldTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
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
                "name": "alternate_name",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f6915f8c156ba6e4a4caf45dcd4c59a0",
    "id": null,
    "metadata": {},
    "name": "RelayModernFragmentSpecResolverRequiredFieldTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernFragmentSpecResolverRequiredFieldTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernFragmentSpecResolverRequiredFieldTestUserFragment\n    id\n  }\n}\n\nfragment RelayModernFragmentSpecResolverRequiredFieldTestUserFragment on User {\n  id\n  name\n  alternate_name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7a8f1c7d05c71461bd82aa5538c96b3c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$variables,
  RelayModernFragmentSpecResolverRequiredFieldTestUserQuery$data,
>*/);
