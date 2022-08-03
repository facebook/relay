/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5fad72fbfb22f5d305d85277d56a08d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency fetchQueryInternalTest3Query.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"fetchQueryInternalTestMarkdown1Fragment_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"fetchQueryInternalTestPlain1Fragment_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { fetchQueryInternalTestMarkdown1Fragment_name$fragmentType } from "./fetchQueryInternalTestMarkdown1Fragment_name.graphql";
import type { fetchQueryInternalTestPlain1Fragment_name$fragmentType } from "./fetchQueryInternalTestPlain1Fragment_name.graphql";
export type fetchQueryInternalTest3Query$variables = {|
  id: string,
|};
export type fetchQueryInternalTest3Query$data = {|
  +node: ?{|
    +nameRenderer?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: fetchQueryInternalTestMarkdown1Fragment_name$fragmentType & fetchQueryInternalTestPlain1Fragment_name$fragmentType,
    |},
  |},
|};
export type fetchQueryInternalTest3Query = {|
  response: fetchQueryInternalTest3Query$data,
  variables: fetchQueryInternalTest3Query$variables,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "fetchQueryInternalTest3Query",
      "fragmentName": "fetchQueryInternalTestPlain1Fragment_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "fetchQueryInternalTest3Query",
      "fragmentName": "fetchQueryInternalTestMarkdown1Fragment_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v4 = {
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
    "name": "fetchQueryInternalTest3Query",
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
                  (v3/*: any*/)
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "fetchQueryInternalTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v4/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "20f58db9aadbc02ce1b2f3d2173fda69",
    "id": null,
    "metadata": {},
    "name": "fetchQueryInternalTest3Query",
    "operationKind": "query",
    "text": "query fetchQueryInternalTest3Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderer {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...fetchQueryInternalTestPlain1Fragment_name\n          __module_operation_fetchQueryInternalTest3Query: js(module: \"fetchQueryInternalTestPlain1Fragment_name$normalization.graphql\", id: \"fetchQueryInternalTest3Query.node.nameRenderer\")\n          __module_component_fetchQueryInternalTest3Query: js(module: \"PlainUserNameRenderer.react\", id: \"fetchQueryInternalTest3Query.node.nameRenderer\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...fetchQueryInternalTestMarkdown1Fragment_name\n          __module_operation_fetchQueryInternalTest3Query: js(module: \"fetchQueryInternalTestMarkdown1Fragment_name$normalization.graphql\", id: \"fetchQueryInternalTest3Query.node.nameRenderer\")\n          __module_component_fetchQueryInternalTest3Query: js(module: \"MarkdownUserNameRenderer.react\", id: \"fetchQueryInternalTest3Query.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment fetchQueryInternalTestMarkdown1Fragment_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment fetchQueryInternalTestPlain1Fragment_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "75ae6c5d458245bd586c46fd64b355af";
}

module.exports = ((node/*: any*/)/*: Query<
  fetchQueryInternalTest3Query$variables,
  fetchQueryInternalTest3Query$data,
>*/);
