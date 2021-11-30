/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6c034af418fa8dea8cf289e08500688b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType = any;
export type RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$variables = {|
  id: string,
|};
export type RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQueryVariables = RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$variables;
export type RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$data = {|
  +feedback: ?{|
    +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestNoticeableResultFragment$fragmentType,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQueryResponse = RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$data;
export type RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$data,
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
    "name": "RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery",
    "selections": [
      {
        "alias": "feedback",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockEnvironmentWithComponentsTestNoticeableResultFragment"
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
    "name": "RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery",
    "selections": [
      {
        "alias": "feedback",
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
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "message",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "text",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "doesViewerLike",
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "06542714afbde4ed76c442b3a95d94f8",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery(\n  $id: ID!\n) {\n  feedback: node(id: $id) {\n    __typename\n    ...RelayMockEnvironmentWithComponentsTestNoticeableResultFragment\n    id\n  }\n}\n\nfragment RelayMockEnvironmentWithComponentsTestNoticeableResultFragment on Feedback {\n  id\n  message {\n    text\n  }\n  doesViewerLike\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ac58d11ae357d8162d5c45b77ca2c4a1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$variables,
  RelayMockEnvironmentWithComponentsTestWorldClassAwesomenessQuery$data,
>*/);
