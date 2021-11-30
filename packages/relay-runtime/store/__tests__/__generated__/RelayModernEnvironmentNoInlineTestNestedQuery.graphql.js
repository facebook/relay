/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e851018174604a20e31ee19b79bc894b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType = any;
export type RelayModernEnvironmentNoInlineTestNestedQuery$variables = {|
  global_cond: boolean,
|};
export type RelayModernEnvironmentNoInlineTestNestedQueryVariables = RelayModernEnvironmentNoInlineTestNestedQuery$variables;
export type RelayModernEnvironmentNoInlineTestNestedQuery$data = {|
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTestNestedQueryResponse = RelayModernEnvironmentNoInlineTestNestedQuery$data;
export type RelayModernEnvironmentNoInlineTestNestedQuery = {|
  variables: RelayModernEnvironmentNoInlineTestNestedQueryVariables,
  response: RelayModernEnvironmentNoInlineTestNestedQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "global_cond"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentNoInlineTestNestedQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Literal",
            "name": "cond",
            "value": true
          }
        ],
        "kind": "FragmentSpread",
        "name": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentNoInlineTestNestedQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Literal",
            "name": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$cond",
            "value": true
          }
        ],
        "fragment": require('./RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$normalization.graphql'),
        "kind": "FragmentSpread"
      }
    ]
  },
  "params": {
    "cacheID": "b412bf3eb048e4fdf6264ed16b282395",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentNoInlineTestNestedQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentNoInlineTestNestedQuery(\n  $global_cond: Boolean!\n) {\n  ...RelayModernEnvironmentNoInlineTest_nestedNoInlineParent_22eGLd\n}\n\nfragment RelayModernEnvironmentNoInlineTest_nestedNoInlineParent_22eGLd on Query {\n  mark: username(name: \"Mark\") {\n    __typename\n    ...RelayModernEnvironmentNoInlineTest_nestedNoInline_1QwPIR\n    id\n  }\n  zuck: username(name: \"Zuck\") {\n    __typename\n    id\n  }\n  joe: username(name: \"Joe\") {\n    __typename\n    ...RelayModernEnvironmentNoInlineTest_nestedNoInline_22eGLd\n    id\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTest_nestedNoInline_1QwPIR on User {\n  name @include(if: $global_cond)\n}\n\nfragment RelayModernEnvironmentNoInlineTest_nestedNoInline_22eGLd on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "cecbcd722b6b7ecf0d3af5c336814547";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentNoInlineTestNestedQuery$variables,
  RelayModernEnvironmentNoInlineTestNestedQuery$data,
>*/);
