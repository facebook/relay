/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a97e49700b6c3c6de7a873ad3bf0db10>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency fetchQueryInternalTest2Query.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"fetchQueryInternalTestMarkdownFragment_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"fetchQueryInternalTestPlainFragment_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { fetchQueryInternalTestMarkdownFragment_name$fragmentType } from "./fetchQueryInternalTestMarkdownFragment_name.graphql";
import type { fetchQueryInternalTestPlainFragment_name$fragmentType } from "./fetchQueryInternalTestPlainFragment_name.graphql";
export type fetchQueryInternalTest2Query$variables = {|
  id: string,
|};
export type fetchQueryInternalTest2Query$data = {|
  +node: ?{|
    +nameRenderer?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: fetchQueryInternalTestMarkdownFragment_name$fragmentType & fetchQueryInternalTestPlainFragment_name$fragmentType,
    |},
  |},
|};
export type fetchQueryInternalTest2Query = {|
  response: fetchQueryInternalTest2Query$data,
  variables: fetchQueryInternalTest2Query$variables,
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
      "documentName": "fetchQueryInternalTest2Query",
      "fragmentName": "fetchQueryInternalTestPlainFragment_name",
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
      "documentName": "fetchQueryInternalTest2Query",
      "fragmentName": "fetchQueryInternalTestMarkdownFragment_name",
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
    "name": "fetchQueryInternalTest2Query",
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
    "name": "fetchQueryInternalTest2Query",
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
    "cacheID": "aa31734259f5c793b5c7569f3e82f202",
    "id": null,
    "metadata": {},
    "name": "fetchQueryInternalTest2Query",
    "operationKind": "query",
    "text": "query fetchQueryInternalTest2Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderer {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...fetchQueryInternalTestPlainFragment_name\n          __module_operation_fetchQueryInternalTest2Query: js(module: \"fetchQueryInternalTestPlainFragment_name$normalization.graphql\", id: \"fetchQueryInternalTest2Query.node.nameRenderer\")\n          __module_component_fetchQueryInternalTest2Query: js(module: \"PlainUserNameRenderer.react\", id: \"fetchQueryInternalTest2Query.node.nameRenderer\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...fetchQueryInternalTestMarkdownFragment_name\n          __module_operation_fetchQueryInternalTest2Query: js(module: \"fetchQueryInternalTestMarkdownFragment_name$normalization.graphql\", id: \"fetchQueryInternalTest2Query.node.nameRenderer\")\n          __module_component_fetchQueryInternalTest2Query: js(module: \"MarkdownUserNameRenderer.react\", id: \"fetchQueryInternalTest2Query.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment fetchQueryInternalTestMarkdownFragment_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment fetchQueryInternalTestPlainFragment_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8b4e8e582a315c7b0003b5f190341462";
}

module.exports = ((node/*: any*/)/*: Query<
  fetchQueryInternalTest2Query$variables,
  fetchQueryInternalTest2Query$data,
>*/);
