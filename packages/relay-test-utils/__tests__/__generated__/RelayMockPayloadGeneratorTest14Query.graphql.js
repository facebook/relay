/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f6c992fcd72f7d7e13b0885bd88a2535>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayMockPayloadGeneratorTest14Fragment$ref = any;
export type RelayMockPayloadGeneratorTest14QueryVariables = {|
  smallScale?: ?number,
  bigScale?: ?number,
|};
export type RelayMockPayloadGeneratorTest14QueryResponse = {|
  +node: ?{|
    +$fragmentRefs: RelayMockPayloadGeneratorTest14Fragment$ref,
  |},
|};
export type RelayMockPayloadGeneratorTest14Query = {|
  variables: RelayMockPayloadGeneratorTest14QueryVariables,
  response: RelayMockPayloadGeneratorTest14QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": 100,
  "kind": "LocalArgument",
  "name": "bigScale"
},
v1 = {
  "defaultValue": 1,
  "kind": "LocalArgument",
  "name": "smallScale"
},
v2 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest14Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest14Fragment"
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest14Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                "alias": "smallImage",
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "smallScale"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              },
              {
                "alias": "bigImage",
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "bigScale"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "a1a63d65a46626e2c15b2597720005e3",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest14Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest14Query(\n  $smallScale: Int = 1\n  $bigScale: Int = 100\n) {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest14Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest14Fragment on User {\n  id\n  name\n  smallImage: profile_picture(scale: $smallScale) {\n    uri\n  }\n  bigImage: profile_picture(scale: $bigScale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d131dd86a63779a30fcccad4262a2c77";
}

module.exports = node;
