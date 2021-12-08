/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8a2a8f16a25b329ecec8d3052ec8d34d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTestFragment$fragmentType = any;
export type RelayResponseNormalizerTest4Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest4QueryVariables = RelayResponseNormalizerTest4Query$variables;
export type RelayResponseNormalizerTest4Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTestFragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest4QueryResponse = RelayResponseNormalizerTest4Query$data;
export type RelayResponseNormalizerTest4Query = {|
  variables: RelayResponseNormalizerTest4QueryVariables,
  response: RelayResponseNormalizerTest4Query$data,
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
    "name": "RelayResponseNormalizerTest4Query",
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
            "name": "RelayResponseNormalizerTestFragment"
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
    "name": "RelayResponseNormalizerTest4Query",
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
                        "documentName": "RelayResponseNormalizerTestFragment",
                        "fragmentName": "RelayResponseNormalizerTestPlainUserNameRenderer_name",
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
                        "documentName": "RelayResponseNormalizerTestFragment",
                        "fragmentName": "RelayResponseNormalizerTestMarkdownUserNameRenderer_name",
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
    "cacheID": "af75ba0a171ebe32576a4c6676ebb14c",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest4Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest4Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTestFragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTestFragment on User {\n  id\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayResponseNormalizerTestPlainUserNameRenderer_name\n      __module_operation_RelayResponseNormalizerTestFragment: js(module: \"RelayResponseNormalizerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayResponseNormalizerTestFragment.nameRenderer\")\n      __module_component_RelayResponseNormalizerTestFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayResponseNormalizerTestFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayResponseNormalizerTestMarkdownUserNameRenderer_name\n      __module_operation_RelayResponseNormalizerTestFragment: js(module: \"RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayResponseNormalizerTestFragment.nameRenderer\")\n      __module_component_RelayResponseNormalizerTestFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayResponseNormalizerTestFragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayResponseNormalizerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "325e859306b977210ac702e455a74207";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest4Query$variables,
  RelayResponseNormalizerTest4Query$data,
>*/);
