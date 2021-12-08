/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4a7011a551084c32838e532c96d086af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentWithOperationTrackerTestQuery$variables = {|
  id?: ?string,
|};
export type RelayModernEnvironmentWithOperationTrackerTestQueryVariables = RelayModernEnvironmentWithOperationTrackerTestQuery$variables;
export type RelayModernEnvironmentWithOperationTrackerTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentWithOperationTrackerTestQueryResponse = RelayModernEnvironmentWithOperationTrackerTestQuery$data;
export type RelayModernEnvironmentWithOperationTrackerTestQuery = {|
  variables: RelayModernEnvironmentWithOperationTrackerTestQueryVariables,
  response: RelayModernEnvironmentWithOperationTrackerTestQuery$data,
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserNameRenderer"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSDependency"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PlainUserNameData"
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ID"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentWithOperationTrackerTestQuery",
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
            "name": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment"
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
    "name": "RelayModernEnvironmentWithOperationTrackerTestQuery",
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
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
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
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
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
                            "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
                            "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
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
                            "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
                            "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name",
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
                            "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer",
                            "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
                            "fragmentPropName": "name",
                            "kind": "ModuleImport"
                          }
                        ],
                        "type": "PlainUserNameRenderer",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
                  },
                  (v3/*: any*/)
                ],
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
    "cacheID": "c4c553783b1fd36510d3053574a2a763",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v4/*: any*/),
        "node.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "node.author.__typename": (v4/*: any*/),
        "node.author.id": (v5/*: any*/),
        "node.author.nameRenderer": (v6/*: any*/),
        "node.author.nameRenderer.__module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment": (v7/*: any*/),
        "node.author.nameRenderer.__module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment": (v7/*: any*/),
        "node.author.nameRenderer.__typename": (v4/*: any*/),
        "node.author.nameRenderer.data": (v8/*: any*/),
        "node.author.nameRenderer.data.id": (v9/*: any*/),
        "node.author.nameRenderer.data.markup": (v10/*: any*/),
        "node.author.nameRenderer.data.text": (v10/*: any*/),
        "node.author.nameRenderer.markdown": (v10/*: any*/),
        "node.author.nameRenderer.plaintext": (v10/*: any*/),
        "node.author.plainNameRenderer": (v6/*: any*/),
        "node.author.plainNameRenderer.__module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer": (v7/*: any*/),
        "node.author.plainNameRenderer.__module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer": (v7/*: any*/),
        "node.author.plainNameRenderer.__typename": (v4/*: any*/),
        "node.author.plainNameRenderer.data": (v8/*: any*/),
        "node.author.plainNameRenderer.data.id": (v9/*: any*/),
        "node.author.plainNameRenderer.data.text": (v10/*: any*/),
        "node.author.plainNameRenderer.plaintext": (v10/*: any*/),
        "node.body": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Text"
        },
        "node.body.text": (v10/*: any*/),
        "node.id": (v5/*: any*/)
      }
    },
    "name": "RelayModernEnvironmentWithOperationTrackerTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentWithOperationTrackerTestQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment on Feedback {\n  id\n  body {\n    text\n  }\n  author {\n    __typename\n    nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n        __module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n      }\n      ... on MarkdownUserNameRenderer {\n        ...RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n        __module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n      }\n    }\n    plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer: js(module: \"RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.plainNameRenderer\")\n        __module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.plainNameRenderer\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a7167fdd5f3eacc9c1ed47a342eb2fa0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentWithOperationTrackerTestQuery$variables,
  RelayModernEnvironmentWithOperationTrackerTestQuery$data,
>*/);
