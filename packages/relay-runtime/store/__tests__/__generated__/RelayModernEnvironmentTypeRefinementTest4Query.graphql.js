/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f2535914d69dee3b718876841bfd7729>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType = any;
export type RelayModernEnvironmentTypeRefinementTest4Query$variables = {||};
export type RelayModernEnvironmentTypeRefinementTest4QueryVariables = RelayModernEnvironmentTypeRefinementTest4Query$variables;
export type RelayModernEnvironmentTypeRefinementTest4Query$data = {|
  +userOrPage: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTest4QueryResponse = RelayModernEnvironmentTypeRefinementTest4Query$data;
export type RelayModernEnvironmentTypeRefinementTest4Query = {|
  variables: RelayModernEnvironmentTypeRefinementTest4QueryVariables,
  response: RelayModernEnvironmentTypeRefinementTest4Query$data,
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
    "name": "RelayModernEnvironmentTypeRefinementTest4Query",
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
            "name": "RelayModernEnvironmentTypeRefinementTest7Fragment"
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
    "name": "RelayModernEnvironmentTypeRefinementTest4Query",
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
                    "type": "Named",
                    "abstractKey": "__isNamed"
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
    "cacheID": "ee9b167d53d6825c7ce6f8a16975bcd5",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTest4Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTest4Query {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTest7Fragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest7Fragment on User {\n  ... on Actor {\n    __isActor: __typename\n    id\n    lastName\n    ...RelayModernEnvironmentTypeRefinementTest8Fragment\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest8Fragment on Named {\n  __isNamed: __typename\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a58fd2e641e7c6652209199221c50e34";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTest4Query$variables,
  RelayModernEnvironmentTypeRefinementTest4Query$data,
>*/);
