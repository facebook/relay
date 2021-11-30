/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<99ea1efca5ce7ee881a5cac60fc64d91>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReferenceMarkerTest5Fragment$fragmentType = any;
export type RelayReferenceMarkerTest7Query$variables = {|
  id: string,
|};
export type RelayReferenceMarkerTest7QueryVariables = RelayReferenceMarkerTest7Query$variables;
export type RelayReferenceMarkerTest7Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReferenceMarkerTest5Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest7QueryResponse = RelayReferenceMarkerTest7Query$data;
export type RelayReferenceMarkerTest7Query = {|
  variables: RelayReferenceMarkerTest7QueryVariables,
  response: RelayReferenceMarkerTest7Query$data,
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTest7Query",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayReferenceMarkerTest5Fragment"
              }
            ]
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
    "name": "RelayReferenceMarkerTest7Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "if": null,
            "kind": "Defer",
            "label": "RelayReferenceMarkerTest7Query$defer$TestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actors",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Feedback",
                "abstractKey": null
              }
            ]
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e4716e44543162b93456d46944d33b9d",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest7Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest7Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReferenceMarkerTest5Fragment @defer(label: \"RelayReferenceMarkerTest7Query$defer$TestFragment\")\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTest5Fragment on Feedback {\n  id\n  actors {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e9f37482cdecc3ffcf60ff0a5957ffab";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest7Query$variables,
  RelayReferenceMarkerTest7Query$data,
>*/);
