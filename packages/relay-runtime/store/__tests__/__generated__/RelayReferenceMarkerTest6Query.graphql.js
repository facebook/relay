/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<66589315ffaeb5dae7119d5549099af0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @indirectDataDrivenDependency RelayReferenceMarkerTest4Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReferenceMarkerTest2PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReferenceMarkerTest4Fragment$fragmentType } from "./RelayReferenceMarkerTest4Fragment.graphql";
export type RelayReferenceMarkerTest6Query$variables = {|
  id: string,
|};
export type RelayReferenceMarkerTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReferenceMarkerTest4Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest6Query = {|
  response: RelayReferenceMarkerTest6Query$data,
  variables: RelayReferenceMarkerTest6Query$variables,
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
  (node/*: any*/).hash = "c11d69bf3fe2868cfc206f53c56cbc72";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest6Query$variables,
  RelayReferenceMarkerTest6Query$data,
>*/);
