/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ab34f0e5b24bdcbb133874fcf0d9f57>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest9Fragment$ref = any;
export type RelayModernEnvironmentTypeRefinementTest5QueryVariables = {||};
export type RelayModernEnvironmentTypeRefinementTest5QueryResponse = {|
  +userOrPage: ?{|
    +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest9Fragment$ref,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTest5Query = {|
  variables: RelayModernEnvironmentTypeRefinementTest5QueryVariables,
  response: RelayModernEnvironmentTypeRefinementTest5QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "abc"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentTypeRefinementTest5Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "userOrPage",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTest9Fragment"
          }
        ],
        "storageKey": "userOrPage(id:\"abc\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentTypeRefinementTest5Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "userOrPage",
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
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lastName",
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
                  }
                ],
                "type": "User",
                "abstractKey": null
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": "userOrPage(id:\"abc\")"
      }
    ]
  },
  "params": {
    "cacheID": "a8d829476e40b6136a8dcd25653d64a5",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTest5Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTest5Query {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTest9Fragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest10Fragment on User {\n  name\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest9Fragment on Actor {\n  __isActor: __typename\n  id\n  lastName\n  ...RelayModernEnvironmentTypeRefinementTest10Fragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "44a6f6a48ad431517c8ff66ac7b1e475";
}

module.exports = node;
