/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<caa2d796a37a9da6330a99bddf8059bd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceWithOperationTrackerTestUserFragment$fragmentType = any;
export type FragmentResourceWithOperationTrackerTestNodeQuery$variables = {|
  id: string,
|};
export type FragmentResourceWithOperationTrackerTestNodeQueryVariables = FragmentResourceWithOperationTrackerTestNodeQuery$variables;
export type FragmentResourceWithOperationTrackerTestNodeQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
  |},
|};
export type FragmentResourceWithOperationTrackerTestNodeQueryResponse = FragmentResourceWithOperationTrackerTestNodeQuery$data;
export type FragmentResourceWithOperationTrackerTestNodeQuery = {|
  variables: FragmentResourceWithOperationTrackerTestNodeQueryVariables,
  response: FragmentResourceWithOperationTrackerTestNodeQuery$data,
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
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserNameRenderer"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSDependency"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PlainUserNameData"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceWithOperationTrackerTestNodeQuery",
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
            "name": "FragmentResourceWithOperationTrackerTestUserFragment"
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
    "name": "FragmentResourceWithOperationTrackerTestNodeQuery",
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
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
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
                        "documentName": "FragmentResourceWithOperationTrackerTestUserFragment",
                        "fragmentName": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
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
                        "documentName": "FragmentResourceWithOperationTrackerTestUserFragment",
                        "fragmentName": "FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "MarkdownUserNameRenderer",
                    "abstractKey": null
                  }
                ],
                "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
              },
              {
                "alias": "plainNameRenderer",
                "args": [
                  {
                    "kind": "Literal",
                    "name": "supported",
                    "value": [
                      "PlainUserNameRenderer"
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
                        "documentName": "FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer",
                        "fragmentName": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "PlainUserNameRenderer",
                    "abstractKey": null
                  }
                ],
                "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
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
    "cacheID": "96eebba688dd18b2fab25e2f22d0fc93",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v3/*: any*/),
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "node.name": (v4/*: any*/),
        "node.nameRenderer": (v5/*: any*/),
        "node.nameRenderer.__module_component_FragmentResourceWithOperationTrackerTestUserFragment": (v6/*: any*/),
        "node.nameRenderer.__module_operation_FragmentResourceWithOperationTrackerTestUserFragment": (v6/*: any*/),
        "node.nameRenderer.__typename": (v3/*: any*/),
        "node.nameRenderer.data": (v7/*: any*/),
        "node.nameRenderer.data.id": (v8/*: any*/),
        "node.nameRenderer.data.markup": (v4/*: any*/),
        "node.nameRenderer.data.text": (v4/*: any*/),
        "node.nameRenderer.markdown": (v4/*: any*/),
        "node.nameRenderer.plaintext": (v4/*: any*/),
        "node.plainNameRenderer": (v5/*: any*/),
        "node.plainNameRenderer.__module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer": (v6/*: any*/),
        "node.plainNameRenderer.__module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer": (v6/*: any*/),
        "node.plainNameRenderer.__typename": (v3/*: any*/),
        "node.plainNameRenderer.data": (v7/*: any*/),
        "node.plainNameRenderer.data.id": (v8/*: any*/),
        "node.plainNameRenderer.data.text": (v4/*: any*/),
        "node.plainNameRenderer.plaintext": (v4/*: any*/)
      }
    },
    "name": "FragmentResourceWithOperationTrackerTestNodeQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerTestNodeQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceWithOperationTrackerTestUserFragment\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestUserFragment on User {\n  id\n  name\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n  }\n  plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ff9181396332978f08da32b08199e7df";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerTestNodeQuery$variables,
  FragmentResourceWithOperationTrackerTestNodeQuery$data,
>*/);
