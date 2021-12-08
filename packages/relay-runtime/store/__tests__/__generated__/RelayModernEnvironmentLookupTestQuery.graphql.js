/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6b7819ca0feb9f11829c3bf465970989>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentLookupTestQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentLookupTestQueryVariables = RelayModernEnvironmentLookupTestQuery$variables;
export type RelayModernEnvironmentLookupTestQuery$data = {|
  +__id: string,
  +me: ?{|
    +__id: string,
    +__typename: string,
    +id: string,
  |},
  +node: ?{|
    +__id: string,
    +__typename: string,
    +id: string,
    +commentBody?: ?{|
      +__id: string,
      +__typename: string,
      +text?: ?{|
        +__id: string,
        +__typename: string,
        +text: ?string,
      |},
    |},
  |},
|};
export type RelayModernEnvironmentLookupTestQueryResponse = RelayModernEnvironmentLookupTestQuery$data;
export type RelayModernEnvironmentLookupTestQuery = {|
  variables: RelayModernEnvironmentLookupTestQueryVariables,
  response: RelayModernEnvironmentLookupTestQuery$data,
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v4 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "me",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "supported",
                "value": [
                  "PlainCommentBody"
                ]
              }
            ],
            "concreteType": null,
            "kind": "LinkedField",
            "name": "commentBody",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Text",
                    "kind": "LinkedField",
                    "name": "text",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "text",
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v3/*: any*/)
                ],
                "type": "PlainCommentBody",
                "abstractKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": "commentBody(supported:[\"PlainCommentBody\"])"
          }
        ],
        "type": "Comment",
        "abstractKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  },
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentLookupTestQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentLookupTestQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "200d36d0a47ffc528a3c4df53b03401f",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentLookupTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentLookupTestQuery(\n  $id: ID!\n) {\n  me {\n    __typename\n    id\n  }\n  node(id: $id) {\n    __typename\n    id\n    ... on Comment {\n      commentBody(supported: [\"PlainCommentBody\"]) {\n        __typename\n        ... on PlainCommentBody {\n          text {\n            __typename\n            text\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bea49102c3069567ca430f28d38ba916";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentLookupTestQuery$variables,
  RelayModernEnvironmentLookupTestQuery$data,
>*/);
