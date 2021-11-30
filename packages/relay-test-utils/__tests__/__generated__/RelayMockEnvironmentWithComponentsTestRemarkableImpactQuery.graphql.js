/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fa7094ecb2dd2325cac0316ae9d62ab6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType = any;
export type RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$variables = {|
  id: string,
|};
export type RelayMockEnvironmentWithComponentsTestRemarkableImpactQueryVariables = RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$variables;
export type RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$data = {|
  +feedback: ?{|
    +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment$fragmentType,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestRemarkableImpactQueryResponse = RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$data;
export type RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestRemarkableImpactQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$data,
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
    "name": "RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery",
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
            "name": "RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment"
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
    "name": "RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery",
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
    "cacheID": "39bd5c820ff82c4f123544c8317c2b57",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery(\n  $id: ID!\n) {\n  feedback: node(id: $id) {\n    __typename\n    ...RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment\n    id\n  }\n}\n\nfragment RelayMockEnvironmentWithComponentsTestImpactfulAwesomenessFragment on Feedback {\n  id\n  message {\n    text\n  }\n  doesViewerLike\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9eedc32df7974b18aa138a63ffd62be9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$variables,
  RelayMockEnvironmentWithComponentsTestRemarkableImpactQuery$data,
>*/);
