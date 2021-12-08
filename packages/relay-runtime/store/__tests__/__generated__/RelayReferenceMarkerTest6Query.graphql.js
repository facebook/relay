/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<67166aa8266085abdf4e71648cb9a604>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReferenceMarkerTest4Fragment$fragmentType = any;
export type RelayReferenceMarkerTest6Query$variables = {|
  id: string,
|};
export type RelayReferenceMarkerTest6QueryVariables = RelayReferenceMarkerTest6Query$variables;
export type RelayReferenceMarkerTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReferenceMarkerTest4Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest6QueryResponse = RelayReferenceMarkerTest6Query$data;
export type RelayReferenceMarkerTest6Query = {|
  variables: RelayReferenceMarkerTest6QueryVariables,
  response: RelayReferenceMarkerTest6Query$data,
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
    "name": "RelayReferenceMarkerTest6Query",
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
            "name": "RelayReferenceMarkerTest4Fragment"
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
    "name": "RelayReferenceMarkerTest6Query",
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
                "args": null,
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
                        "documentName": "RelayReferenceMarkerTest4Fragment",
                        "fragmentName": "RelayReferenceMarkerTest2PlainUserNameRenderer_name",
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
                        "documentName": "RelayReferenceMarkerTest4Fragment",
                        "fragmentName": "RelayReferenceMarkerTest2MarkdownUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "MarkdownUserNameRenderer",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
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
    "cacheID": "df050b81ec9225619e024c762c128121",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest6Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest6Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReferenceMarkerTest4Fragment\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTest2MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTest2PlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment RelayReferenceMarkerTest4Fragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayReferenceMarkerTest2PlainUserNameRenderer_name\n      __module_operation_RelayReferenceMarkerTest4Fragment: js(module: \"RelayReferenceMarkerTest2PlainUserNameRenderer_name$normalization.graphql\", id: \"RelayReferenceMarkerTest4Fragment.nameRenderer\")\n      __module_component_RelayReferenceMarkerTest4Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReferenceMarkerTest4Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayReferenceMarkerTest2MarkdownUserNameRenderer_name\n      __module_operation_RelayReferenceMarkerTest4Fragment: js(module: \"RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayReferenceMarkerTest4Fragment.nameRenderer\")\n      __module_component_RelayReferenceMarkerTest4Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayReferenceMarkerTest4Fragment.nameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f6c61057e6890addba331b5b9df9fbb6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest6Query$variables,
  RelayReferenceMarkerTest6Query$data,
>*/);
