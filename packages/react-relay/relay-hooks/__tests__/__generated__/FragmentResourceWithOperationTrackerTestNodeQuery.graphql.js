/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<19fc9778d41a62d22c998b391918e9b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @indirectDataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @indirectDataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerTestUserFragment$fragmentType } from "./FragmentResourceWithOperationTrackerTestUserFragment.graphql";
export type FragmentResourceWithOperationTrackerTestNodeQuery$variables = {|
  id: string,
|};
export type FragmentResourceWithOperationTrackerTestNodeQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
  |},
|};
export type FragmentResourceWithOperationTrackerTestNodeQuery = {|
  response: FragmentResourceWithOperationTrackerTestNodeQuery$data,
  variables: FragmentResourceWithOperationTrackerTestNodeQuery$variables,
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
                    "value": "34hjiS"
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
                "storageKey": "nameRenderer(supported:\"34hjiS\")"
              },
              {
                "alias": "plainNameRenderer",
                "args": [
                  {
                    "kind": "Literal",
                    "name": "supported",
                    "value": "1AwQS7"
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
                "storageKey": "nameRenderer(supported:\"1AwQS7\")"
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
    "metadata": {},
    "name": "FragmentResourceWithOperationTrackerTestNodeQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerTestNodeQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceWithOperationTrackerTestUserFragment\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestUserFragment on User {\n  id\n  name\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n  }\n  plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "43da25d82b333c14f0570f553ebc8631";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerTestNodeQuery$variables,
  FragmentResourceWithOperationTrackerTestNodeQuery$data,
>*/);
