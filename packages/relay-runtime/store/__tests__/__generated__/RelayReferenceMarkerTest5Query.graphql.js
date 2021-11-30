/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cd16a88730d298fe799721e074054cae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReferenceMarkerTest3Fragment$fragmentType = any;
export type RelayReferenceMarkerTest5Query$variables = {|
  id: string,
|};
export type RelayReferenceMarkerTest5QueryVariables = RelayReferenceMarkerTest5Query$variables;
export type RelayReferenceMarkerTest5Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReferenceMarkerTest3Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest5QueryResponse = RelayReferenceMarkerTest5Query$data;
export type RelayReferenceMarkerTest5Query = {|
  variables: RelayReferenceMarkerTest5QueryVariables,
  response: RelayReferenceMarkerTest5Query$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTest5Query",
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
            "name": "RelayReferenceMarkerTest3Fragment"
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
    "name": "RelayReferenceMarkerTest5Query",
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
                "args": [
                  {
                    "kind": "Literal",
                    "name": "supported",
                    "value": [
                      "PlainUserNameRenderer",
                      "MarkdownUserNameRenderer"
                    ]
                  }
                ],
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "RelayReferenceMarkerTest3Fragment",
                        "fragmentName": "RelayReferenceMarkerTestPlainUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "PlainUserNameRenderer",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "RelayReferenceMarkerTest3Fragment",
                        "fragmentName": "RelayReferenceMarkerTestMarkdownUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "MarkdownUserNameRenderer",
                    "abstractKey": null
                  }
                ],
                "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "cacheID": "e2a74e2111b8998f4977576d748fde07",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest5Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest5Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReferenceMarkerTest3Fragment\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTest3Fragment on User {\n  id\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayReferenceMarkerTestPlainUserNameRenderer_name\n      __module_operation_RelayReferenceMarkerTest3Fragment: js(module: \"RelayReferenceMarkerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayReferenceMarkerTest3Fragment.nameRenderer\")\n      __module_component_RelayReferenceMarkerTest3Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReferenceMarkerTest3Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayReferenceMarkerTestMarkdownUserNameRenderer_name\n      __module_operation_RelayReferenceMarkerTest3Fragment: js(module: \"RelayReferenceMarkerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayReferenceMarkerTest3Fragment.nameRenderer\")\n      __module_component_RelayReferenceMarkerTest3Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayReferenceMarkerTest3Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayReferenceMarkerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0788b1f4742c878888dfe9389e4d9de4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest5Query$variables,
  RelayReferenceMarkerTest5Query$data,
>*/);
