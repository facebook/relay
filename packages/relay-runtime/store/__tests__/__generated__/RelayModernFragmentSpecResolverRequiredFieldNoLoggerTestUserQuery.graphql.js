/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e3ccb1b954d826b1abead20ab94afe04>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref = any;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQueryVariables = {|
  id: string,
|};
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref,
  |},
|};
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQuery = {|
  variables: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQueryVariables,
  response: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQueryResponse,
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
    "name": "RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQuery",
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
            "name": "RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment"
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
    "name": "RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQuery",
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
    "cacheID": "74899528ef8d3d7eeca93945fbbf8d56",
    "id": null,
    "metadata": {},
    "name": "RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment\n    id\n  }\n}\n\nfragment RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment on User {\n  id\n  alternate_name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "509d57fcdf4027461a38077ba36fc41b";
}

module.exports = node;
