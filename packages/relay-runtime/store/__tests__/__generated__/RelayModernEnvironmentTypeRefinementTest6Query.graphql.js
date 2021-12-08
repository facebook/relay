/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9e8ef639d08fce3631c49195e830210>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType = any;
export type RelayModernEnvironmentTypeRefinementTest6Query$variables = {||};
export type RelayModernEnvironmentTypeRefinementTest6QueryVariables = RelayModernEnvironmentTypeRefinementTest6Query$variables;
export type RelayModernEnvironmentTypeRefinementTest6Query$data = {|
  +userOrPage: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTest6QueryResponse = RelayModernEnvironmentTypeRefinementTest6Query$data;
export type RelayModernEnvironmentTypeRefinementTest6Query = {|
  variables: RelayModernEnvironmentTypeRefinementTest6QueryVariables,
  response: RelayModernEnvironmentTypeRefinementTest6Query$data,
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
    "name": "RelayModernEnvironmentTypeRefinementTest6Query",
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
            "name": "RelayModernEnvironmentTypeRefinementTest11Fragment"
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
    "name": "RelayModernEnvironmentTypeRefinementTest6Query",
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
              }
            ],
            "type": "User",
            "abstractKey": null
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
    "cacheID": "6d7cea247106718129120a13b608ff05",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTest6Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTest6Query {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTest11Fragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest11Fragment on User {\n  ... on Actor {\n    __isActor: __typename\n    id\n    lastName\n    ...RelayModernEnvironmentTypeRefinementTest12Fragment\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest12Fragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8a7b0811d0016fa43cbdb871c6825a8e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTest6Query$variables,
  RelayModernEnvironmentTypeRefinementTest6Query$data,
>*/);
