/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7e3ead94f3881609475adb996dba4979>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType = any;
export type RelayModernEnvironmentTypeRefinementTest3Query$variables = {||};
export type RelayModernEnvironmentTypeRefinementTest3QueryVariables = RelayModernEnvironmentTypeRefinementTest3Query$variables;
export type RelayModernEnvironmentTypeRefinementTest3Query$data = {|
  +userOrPage: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTest3QueryResponse = RelayModernEnvironmentTypeRefinementTest3Query$data;
export type RelayModernEnvironmentTypeRefinementTest3Query = {|
  variables: RelayModernEnvironmentTypeRefinementTest3QueryVariables,
  response: RelayModernEnvironmentTypeRefinementTest3Query$data,
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
    "name": "RelayModernEnvironmentTypeRefinementTest3Query",
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
            "name": "RelayModernEnvironmentTypeRefinementTest5Fragment"
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
    "name": "RelayModernEnvironmentTypeRefinementTest3Query",
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
                "type": "Named",
                "abstractKey": "__isNamed"
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
    "cacheID": "9f7904cb586ea051d96378fdb0d07de0",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTest3Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTest3Query {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTest5Fragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest5Fragment on Actor {\n  __isActor: __typename\n  id\n  lastName\n  ...RelayModernEnvironmentTypeRefinementTest6Fragment\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest6Fragment on Named {\n  __isNamed: __typename\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "69d71c1ff828bb46f4cd52ffb90e99fa";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTest3Query$variables,
  RelayModernEnvironmentTypeRefinementTest3Query$data,
>*/);
